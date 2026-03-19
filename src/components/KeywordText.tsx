import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { parseKeywords, getKeywordColor, splitWords } from "@/utils/keywords";

interface KeywordTextProps {
  text: string;
  baseColor: string;
  fontSize: number;
  lineHeight?: number;
  fontWeight?: "400" | "500" | "600";
  colorSeed: string;
}

export function KeywordText({
  text,
  baseColor,
  fontSize,
  lineHeight,
  fontWeight,
  colorSeed,
}: KeywordTextProps) {
  const { isDark } = useTheme();
  const segments = parseKeywords(text);
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center" }}>
      {segments.flatMap((seg, i) => {
        if (seg.isPill && seg.pillIndex !== null) {
          const color = getKeywordColor(seg.pillIndex, isDark, colorSeed);
          return splitWords(seg.text).map((word, j) => (
            <Text
              key={`${i}-${j}`}
              style={{ color, fontSize, lineHeight, fontWeight: "700" }}
            >
              {word}
            </Text>
          ));
        }
        return splitWords(seg.text).map((word, j) => (
          <Text
            key={`${i}-${j}`}
            style={{ color: baseColor, fontSize, lineHeight, fontWeight: fontWeight ?? "400" }}
          >
            {word}
          </Text>
        ));
      })}
    </View>
  );
}
