import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import { stripMarkers } from "@/utils/keywords";
import { usePremium } from "@/hooks/usePremium";
import { GradientView } from "@/components/GradientView";
import { KeywordText } from "@/components/KeywordText";
import { Sentence, SupportedLanguage } from "@/types";

// State-aware top accent colors (subtle, not a bar)
const STATE_ACCENT: Record<"new" | "learning" | "learned", string> = {
  new: "rgba(232,93,93,0.28)",
  learning: "rgba(77,163,255,0.28)",
  learned: "rgba(73,201,138,0.28)",
};

const LANG_CODE: Record<SupportedLanguage, string> = {
  tr: "tr-TR",
  en: "en-US",
  sv: "sv-SE",
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  pt: "pt-BR",
};

export interface SentenceCardProps {
  sentence: Sentence;
  uiLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  state: "new" | "learning" | "learned";
  onLearn: () => void;
  onMarkLearned: () => void;
  onForgot: () => void;
  onRemoveFromList?: () => void;
  onEdit?: () => void;
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
  onRemoveFromList,
  onEdit,
  showTarget = true,
}) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { isPremium } = usePremium();
  const [speaking, setSpeaking] = useState(false);

  const hasMismatch =
    !sentence.is_preset &&
    sentence.source_lang &&
    sentence.target_lang &&
    onEdit &&
    (sentence.source_lang !== uiLanguage || sentence.target_lang !== targetLanguage);

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
        rate: 0.85,
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    };
    if (isPremium) {
      Speech.speak(stripMarkers(sentence.source_text), {
        language: LANG_CODE[uiLanguage],
        rate: 0.85,
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

  const actionConfig = {
    new: { label: t("learn.add_to_list"), icon: "add-circle-outline" as const, handler: onLearn },
    learning: {
      label: t("learn.mark_learned"),
      icon: "checkmark-circle-outline" as const,
      handler: onMarkLearned,
    },
    learned: {
      label: t("learn.mark_unlearned"),
      icon: "refresh-outline" as const,
      handler: onForgot,
    },
  }[state];

  // ── Theme-aware tokens  ────────────────────────────────────────────
  const cardBg: [string, string] = isDark
    ? ["#1E2130", "#181C28"] // v1 same — works well
    : ["#F4F1EB", "#fefaff"]; // ❌ was pure white → ✅ subtle cool-white

  const outerBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";

  const dividerColor = isDark
    ? "rgba(255,255,255,0.10)" // slightly more visible than v1
    : "rgba(0,0,0,0.12)"; // ✅ feedback: was too weak

  // Button: soft fill per feedback
  const btnBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const btnBgPress = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const btnBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  // Shadow: stronger per feedback
  const shadowColor = isDark ? "#000000" : "#1A2340";
  const shadowOpacity = isDark ? 0.45 : 0.09; // ❌ v1: 0.4/0.1 → ✅ v2: 0.45/0.09

  return (
    // Outer: shadow (no overflow:hidden)
    <View
      style={[
        styles.cardOuter,
        {
          borderColor: outerBorder,
          shadowColor,
          shadowOpacity,
        },
      ]}
    >
      {/* Inner: overflow:hidden — gradient bg + top accent */}
      <View style={styles.cardInner}>
        {/* Subtle diagonal card gradient */}
        <GradientView
          colors={cardBg}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
        />

        {/* ✅ v2: 1px subtle accent line (not 3px bar) — state awareness without gimmick */}
        <View />

        <View style={styles.body}>
          {/* Source — semi-bold */}
          <KeywordText
            text={sentence.source_text}
            baseColor={colors.text}
            fontSize={18}
            lineHeight={27}
            fontWeight="600"
            colorSeed={String(sentence.id)}
          />

          {/* Target + TTS */}
          {showTarget && (
            <View style={[styles.targetRow, { borderTopColor: dividerColor }]}>
              <View style={styles.targetText}>
                <KeywordText
                  text={sentence.target_text}
                  baseColor={colors.textSecondary}
                  fontSize={15}
                  lineHeight={22}
                  colorSeed={String(sentence.id)}
                />
              </View>
              {/* ✅ v2: softer icon opacity */}
              <Pressable
                onPress={handleAudio}
                style={({ pressed }) => [
                  styles.ttsBtn,
                  {
                    backgroundColor: pressed ? colors.primary + "28" : colors.primary + "10",
                    transform: [{ scale: pressed ? 0.9 : 1 }],
                  },
                ]}
              >
                <Ionicons
                  name={speaking ? "stop-circle" : "volume-high-outline"}
                  size={19}
                  color={isDark ? colors.primary + "CC" : colors.primary}
                />
              </Pressable>
            </View>
          )}

          {/* Category chip */}
          {sentence.category_name ? (
            <View
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                },
              ]}
            >
              <Text style={[styles.categoryText, { color: colors.textTertiary }]}>
                {sentence.category_name}
              </Text>
            </View>
          ) : null}

          {/* Action buttons */}
          <View style={[styles.actionRow, state === "learning" && onRemoveFromList ? styles.actionRowSplit : null]}>
            {state === "learning" && onRemoveFromList ? (
              <>
                {/* Listeden Çıkar — ghost */}
                <Pressable onPress={onRemoveFromList} style={{ flex: 1 }}>
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: pressed ? btnBgPress : btnBg,
                          borderColor: btnBorder,
                          transform: [{ scale: pressed ? 0.96 : 1 }],
                        },
                      ]}
                    >
                      <Ionicons name="remove-circle-outline" size={15} color={colors.textTertiary} />
                      <Text numberOfLines={1} style={[styles.actionBtnText, { color: colors.textTertiary }]}>
                        {t("learn.remove_from_list")}
                      </Text>
                    </View>
                  )}
                </Pressable>
                {/* Öğrendim — accent fill */}
                <Pressable onPress={onMarkLearned} style={{ flex: 1 }}>
                  {({ pressed }) => (
                    <View
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: pressed ? colors.primary + "33" : colors.primary + "18",
                          borderColor: colors.primary + "40",
                          transform: [{ scale: pressed ? 0.96 : 1 }],
                        },
                      ]}
                    >
                      <Ionicons name="checkmark-circle-outline" size={15} color={colors.primary} />
                      <Text numberOfLines={1} style={[styles.actionBtnText, { color: colors.primary }]}>
                        {t("learn.mark_learned")}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </>
            ) : (
              <Pressable onPress={actionConfig.handler}>
                {({ pressed }) => (
                  <View
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: pressed ? btnBgPress : btnBg,
                        borderColor: btnBorder,
                        transform: [{ scale: pressed ? 0.96 : 1 }],
                      },
                    ]}
                  >
                    <Ionicons name={actionConfig.icon} size={15} color={colors.textSecondary} />
                    <Text numberOfLines={1} style={[styles.actionBtnText, { color: colors.textSecondary }]}>
                      {actionConfig.label}
                    </Text>
                  </View>
                )}
              </Pressable>
            )}
          </View>

          {hasMismatch && (
            <View style={{ marginTop: 8 }}>
              <Pressable onPress={onEdit} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                <View style={styles.mismatchStrip}>
                  <Ionicons name="warning-outline" size={13} color="#B45309" />
                  <Text style={styles.mismatchText}>{t("sentences.lang_mismatch_strip")}</Text>
                </View>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: 18,
    borderWidth: 1,
    // ✅ v2: deeper shadow
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 28,
    elevation: 8,
  },
  cardInner: {
    borderRadius: 17,
    overflow: "hidden",
  },
  // ✅ v2: 1px accent instead of 3px gradient bar
  body: {
    padding: 18,
    paddingBottom: 14,
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  targetText: { flex: 1 },
  ttsBtn: {
    width: 34,
    height: 34,
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
    marginTop: 12,
  },
  categoryText: { fontSize: 11 },
  actionRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  actionRowSplit: {
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 22,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  actionBtnText: {
    fontWeight: "600",
    fontSize: 13,
  },
  mismatchStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(245,158,11,0.10)",
  },
  mismatchText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#B45309",
  },
});
