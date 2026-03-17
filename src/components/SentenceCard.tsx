import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import { parseKeywords, getPillColor, splitWords, stripMarkers } from "@/utils/keywords";
import { usePremium } from "@/hooks/usePremium";
import { GradientView } from "@/components/GradientView";
import { Sentence, SupportedLanguage } from "@/types";

// Status gradient colors
const STATUS_BAR_GRADIENT: Record<"new" | "learning" | "learned", [string, string]> = {
  new: ["#E85D5D", "#F87171"],
  learning: ["#4DA3FF", "#7CC4FF"],
  learned: ["#49C98A", "#6EE7B7"],
};

const LANG_CODE: Record<SupportedLanguage, string> = {
  tr: "tr-TR",
  en: "en-US",
  sv: "sv-SE",
  de: "de-DE",
};

function KeywordText({
  text,
  baseColor,
  fontSize,
  lineHeight,
  fontWeight,
  colorSeed,
}: {
  text: string;
  baseColor: string;
  fontSize: number;
  lineHeight: number;
  fontWeight?: "400" | "500" | "600";
  colorSeed: string;
}) {
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

export interface SentenceCardProps {
  sentence: Sentence;
  uiLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  state: "new" | "learning" | "learned";
  onLearn: () => void; // KIRMIZI → MAVİ
  onMarkLearned: () => void; // MAVİ → YEŞİL
  onForgot: () => void; // YEŞİL → KIRMIZI
  showTarget?: boolean;
}

export const SentenceCard: React.FC<SentenceCardProps> = ({
  sentence,
  uiLanguage,
  targetLanguage,
  state,
  onLearn,
  onMarkLearned,
  onForgot,
  showTarget = true,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { isPremium } = usePremium();
  const [speaking, setSpeaking] = useState(false);

  const barGradient = STATUS_BAR_GRADIENT[state];

  const handleAudio = async () => {
    if (speaking) {
      await Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    const speakTarget = () => {
      Speech.speak(stripMarkers(sentence.target_text), {
        language: LANG_CODE[targetLanguage],
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    };
    if (isPremium) {
      Speech.speak(stripMarkers(sentence.source_text), {
        language: LANG_CODE[uiLanguage],
        onDone: () => {
          setTimeout(speakTarget, 1000);
        },
        onStopped: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    } else {
      speakTarget();
    }
  };

  // Button gradient colors per state
  const actionConfig = {
    new: {
      label: t("learn.add_to_list"),
      icon: "add-circle-outline" as const,
      gradient: ["#4DA3FF", "#2E7DC0"] as [string, string],
      handler: onLearn,
    },
    learning: {
      label: t("learn.mark_learned"),
      icon: "checkmark-circle-outline" as const,
      gradient: ["#49C98A", "#2FAF72"] as [string, string],
      handler: onMarkLearned,
    },
    learned: {
      label: t("learn.mark_unlearned"),
      icon: "refresh-outline" as const,
      gradient: ["#E85D5D", "#DC2626"] as [string, string],
      handler: onForgot,
    },
  }[state];

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      {/* 8px gradient status bar */}
      <GradientView
        colors={barGradient}
        style={styles.statusBar}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />

      <View style={styles.body}>
        {/* Source language — full width, no icon on right */}
        <KeywordText
          text={sentence.source_text}
          baseColor={colors.text}
          fontSize={18}
          lineHeight={26}
          fontWeight="500"
          colorSeed={String(sentence.id)}
        />

        {/* Target language + TTS side by side */}
        {showTarget && (
          <View style={styles.targetRow}>
            <View style={styles.targetText}>
              <KeywordText
                text={sentence.target_text}
                baseColor={colors.textSecondary}
                fontSize={15}
                lineHeight={22}
                colorSeed={String(sentence.id)}
              />
            </View>
            {/* TTS — on the right of target */}
            <Pressable
              onPress={handleAudio}
              style={({ pressed }) => [
                styles.ttsBtn,
                {
                  backgroundColor: pressed ? colors.primary + "30" : colors.primary + "15",
                  transform: [{ scale: pressed ? 0.9 : 1 }],
                },
              ]}
            >
              <Ionicons
                name={speaking ? "stop-circle" : "volume-high-outline"}
                size={22}
                color={colors.primary}
              />
            </Pressable>
          </View>
        )}

        {/* Category chip — bottom left */}
        {sentence.category_name ? (
          <View style={[styles.categoryChip, { backgroundColor: colors.backgroundTertiary }]}>
            <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
              {sentence.category_name}
            </Text>
          </View>
        ) : null}

        {/* Action button — centered, ~80% width */}
        <View style={styles.actionRow}>
          <Pressable
            onPress={actionConfig.handler}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.95 : 1 }],
              opacity: pressed ? 0.85 : 1,
              width: "80%",
            })}
          >
            <GradientView
              colors={actionConfig.gradient}
              style={styles.actionBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name={actionConfig.icon} size={20} color="#fff" />
              <Text numberOfLines={1} style={styles.actionBtnText}>
                {actionConfig.label}
              </Text>
            </GradientView>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  statusBar: {
    height: 8,
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  body: {
    padding: 16,
    paddingBottom: 12,
    gap: 0,
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  targetText: {
    flex: 1,
  },
  ttsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  categoryChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 10,
  },
  categoryText: {
    fontSize: 11,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 8,
    gap: 6,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
