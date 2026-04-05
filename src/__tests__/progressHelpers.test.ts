import { countTodayLearned } from "@/utils/progressHelpers";
import type { UserProgress } from "@/types";

function makeProgress(
  state: "learning" | "learned",
  learned_at?: string
): UserProgress {
  return {
    id: Math.random().toString(),
    user_id: "u1",
    sentence_id: "s1",
    state,
    learned_at,
    created_at: "2026-01-01T00:00:00Z",
  };
}

describe("countTodayLearned", () => {
  const TODAY = "2026-04-05";

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(`${TODAY}T12:00:00Z`));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns 0 for empty list", () => {
    expect(countTodayLearned([])).toBe(0);
  });

  it("counts items learned today", () => {
    const progress = [
      makeProgress("learned", `${TODAY}T08:00:00Z`),
      makeProgress("learned", `${TODAY}T11:00:00Z`),
    ];
    expect(countTodayLearned(progress)).toBe(2);
  });

  it("ignores items learned on a different day", () => {
    const progress = [
      makeProgress("learned", "2026-04-04T23:59:59Z"),
      makeProgress("learned", "2026-04-06T00:00:00Z"),
    ];
    expect(countTodayLearned(progress)).toBe(0);
  });

  it("ignores items with state 'learning' even if learned_at is today", () => {
    const progress = [makeProgress("learning", `${TODAY}T10:00:00Z`)];
    expect(countTodayLearned(progress)).toBe(0);
  });

  it("ignores items with no learned_at", () => {
    const progress = [makeProgress("learned", undefined)];
    expect(countTodayLearned(progress)).toBe(0);
  });

  it("counts only today's learned among mixed data", () => {
    const progress = [
      makeProgress("learned", `${TODAY}T09:00:00Z`),   // today ✓
      makeProgress("learned", "2026-04-04T09:00:00Z"),  // yesterday ✗
      makeProgress("learning", `${TODAY}T10:00:00Z`),   // wrong state ✗
      makeProgress("learned", undefined),                // no date ✗
      makeProgress("learned", `${TODAY}T20:00:00Z`),   // today ✓
    ];
    expect(countTodayLearned(progress)).toBe(2);
  });
});
