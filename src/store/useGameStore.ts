import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import {
  GameFilter,
  GameLeaderboard,
  GameLeaderboardEntry,
  GameSessionResult,
  GameSubmitResult,
  GameType,
  RawSessionStats,
  UserGameStats,
} from "@/types/game";
import { validateRawSessionStats } from "@/utils/gameScoring";
import { readCache, writeCache } from "@/lib/offlineCache";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ----------------------------------------------------------------
// State (persistent/meta only — no in-game state here)
// ----------------------------------------------------------------
interface GameStoreState {
  userStats: UserGameStats | null;
  leaderboard: {
    speed_round: { weekly: GameLeaderboard | null; alltime: GameLeaderboard | null };
    word_rain:   { weekly: GameLeaderboard | null; alltime: GameLeaderboard | null };
    memory_match:{ weekly: GameLeaderboard | null; alltime: GameLeaderboard | null };
  };
  leaderboardLoading: {
    speed_round: { weekly: boolean; alltime: boolean };
    word_rain:   { weekly: boolean; alltime: boolean };
    memory_match:{ weekly: boolean; alltime: boolean };
  };
  leaderboardFetchedAt: {
    speed_round: { weekly: number | null; alltime: number | null };
    word_rain:   { weekly: number | null; alltime: number | null };
    memory_match:{ weekly: number | null; alltime: number | null };
  };
  tutorialSeen: { speed_round: boolean; word_rain: boolean; memory_match: boolean };
  dailyLimitReached: { speed_round: boolean; word_rain: boolean; memory_match: boolean };
  pendingScores: RawSessionStats[];
  loading: boolean;
  submitLoading: boolean;
  error: string | null;

  // Actions
  loadUserStats: () => Promise<void>;
  submitScore: (stats: RawSessionStats) => Promise<GameSubmitResult | null>;
  retryPendingScore: () => Promise<void>;
  loadLeaderboard: (gameType: GameType, period: "weekly" | "alltime") => Promise<void>;
  checkInactivityDemotion: () => Promise<{ demoted: boolean; oldLeague?: string; newLeague?: string } | null>;
  markTutorialSeen: (gameType: GameType) => void;
  setDailyLimitReached: (gameType: GameType, value: boolean) => void;
  clearError: () => void;
  clear: () => void;
  /** Load persisted pending scores from AsyncStorage (call on startup). */
  loadPersistedPendingScores: (userId: string) => Promise<void>;
}

// Cache duration: 3 minutes for leaderboard
const LEADERBOARD_CACHE_MS = 3 * 60 * 1000;

function cacheKeyGameStats(userId: string) {
  return `game_stats:${userId}`;
}

function pendingScoresStorageKey(userId: string) {
  return `offline_cache:pending_scores:${userId}`;
}

function hasActiveLeaderboardLoads(loadingState: GameStoreState["leaderboardLoading"]): boolean {
  return Object.values(loadingState).some((periods) => periods.weekly || periods.alltime);
}

