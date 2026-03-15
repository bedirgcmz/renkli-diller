import { KeywordColor, TextSegment } from "@/types";
import { KEYWORD_COLORS } from "./constants";

const markerToColor = new Map<KeywordColor["marker"], string>(
  KEYWORD_COLORS.map((c) => [c.marker, c.color] as const),
);

const markerPattern = /([*#%@+&{~])(.*?)\1/g;

export function parseKeywords(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(markerPattern)) {
    const [fullMatch, marker, inner] = match;
    const start = match.index ?? 0;
    const end = start + fullMatch.length;

    if (lastIndex < start) {
      segments.push({
        text: text.slice(lastIndex, start),
        color: null,
      });
    }

    const color = markerToColor.get(marker as KeywordColor["marker"]) ?? null;
    segments.push({
      text: inner,
      color,
      isItalic: marker === "@",
    });

    lastIndex = end;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      color: null,
    });
  }

  return segments;
}
