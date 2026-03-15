import { useMemo } from "react";

export function useStreak(count: number) {
  return useMemo(() => {
    return {
      streak: count,
      level: count > 30 ? "legend" : count > 14 ? "expert" : "beginner",
    };
  }, [count]);
}
