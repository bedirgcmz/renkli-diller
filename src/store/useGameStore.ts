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

// ----------------------------------------------------------------
// State (persistent/meta only — no in-game state here)
// ----------------------------------------------------------------
interface GameStoreState {
  userStats: UserGameStats | null;
  leaderboard: {
    speed_round: { weekly: GameLeaderboard | null; alltime: GameLeaderboard | null };
    word_rain:   { weekly: GameLeaderboard | null; alltime: GameLeaderboard | null };
  };
  leaderboardLoading: {
    speed_round: { weekly: boolean; alltime: boolean };
    word_rain:   { weekly: boolean; alltime: boolean };
  };
  leaderboardFetchedAt: {
    speed_round: { weekly: number | null; alltime: number | null };
    word_rain:   { weekly: number | null; alltime: number | null };
  };
  tutorialSeen: { speed_round: boolean; word_rain: boolean };
  dailyLimitReached: { speed_round: boolean; word_rain: boolean };
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
}

// Cache duration: 3 minutes for leaderboard
const LEADERBOARD_CACHE_MS = 3 * 60 * 1000;

function hasActiveLeaderboardLoads(loadingState: GameStoreState["leaderboardLoading"]): boolean {
  return Object.values(loadingState).some((periods) => periods.weekly || periods.alltime);
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  userStats: null,
  leaderboard: {
    speed_round: { weekly: null, alltime: null },
    word_rain:   { weekly: null, alltime: null },
  },
  leaderboardLoading: {
    speed_round: { weekly: false, alltime: false },
    word_rain:   { weekly: false, alltime: false },
  },
  leaderboardFetchedAt: {
    speed_round: { weekly: null, alltime: null },
    word_rain:   { weekly: null, alltime: null },
  },
  tutorialSeen: { speed_round: false, word_rain: false },
  dailyLimitReached: { speed_round: false, word_rain: false },
  pendingScores: [],
  loading: false,
  submitLoading: false,
  error: null,

  // ---- Load user game stats ----
  loadUserStats: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
      set({
        userStats: {
          league: "bronze",
          cumulativeScore: 0,
          gamesPlayed: 0,
          bestSpeedRound: 0,
          bestWordRain: 0,
          lastPlayedAt: null,
        },
      });
      return;
    }

    set({
      userStats: {
        league: data.league,
        cumulativeScore: data.cumulative_score,
        gamesPlayed: data.games_played,
        bestSpeedRound: data.best_speed_round,
        bestWordRain: data.best_word_rain,
        lastPlayedAt: data.last_played_at,
      },
    });
  },

  // ---- Submit game score via RPC ----
  submitScore: async (stats: RawSessionStats): Promise<GameSubmitResult | null> => {
    set({ submitLoading: true, error: null });

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
        // Network or server error → queue for retry
        set((state) => ({
          submitLoading: false,
          error: "network",
          pendingScores: state.pendingScores.some((queued) => queued.sessionId === stats.sessionId)
            ? state.pendingScores
            : [...state.pendingScores, stats],
        }));
        return null;
      }

      if (data?.error) {
        // RPC-level error (daily_limit, invalid_stats, etc.)
        set({ submitLoading: false, error: data.error });
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

      // Update local stats
      set((state) => ({
        submitLoading: false,
        pendingScores: state.pendingScores.filter((queued) => queued.sessionId !== stats.sessionId),
        userStats: state.userStats
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
              lastPlayedAt: new Date().toISOString(),
            }
          : state.userStats,
      }));

      return result;
    } catch {
      set((state) => ({
        submitLoading: false,
        error: "network",
        pendingScores: state.pendingScores.some((queued) => queued.sessionId === stats.sessionId)
          ? state.pendingScores
          : [...state.pendingScores, stats],
      }));
      return null;
    }
  },

  // ---- Retry a pending (offline) score ----
  retryPendingScore: async () => {
    const { pendingScores, submitScore } = get();
    const nextPending = pendingScores[0];
    if (!nextPending) return;
    await submitScore(nextPending);
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
      },
      leaderboardLoading: {
        speed_round: { weekly: false, alltime: false },
        word_rain: { weekly: false, alltime: false },
      },
      leaderboardFetchedAt: {
        speed_round: { weekly: null, alltime: null },
        word_rain: { weekly: null, alltime: null },
      },
      tutorialSeen: { speed_round: false, word_rain: false },
      dailyLimitReached: { speed_round: false, word_rain: false },
      pendingScores: [],
      loading: false,
      submitLoading: false,
      error: null,
    }),
}));
