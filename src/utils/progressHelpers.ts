import type { UserProgress } from "@/types";

/**
 * Returns how many sentences were marked as learned today (local date).
 * Used in HeroHeader and ProfileScreen for daily goal tracking.
 */
export function countTodayLearned(progress: UserProgress[]): number {
  const today = new Date().toISOString().split("T")[0];
  return progress.filter(
    (p) => p.state === "learned" && p.learned_at?.startsWith(today),
  ).length;
}
