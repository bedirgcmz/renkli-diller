import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
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

// Animated buton ile press efekti
function AnimatedBtn({
  onPress,
  bgColor,
  children,
}: {
  onPress: () => void;
  bgColor: string;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          styles.actionBtn,
          { backgroundColor: bgColor, transform: [{ scale }] },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

export interface SentenceCardProps {
  sentence: Sentence;
  uiLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  state: "new" | "learning" | "learned";
  onLearn: () => void;       // KIRMIZI → MAVİ
  onMarkLearned: () => void; // MAVİ → YEŞİL
  onForgot: () => void;      // YEŞİL → KIRMIZI
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
        onDone: () => { setTimeout(speakTarget, 1000); },
        onStopped: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    } else {
      speakTarget();
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {/* Renkli durum barı: KIRMIZI=new, MAVİ=learning, YEŞİL=learned */}
      <View style={[styles.statusBar, { backgroundColor: barColor }]} />

      <View style={styles.body}>
        {/* Metin */}
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

          {sentence.category_name ? (
            <View style={[styles.categoryChip, { backgroundColor: colors.backgroundTertiary }]}>
              <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
                {sentence.category_name}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Sağ kolon: TTS + tek durum butonu */}
        <View style={styles.actions}>
          {/* TTS - her zaman görünür */}
          <AnimatedBtn
            onPress={handleAudio}
            bgColor={colors.primary + "18"}
          >
            <Ionicons
              name={speaking ? "stop-circle" : "volume-high-outline"}
              size={20}
              color={colors.primary}
            />
          </AnimatedBtn>

          {/* Durum butonu: sadece bir tanesi gösterilir */}
          {state === "new" && (
            <AnimatedBtn onPress={onLearn} bgColor="#3B8BD420">
              <Ionicons name="add-circle-outline" size={20} color="#3B8BD4" />
            </AnimatedBtn>
          )}
          {state === "learning" && (
            <AnimatedBtn onPress={onMarkLearned} bgColor="#2ECC7120">
              <Ionicons name="checkmark-circle-outline" size={20} color="#2ECC71" />
            </AnimatedBtn>
          )}
          {state === "learned" && (
            <AnimatedBtn onPress={onForgot} bgColor="#E53E3E20">
              <Ionicons name="refresh-outline" size={20} color="#E53E3E" />
            </AnimatedBtn>
          )}
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
