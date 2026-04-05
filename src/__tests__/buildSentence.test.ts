import { normalizeWord, buildWordChips } from "@/utils/buildSentence";
import type { Sentence } from "@/types";

// ---- helpers ----------------------------------------------------------------

function makeSentence(
  id: string,
  target_text: string,
  overrides: Partial<Sentence> = {}
): Sentence {
  return {
    id,
    source_text: "",
    target_text,
    keywords: [],
    status: "new",
    is_preset: true,
    ...overrides,
  };
}

// ---- normalizeWord ----------------------------------------------------------

describe("normalizeWord", () => {
  it("lowercases text", () => {
    expect(normalizeWord("Hello")).toBe("hello");
  });

  it("strips leading punctuation", () => {
    expect(normalizeWord("'hello")).toBe("hello");
    expect(normalizeWord("«hello")).toBe("hello");
  });

  it("strips trailing punctuation", () => {
    expect(normalizeWord("hello.")).toBe("hello");
    expect(normalizeWord("hello!")).toBe("hello");
    expect(normalizeWord("hello,")).toBe("hello");
  });

  it("strips both sides", () => {
    expect(normalizeWord('"hello"')).toBe("hello");
    expect(normalizeWord("(hello)")).toBe("hello");
  });

  it("preserves mid-word apostrophe", () => {
    expect(normalizeWord("don't")).toBe("don't");
    expect(normalizeWord("it's")).toBe("it's");
  });

  it("handles already-clean word", () => {
    expect(normalizeWord("hello")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(normalizeWord("")).toBe("");
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeWord("  hello  ")).toBe("hello");
  });
});

// ---- buildWordChips ---------------------------------------------------------

describe("buildWordChips", () => {
  const sentence = makeSentence("s1", "Hello world today");
  const pool: Sentence[] = [
    makeSentence("s2", "Running quickly outside"),
    makeSentence("s3", "Beautiful morning sunshine"),
    makeSentence("s4", "Learning something new everyday"),
  ];

  it("correctOrder matches normalized words of target_text", () => {
    const { correctOrder } = buildWordChips(sentence, pool, 3);
    expect(correctOrder).toEqual(["hello", "world", "today"]);
  });

  it("correct chips (non-decoy) match the correct words", () => {
    const { chips } = buildWordChips(sentence, pool, 3);
    const correctChips = chips.filter((c) => !c.isDecoy);
    const normalizedCorrects = correctChips.map((c) => c.normalized).sort();
    expect(normalizedCorrects).toEqual(["hello", "today", "world"]);
  });

  it("decoy chips are marked isDecoy = true", () => {
    const { chips } = buildWordChips(sentence, pool, 3);
    const decoys = chips.filter((c) => c.isDecoy);
    expect(decoys.length).toBeGreaterThan(0);
    decoys.forEach((d) => expect(d.isDecoy).toBe(true));
  });

  it("decoy words do not overlap with correct words", () => {
    const { chips, correctOrder } = buildWordChips(sentence, pool, 3);
    const correctSet = new Set(correctOrder);
    const decoys = chips.filter((c) => c.isDecoy);
    decoys.forEach((d) => {
      expect(correctSet.has(d.normalized)).toBe(false);
    });
  });

  it("each chip has a unique id", () => {
    const { chips } = buildWordChips(sentence, pool, 3);
    const ids = chips.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("strips ** markers from correct words", () => {
    const s = makeSentence("s5", "**Hello** world **today**");
    const { correctOrder } = buildWordChips(s, pool, 0);
    expect(correctOrder).toEqual(["hello", "world", "today"]);
  });

  it("returns no decoys when pool is empty", () => {
    const { chips } = buildWordChips(sentence, [], 3);
    const decoys = chips.filter((c) => c.isDecoy);
    expect(decoys).toHaveLength(0);
  });

  it("does not include the target sentence itself as a decoy source", () => {
    // Pool only contains the same sentence — no decoys should be added
    const { chips } = buildWordChips(sentence, [sentence], 3);
    const decoys = chips.filter((c) => c.isDecoy);
    expect(decoys).toHaveLength(0);
  });
});