async function persistPendingScores(userId: string, scores: RawSessionStats[]): Promise<void> {
  try {
    await AsyncStorage.setItem(pendingScoresStorageKey(userId), JSON.stringify(scores));
  } catch {
    // Non-fatal
  }
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  userStats: null,
  leaderboard: {
    speed_round: { weekly: null, alltime: null },
    word_rain:   { weekly: null, alltime: null },
    memory_match:{ weekly: null, alltime: null },
  },
  leaderboardLoading: {
    speed_round: { weekly: false, alltime: false },
    word_rain:   { weekly: false, alltime: false },
    memory_match:{ weekly: false, alltime: false },
  },
  leaderboardFetchedAt: {
    speed_round: { weekly: null, alltime: null },
    word_rain:   { weekly: null, alltime: null },
    memory_match:{ weekly: null, alltime: null },
  },
  tutorialSeen: { speed_round: false, word_rain: false, memory_match: false },
  dailyLimitReached: { speed_round: false, word_rain: false, memory_match: false },
  pendingScores: [],
  loading: false,
  submitLoading: false,
  error: null,

  // ---- Load persisted pending scores from AsyncStorage ----
  loadPersistedPendingScores: async (userId: string) => {
    try {
      const raw = await AsyncStorage.getItem(pendingScoresStorageKey(userId));
      if (!raw) return;
      const scores = JSON.parse(raw) as RawSessionStats[];
      if (Array.isArray(scores) && scores.length > 0) {
        set((state) => {
          const existingIds = new Set(state.pendingScores.map((s) => s.sessionId));
          const newOnes = scores.filter((s) => !existingIds.has(s.sessionId));
          return { pendingScores: [...state.pendingScores, ...newOnes] };
        });
      }
    } catch {
      // Non-fatal
    }
  },

  // ---- Load user game stats ----
  loadUserStats: async () => {
    // getSession() reads from AsyncStorage — no network, safe for offline cache-first reads.
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    if (!user) return;

    // 1. Cache-first: show cached stats without loading spinner
    const cached = await readCache<UserGameStats>(cacheKeyGameStats(user.id));
    if (cached) {
      set({ userStats: cached });
    }

    // 2. Background network fetch
    const { data, error } = await supabase
      .from("user_game_stats")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      set({ error: error.message });
      return;
    }

    if (!data) {
      // No row yet — default stats
      const defaultStats: UserGameStats = {
        league: "bronze",
        cumulativeScore: 0,
        gamesPlayed: 0,
        bestSpeedRound: 0,
        bestWordRain: 0,
        bestMemoryMatch: 0,
        lastPlayedAt: null,
      };
      set({ userStats: defaultStats });
      void writeCache(cacheKeyGameStats(user.id), defaultStats);
      return;
    }

    const freshStats: UserGameStats = {
      league: data.league,
      cumulativeScore: data.cumulative_score,
      gamesPlayed: data.games_played,
      bestSpeedRound: data.best_speed_round,
      bestWordRain: data.best_word_rain,
      bestMemoryMatch: data.best_memory_match ?? 0,
      lastPlayedAt: data.last_played_at,
    };
    set({ userStats: freshStats });
    void writeCache(cacheKeyGameStats(user.id), freshStats);
  },

  // ---- Submit game score via RPC ----
  submitScore: async (stats: RawSessionStats): Promise<GameSubmitResult | null> => {
    set({ submitLoading: true, error: null });

    const validationError = validateRawSessionStats(stats);
    if (validationError) {
      set({ submitLoading: false, error: validationError });
      return null;
    }

    // Resolve userId once with getSession() (no network) so that all error/success
    // branches — including the offline retry path — can persist the queue without
    // making additional network-dependent auth calls.
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    const currentUserId = currentSession?.user?.id ?? null;

    try {
      const { data, error } = await supabase.rpc("submit_game_score", {
        p_session_id:    stats.sessionId,
        p_game_type:     stats.gameType,
        p_correct:       stats.correct,
        p_wrong:         stats.wrong,
        p_missed:        stats.missed,
        p_duration_sec:  stats.durationSec,
        p_combo_max:     stats.comboMax,
        p_level_reached: stats.levelReached,
        p_pool_size:     stats.poolSize,
        p_filter_used:   stats.filterUsed,
        p_source_lang:   stats.sourceLang,
        p_target_lang:   stats.targetLang,
      });

      if (error) {
        // Network or server error → queue for retry (persist to AsyncStorage)
        set((state) => {
          const alreadyQueued = state.pendingScores.some((q) => q.sessionId === stats.sessionId);
          const updated = alreadyQueued ? state.pendingScores : [...state.pendingScores, stats];
          if (currentUserId) void persistPendingScores(currentUserId, updated);
          return {
            submitLoading: false,
            error: "network",
            pendingScores: updated,
          };
        });
        return null;
      }

      if (data?.error) {
        // RPC-level errors are terminal for this payload — clear from retry queue
        set((state) => {
          const updated = state.pendingScores.filter((q) => q.sessionId !== stats.sessionId);
          if (currentUserId) void persistPendingScores(currentUserId, updated);
          return {
            submitLoading: false,
            error: data.error,
            pendingScores: updated,
          };
        });
        return null;
      }

      const result: GameSubmitResult = {
        score:               data.score,
        accuracy:            data.accuracy,
        personalBestBroken:  data.personal_best_broken,
        oldBest:             data.old_best,
        league:              data.league,
        leagueChanged:       data.league_changed,
        oldLeague:           data.old_league,
        weeklyRank:          data.weekly_rank ?? null,
        cumulativeScore:     data.cumulative_score,
      };

      // Update local stats and persist to cache
      set((state) => {
        const updatedPending = state.pendingScores.filter((q) => q.sessionId !== stats.sessionId);
        if (currentUserId) void persistPendingScores(currentUserId, updatedPending);

        const updatedStats = state.userStats
          ? {
              ...state.userStats,
              league:          result.league,
              cumulativeScore: result.cumulativeScore,
              gamesPlayed:     state.userStats.gamesPlayed + 1,
              bestSpeedRound:
                stats.gameType === "speed_round" && result.personalBestBroken
                  ? result.score
                  : state.userStats.bestSpeedRound,
              bestWordRain:
                stats.gameType === "word_rain" && result.personalBestBroken
                  ? result.score
                  : state.userStats.bestWordRain,
              bestMemoryMatch:
                stats.gameType === "memory_match" && result.personalBestBroken
                  ? result.score
                  : state.userStats.bestMemoryMatch,
              lastPlayedAt: new Date().toISOString(),
            }
          : {
              league: result.league,
              cumulativeScore: result.cumulativeScore,
              gamesPlayed: 1,
              bestSpeedRound: stats.gameType === "speed_round" ? result.score : 0,
              bestWordRain: stats.gameType === "word_rain" ? result.score : 0,
              bestMemoryMatch: stats.gameType === "memory_match" ? result.score : 0,
              lastPlayedAt: new Date().toISOString(),
            };

        if (currentUserId) void writeCache(cacheKeyGameStats(currentUserId), updatedStats);

        return {
          submitLoading: false,
          pendingScores: updatedPending,
          userStats: updatedStats,
        };
      });

      return result;
    } catch {
      set((state) => {
        const alreadyQueued = state.pendingScores.some((q) => q.sessionId === stats.sessionId);
        const updated = alreadyQueued ? state.pendingScores : [...state.pendingScores, stats];
        if (currentUserId) void persistPendingScores(currentUserId, updated);
        return {
          submitLoading: false,
          error: "network",
          pendingScores: updated,
        };
      });
      return null;
    }
  },

  // ---- Retry a pending (offline) score ----
  retryPendingScore: async () => {
    let attempts = 0;

    while (attempts < 20) {
      const { pendingScores, submitScore } = get();
      const nextPending = pendingScores[0];
      if (!nextPending) return;

      const result = await submitScore(nextPending);
      const currentError = get().error;

      if (!result && currentError === "network") {
        return;
      }

      attempts += 1;
    }
  },

  // ---- Load leaderboard (with cache) ----
  loadLeaderboard: async (gameType: GameType, period: "weekly" | "alltime") => {
    const { leaderboardFetchedAt } = get();
    const fetchedAt = leaderboardFetchedAt[gameType][period];
    if (fetchedAt && Date.now() - fetchedAt < LEADERBOARD_CACHE_MS) return;

    set((state) => {
      const leaderboardLoading = {
        ...state.leaderboardLoading,
        [gameType]: {
          ...state.leaderboardLoading[gameType],
          [period]: true,
        },
      };

      return {
        error: null,
        loading: hasActiveLeaderboardLoads(leaderboardLoading),
        leaderboardLoading,
      };
    });

    try {
      const { data, error } = await supabase.rpc("get_game_leaderboard", {
        p_game_type: gameType,
        p_period:    period,
        p_limit:     50,
      });

      if (error || !data) {
        set((state) => {
          const leaderboardLoading = {
            ...state.leaderboardLoading,
            [gameType]: {
              ...state.leaderboardLoading[gameType],
              [period]: false,
            },
          };

          return {
            error: error?.message ?? "load_failed",
            loading: hasActiveLeaderboardLoads(leaderboardLoading),
            leaderboardLoading,
          };
        });
        return;
      }

      const entries: GameLeaderboardEntry[] = (data.entries ?? []).map((e: any) => ({
        rank:        e.rank,
        userId:      e.user_id,
        displayName: e.display_name,
        avatarUrl:   e.avatar_url ?? null,
        score:       e.score,
        league:      e.league,
      }));

      const leaderboard: GameLeaderboard = {
        myRank:  data.my_rank ?? null,
        entries,
      };

      set((state) => ({
        loading: hasActiveLeaderboardLoads({
          ...state.leaderboardLoading,
          [gameType]: {
            ...state.leaderboardLoading[gameType],
            [period]: false,
          },
        }),
        leaderboard: {
          ...state.leaderboard,
          [gameType]: {
            ...state.leaderboard[gameType],
            [period]: leaderboard,
          },
        },
        leaderboardLoading: {
          ...state.leaderboardLoading,
          [gameType]: {
            ...state.leaderboardLoading[gameType],
            [period]: false,
          },
        },
        leaderboardFetchedAt: {
          ...state.leaderboardFetchedAt,
          [gameType]: {
            ...state.leaderboardFetchedAt[gameType],
            [period]: Date.now(),
          },
        },
      }));
    } catch {
      set((state) => {
        const leaderboardLoading = {
          ...state.leaderboardLoading,
          [gameType]: {
            ...state.leaderboardLoading[gameType],
            [period]: false,
          },
        };

        return {
          error: "network",
          loading: hasActiveLeaderboardLoads(leaderboardLoading),
          leaderboardLoading,
        };
      });
    }
  },

  // ---- Check and apply inactivity demotion ----
  checkInactivityDemotion: async () => {
    try {
      const { data, error } = await supabase.rpc("check_inactivity_demotion");
      if (error || !data) return null;

      if (data.demoted && get().userStats) {
        set((state) => ({
          userStats: state.userStats
            ? { ...state.userStats, league: data.new_league }
            : state.userStats,
        }));
      }

      return {
        demoted:    data.demoted,
        oldLeague:  data.old_league,
        newLeague:  data.new_league,
      };
    } catch {
      return null;
    }
  },

  // ---- Mark tutorial as seen ----
  markTutorialSeen: (gameType: GameType) => {
    set((state) => ({
      tutorialSeen: { ...state.tutorialSeen, [gameType]: true },
    }));
  },

  // ---- Set daily limit reached flag ----
  setDailyLimitReached: (gameType: GameType, value: boolean) => {
    set((state) => ({
      dailyLimitReached: { ...state.dailyLimitReached, [gameType]: value },
    }));
  },

  clearError: () => set({ error: null }),

  clear: () =>
    set({
      userStats: null,
      leaderboard: {
        speed_round: { weekly: null, alltime: null },
        word_rain: { weekly: null, alltime: null },
        memory_match: { weekly: null, alltime: null },
      },
      leaderboardLoading: {
        speed_round: { weekly: false, alltime: false },
        word_rain: { weekly: false, alltime: false },
        memory_match: { weekly: false, alltime: false },
      },
      leaderboardFetchedAt: {
        speed_round: { weekly: null, alltime: null },
        word_rain: { weekly: null, alltime: null },
        memory_match: { weekly: null, alltime: null },
      },
      tutorialSeen: { speed_round: false, word_rain: false, memory_match: false },
      dailyLimitReached: { speed_round: false, word_rain: false, memory_match: false },
      pendingScores: [],
      loading: false,
      submitLoading: false,
      error: null,
    }),
}));
