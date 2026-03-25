import React, { useEffect, useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  type DimensionValue,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";
import type { ThemeColors } from "@/providers/ThemeProvider";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { SentenceCard } from "@/components/SentenceCard";
import { GradientView } from "@/components/GradientView";
import { KeywordText } from "@/components/KeywordText";
import { FavoriteButton } from "@/components/FavoriteButton";
import { speak, stopSpeaking } from "@/services/tts";
import { stripMarkers } from "@/utils/keywords";
import { QUIZ_CORRECT_COLOR, QUIZ_WRONG_COLOR } from "@/utils/constants";
import { Sentence, HomeStackParamList, MainStackParamList } from "@/types";
import * as Haptics from "expo-haptics";

type TabKey = "learning" | "listening";

interface ListenOption {
  text: string;
  isCorrect: boolean;
}

function generateListenOptions(sentence: Sentence, pool: Sentence[]): ListenOption[] {
  const correctText = stripMarkers(sentence.source_text);
  const others = pool
    .filter((s) => s.id !== sentence.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((s) => ({ text: stripMarkers(s.source_text), isCorrect: false as const }));
  return [...others, { text: correctText, isCorrect: true as const }].sort(
    () => Math.random() - 0.5,
  );
}

// ─── Listening card ────────────────────────────────────────────────────────────

function ListenCard({
  sentence,
  showTarget,
  onToggleTarget,
  options,
  selected,
  onSelectOption,
  onReplay,
  onReplaySlow,
  colors,
  t,
}: {
  sentence: Sentence;
  showTarget: boolean;
  onToggleTarget: () => void;
  options: ListenOption[];
  selected: string | null;
  onSelectOption: (opt: ListenOption) => void;
  onReplay: () => void;
  onReplaySlow: () => void;
  colors: ThemeColors;
  t: (k: string) => string;
}) {
  return (
    <View style={[listenStyles.card, { backgroundColor: colors.cardBackground }]}>
      {/* ── Icon row: eye toggle + replay + favorite — horizontal, left-aligned ── */}
      <View style={listenStyles.iconRow}>
        <TouchableOpacity
          style={[listenStyles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}
          onPress={onToggleTarget}
          activeOpacity={0.75}
        >
          <Ionicons
            name={showTarget ? "eye-outline" : "eye-off-outline"}
            size={18}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[listenStyles.iconBtn, { backgroundColor: colors.primary + "18" }]}
          onPress={onReplay}
          activeOpacity={0.75}
        >
          <Ionicons name="volume-medium-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[listenStyles.iconBtn, { backgroundColor: colors.primary + "10" }]}
          onPress={onReplaySlow}
          activeOpacity={0.75}
        >
          <MaterialIcons name="slow-motion-video" size={18} color={colors.primary} />
        </TouchableOpacity>
        <View style={[listenStyles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}>
          <FavoriteButton sentenceId={sentence.id} isPreset={sentence.is_preset ?? false} size={18} />
        </View>
      </View>

      {/* ── Target sentence area ── */}
      <View style={listenStyles.targetContent}>
        {showTarget ? (
          <KeywordText
            text={sentence.target_text}
            baseColor={colors.text}
            fontSize={18}
            lineHeight={27}
            fontWeight="600"
            colorSeed={String(sentence.id)}
          />
        ) : (
          <View
            style={[
              listenStyles.hiddenBox,
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
            ]}
          >
            <Ionicons name="headset-outline" size={18} color={colors.primary} />
            <Text style={[listenStyles.hiddenText, { color: colors.textSecondary }]}>
              {t("learn.tap_to_reveal")}
            </Text>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={[listenStyles.divider, { backgroundColor: colors.border }]} />

      {/* Instruction */}
      <Text style={[listenStyles.prompt, { color: colors.textTertiary }]}>
        {t("learn.listen_select")}
      </Text>

      {/* Options */}
      <View style={listenStyles.optionsContainer}>
        {options.map((opt, idx) => {
          let bg = colors.surface ?? colors.backgroundSecondary;
          let borderColor = colors.border;
          let textColor = colors.text;

          if (selected !== null) {
            if (opt.isCorrect) {
              bg = QUIZ_CORRECT_COLOR + "22";
              borderColor = QUIZ_CORRECT_COLOR;
              textColor = QUIZ_CORRECT_COLOR;
            } else if (opt.text === selected && !opt.isCorrect) {
              bg = QUIZ_WRONG_COLOR + "22";
              borderColor = QUIZ_WRONG_COLOR;
              textColor = QUIZ_WRONG_COLOR;
            }
          }

          return (
            <TouchableOpacity
              key={idx}
              style={[listenStyles.option, { backgroundColor: bg, borderColor }]}
              onPress={() => onSelectOption(opt)}
              disabled={selected !== null}
              activeOpacity={0.8}
            >
              <Text style={[listenStyles.optionText, { color: textColor }]}>{opt.text}</Text>
              {selected !== null && opt.isCorrect && (
                <Ionicons name="checkmark-circle" size={18} color={QUIZ_CORRECT_COLOR} />
              )}
              {selected !== null && opt.text === selected && !opt.isCorrect && (
                <Ionicons name="close-circle" size={18} color={QUIZ_WRONG_COLOR} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const listenStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  targetRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 16,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  targetContent: {
    marginBottom: 16,
  },
  hiddenBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  hiddenText: {
    fontSize: 14,
    fontWeight: "500",
  },
  iconCol: {
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    marginBottom: 14,
  },
  prompt: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
  },
  optionText: {
    fontSize: 15,
    flex: 1,
    lineHeight: 21,
  },
});

// ─── Ana ekran ─────────────────────────────────────────────────────────────────

export default function LearnScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        NativeStackNavigationProp<HomeStackParamList>,
        NativeStackNavigationProp<MainStackParamList>
      >
    >();
  const route = useRoute<RouteProp<HomeStackParamList, "Learn">>();
  const initialTab: TabKey = route.params?.initialTab === "listening" ? "listening" : "learning";
  const { uiLanguage, targetLanguage } = useSettingsStore();
  const {
    sentences: userSentences,
    presetSentences,
    loadSentences,
    loadPresetSentences,
  } = useSentenceStore();
  const {
    progressMap,
    loadProgress,
    addToLearning,
    markAsLearned: presetMarkLearned,
  } = useProgressStore();

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // ── Listening state ──────────────────────────────────────────────────────────
  const [listenIdx, setListenIdx] = useState(0);
  const [showTarget, setShowTarget] = useState(false);
  const [listenSelected, setListenSelected] = useState<string | null>(null);
  const [listenOptions, setListenOptions] = useState<ListenOption[]>([]);

  const cardOpacity = useRef(new Animated.Value(1)).current;
  const cardTranslateX = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const successOverlayOpacity = useRef(new Animated.Value(0)).current;
  const removeOverlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    // Reset so dependent effects (e.g. listening tab) re-fire after reload.
    setInitialized(false);
    const init = async () => {
      try {
        await Promise.all([loadSentences(), loadPresetSentences(), loadProgress()]);
      } catch {
      } finally {
        if (mounted) setInitialized(true);
      }
    };
    init();
    return () => {
      mounted = false;
      stopSpeaking();
    };
  }, [targetLanguage, uiLanguage]);

  const learningList: Sentence[] = [
    ...userSentences.filter((s) => s.status === "learning"),
    ...presetSentences.filter((s) => progressMap[s.id] === "learning"),
  ];

  const learnedList: Sentence[] = [
    ...userSentences.filter((s) => s.status === "learned"),
    ...presetSentences.filter((s) => progressMap[s.id] === "learned"),
  ];

  const total = learningList.length;
  const listenTotal = learningList.length;
  const currentSentence = learningList[currentIndex] ?? null;

  // index guard
  useEffect(() => {
    if (currentIndex >= total && total > 0) setCurrentIndex(total - 1);
  }, [total]);

  useEffect(() => {
    if (listenIdx >= listenTotal && listenTotal > 0) setListenIdx(listenTotal - 1);
  }, [listenTotal]);

  // ── Auto-TTS + option generation when listening card changes ─────────────────
  useEffect(() => {
    if (activeTab !== "listening") return;
    const sentence = learningList[listenIdx];
    if (!sentence) return;

    setShowTarget(false);
    setListenSelected(null);

    // Build option pool: prefer learningList, pad with all sentences if needed
    const allPool = [...userSentences, ...presetSentences];
    const pool = allPool.length >= 3 ? allPool : learningList;
    setListenOptions(generateListenOptions(sentence, pool));

    const timer = setTimeout(() => {
      speak(stripMarkers(sentence.target_text), targetLanguage);
    }, 500);

    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [listenIdx, activeTab, initialized, targetLanguage]);

  const handleTabChange = (tab: TabKey) => {
    stopSpeaking();
    setActiveTab(tab);
    setCurrentIndex(0);
    setListenIdx(0);
  };

  const getEffectiveState = (s: Sentence): "new" | "learning" | "learned" => {
    if (s.is_preset) return progressMap[s.id] ?? "new";
    return s.status as "new" | "learning" | "learned";
  };

  // ── Shared animation ─────────────────────────────────────────────────────────

  const animateAndGo = useCallback(
    (direction: "next" | "prev", callback: () => void) => {
      const outX = direction === "next" ? -40 : 40;
      const inX = direction === "next" ? 40 : -40;
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(cardTranslateX, { toValue: outX, duration: 140, useNativeDriver: true }),
      ]).start(() => {
        cardTranslateX.setValue(inX);
        callback();
        Animated.parallel([
          Animated.timing(cardOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
          Animated.timing(cardTranslateX, { toValue: 0, duration: 180, useNativeDriver: true }),
        ]).start();
      });
    },
    [cardOpacity, cardTranslateX],
  );

  // Remove animation: show undo overlay → shrink + fly down → next card
  const animateRemove = useCallback(
    (callback: () => void) => {
      Animated.timing(removeOverlayOpacity, { toValue: 1, duration: 100, useNativeDriver: true }).start(() => {
        Animated.parallel([
          Animated.timing(cardOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.timing(cardTranslateY, { toValue: 120, duration: 220, useNativeDriver: true }),
          Animated.timing(cardScale, { toValue: 0.7, duration: 220, useNativeDriver: true }),
        ]).start(() => {
          cardTranslateX.setValue(-40);
          cardTranslateY.setValue(0);
          cardScale.setValue(1);
          removeOverlayOpacity.setValue(0);
          callback();
          Animated.parallel([
            Animated.timing(cardOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
            Animated.timing(cardTranslateX, { toValue: 0, duration: 180, useNativeDriver: true }),
          ]).start();
        });
      });
    },
    [cardOpacity, cardTranslateX, cardTranslateY, cardScale, removeOverlayOpacity],
  );

  // Success animation: scale up + green overlay → shrink + fly up → next card
  const animateSuccess = useCallback(
    (callback: () => void) => {
      // Phase 1: scale up + show overlay (120ms)
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1.04,
          useNativeDriver: true,
          speed: 30,
          bounciness: 4,
        }),
        Animated.timing(successOverlayOpacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Phase 2: fly up + shrink + fade out (220ms)
        Animated.parallel([
          Animated.timing(cardOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
          Animated.timing(cardTranslateY, { toValue: -120, duration: 220, useNativeDriver: true }),
          Animated.timing(cardScale, { toValue: 0.7, duration: 220, useNativeDriver: true }),
        ]).start(() => {
          // Reset values, run callback, slide in next card from left
          cardTranslateX.setValue(-40);
          cardTranslateY.setValue(0);
          cardScale.setValue(1);
          successOverlayOpacity.setValue(0);
          callback();
          Animated.parallel([
            Animated.timing(cardOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
            Animated.timing(cardTranslateX, { toValue: 0, duration: 180, useNativeDriver: true }),
          ]).start();
        });
      });
    },
    [cardOpacity, cardTranslateX, cardTranslateY, cardScale, successOverlayOpacity],
  );

  // Learning tab navigation
  const goNext = useCallback(() => {
    if (currentIndex < total - 1) animateAndGo("next", () => setCurrentIndex((i) => i + 1));
  }, [currentIndex, total, animateAndGo]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) animateAndGo("prev", () => setCurrentIndex((i) => i - 1));
  }, [currentIndex, animateAndGo]);

  // Listening tab navigation
  const listenGoNext = useCallback(() => {
    if (listenIdx < listenTotal - 1) animateAndGo("next", () => setListenIdx((i) => i + 1));
  }, [listenIdx, listenTotal, animateAndGo]);

  const listenGoPrev = useCallback(() => {
    if (listenIdx > 0) animateAndGo("prev", () => setListenIdx((i) => i - 1));
  }, [listenIdx, animateAndGo]);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((e) => {
      if (e.translationX < -50) runOnJS(goNext)();
      else if (e.translationX > 50) runOnJS(goPrev)();
    });

  const listenSwipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((e) => {
      if (e.translationX < -50) runOnJS(listenGoNext)();
      else if (e.translationX > 50) runOnJS(listenGoPrev)();
    });

  // ── Learning actions ─────────────────────────────────────────────────────────

  const handleLearn = async () => {
    if (!currentSentence) return;
    if (currentSentence.is_preset) {
      await addToLearning(currentSentence.id);
    } else {
      await useSentenceStore.getState().addToLearningList(currentSentence.id);
      await loadSentences();
    }
  };

  const handleMarkLearned = async () => {
    if (!currentSentence) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    animateSuccess(() => {});
    if (currentSentence.is_preset) {
      await presetMarkLearned(currentSentence.id);
    } else {
      await useSentenceStore.getState().updateSentence(currentSentence.id, { status: "learned" });
      await loadSentences();
    }
  };

  const handleRemoveFromList = async () => {
    if (!currentSentence) return;
    animateRemove(() => {});
    await useSentenceStore.getState().removeFromLearningList(currentSentence.id);
    if (!currentSentence.is_preset) await loadSentences();
  };

  // ── Listening actions ────────────────────────────────────────────────────────

  const handleListenOption = (opt: ListenOption) => {
    if (listenSelected !== null) return;
    setListenSelected(opt.text);
    setShowTarget(true); // auto-reveal after answering
  };

  const handleReplay = () => {
    const s = learningList[listenIdx];
    if (s) speak(stripMarkers(s.target_text), targetLanguage);
  };

  const handleReplaySlow = () => {
    const s = learningList[listenIdx];
    if (s) speak(stripMarkers(s.target_text), targetLanguage, 0.5);
  };

  // ── Shared nav button renderer ───────────────────────────────────────────────

  const renderNavButtons = (
    onPrev: () => void,
    onNext: () => void,
    prevDisabled: boolean,
    nextDisabled: boolean,
  ) => (
    <View style={styles.navRow}>
      <TouchableOpacity
        style={[
          styles.navBtn,
          {
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
          },
          prevDisabled && styles.navBtnDisabled,
        ]}
        onPress={onPrev}
        disabled={prevDisabled}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.navBtnText, { color: prevDisabled ? colors.textTertiary : colors.text }]}
        >
          ‹ {t("learn.prev")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.navBtn,
          {
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
          },
          nextDisabled && styles.navBtnDisabled,
        ]}
        onPress={onNext}
        disabled={nextDisabled}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.navBtnText, { color: nextDisabled ? colors.textTertiary : colors.text }]}
        >
          {t("learn.next")} ›
        </Text>
      </TouchableOpacity>
    </View>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("learn.title")}</Text>
          {activeTab === "learning" && total > 0 && (
            <View style={[styles.counterBadge, { backgroundColor: colors.primary + "18" }]}>
              <Text style={[styles.counterText, { color: colors.primary }]}>
                {currentIndex + 1}/{total}
              </Text>
            </View>
          )}
          {activeTab === "listening" && listenTotal > 0 && (
            <View style={[styles.counterBadge, { backgroundColor: colors.primary + "18" }]}>
              <Text style={[styles.counterText, { color: colors.primary }]}>
                {listenIdx + 1}/{listenTotal}
              </Text>
            </View>
          )}
        </View>

        {/* Segment control */}
        <View style={[styles.segmentContainer, { backgroundColor: colors.surfaceSecondary }]}>
          {/* Learning tab */}
          <TouchableOpacity
            style={[styles.segmentTab, activeTab === "learning" && styles.segmentTabActiveWrapper]}
            onPress={() => handleTabChange("learning")}
            activeOpacity={0.8}
          >
            {activeTab === "learning" ? (
              <GradientView
                colors={["#4DA3FF", "#7CC4FF"]}
                style={styles.segmentTabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="book-outline" size={14} color="#fff" />
                <Text style={[styles.segmentLabel, { color: "#fff" }]}>{t("learn.tab_study")}</Text>
                {learningList.length > 0 && (
                  <View style={[styles.badge, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
                    <Text style={styles.badgeText}>{learningList.length}</Text>
                  </View>
                )}
              </GradientView>
            ) : (
              <View style={styles.segmentTabInner}>
                <Ionicons name="book-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.segmentLabel, { color: colors.textSecondary }]}>
                  {t("learn.tab_study")}
                </Text>
                {learningList.length > 0 && (
                  <View style={[styles.badge, { backgroundColor: "#4DA3FF" }]}>
                    <Text style={styles.badgeText}>{learningList.length}</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>

          {/* Listening tab */}
          <TouchableOpacity
            style={[styles.segmentTab, activeTab === "listening" && styles.segmentTabActiveWrapper]}
            onPress={() => handleTabChange("listening")}
            activeOpacity={0.8}
          >
            {activeTab === "listening" ? (
              <GradientView
                colors={["#4DA3FF", "#7CC4FF"]}
                style={styles.segmentTabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="headset-outline" size={14} color="#fff" />
                <Text style={[styles.segmentLabel, { color: "#fff" }]}>
                  {t("learn.tab_listen")}
                </Text>
              </GradientView>
            ) : (
              <View style={styles.segmentTabInner}>
                <Ionicons name="headset-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.segmentLabel, { color: colors.textSecondary }]}>
                  {t("learn.tab_listen")}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Progress bar — only on learning tab */}
        {activeTab === "learning" && initialized && total > 0 && (
          <View style={[styles.progressRow, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.progressTrack, { backgroundColor: colors.backgroundTertiary }]}>
              <GradientView
                colors={["#4DA3FF", "#49C98A"]}
                style={[
                  styles.progressFill,
                  { width: `${Math.round(((currentIndex + 1) / total) * 100)}%` as DimensionValue },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={[styles.progressPercent, { color: colors.textSecondary }]}>
              {Math.round(((currentIndex + 1) / total) * 100)}%
            </Text>
          </View>
        )}

        {/* ── LEARNING TAB ──────────────────────────────────────────────────────── */}
        {activeTab === "learning" &&
          (!initialized ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : total === 0 ? (
            <EmptyState tab="learning" colors={colors} t={t} />
          ) : (
            <>
              <GestureDetector gesture={swipeGesture}>
                <Animated.View
                  style={[
                    styles.cardWrapper,
                    {
                      opacity: cardOpacity,
                      transform: [{ translateX: cardTranslateX }, { translateY: cardTranslateY }, { scale: cardScale }],
                    },
                  ]}
                  shouldRasterizeIOS
                  renderToHardwareTextureAndroid
                >
                  {currentSentence && (
                    <SentenceCard
                      sentence={currentSentence}
                      uiLanguage={uiLanguage}
                      targetLanguage={targetLanguage}
                      state={getEffectiveState(currentSentence)}
                      onLearn={handleLearn}
                      onMarkLearned={handleMarkLearned}
                      onForgot={handleRemoveFromList}
                      onRemoveFromList={handleRemoveFromList}
                      onEdit={() =>
                        navigation.navigate("EditSentence", {
                          sentenceId: currentSentence.id,
                          isPreset: currentSentence.is_preset,
                        })
                      }
                    />
                  )}
                  {/* Success overlay */}
                  <Animated.View
                    style={[styles.successOverlay, { opacity: successOverlayOpacity }]}
                    pointerEvents="none"
                  >
                    <Ionicons name="checkmark-circle" size={72} color="#49C98A" />
                  </Animated.View>
                  {/* Remove overlay */}
                  <Animated.View
                    style={[styles.successOverlay, { opacity: removeOverlayOpacity }]}
                    pointerEvents="none"
                  >
                    <Ionicons name="arrow-undo-circle" size={72} color="#E07B39" />
                  </Animated.View>
                </Animated.View>
              </GestureDetector>

              {renderNavButtons(goPrev, goNext, currentIndex === 0, currentIndex === total - 1)}

              <MotivationBar
                remaining={total - currentIndex - 1}
                learnedCount={learnedList.length}
                colors={colors}
                t={t}
              />
            </>
          ))}

        {/* ── LISTENING TAB ─────────────────────────────────────────────────────── */}
        {activeTab === "listening" &&
          (!initialized ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : listenTotal === 0 ? (
            <EmptyState tab="listening" colors={colors} t={t} />
          ) : (
            <>
              <GestureDetector gesture={listenSwipeGesture}>
                <Animated.View
                  style={[
                    styles.cardWrapper,
                    { opacity: cardOpacity, transform: [{ translateX: cardTranslateX }] },
                  ]}
                  shouldRasterizeIOS
                  renderToHardwareTextureAndroid
                >
                  <ListenCard
                    sentence={learningList[listenIdx]}
                    showTarget={showTarget}
                    onToggleTarget={() => setShowTarget((v) => !v)}
                    options={listenOptions}
                    selected={listenSelected}
                    onSelectOption={handleListenOption}
                    onReplay={handleReplay}
                    onReplaySlow={handleReplaySlow}
                    colors={colors}
                    t={t}
                  />
                </Animated.View>
              </GestureDetector>

              {renderNavButtons(
                listenGoPrev,
                listenGoNext,
                listenIdx === 0,
                listenIdx === listenTotal - 1,
              )}
            </>
          ))}
      </SafeAreaView>
    </View>
  );
}

// ─── Alt bileşenler ────────────────────────────────────────────────────────────

function EmptyState({ tab, colors, t }: { tab: TabKey; colors: ThemeColors; t: (k: string) => string }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>{tab === "listening" ? "🎧" : "📚"}</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("learn.no_sentences")}</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {tab === "listening" ? t("learn.no_listen_sentences") : t("learn.start_hint")}
      </Text>
    </View>
  );
}

function MotivationBar({
  remaining,
  learnedCount,
  colors,
  t,
}: {
  remaining: number;
  learnedCount: number;
  colors: ThemeColors;
  t: (k: string) => string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const prevLearned = useRef(learnedCount);

  useEffect(() => {
    if (learnedCount > prevLearned.current) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.18, useNativeDriver: true, speed: 40, bounciness: 8 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }),
      ]).start();
    }
    prevLearned.current = learnedCount;
  }, [learnedCount, scale]);

  const message =
    remaining > 0
      ? `${remaining} ${t("learn.sentences_to_learn")} 💪`
      : learnedCount > 0
        ? `${learnedCount} ${t("learn.sentences_learned")} 🎉`
        : null;

  if (!message) return null;

  return (
    <View style={[styles.motivationBar, { backgroundColor: colors.backgroundSecondary }]}>
      <Animated.Text
        style={[styles.motivationText, { color: colors.textTertiary, transform: [{ scale }] }]}
      >
        {message}
      </Animated.Text>
    </View>
  );
}

// ─── Stiller ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  counterBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  counterText: { fontSize: 13, fontWeight: "600" },
  segmentContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 4,
    marginBottom: 16,
  },
  segmentTab: {
    flex: 1,
    borderRadius: 22,
    overflow: "hidden",
  },
  segmentTabActiveWrapper: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentTabGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 22,
    gap: 6,
  },
  segmentTabInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 22,
    gap: 6,
  },
  segmentLabel: { fontSize: 14, fontWeight: "500" },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  cardWrapper: { flex: 1, paddingHorizontal: 20, justifyContent: "center" },
  successOverlay: {
    position: "absolute",
    top: 0,
    left: 20,
    right: 20,
    bottom: 0,
    borderRadius: 20,
    // backgroundColor: "rgba(0,0,0,0.32)",
    alignItems: "center",
    justifyContent: "center",
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText: { fontSize: 15, fontWeight: "600" },
  motivationBar: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  motivationText: { fontSize: 13, fontWeight: "500" },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: "600", textAlign: "center" },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#4DA3FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 36,
    textAlign: "right",
  },
  autoModeShortcut: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  autoModeShortcutText: { fontSize: 13 },
});
