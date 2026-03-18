import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/providers/ThemeProvider";
import { parseKeywords, getPillColor, splitWords } from "@/utils/keywords";

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
          const color = getPillColor(seg.pillIndex, isDark, colorSeed);
          return [
            <View
              key={i}
              style={{
                backgroundColor: color.bg,
                borderRadius: 6,
                paddingHorizontal: 6,
                paddingVertical: 2,
                marginRight: 1,
              }}
            >
              <Text style={{ color: color.text, fontSize, fontWeight: "700" }}>{seg.text}</Text>
            </View>,
          ];
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
