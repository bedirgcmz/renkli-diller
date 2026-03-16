import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";
import { parseKeywords } from "@/utils/keywords";
import { usePremium } from "@/hooks/usePremium";
import { Sentence, SupportedLanguage, TextSegment } from "@/types";

const STATUS_BAR_COLOR: Record<"new" | "learning" | "learned", string> = {
  new: "#3B8BD4",
  learning: "#2ECC71",
  learned: "#E53E3E",
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

interface SentenceCardProps {
  sentence: Sentence;
  uiLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  state: "new" | "learning" | "learned";
  onMarkLearned: () => void;
  onMarkUnlearned: () => void;
  onAddToList: () => void;
  onRemoveFromList: () => void;
  showTarget?: boolean;
}

export const SentenceCard: React.FC<SentenceCardProps> = ({
  sentence,
  uiLanguage,
  targetLanguage,
  state,
  onMarkLearned,
  onMarkUnlearned,
  onAddToList,
  onRemoveFromList,
  showTarget = true,
}) => {
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
      const targetText = stripMarkers(sentence.target_text);
      Speech.speak(targetText, {
        language: LANG_CODE[targetLanguage],
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    };

    if (isPremium) {
      const sourceText = stripMarkers(sentence.source_text);
      Speech.speak(sourceText, {
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

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Renkli durum barı */}
      <View style={[styles.statusBar, { backgroundColor: barColor }]} />

      <View style={styles.body}>
        {/* Metin bölümü */}
        <View style={styles.textSection}>
          <KeywordText
            segments={sourceSegments}
            baseColor={colors.text}
            fontSize={18}
            lineHeight={26}
            fontWeight="500"
          />

          {showTarget && (
            <View style={styles.targetContainer}>
              <KeywordText
                segments={targetSegments}
                baseColor={colors.textSecondary}
                fontSize={16}
                lineHeight={22}
              />
            </View>
          )}

          <View
            style={[
              styles.categoryChip,
              { backgroundColor: colors.backgroundTertiary },
            ]}
          >
            <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
              {sentence.category.replace(/_/g, " ")}
            </Text>
          </View>
        </View>

        {/* Aksyon butonları (sağ kolon) */}
        <View style={styles.actions}>
          {/* Listeye ekle / listeden çıkar */}
          {state === "new" && (
            <TouchableOpacity
              onPress={onAddToList}
              hitSlop={HIT_SLOP}
              activeOpacity={0.7}
              style={[styles.actionBtn, { backgroundColor: colors.primary + "20" }]}
            >
              <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
            </TouchableOpacity>
          )}
          {state === "learning" && (
            <TouchableOpacity
              onPress={onRemoveFromList}
              hitSlop={HIT_SLOP}
              activeOpacity={0.7}
              style={[styles.actionBtn, { backgroundColor: colors.backgroundTertiary }]}
            >
              <Ionicons name="remove-circle-outline" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          {state === "learned" && (
            <TouchableOpacity
              onPress={onMarkUnlearned}
              hitSlop={HIT_SLOP}
              activeOpacity={0.7}
              style={[styles.actionBtn, { backgroundColor: "#E53E3E20" }]}
            >
              <Ionicons name="refresh-outline" size={22} color="#E53E3E" />
            </TouchableOpacity>
          )}

          {/* TTS butonu */}
          <TouchableOpacity
            onPress={handleAudio}
            hitSlop={HIT_SLOP}
            activeOpacity={0.7}
            style={[styles.actionBtn, { backgroundColor: colors.primary + "15" }]}
          >
            <Ionicons
              name={speaking ? "stop-circle" : "volume-high-outline"}
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>

          {/* Öğrendim / Tekrar öğren */}
          {state !== "learned" ? (
            <TouchableOpacity
              onPress={onMarkLearned}
              hitSlop={HIT_SLOP}
              activeOpacity={0.7}
              style={[styles.actionBtn, { backgroundColor: "#2ECC7120" }]}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color="#2ECC71" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const HIT_SLOP = { top: 6, bottom: 6, left: 6, right: 6 };

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
    height: 5,
    width: "100%",
  },
  body: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  textSection: {
    flex: 1,
  },
  targetContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.08)",
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
    textTransform: "capitalize",
  },
  actions: {
    width: 36,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
    paddingTop: 2,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
