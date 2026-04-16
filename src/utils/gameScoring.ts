import { MIN_POOL_SIZE, RawSessionStats } from "@/types/game";

export function calculateAccuracy(correct: number, wrong: number): number {
  if (correct < 0 || wrong < 0) return 0;
  const attempts = correct + wrong;
  if (attempts <= 0) return 0;
  return Math.round((correct / attempts) * 100);
}

export function calculateAuthoritativeGameScore(params: {
  gameType: RawSessionStats["gameType"];
  correct: number;
  comboMax: number;
  levelReached: number;
}): number {
  const baseScore = Math.max(0, params.correct) * 10 + Math.max(0, params.comboMax) * 5;

  if (params.gameType !== "word_rain") {
    return baseScore;
  }

  return baseScore + (Math.max(params.levelReached, 1) - 1) * 20;
}

export function validateRawSessionStats(stats: RawSessionStats): string | null {
  if (!stats.sessionId) return "invalid_stats";
  if (!["speed_round", "word_rain", "memory_match"].includes(stats.gameType)) return "invalid_game_type";
  if (stats.correct < 0 || stats.wrong < 0 || stats.missed < 0) return "invalid_stats";
  if (stats.durationSec < 0 || stats.levelReached < 1 || stats.poolSize < 0) return "invalid_stats";
  if (!["global", "user_learning", "user_learned", "mixed"].includes(stats.filterUsed)) return "invalid_filter";
  if (!stats.sourceLang?.trim() || !stats.targetLang?.trim()) return "invalid_language";
  if (stats.comboMax < 0 || stats.comboMax > stats.correct) return "invalid_combo";
  if (stats.poolSize < MIN_POOL_SIZE[stats.gameType]) return "invalid_pool_size";
  if (stats.gameType !== "word_rain" && stats.missed !== 0) return "invalid_stats";
  if (stats.gameType !== "word_rain" && stats.levelReached !== 1) return "invalid_stats";
  if (stats.correct + stats.wrong + stats.missed <= 0) return "invalid_stats";

  return null;
}
