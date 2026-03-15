import { useMemo } from "react";

export function useDailyGoal(goal: number, completed: number) {
  return useMemo(() => {
    const progress = Math.min(1, completed / goal);
    return {
      goal,
      completed,
      progress,
    };
  }, [goal, completed]);
}
