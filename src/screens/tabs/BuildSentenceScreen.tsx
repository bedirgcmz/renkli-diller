import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  useWindowDimensions,
} from "react-native";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { HomeStackParamList, MainStackParamList, Sentence } from "@/types";
import { buildWordChips, WordChip } from "@/utils/buildSentence";
import { stripMarkers } from "@/utils/keywords";
import { VisualBadge } from "@/components/VisualBadge";
import { QUIZ_CORRECT_COLOR, QUIZ_WRONG_COLOR, FREE_BUILD_SENTENCE_DAILY_LIMIT } from "@/utils/constants";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useAchievementStore } from "@/store/useAchievementStore";

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;


// ─── Header ──────────────────────────────────────────────────────────────────

function Header({
  title,
  current,
  total,
  onBack,
  colors,
}: {
  title: string;
  current: number;
  total: number;
  onBack: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={[headerStyles.row, { borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={onBack} hitSlop={8} style={headerStyles.back}>
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[headerStyles.title, { color: colors.text }]} numberOfLines={1}>
        {title}
      </Text>
      {total > 0 ? (
        <Text style={[headerStyles.counter, { color: colors.textSecondary }]}>
          {current + 1} / {total}
        </Text>
      ) : (
        <View style={headerStyles.counterPlaceholder} />
      )}
    </View>
  );
}

const headerStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  back: {
    width: 32,
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  counter: {
    width: 48,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "500",
  },
  counterPlaceholder: {
    width: 48,
  },
});

// ─── SourceCard ───────────────────────────────────────────────────────────────

function SourceCard({
  sentence,
  label,
  colors,
}: {
  sentence: Sentence;
  label: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const sourceText = stripMarkers(sentence.source_text);
  return (
    <View style={[sourceStyles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.text }]}>
      <Text style={[sourceStyles.label, { color: colors.textTertiary }]}>{label}</Text>
      <View style={sourceStyles.row}>
        <VisualBadge
          imageUrl={sentence.visual_image_url}
          size={48}
          borderRadius={8}
          backgroundColor={colors.backgroundSecondary}
          borderColor={colors.border}
          placeholderColor={colors.textTertiary}
          imageOverflow={{ top: 10, bottom: 10, horizontal: 10 }}
        />
        <Text style={[sourceStyles.text, { color: colors.text }]}>{sourceText}</Text>
      </View>
    </View>
  );
}

const sourceStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  text: {
    flex: 1,
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 26,
  },
});

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({
  title,
  desc,
  colors,
  t,
  onPrimary,
  onSecondary,
}: {
  title: string;
  desc: string;
  colors: ReturnType<typeof useTheme>["colors"];
  t: (k: string) => string;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  return (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.emoji}>📚</Text>
      <Text style={[emptyStyles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[emptyStyles.desc, { color: colors.textSecondary }]}>{desc}</Text>
      <View style={emptyStyles.actions}>
        <TouchableOpacity
          style={[emptyStyles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={onPrimary}
          activeOpacity={0.85}
        >
          <Ionicons name="list-outline" size={16} color="#FFFFFF" />
          <Text style={emptyStyles.primaryButtonText}>{t("quiz.go_to_sentences")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            emptyStyles.secondaryButton,
            { backgroundColor: colors.cardBackground, borderColor: colors.border },
          ]}
          onPress={onSecondary}
          activeOpacity={0.85}
        >
          <Ionicons name="grid-outline" size={16} color={colors.primary} />
          <Text style={[emptyStyles.secondaryButtonText, { color: colors.text }]}>
            {t("common.explore_categories")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const emptyStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emoji: { fontSize: 48 },
  title: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  desc: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  actions: {
    width: "100%",
    marginTop: 4,
    gap: 10,
  },
  primaryButton: {
    minHeight: 46,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function BuildSentenceScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();
  const { height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700;

  const { sentences, presetSentences, loadSentences, loadPresetSentences } = useSentenceStore();
  const { progressMap, loadProgress, recordQuizResult } = useProgressStore();
  const { targetLanguage, uiLanguage } = useSettingsStore();
  const isPremium = useAuthStore((s) => s.user?.is_premium ?? false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // Word chip state — rebuilt whenever sentence changes
  const [wordBank, setWordBank] = useState<WordChip[]>([]);
  const [dropZone, setDropZone] = useState<WordChip[]>([]);
  const [correctOrder, setCorrectOrder] = useState<string[]>([]);

  // Validate / feedback state
  type Phase = "arranging" | "correct" | "wrong";
  const [phase, setPhase] = useState<Phase>("arranging");
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [sessionComplete, setSessionComplete] = useState(false);

  // Daily limit
  const [dailyCount, setDailyCount] = useState(0);
  const [dailyCountLoaded, setDailyCountLoaded] = useState(false);
  const dailyLimitReached = !isPremium && dailyCount >= FREE_BUILD_SENTENCE_DAILY_LIMIT;

  // Learning list — stored in state so updating it triggers a re-render and
  // allows the word-chip effect ([currentSentence?.id]) to fire correctly.
  const [learningSentences, setLearningSentences] = useState<Sentence[]>([]);

  useEffect(() => {
    setInitialized(false);
    Promise.all([loadSentences(), loadPresetSentences(undefined, isPremium), loadProgress()]).finally(() =>
      setInitialized(true)
    );
  }, [targetLanguage, uiLanguage, isPremium]);

  useEffect(() => {
    const loadTodayCount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setDailyCountLoaded(true); return; }
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("quiz_results")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("quiz_type", "build_sentence")
        .gte("answered_at", todayStart.toISOString());
      setDailyCount(count ?? 0);
      setDailyCountLoaded(true);
    };
    loadTodayCount();
  }, []);

  // Build & shuffle the learning list once after data loads.
  // Read directly from Zustand store state to avoid stale-closure race between
  // `setInitialized(true)` and the Zustand subscription re-render propagating.
  useEffect(() => {
    if (!initialized) return;
    const { sentences: s, presetSentences: ps } = useSentenceStore.getState();
    const { progressMap: pm } = useProgressStore.getState();
    const { targetLanguage: tl, uiLanguage: ul } = useSettingsStore.getState();
    const learning = [
      ...s.filter((sent) => sent.status === "learning" && (sent.target_lang ?? tl) === tl && (sent.source_lang ?? ul) === ul),
      ...ps.filter((sent) => pm[sent.id] === "learning"),
    ];
    setLearningSentences([...learning].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
  }, [initialized]);

  const total = learningSentences.length;
  const currentSentence = learningSentences[currentIndex] ?? null;

  // Rebuild word chips whenever the current sentence changes
  useEffect(() => {
    if (!currentSentence) return;
    const { chips, correctOrder: order } = buildWordChips(
      currentSentence,
      learningSentences,
      3,
    );
    setWordBank(chips);
    setDropZone([]);
    setCorrectOrder(order);
  }, [currentSentence?.id]);

  const handleBankChipPress = useCallback((chip: WordChip) => {
    if (phase !== "arranging") return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setWordBank((prev) => prev.filter((c) => c.id !== chip.id));
    setDropZone((prev) => [...prev, chip]);
  }, [phase]);

  const handleDropChipPress = useCallback((chip: WordChip) => {
    if (phase !== "arranging") return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDropZone((prev) => prev.filter((c) => c.id !== chip.id));
    setWordBank((prev) => [...prev, chip]);
  }, [phase]);

  const handleValidate = useCallback(() => {
    if (dailyLimitReached) return;

    const placed = dropZone.map((c) => c.normalized);
    const isCorrect =
      placed.length === correctOrder.length &&
      placed.every((w, i) => w === correctOrder[i]);

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setPhase(isCorrect ? "correct" : "wrong");
    const newTotal = score.total + 1;
    const newCorrect = score.correct + (isCorrect ? 1 : 0);
    setScore({ correct: newCorrect, total: newTotal });
    setDailyCount((c) => c + 1);

    // Persist to quiz_results for stats & daily limit tracking
    if (currentSentence) {
      recordQuizResult({
        user_id: "",
        sentence_id: currentSentence.is_preset ? currentSentence.id : null,
        user_sentence_id: currentSentence.is_preset ? null : Number(currentSentence.id),
        is_correct: isCorrect,
        quiz_type: "build_sentence",
      });
    }

    // Achievement check for build_total milestones
    useAchievementStore.getState().checkProgressAchievements({
      totalSentencesLearned: 0,
      currentStreak: 0,
      totalQuizQuestions: 0,
      totalBuildSentences: dailyCount + 1, // approximate; loadStats has exact total
    });
  }, [dropZone, correctOrder, dailyLimitReached, currentSentence, recordQuizResult, score, dailyCount]);

  const handleGoNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= total) {
      // Check perfect_build: all answers correct in this session
      const finalCorrect = score.correct + (phase === "correct" ? 0 : 0); // score already updated
      const isPerfect = score.total > 0 && score.correct === score.total;
      if (isPerfect) {
        useAchievementStore.getState().checkProgressAchievements({
          totalSentencesLearned: 0,
          currentStreak: 0,
          totalQuizQuestions: 0,
          perfectBuildSession: true,
        });
      }
      setSessionComplete(true);
      return;
    }
    setPhase("arranging");
    setCurrentIndex(nextIndex);
  }, [currentIndex, total, score, phase]);

  const handleRestart = useCallback(() => {
    const { sentences: s, presetSentences: ps } = useSentenceStore.getState();
    const { progressMap: pm } = useProgressStore.getState();
    const { targetLanguage: tl, uiLanguage: ul } = useSettingsStore.getState();
    const learning = [
      ...s.filter((sent) => sent.status === "learning" && (sent.target_lang ?? tl) === tl && (sent.source_lang ?? ul) === ul),
      ...ps.filter((sent) => pm[sent.id] === "learning"),
    ];
    setLearningSentences([...learning].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setPhase("arranging");
    setScore({ correct: 0, total: 0 });
    setSessionComplete(false);
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (!initialized || !dailyCountLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <Header
          title={t("build_sentence.title")}
          current={0}
          total={0}
          onBack={() => navigation.goBack()}
          colors={colors}
        />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (total === 0 || !currentSentence) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <Header
          title={t("build_sentence.title")}
          current={0}
          total={0}
          onBack={() => navigation.goBack()}
          colors={colors}
        />
        <EmptyState
          title={t("build_sentence.empty_title")}
          desc={t("build_sentence.empty_desc")}
          colors={colors}
          t={t}
          onPrimary={() => navigation.getParent()?.navigate("Sentences" as never)}
          onSecondary={() => navigation.navigate("CategoryBrowser")}
        />
      </SafeAreaView>
    );
  }

  // ── Daily limit wall ─────────────────────────────────────────────────────
  if (dailyLimitReached && phase === "arranging") {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <Header
          title={t("build_sentence.title")}
          current={currentIndex}
          total={total}
          onBack={() => navigation.goBack()}
          colors={colors}
        />
        <View style={styles.center}>
          <Text style={[styles.completeEmoji, isSmallScreen && { fontSize: 40, marginBottom: 4 }]}>⏳</Text>
          <Text style={[styles.completeTitle, isSmallScreen && { fontSize: 18, marginBottom: 4 }, { color: colors.text }]}>
            {t("build_sentence.limit_title")}
          </Text>
          <Text style={[styles.limitDesc, isSmallScreen && { paddingHorizontal: 20, marginBottom: 16 }, { color: colors.textSecondary }]}>
            {t("build_sentence.limit_desc")}
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, styles.premiumBtn]}
            onPress={() => navigation.navigate("Paywall", { source: "quiz" })}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>✨ Premium</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Session complete ──────────────────────────────────────────────────────
  if (sessionComplete) {
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <Header
          title={t("build_sentence.title")}
          current={total - 1}
          total={total}
          onBack={() => navigation.goBack()}
          colors={colors}
        />
        <View style={styles.center}>
          <Text style={[styles.completeEmoji, isSmallScreen && { fontSize: 40, marginBottom: 4 }]}>🏆</Text>
          <Text style={[styles.completeTitle, isSmallScreen && { fontSize: 18, marginBottom: 4 }, { color: colors.text }]}>
            {t("build_sentence.session_complete")}
          </Text>
          <Text style={[styles.completeScore, isSmallScreen && { fontSize: 14 }, { color: colors.textSecondary }]}>
            {t("build_sentence.session_score", { correct: score.correct, total: score.total })}
          </Text>
          <Text style={[styles.completeAccuracy, isSmallScreen && { fontSize: 32, marginBottom: 16 }, { color: colors.primary }]}>
            {accuracy}%
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={handleRestart}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>{t("build_sentence.restart")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────
  const dropZoneBorderColor =
    phase === "correct"
      ? QUIZ_CORRECT_COLOR
      : phase === "wrong"
        ? QUIZ_WRONG_COLOR
        : dropZone.length > 0
          ? colors.primary
          : colors.border;

  const canValidate = dropZone.length === correctOrder.length && phase === "arranging";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <Header
        title={t("build_sentence.title")}
        current={currentIndex}
        total={total}
        onBack={() => navigation.goBack()}
        colors={colors}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Source sentence card */}
        <SourceCard
          sentence={currentSentence}
          label={t("build_sentence.source_label")}
          colors={colors}
        />

        {/* ── Drop zone ── */}
        <View
          style={[
            styles.dropZone,
            isSmallScreen && { marginTop: 10, minHeight: 72 },
            {
              backgroundColor: colors.surface ?? colors.backgroundSecondary,
              borderColor: dropZoneBorderColor,
              borderStyle: phase === "arranging" && dropZone.length === 0 ? "dashed" : "solid",
            },
          ]}
        >
          {dropZone.length === 0 ? (
            <Text style={[styles.dropHint, { color: colors.textTertiary }]}>
              {t("build_sentence.drop_hint")}
            </Text>
          ) : (
            <View style={styles.chipRow}>
              {dropZone.map((chip) => {
                const chipBg =
                  phase === "correct"
                    ? QUIZ_CORRECT_COLOR + "22"
                    : phase === "wrong"
                      ? QUIZ_WRONG_COLOR + "22"
                      : colors.primary + "18";
                const chipBorder =
                  phase === "correct"
                    ? QUIZ_CORRECT_COLOR
                    : phase === "wrong"
                      ? QUIZ_WRONG_COLOR
                      : colors.primary;
                const chipTextColor =
                  phase === "correct"
                    ? QUIZ_CORRECT_COLOR
                    : phase === "wrong"
                      ? QUIZ_WRONG_COLOR
                      : colors.primary;
                return (
                  <TouchableOpacity
                    key={chip.id}
                    onPress={() => handleDropChipPress(chip)}
                    activeOpacity={phase === "arranging" ? 0.7 : 1}
                    disabled={phase !== "arranging"}
                    style={[styles.chip, styles.chipPlaced, { backgroundColor: chipBg, borderColor: chipBorder }]}
                  >
                    <Text style={[styles.chipText, { color: chipTextColor }]}>{chip.display}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Feedback bar ── */}
        {phase !== "arranging" && (
          <View
            style={[
              styles.feedbackBar,
              {
                backgroundColor:
                  phase === "correct" ? QUIZ_CORRECT_COLOR + "18" : QUIZ_WRONG_COLOR + "18",
                borderColor:
                  phase === "correct" ? QUIZ_CORRECT_COLOR : QUIZ_WRONG_COLOR,
              },
            ]}
          >
            <Ionicons
              name={phase === "correct" ? "checkmark-circle" : "close-circle"}
              size={20}
              color={phase === "correct" ? QUIZ_CORRECT_COLOR : QUIZ_WRONG_COLOR}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.feedbackText,
                  { color: phase === "correct" ? QUIZ_CORRECT_COLOR : QUIZ_WRONG_COLOR },
                ]}
              >
                {phase === "correct"
                  ? t("build_sentence.correct_feedback")
                  : t("build_sentence.wrong_feedback")}
              </Text>
              {phase === "wrong" && (
                <Text style={[styles.correctAnswerLabel, { color: colors.textSecondary }]}>
                  {t("build_sentence.correct_answer_label")}{" "}
                  <Text style={{ fontWeight: "600", color: colors.text }}>
                    {correctOrder.join(" ")}
                  </Text>
                </Text>
              )}
            </View>
          </View>
        )}

        {/* ── Divider ── */}
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* ── Word bank ── */}
        <View style={styles.wordBankContainer}>
          <View style={styles.chipRow}>
            {wordBank.map((chip) => (
              <TouchableOpacity
                key={chip.id}
                onPress={() => handleBankChipPress(chip)}
                activeOpacity={0.7}
                disabled={phase !== "arranging"}
                style={[
                  styles.chip,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                  phase !== "arranging" && styles.chipDisabled,
                ]}
              >
                <Text style={[styles.chipText, { color: colors.text }]}>{chip.display}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ── Bottom action button ── */}
      <View style={[styles.bottomBar, isSmallScreen && { paddingVertical: 8 }, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        {phase === "arranging" ? (
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              isSmallScreen && { height: 44 },
              { backgroundColor: canValidate ? colors.primary : colors.border },
            ]}
            onPress={handleValidate}
            disabled={!canValidate}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryBtnText, !canValidate && { color: colors.textTertiary }]}>
              {t("build_sentence.validate")}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              isSmallScreen && { height: 44 },
              {
                backgroundColor:
                  phase === "correct" ? QUIZ_CORRECT_COLOR : QUIZ_WRONG_COLOR,
              },
            ]}
            onPress={handleGoNext}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>{t("build_sentence.continue")}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  dropZone: {
    marginHorizontal: 16,
    marginTop: 16,
    minHeight: 88,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 16,
    padding: 12,
    justifyContent: "center",
  },
  dropHint: {
    fontSize: 13,
    textAlign: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginTop: 20,
  },
  wordBankContainer: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  chipPlaced: {
    borderStyle: "solid",
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipText: {
    fontSize: 15,
    fontWeight: "500",
  },
  feedbackBar: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  correctAnswerLabel: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  completeEmoji: { fontSize: 56, marginBottom: 8 },
  completeTitle: { fontSize: 22, fontWeight: "800", marginBottom: 6, textAlign: "center" },
  completeScore: { fontSize: 16, marginBottom: 4 },
  completeAccuracy: { fontSize: 42, fontWeight: "800", marginBottom: 24 },
  limitDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 32,
    marginTop: 8,
    marginBottom: 24,
  },
  premiumBtn: {
    width: 200,
    backgroundColor: "#7C5CF6",
  },
});
