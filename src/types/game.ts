// ============================================================
// Game Types
// ============================================================

export type GameType = "speed_round" | "word_rain" | "memory_match";
export type LeagueType = "bronze" | "silver" | "gold";
export type GameFilter = "global" | "user_learning" | "user_learned" | "mixed";
export type GameDifficultyFilter = "mixed" | "easy" | "medium" | "hard";

export type GamePhase =
  | "loading"
  | "tutorial"
  | "ready"
  | "countdown"
  | "playing"
  | "paused"
  | "result";

// A single playable vocabulary item (normalized, game-ready)
export interface GameVocabularyItem {
  id: string;
  sourceText: string;   // user's UI language (answer)
  targetText: string;   // language being learned (question)
  difficulty: 1 | 2 | 3;
  lengthBucket: "short" | "medium" | "long";
  origin: "global" | "user";
}

// Raw stats sent to the RPC (client collects these during gameplay)
export interface RawSessionStats {
  sessionId: string;      // UUID generated at game start
  gameType: GameType;
  correct: number;
  wrong: number;
  missed: number;         // Word Rain: words that hit the ground
  durationSec: number;
  comboMax: number;
  levelReached: number;   // Word Rain level
  poolSize: number;
  filterUsed: GameFilter;
  sourceLang: string;
  targetLang: string;
}

// Result returned from the RPC after submit
export interface GameSubmitResult {
  score: number;
  accuracy: number;
  personalBestBroken: boolean;
  oldBest: number;
  league: LeagueType;
  leagueChanged: boolean;
  oldLeague: LeagueType;
  weeklyRank: number | null;
  cumulativeScore: number;
}

// Local result built during gameplay (before RPC returns)
export interface GameSessionResult {
  sessionId: string;
  gameType: GameType;
  correctCount: number;
  wrongCount: number;
  missedCount: number;
  comboMax: number;
  durationSec: number;
  levelReached: number;
  poolSize: number;
  filterUsed: GameFilter;
  // Filled in after RPC responds:
  submitResult: GameSubmitResult | null;
  submitError: "daily_limit_reached" | "duplicate_session" | "network" | null;
}

// User's persistent game stats (from user_game_stats table)
export interface UserGameStats {
  league: LeagueType;
  cumulativeScore: number;
  gamesPlayed: number;
  bestSpeedRound: number;
  bestWordRain: number;
  bestMemoryMatch: number;
  lastPlayedAt: string | null;
}

// Single leaderboard entry
export interface GameLeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  score: number;
  league: LeagueType;
}

// Full leaderboard response from RPC
export interface GameLeaderboard {
  myRank: number | null;
  entries: GameLeaderboardEntry[];
}

// Pool build metadata (for empty-state decisions)
export interface PoolBuildMeta {
  totalRaw: number;
  usable: number;
  rejected: number;
  globalCount: number;
  userCount: number;
  isEnough: boolean;
  minRequired: number;
}

// League thresholds
export const LEAGUE_THRESHOLDS: Record<LeagueType, { min: number; max: number; next?: LeagueType }> = {
  bronze: { min: 0,    max: 999,  next: "silver" },
  silver: { min: 1000, max: 4999, next: "gold" },
  gold:   { min: 5000, max: Infinity },
};

export const LEAGUE_LABELS: Record<LeagueType, string> = {
  bronze: "🥉 Bronz",
  silver: "🥈 Gümüş",
  gold:   "🥇 Altın",
};

// Minimum pool sizes per game type
export const MIN_POOL_SIZE: Record<GameType, number> = {
  speed_round: 10,
  word_rain:   15,
  memory_match: 8,
};

// Word Rain max characters for eligibility
export const WORD_RAIN_MAX_CHARS = 32;
export const MEMORY_MATCH_MAX_CHARS = 24;
