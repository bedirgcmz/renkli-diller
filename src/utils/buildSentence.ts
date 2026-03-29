import { Sentence } from "@/types";
import { stripMarkers } from "./keywords";

export interface WordChip {
  /** Unique id within this exercise (stable across renders) */
  id: string;
  /** Text shown on the chip, may include punctuation */
  display: string;
  /** Lowercased, punctuation-stripped version used for answer checking */
  normalized: string;
  /** True for distractor words that don't belong in the answer */
  isDecoy: boolean;
}

/**
 * Strip leading and trailing punctuation from a word for comparison purposes.
 * Preserves mid-word punctuation (e.g. apostrophes in contractions).
 */
export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .trim()
    .replace(/^[.,!?;:'"«»„""()\[\]…–—]+|[.,!?;:'"«»„""()\[\]…–—]+$/g, "");
}

/**
 * Build the word chips for a BuildSentence exercise.
 *
 * - Correct chips come from `sentence.target_text` (markers stripped).
 * - Decoy chips are sampled from other sentences in `pool` so they look
 *   plausible but don't overlap with the correct words.
 *
 * Returns:
 *   chips        — shuffled array of all chips (correct + decoys)
 *   correctOrder — normalized words of the correct sentence in order
 */
export function buildWordChips(
  sentence: Sentence,
  pool: Sentence[],
  decoyCount = 3,
): { chips: WordChip[]; correctOrder: string[] } {
  const cleanTarget = stripMarkers(sentence.target_text);
  const rawWords = cleanTarget.match(/\S+/g) ?? [];

  const correctChips: WordChip[] = rawWords.map((word, idx) => ({
    id: `c_${idx}`,
    display: word,
    normalized: normalizeWord(word),
    isDecoy: false,
  }));

  const correctNormalizedSet = new Set(correctChips.map((c) => c.normalized));
  const correctOrder = correctChips.map((c) => c.normalized);

  // Collect decoy candidates from other sentences in the pool
  const seenDecoyNorms = new Set(correctNormalizedSet);
  const decoyDisplayWords: string[] = [];

  const shuffledOthers = [...pool.filter((s) => s.id !== sentence.id)].sort(
    () => Math.random() - 0.5,
  );

  outer: for (const s of shuffledOthers) {
    const words = stripMarkers(s.target_text).match(/\S+/g) ?? [];
    for (const w of words) {
      const norm = normalizeWord(w);
      // Skip short words, duplicates, and words already in the correct sentence
      if (norm.length <= 1 || seenDecoyNorms.has(norm)) continue;
      decoyDisplayWords.push(w);
      seenDecoyNorms.add(norm);
      if (decoyDisplayWords.length >= decoyCount) break outer;
    }
  }

  const decoyChips: WordChip[] = decoyDisplayWords.map((word, idx) => ({
    id: `d_${idx}`,
    display: word,
    normalized: normalizeWord(word),
    isDecoy: true,
  }));

  // Shuffle correct + decoy chips together
  const chips = [...correctChips, ...decoyChips].sort(() => Math.random() - 0.5);

  return { chips, correctOrder };
}
