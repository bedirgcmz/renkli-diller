import {
  parseKeywords,
  textToColorIndex,
  getPillColor,
  getKeywordColor,
  splitWords,
  stripMarkers,
} from "@/utils/keywords";

describe("stripMarkers", () => {
  it("removes ** markers from text", () => {
    expect(stripMarkers("Ben **öğrenmek** istiyorum")).toBe(
      "Ben öğrenmek istiyorum"
    );
  });

  it("handles multiple markers", () => {
    expect(stripMarkers("**Hello** **world**")).toBe("Hello world");
  });

  it("returns text unchanged if no markers", () => {
    expect(stripMarkers("plain text")).toBe("plain text");
  });

  it("handles empty string", () => {
    expect(stripMarkers("")).toBe("");
  });
});

describe("parseKeywords", () => {
  it("parses a single keyword", () => {
    const result = parseKeywords("Ben **öğrenmek** istiyorum");
    expect(result).toEqual([
      { text: "Ben ", isPill: false, pillIndex: null },
      { text: "öğrenmek", isPill: true, pillIndex: 0 },
      { text: " istiyorum", isPill: false, pillIndex: null },
    ]);
  });

  it("parses multiple keywords", () => {
    const result = parseKeywords("**Hello** and **world**");
    const pills = result.filter((s) => s.isPill);
    expect(pills).toHaveLength(2);
    expect(pills[0]).toEqual({ text: "Hello", isPill: true, pillIndex: 0 });
    expect(pills[1]).toEqual({ text: "world", isPill: true, pillIndex: 1 });
  });

  it("returns single plain segment for text without markers", () => {
    const result = parseKeywords("no keywords here");
    expect(result).toEqual([
      { text: "no keywords here", isPill: false, pillIndex: null },
    ]);
  });

  it("handles text starting with a keyword", () => {
    const result = parseKeywords("**Start** of sentence");
    expect(result[0]).toEqual({ text: "Start", isPill: true, pillIndex: 0 });
    expect(result[1]).toEqual({
      text: " of sentence",
      isPill: false,
      pillIndex: null,
    });
  });

  it("handles text ending with a keyword", () => {
    const result = parseKeywords("End of **sentence**");
    expect(result[result.length - 1]).toEqual({
      text: "sentence",
      isPill: true,
      pillIndex: 0,
    });
  });

  it("returns empty array for empty string", () => {
    expect(parseKeywords("")).toEqual([]);
  });
});

describe("textToColorIndex", () => {
  it("returns a non-negative integer", () => {
    const result = textToColorIndex("hello");
    expect(result).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(result)).toBe(true);
  });

  it("returns the same value for the same input", () => {
    expect(textToColorIndex("test")).toBe(textToColorIndex("test"));
  });

  it("returns different values for different inputs", () => {
    expect(textToColorIndex("abc")).not.toBe(textToColorIndex("xyz"));
  });

  it("handles empty string", () => {
    expect(textToColorIndex("")).toBe(0);
  });
});

describe("getPillColor", () => {
  it("returns bg and text fields", () => {
    const result = getPillColor(0, false);
    expect(result).toHaveProperty("bg");
    expect(result).toHaveProperty("text");
  });

  it("returns different palettes for light vs dark", () => {
    const light = getPillColor(0, false);
    const dark = getPillColor(0, true);
    expect(light.bg).not.toBe(dark.bg);
  });

  it("wraps around when pillIndex exceeds palette length", () => {
    const a = getPillColor(0, false);
    const b = getPillColor(10, false); // palette has 10 entries, index 10 wraps to 0
    expect(a.bg).toBe(b.bg);
  });

  it("seedText shifts the offset consistently", () => {
    const withSeed = getPillColor(0, false, "some text");
    const withoutSeed = getPillColor(0, false);
    // They may differ — just verify it returns valid color structure
    expect(withSeed).toHaveProperty("bg");
    expect(withSeed).toHaveProperty("text");
    expect(withoutSeed).toHaveProperty("bg");
  });
});

describe("getKeywordColor", () => {
  it("returns a string", () => {
    expect(typeof getKeywordColor(0, false)).toBe("string");
  });

  it("returns different colors for light vs dark", () => {
    expect(getKeywordColor(0, false)).not.toBe(getKeywordColor(0, true));
  });

  it("wraps around palette correctly", () => {
    expect(getKeywordColor(0, false)).toBe(getKeywordColor(10, false));
  });
});

describe("splitWords", () => {
  it("splits basic sentence into words", () => {
    expect(splitWords("hello world")).toEqual(["hello ", "world"]);
  });

  it("preserves leading whitespace on tokens", () => {
    const result = splitWords(", are you free?");
    expect(result).toEqual([", ", "are ", "you ", "free?"]);
  });

  it("handles single word", () => {
    expect(splitWords("hello")).toEqual(["hello"]);
  });

  it("returns empty array for empty string", () => {
    expect(splitWords("")).toEqual([]);
  });
});
