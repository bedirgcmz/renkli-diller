import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { stripMarkers } from "@/utils/keywords";
import { KeywordText } from "@/components/KeywordText";
import {
  FREE_AUTO_MODE_LIMIT,
  MIN_DELAY_MS,
  DELAY_PER_CHAR_MS,
  POST_READ_DELAY_MS,
  LANG_CODE,
} from "@/utils/constants";
import { MainStackParamList, SentenceTag } from "@/types";
import { TagFilterModal, FilterButton } from "@/components/TagFilterModal";

type Phase = "idle" | "source" | "waiting" | "target" | "post" | "done";
type Speed = 0.5 | 1 | 1.5 | 2;

const SPEEDS: Speed[] = [0.5, 1, 1.5, 2];

// Actual TTS rates — 1x label = 0.85 real rate, 0.5x label = 0.4 real rate
const SPEED_RATE: Record<Speed, number> = { 0.5: 0.4, 1: 0.85, 1.5: 1.3, 2: 1.7 };

export default function AutoModeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { uiLanguage, targetLanguage, autoModeSpeed } = useSettingsStore();
  const { sentences, presetSentences, loadSentences, loadPresetSentences } = useSentenceStore();
  const { progressMap, tagMap, loadProgress, recordStudySession } = useProgressStore();
  const isPremium = useAuthStore((s) => s.user?.is_premium ?? false);

  const [speed, setSpeed] = useState<Speed>((autoModeSpeed as Speed) ?? 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTarget, setShowTarget] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [activeTagFilters, setActiveTagFilters] = useState<SentenceTag[]>([]);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = useRef<Speed>(speed);
  const skipRef = useRef<(() => void) | null>(null);

  // Sync speed ref
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  // Reset session when tag filter changes
  useEffect(() => {
    try {
      Speech.stop();
    } catch {}
    setIsPlaying(false);
    setPhase("idle");
    setCurrentIndex(0);
    setShowTarget(false);
  }, [activeTagFilters]);

  useEffect(() => {
    setInitialized(false);
    try {
      Speech.stop();
    } catch {}
    setIsPlaying(false);
    setPhase("idle");
    setCurrentIndex(0);
    Promise.all([loadSentences(), loadPresetSentences(undefined, isPremium), loadProgress()]).finally(() =>
      setInitialized(true),
    );
  }, [targetLanguage, uiLanguage, isPremium]);

  // Tüm öğreniliyor cümleler: user sentences + preset sentences (progressMap)
  const allLearning = [
    ...sentences.filter(
      (s) =>
        s.status === "learning" &&
        (s.target_lang ?? targetLanguage) === targetLanguage &&
        (s.source_lang ?? uiLanguage) === uiLanguage,
    ),
    ...presetSentences.filter((s) => progressMap[s.id] === "learning"),
  ];

  const filteredLearning =
    activeTagFilters.length === 0
      ? allLearning
      : allLearning.filter((s) => {
          const tag = s.is_preset ? tagMap[s.id] : s.tag;
          return tag != null && activeTagFilters.includes(tag);
        });

  const sessionSentences = isPremium
    ? filteredLearning
    : filteredLearning.slice(0, FREE_AUTO_MODE_LIMIT);

  const sentence = sessionSentences[currentIndex];
  const total = sessionSentences.length;

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Also resolve any pending skip
    if (skipRef.current) {
      skipRef.current();
      skipRef.current = null;
    }
  };

  // ─── Phase machine ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isPlaying || !sentence) return;

    if (phase === "source") {
      const sourceText = stripMarkers(sentence.source_text);
      Speech.speak(sourceText, {
        language: LANG_CODE[uiLanguage],
        rate: SPEED_RATE[speedRef.current],
        onDone: () => setPhase("waiting"),
        onStopped: () => {},
        onError: () => setPhase("waiting"),
      });
      return () => {
        Speech.stop();
      };
    }

    if (phase === "waiting") {
      const sourceLen = stripMarkers(sentence.source_text).length;
      const waitMs = Math.max(MIN_DELAY_MS, sourceLen * DELAY_PER_CHAR_MS) / speedRef.current;

      timerRef.current = setTimeout(() => {
        setShowTarget(true);
        setPhase("target");
      }, waitMs);

      return () => {
        clearTimeout(timerRef.current!);
        timerRef.current = null;
      };
    }

    if (phase === "target") {
      const targetText = stripMarkers(sentence.target_text);
      Speech.speak(targetText, {
        language: LANG_CODE[targetLanguage],
        rate: SPEED_RATE[speedRef.current],
        onDone: () => setPhase("post"),
        onStopped: () => {},
        onError: () => setPhase("post"),
      });
      return () => {
        Speech.stop();
      };
    }

    if (phase === "post") {
      timerRef.current = setTimeout(() => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < total) {
          setCurrentIndex(nextIndex);
          setShowTarget(false);
          setPhase("source");
        } else {
          void recordStudySession({
            user_id: "",
            sentence_id: sentence.id,
            duration_minutes: 0,
            completed: true,
          });
          setPhase("done");
          setIsPlaying(false);
        }
      }, POST_READ_DELAY_MS / speedRef.current);

      return () => {
        clearTimeout(timerRef.current!);
        timerRef.current = null;
      };
    }
  }, [phase, isPlaying, sentence, currentIndex, total, uiLanguage, targetLanguage, recordStudySession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      Speech.stop();
    };
  }, []);

  const handlePlay = () => {
    if (total === 0) return;
    setIsPlaying(true);
    setShowTarget(false);
    setPhase("source");
  };

  const handlePause = () => {
    clearTimer();
    Speech.stop();
    setIsPlaying(false);
    setPhase("idle");
  };

  const handleShow = () => {
    if (phase !== "waiting") return;
    // Cancel the waiting timer and move to target phase immediately
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowTarget(true);
    setPhase("target");
  };

  const progress = total > 0 ? (currentIndex + 1) / total : 0;
  const phaseLabel =
    phase === "source"
      ? t("auto_mode.playing")
      : phase === "waiting"
        ? t("auto_mode.thinking_time")
        : phase === "target"
          ? t("auto_mode.playing")
          : phase === "done"
            ? `${total} ${t("auto_mode.sentences_completed")}`
            : t("auto_mode.paused");

  if (!initialized) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
        edges={["top", "bottom"]}
      >
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      {/* Header */}
      <View style={styles.topBar}>
        <View style={{ opacity: isPlaying ? 0.4 : 1 }} pointerEvents={isPlaying ? "none" : "auto"}>
          <FilterButton
            activeCount={activeTagFilters.length}
            onPress={() => setFilterModalVisible(true)}
          />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{t("auto_mode.title")}</Text>
        <TouchableOpacity
          onPress={() => {
            try {
              Speech.stop();
            } catch {}
            navigation.goBack();
          }}
          hitSlop={{ top: 16, right: 16, bottom: 16, left: 16 }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <TagFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        selectedTags={activeTagFilters}
        onApply={setActiveTagFilters}
        getMatchCount={(draft) =>
          draft.length === 0
            ? allLearning.length
            : allLearning.filter((s) => {
                const tag = s.is_preset ? tagMap[s.id] : s.tag;
                return tag != null && draft.includes(tag);
              }).length
        }
      />

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: colors.primary, width: `${progress * 100}%` },
          ]}
        />
      </View>

      {/* Counter */}
      <View style={styles.counterRow}>
        <Text style={[styles.counterText, { color: colors.textSecondary }]}>
          {total > 0 ? `${currentIndex + 1}/${total}` : "0/0"}
        </Text>
        <Text style={[styles.phaseLabel, { color: colors.primary }]}>{phaseLabel}</Text>
      </View>

      {/* Info note */}
      <View
        style={[
          styles.infoBox,
          { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={styles.infoHeader}
          onPress={() => setInfoOpen((o) => !o)}
          activeOpacity={0.7}
        >
          <View style={styles.infoHeaderLeft}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.primary }]}>
              {t("auto_mode.info_title")}
            </Text>
          </View>
          <Ionicons
            name={infoOpen ? "chevron-up" : "chevron-down"}
            size={14}
            color={colors.primary}
          />
        </TouchableOpacity>
        {infoOpen && (
          <Text style={[styles.infoBody, { color: colors.textSecondary }]}>
            {t("auto_mode.info_body")}
          </Text>
        )}
      </View>

      {/* Free session limit banner */}
      {!isPremium && allLearning.length > FREE_AUTO_MODE_LIMIT && (
        <View
          style={[
            styles.limitBanner,
            { backgroundColor: colors.warning + "22", borderColor: colors.warning },
          ]}
        >
          <Text style={[styles.limitBannerText, { color: colors.warning }]}>
            {t("auto_mode.session_limit")} ({FREE_AUTO_MODE_LIMIT}/{allLearning.length})
          </Text>
          <TouchableOpacity
            style={[styles.limitBannerBtn, { backgroundColor: colors.warning }]}
            onPress={() => navigation.navigate("Paywall", { source: "quiz" })}
            activeOpacity={0.85}
          >
            <Text style={styles.limitBannerBtnText}>{t("premium.title")} →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main card */}
      <View style={styles.cardArea}>
        {total === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t("auto_mode.no_sentences")}
            </Text>
            <View style={styles.emptyActions}>
              <TouchableOpacity
                style={[styles.emptyPrimaryBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigation.getParent()?.navigate("Sentences" as never)}
                activeOpacity={0.85}
              >
                <Ionicons name="list-outline" size={16} color="#FFFFFF" />
                <Text style={styles.emptyPrimaryBtnText}>{t("quiz.go_to_sentences")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.emptySecondaryBtn,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                ]}
                onPress={() => navigation.navigate("CategoryBrowser")}
                activeOpacity={0.85}
              >
                <Ionicons name="grid-outline" size={16} color={colors.primary} />
                <Text style={[styles.emptySecondaryBtnText, { color: colors.text }]}>
                  {t("common.explore_categories")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : phase === "done" ? (
          <View style={[styles.doneCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={styles.doneIcon}>🎉</Text>
            <Text style={[styles.doneText, { color: colors.text }]}>
              {total} {t("auto_mode.sentences_completed")}
            </Text>
            <TouchableOpacity
              style={[styles.restartBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                setCurrentIndex(0);
                setShowTarget(false);
                setPhase("idle");
                setIsPlaying(false);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.restartBtnText}>{t("common.restart")}</Text>
            </TouchableOpacity>
          </View>
        ) : sentence ? (
          <View style={[styles.sentenceCard, { backgroundColor: colors.cardBackground }]}>
            {/* Source */}
            <View style={styles.sourceSection}>
              <Text style={[styles.langLabel, { color: colors.textTertiary }]}>
                {t(`languages.${uiLanguage}`).toUpperCase()}
              </Text>
              <KeywordText
                text={sentence.source_text}
                baseColor={colors.text}
                fontSize={18}
                lineHeight={27}
                colorSeed={String(sentence.id)}
              />
            </View>

            {/* Divider */}
            <View style={[styles.cardDivider, { backgroundColor: colors.divider }]} />

            {/* Target — shown or hidden */}
            <View style={styles.targetSection}>
              <Text style={[styles.langLabel, { color: colors.textTertiary }]}>
                {t(`languages.${targetLanguage}`).toUpperCase()}
              </Text>
              {showTarget ? (
                <KeywordText
                  text={sentence.target_text}
                  baseColor={colors.textSecondary}
                  fontSize={18}
                  lineHeight={27}
                  colorSeed={String(sentence.id)}
                />
              ) : (
                <View style={[styles.hiddenTarget, { backgroundColor: colors.backgroundTertiary }]}>
                  {phase === "waiting" ? (
                    <Text style={[styles.hiddenTargetText, { color: colors.textTertiary }]}>
                      ···
                    </Text>
                  ) : (
                    <Ionicons name="eye-off-outline" size={22} color={colors.textTertiary} />
                  )}
                </View>
              )}
            </View>

            {/* Visual image */}
            {sentence.visual_image_url && (
              <View style={styles.visualImageWrapper}>
                <View style={styles.visualImageClip}>
                  <Image
                    source={{ uri: sentence.visual_image_url }}
                    style={styles.visualImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
            )}
          </View>
        ) : null}
      </View>

      {/* Show button */}
      {phase === "waiting" && isPlaying && (
        <TouchableOpacity
          style={[
            styles.showBtn,
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
          ]}
          onPress={handleShow}
          activeOpacity={0.8}
        >
          <Ionicons name="eye-outline" size={20} color={colors.primary} />
          <Text style={[styles.showBtnText, { color: colors.primary }]}>
            {t("auto_mode.show_answer")}
          </Text>
        </TouchableOpacity>
      )}

      {/* Speed selector */}
      <View style={styles.speedRow}>
        <Text style={[styles.speedLabel, { color: colors.textSecondary }]}>
          {t("auto_mode.speed")}:
        </Text>
        {SPEEDS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[
              styles.speedChip,
              {
                backgroundColor: speed === s ? colors.primary : colors.backgroundSecondary,
                borderColor: speed === s ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setSpeed(s)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.speedChipText, { color: speed === s ? "#fff" : colors.textSecondary }]}
            >
              {s}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Play/Pause button */}
      <View style={styles.controlRow}>
        <TouchableOpacity
          style={[
            styles.playBtn,
            {
              backgroundColor: isPlaying ? colors.error : colors.primary,
              opacity: total === 0 ? 0.4 : 1,
            },
          ]}
          onPress={isPlaying ? handlePause : handlePlay}
          disabled={total === 0}
          activeOpacity={0.85}
        >
          <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: { fontSize: 17, fontWeight: "600" },
  progressTrack: {
    height: 3,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: { height: 3, borderRadius: 2 },
  counterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  counterText: { fontSize: 13 },
  phaseLabel: { fontSize: 13, fontWeight: "500" },
  cardArea: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  sentenceCard: {
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sourceSection: { marginBottom: 16 },
  targetSection: { marginTop: 16 },
  langLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginBottom: 8 },
  cardDivider: { height: 1 },
  hiddenTarget: {
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  hiddenTargetText: { fontSize: 22, letterSpacing: 8 },
  emptyCard: {
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: 16, textAlign: "center" },
  emptyActions: {
    width: "100%",
    gap: 10,
    marginTop: 8,
  },
  emptyPrimaryBtn: {
    minHeight: 46,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  emptyPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  emptySecondaryBtn: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  emptySecondaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  doneCard: {
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    gap: 16,
  },
  doneIcon: { fontSize: 52 },
  doneText: { fontSize: 18, fontWeight: "600" },
  restartBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  restartBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  showBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
    marginBottom: 10,
  },
  showBtnText: { fontSize: 14, fontWeight: "600" },
  speedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  speedLabel: { fontSize: 13 },
  speedChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  speedChipText: { fontSize: 13, fontWeight: "600" },
  controlRow: {
    alignItems: "center",
    paddingVertical: 20,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  infoBox: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  infoHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  infoBody: {
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  limitBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  limitBannerText: { fontSize: 12, flex: 1, lineHeight: 17 },
  limitBannerBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  limitBannerBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  visualImageWrapper: {
    alignItems: "center",
    marginTop: 2,
    marginBottom: -26,
  },
  visualImageClip: {
    width: 160,
    height: 160,
    overflow: "hidden",
  },
  visualImage: {
    position: "absolute",
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
  },
});
