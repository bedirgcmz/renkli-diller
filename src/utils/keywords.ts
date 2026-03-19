import { PillSegment } from '@/types';
import { PILL_COLORS, KEYWORD_TEXT_COLORS } from './constants';

const pillPattern = /\*\*(.*?)\*\*/g;

/**
 * Parse **keyword** markers in text.
 * Input:  "Ben **öğrenmek** istiyorum"
 * Output: [
 *   { text: "Ben ", isPill: false, pillIndex: null },
 *   { text: "öğrenmek", isPill: true, pillIndex: 0 },
 *   { text: " istiyorum", isPill: false, pillIndex: null }
 * ]
 */
export function parseKeywords(text: string): PillSegment[] {
  const segments: PillSegment[] = [];
  let lastIndex = 0;
  let pillIndex = 0;
  let match: RegExpExecArray | null;

  // Reset lastIndex before each call
  pillPattern.lastIndex = 0;

  while ((match = pillPattern.exec(text)) !== null) {
    // Plain text before this match
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), isPill: false, pillIndex: null });
    }
    // Pill keyword
    segments.push({ text: match[1], isPill: true, pillIndex });
    pillIndex++;
    lastIndex = pillPattern.lastIndex;
  }

  // Remaining plain text after last match
  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isPill: false, pillIndex: null });
  }

  return segments;
}

/**
 * Stable hash of a string → number (used to spread colors across sentences).
 */
export function textToColorIndex(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}

/**
 * Get pill color. Pass seedText (full sentence text) so each sentence gets
 * a different color rather than always using the first palette entry.
 */
export function getPillColor(pillIndex: number, isDark: boolean, seedText?: string): { bg: string; text: string } {
  const palette = isDark ? PILL_COLORS.dark : PILL_COLORS.light;
  const offset = seedText ? textToColorIndex(seedText) : 0;
  return palette[(offset + pillIndex) % palette.length];
}

/**
 * Get keyword text color (no background — color is applied to the word itself).
 */
export function getKeywordColor(pillIndex: number, isDark: boolean, seedText?: string): string {
  const palette = isDark ? KEYWORD_TEXT_COLORS.dark : KEYWORD_TEXT_COLORS.light;
  const offset = seedText ? textToColorIndex(seedText) : 0;
  return palette[(offset + pillIndex) % palette.length];
}

/**
 * Split plain text into word tokens preserving surrounding whitespace.
 * " more text" → [" more ", "text"]
 * ", are you free?" → [", ", "are ", "you ", "free?"]
 * Used so each word can be a separate flex item, allowing proper wrap
 * after View-based pill elements in a flex row.
 */
export function splitWords(text: string): string[] {
  return text.match(/\s*\S+\s*/g) ?? (text ? [text] : []);
}

/**
 * Remove ** markers from text (used for TTS, quiz comparison, search, etc.)
 */
export function stripMarkers(text: string): string {
  return text.replace(/\*\*/g, '');
}
