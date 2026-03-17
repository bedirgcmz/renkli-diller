import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/providers/ThemeProvider";
import { parseKeywords } from "@/utils/keywords";
import { usePremium } from "@/hooks/usePremium";
import { Sentence, SupportedLanguage, TextSegment } from "@/types";

// State renkleri: KIRMIZI=new, MAVİ=learning, YEŞİL=learned
const STATUS_BAR_COLOR: Record<"new" | "learning" | "learned", string> = {
  new: "#E53E3E",
  learning: "#3B8BD4",
  learned: "#2ECC71",
};

const LANG_CODE: Record<SupportedLanguage, string> = {
  tr: "tr-TR",
  en: "en-US",
  sv: "sv-SE",
  de: "de-DE",
};

function stripMarkers(text: string): string {
  return text.replace(/([*#%@+&{~])(.*?)\1/g, "$2");
}

function KeywordText({
  segments,
  baseColor,
  fontSize,
  lineHeight,
  fontWeight,
}: {
  segments: TextSegment[];
  baseColor: string;
  fontSize: number;
  lineHeight: number;
  fontWeight?: "400" | "500" | "600";
}) {
  return (
    <Text>
      {segments.map((seg, i) => (
        <Text
          key={i}
          style={{
            color: seg.color ?? baseColor,
            fontStyle: seg.isItalic ? "italic" : "normal",
            fontSize,
            lineHeight,
            fontWeight: fontWeight ?? "400",
          }}
        >
          {seg.text}
        </Text>
      ))}
    </Text>
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

  const sourceSegments = parseKeywords(sentence.source_text);
  const targetSegments = parseKeywords(sentence.target_text);
  const barColor = STATUS_BAR_COLOR[state];

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

  // Durum butonu config
  const actionConfig = {
    new: {
      label: t("learn.add_to_list"),
      icon: "add-circle-outline" as const,
      color: "#3B8BD4",
      bg: "#3B8BD420",
      bgPressed: "#3B8BD440",
      handler: onLearn,
    },
    learning: {
      label: t("learn.mark_learned"),
      icon: "checkmark-circle-outline" as const,
      color: "#2ECC71",
      bg: "#2ECC7120",
      bgPressed: "#2ECC7140",
      handler: onMarkLearned,
    },
    learned: {
      label: t("learn.mark_unlearned"),
      icon: "refresh-outline" as const,
      color: "#E53E3E",
      bg: "#E53E3E20",
      bgPressed: "#E53E3E40",
      handler: onForgot,
    },
  }[state];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* 8px renkli durum barı */}
      <View style={[styles.statusBar, { backgroundColor: barColor }]} />

      <View style={styles.body}>
        {/* Kaynak dil — tam genişlik, sağda buton yok */}
        <KeywordText
          segments={sourceSegments}
          baseColor={colors.text}
          fontSize={18}
          lineHeight={26}
          fontWeight="500"
        />

        {/* Hedef dil + TTS yan yana */}
        {showTarget && (
          <View style={styles.targetRow}>
            <View style={styles.targetText}>
              <KeywordText
                segments={targetSegments}
                baseColor={colors.textSecondary}
                fontSize={15}
                lineHeight={22}
              />
            </View>
            {/* TTS — hedef dilin sağında */}
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

        {/* Kategori chip */}
        {sentence.category_name ? (
          <View style={[styles.categoryChip, { backgroundColor: colors.backgroundTertiary }]}>
            <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
              {sentence.category_name}
            </Text>
          </View>
        ) : null}

        {/* Tek aksiyon butonu — kart alt kısmında, sağa hizalı */}
        <View style={styles.actionRow}>
          <Pressable onPress={actionConfig.handler}>
            {({ pressed }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 3,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: pressed ? actionConfig.bgPressed : "#22C57E",
                  borderWidth: 1,
                  borderColor: actionConfig.color,
                  transform: [{ scale: pressed ? 0.93 : 1 }],
                  alignSelf: "flex-start",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={actionConfig.icon} size={22} color={"#fff"} />

                <Text
                  numberOfLines={1}
                  style={{
                    marginLeft: 6,
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {actionConfig.label}
                </Text>
              </View>
            )}
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
    shadowRadius: 8,
    elevation: 3,
  },
  statusBar: {
    height: 8,
    width: "100%",
  },
  body: {
    padding: 16,
    paddingBottom: 6,
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
    justifyContent: "flex-end",
    marginTop: 6,
    marginBottom: 6,
  },
});
