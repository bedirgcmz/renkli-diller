import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AppState,
  AppStateStatus,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useTheme";
import { useGameStore } from "@/store/useGameStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  GamePhase,
  GameVocabularyItem,
  RawSessionStats,
  GameSubmitResult,
} from "@/types/game";
import {
  buildGamePool,
  buildSpeedRoundQuestions,
  SpeedRoundQuestion,
} from "@/utils/gamePoolBuilder";
import { HomeStackParamList } from "@/types";
import "react-native-get-random-values"; // UUID support

// UUID helper (crypto.randomUUID polyfill via react-native-get-random-values)
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type Nav = NativeStackNavigationProp<HomeStackParamList>;
type Route = RouteProp<HomeStackParamList, "SpeedRound">;

const GAME_DURATION = 60;
const CORRECT_DELAY_MS = 300;
const WRONG_DELAY_MS = 750;
const LAST_10_THRESHOLD = 10;
const COMBO_X2 = 3;
const COMBO_X3 = 6;

type AnswerState = "idle" | "correct" | "wrong";

export default function SpeedRoundScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { filter } = route.params;
  const { height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700;

  const { user } = useAuthStore();
  const { targetLanguage, uiLanguage } = useSettingsStore();
  const { tutorialSeen, markTutorialSeen, submitScore } = useGameStore();

  // ---- Phase state machine ----
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [poolError, setPoolError] = useState<"empty" | "network" | null>(null);

  // ---- Pool ----
  const [questions, setQuestions] = useState<SpeedRoundQuestion[]>([]);
  const [poolSize, setPoolSize] = useState(0);

  // ---- Gameplay state (screen-local, NOT in store) ----
  const sessionIdRef = useRef<string>(generateUUID());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [comboToast, setComboToast] = useState<string | null>(null);
  const [showLast10, setShowLast10] = useState(false);

  // ---- Countdown ----
  const [countdown, setCountdown] = useState(3);

  // ---- Result ----
  const [submitResult, setSubmitResult] = useState<GameSubmitResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- Refs for timer cleanup ----
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboToastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const comboToastedLevels = useRef<Set<number>>(new Set());

  // ---- AppState (auto-pause) ----
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ----------------------------------------------------------------
  // Cleanup on unmount
  // ----------------------------------------------------------------
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  function clearAllTimers() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (transitionRef.current) clearTimeout(transitionRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (comboToastRef.current) clearTimeout(comboToastRef.current);
  }

  // ----------------------------------------------------------------
  // AppState — auto pause/resume
  // ----------------------------------------------------------------
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (
        appStateRef.current === "active" &&
        nextState !== "active" &&
        phase === "playing"
      ) {
        setPhase("paused");
        stopTimer();
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [phase]);

  // ----------------------------------------------------------------
  // Load pool on mount
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    loadPool();
  }, [user]);

  async function loadPool() {
    setPhase("loading");
    try {
      const { items, meta } = await buildGamePool({
        userId: user!.id,
        filter,
        gameType: "speed_round",
        sourceLang: uiLanguage,
        targetLang: targetLanguage,
      });

      if (!meta.isEnough) {
        setPoolError("empty");
        setPhase("loading"); // stays on loading, shows error UI
        return;
      }

      const qs = buildSpeedRoundQuestions(items);
      setQuestions(qs);
      setPoolSize(meta.usable);

      // Show tutorial or ready screen
      if (!tutorialSeen.speed_round) {
        setPhase("tutorial");
      } else {
        setPhase("ready");
      }
    } catch {
      setPoolError("network");
    }
  }

  // ----------------------------------------------------------------
  // Tutorial → ready
  // ----------------------------------------------------------------
  function handleTutorialDone() {
    markTutorialSeen("speed_round");
    setPhase("ready");
  }

  // ----------------------------------------------------------------
  // Ready → countdown → playing
  // ----------------------------------------------------------------
  function startCountdown() {
    setCountdown(3);
    setPhase("countdown");

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          startGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // ----------------------------------------------------------------
  // Start game
  // ----------------------------------------------------------------
  function startGame() {
    setPhase("playing");
    setCurrentIndex(0);
    setTimeLeft(GAME_DURATION);
    setCorrect(0);
    setWrong(0);
    setCombo(0);
    setComboMax(0);
    setAnswerState("idle");
    setSelectedIndex(null);
    setShowLast10(false);
    comboToastedLevels.current = new Set();
    sessionIdRef.current = generateUUID();
    startTimer();
  }

  // ----------------------------------------------------------------
  // Timer
  // ----------------------------------------------------------------
  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= LAST_10_THRESHOLD + 1 && !showLast10) {
          setShowLast10(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // ----------------------------------------------------------------
  // Answer handling
  // ----------------------------------------------------------------
  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (answerState !== "idle" || phase !== "playing") return;

      const q = questions[currentIndex];
      if (!q) return;

      setSelectedIndex(optionIndex);

      if (optionIndex === q.correctIndex) {
        // Correct
        setAnswerState("correct");
        const newCombo = combo + 1;
        const newComboMax = Math.max(comboMax, newCombo);
        setCombo(newCombo);
        setComboMax(newComboMax);
        setCorrect((c) => c + 1);

        // Combo toast (only on first reaching that level)
        if (newCombo === COMBO_X2 && !comboToastedLevels.current.has(COMBO_X2)) {
          comboToastedLevels.current.add(COMBO_X2);
          showComboToast(t("games.speed_round.combo_x2"));
        } else if (newCombo === COMBO_X3 && !comboToastedLevels.current.has(COMBO_X3)) {
          comboToastedLevels.current.add(COMBO_X3);
          showComboToast(t("games.speed_round.combo_x3"));
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }

        transitionRef.current = setTimeout(nextQuestion, CORRECT_DELAY_MS);
      } else {
        // Wrong
        setAnswerState("wrong");
        setCombo(0);
        setWrong((w) => w + 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        transitionRef.current = setTimeout(nextQuestion, WRONG_DELAY_MS);
      }
    },
    [answerState, phase, questions, currentIndex, combo, comboMax, t]
  );

  function nextQuestion() {
    setAnswerState("idle");
    setSelectedIndex(null);

    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= questions.length) {
        // Pool exhausted before time
        stopTimer();
        endGame();
        return prev;
      }
      return next;
    });
  }

  function showComboToast(message: string) {
    setComboToast(message);
    if (comboToastRef.current) clearTimeout(comboToastRef.current);
    comboToastRef.current = setTimeout(() => setComboToast(null), 1800);
  }

  // ----------------------------------------------------------------
  // End game → submit
  // ----------------------------------------------------------------
  function endGame() {
    stopTimer();
    setPhase("result");
    setTimeout(() => submitGameScore(), 0);
  }

  async function submitGameScore() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const stats: RawSessionStats = {
      sessionId:    sessionIdRef.current,
      gameType:     "speed_round",
      correct,
      wrong,
      missed:       0,
      durationSec:  GAME_DURATION - timeLeft,
      comboMax,
      levelReached: 1,
      poolSize,
      filterUsed:   filter,
      sourceLang:   uiLanguage,
      targetLang:   targetLanguage,
    };

    const result = await submitScore(stats);
    setIsSubmitting(false);

    if (result) {
      setSubmitResult(result);
      if (result.personalBestBroken) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      const storeError = useGameStore.getState().error;
      setSubmitError(storeError ?? "network");
    }
  }

  // ----------------------------------------------------------------
  // Pause / Resume
  // ----------------------------------------------------------------
  function handlePause() {
    if (phase !== "playing") return;
    setPhase("paused");
    stopTimer();
  }

  function handleResume() {
    if (phase !== "paused") return;
    // Short countdown before resuming
    setCountdown(3);
    setPhase("countdown");
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setPhase("playing");
          startTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handlePlayAgain() {
    setSubmitResult(null);
    setSubmitError(null);
    startCountdown();
  }

  // ----------------------------------------------------------------
  // Current question
  // ----------------------------------------------------------------
  const currentQuestion = questions[currentIndex] ?? null;
  const accuracy = correct + wrong > 0
    ? Math.round((correct / (correct + wrong)) * 100)
    : 0;

  const comboLabel =
    combo >= COMBO_X3 ? "🔥 x3" : combo >= COMBO_X2 ? "⚡ x2" : null;

  const timerColor =
    timeLeft <= LAST_10_THRESHOLD ? colors.error : colors.primary;

  // ----------------------------------------------------------------
  // Render helpers
  // ----------------------------------------------------------------
  if (poolError) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.centerContent}>
          <Ionicons name="sad-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            {poolError === "empty"
              ? t("games.common.pool_empty")
              : t("games.common.pool_empty_global")}
          </Text>
          <Text style={[styles.errorDesc, { color: colors.textSecondary }]}>
            {poolError === "empty" ? t("games.common.pool_empty_cta") : ""}
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.primaryBtnText}>{t("games.common.back_hub")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Tutorial ----
  if (phase === "tutorial") {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.tutorialContainer}>
          <Text style={styles.tutorialEmoji}>⚡</Text>
          <Text style={[styles.tutorialTitle, { color: colors.text }]}>
            {t("games.speed_round.tutorial_title")}
          </Text>
          <Text style={[styles.tutorialBody, { color: colors.textSecondary }]}>
            {t("games.speed_round.tutorial_body")}
          </Text>
          <View style={styles.tutorialPatternRow}>
            {["60 sn", "4 seçenek", "combo"].map((item) => (
              <View key={item} style={[styles.patternTag, { backgroundColor: colors.cardBackground }]}>
                <Text style={[styles.patternTagText, { color: colors.text }]}>{item}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={handleTutorialDone}
          >
            <Text style={styles.primaryBtnText}>{t("games.common.start_game")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Ready ----
  if (phase === "ready" || phase === "loading") {
    const isLoading = phase === "loading";
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("games.speed_round.name")}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.centerContent}>
          {isLoading ? (
            <>
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                {t("games.common.loading_pool")}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.readyEmoji}>⚡</Text>
              <Text style={[styles.readyTitle, { color: colors.text }]}>
                {t("games.common.countdown_ready")}
              </Text>
              <Text style={[styles.readyPattern, { color: colors.textSecondary }]}>
                {t("games.speed_round.pattern")}
              </Text>

              {/* Stats preview */}
              <View style={[styles.statsPreview, { backgroundColor: colors.cardBackground }]}>
                <StatItem
                  label={t("games.common.personal_best")}
                  value={(useGameStore.getState().userStats?.bestSpeedRound ?? 0).toLocaleString()}
                  colors={colors}
                />
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <StatItem
                  label={t("games.common.games_played")}
                  value={(useGameStore.getState().userStats?.gamesPlayed ?? 0).toString()}
                  colors={colors}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
                onPress={startCountdown}
              >
                <Ionicons name="play" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>{t("games.common.start_game")}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ---- Countdown ----
  if (phase === "countdown") {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.countdownContainer}>
          <Text style={[styles.countdownNumber, { color: colors.primary }]}>
            {countdown}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Paused ----
  if (phase === "paused") {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.centerContent}>
          <Ionicons name="pause-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.pausedTitle, { color: colors.text }]}>
            {t("games.common.paused_title")}
          </Text>
          <Text style={[styles.pausedStats, { color: colors.textSecondary }]}>
            {correct} doğru • {wrong} yanlış
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
            onPress={handleResume}
          >
            <Text style={styles.primaryBtnText}>{t("games.common.resume")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              {t("games.common.back_hub")}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Result ----
  if (phase === "result") {
    const score = submitResult?.score ?? (correct * 10 + comboMax * 5);
    const isNewRecord = submitResult?.personalBestBroken ?? false;
    const leagueChanged = submitResult?.leagueChanged ?? false;

    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.resultContainer}>
          {/* Title */}
          <Text style={[styles.resultTitle, { color: colors.text }]}>
            {t("games.result.title_speed")}
          </Text>

          {/* New record banner */}
          {isNewRecord && (
            <View style={[styles.newRecordBanner, { backgroundColor: colors.warning + "25" }]}>
              <Text style={[styles.newRecordText, { color: colors.warning }]}>
                🏆 {t("games.common.personal_best_new")}
              </Text>
            </View>
          )}

          {/* League up banner */}
          {leagueChanged && submitResult && (
            <View style={[styles.leagueUpBanner, { backgroundColor: colors.success + "20" }]}>
              <Text style={[styles.leagueUpText, { color: colors.success }]}>
                🎊 {t("games.league.promoted", { league: submitResult.league })}
              </Text>
            </View>
          )}

          {/* Stat cards */}
          <View style={styles.statCardsRow}>
            <StatCard label={t("games.result.score")}    value={score.toLocaleString()} color={colors.primary} colors={colors} />
            <StatCard label={t("games.result.accuracy")} value={`${accuracy}%`}          color={colors.success} colors={colors} />
            <StatCard label={t("games.result.combo")}    value={`x${comboMax}`}           color="#F59E0B"        colors={colors} />
          </View>

          <View style={styles.statCardsRow}>
            <StatCard label={t("games.result.correct")} value={correct.toString()} color={colors.success} colors={colors} />
            <StatCard label={t("games.result.wrong")}   value={wrong.toString()}   color={colors.error}   colors={colors} />
            {submitResult?.weeklyRank ? (
              <StatCard
                label={t("games.hub.leaderboard_title")}
                value={`#${submitResult.weeklyRank}`}
                color={colors.primary}
                colors={colors}
              />
            ) : (
              <StatCard label="—" value="—" color={colors.border} colors={colors} />
            )}
          </View>

          {/* Submit status */}
          {isSubmitting && (
            <Text style={[styles.submitStatus, { color: colors.textSecondary }]}>
              {t("games.common.score_submitting")}
            </Text>
          )}
          {submitError && (
            <Text style={[styles.submitStatus, { color: colors.error }]}>
              {t("games.common.score_failed")}
            </Text>
          )}

          {/* Actions */}
          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={handlePlayAgain}
            >
              <Ionicons name="refresh" size={16} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.primaryBtnText}>{t("games.common.play_again")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: colors.border, flex: 1 }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
                {t("games.common.back_hub")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ---- Playing ----
  if (!currentQuestion) return null;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Game Header */}
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={handlePause} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="pause" size={22} color={colors.text} />
        </TouchableOpacity>

        {/* Timer */}
        <View style={[styles.timerContainer, { backgroundColor: timerColor + "15" }]}>
          <Ionicons name="time-outline" size={15} color={timerColor} />
          <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
        </View>

        {/* Combo */}
        {comboLabel ? (
          <View style={[styles.comboBadge, { backgroundColor: "#F59E0B20" }]}>
            <Text style={[styles.comboText, { color: "#F59E0B" }]}>{comboLabel}</Text>
          </View>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Progress bar (questions) */}
      <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min((currentIndex / questions.length) * 100, 100)}%` as any,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>

      {/* Combo toast */}
      {comboToast && (
        <View style={[styles.comboToast, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.comboToastText, { color: "#F59E0B" }]}>{comboToast}</Text>
        </View>
      )}

      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={[styles.questionLabel, { color: colors.textSecondary }]}>
          {targetLanguage.toUpperCase()}
        </Text>
        <Text
          style={[styles.questionWord, { color: colors.text }, isSmallScreen && { fontSize: 26 }]}
          adjustsFontSizeToFit
          numberOfLines={2}
        >
          {currentQuestion.item.targetText}
        </Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, idx) => {
          let bgColor = colors.cardBackground;
          let borderColor = colors.border;
          let textColor = colors.text;

          if (answerState !== "idle" && selectedIndex !== null) {
            if (idx === currentQuestion.correctIndex) {
              bgColor = colors.success + "20";
              borderColor = colors.success;
              textColor = colors.success;
            } else if (idx === selectedIndex && selectedIndex !== currentQuestion.correctIndex) {
              bgColor = colors.error + "15";
              borderColor = colors.error;
              textColor = colors.error;
            }
          }

          return (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleAnswer(idx)}
              disabled={answerState !== "idle"}
              activeOpacity={0.7}
              style={[
                styles.optionBtn,
                { backgroundColor: bgColor, borderColor },
                isSmallScreen && { paddingVertical: 12 },
              ]}
            >
              <Text
                style={[styles.optionText, { color: textColor }, isSmallScreen && { fontSize: 14 }]}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {option.sourceText}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Score row */}
      <View style={[styles.scoreRow, { borderTopColor: colors.border }]}>
        <ScoreItem icon="checkmark-circle" color={colors.success} value={correct} />
        <ScoreItem icon="close-circle"     color={colors.error}   value={wrong} />
        <ScoreItem icon="flash"            color="#F59E0B"        value={correct * 10 + comboMax * 5} />
      </View>
    </SafeAreaView>
  );
}

// ---- Sub-components ----

function StatItem({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function StatCard({ label, value, color, colors }: { label: string; value: string; color: string; colors: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function ScoreItem({ icon, color, value }: { icon: string; color: string; value: number }) {
  return (
    <View style={styles.scoreItem}>
      <Ionicons name={icon as any} size={16} color={color} />
      <Text style={[styles.scoreValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex:               { flex: 1 },
  header:             { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle:        { fontSize: 18, fontWeight: "700" },

  centerContent:      { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  loadingText:        { fontSize: 15, marginTop: 12, textAlign: "center" },

  // Tutorial
  tutorialContainer:  { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  tutorialEmoji:      { fontSize: 52, marginBottom: 16 },
  tutorialTitle:      { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  tutorialBody:       { fontSize: 15, lineHeight: 23, textAlign: "center", marginBottom: 20 },
  tutorialPatternRow: { flexDirection: "row", gap: 8, marginBottom: 32 },
  patternTag:         { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  patternTagText:     { fontSize: 13, fontWeight: "500" },

  // Ready
  readyEmoji:         { fontSize: 52, marginBottom: 12 },
  readyTitle:         { fontSize: 24, fontWeight: "700", marginBottom: 6 },
  readyPattern:       { fontSize: 13, marginBottom: 24 },
  statsPreview:       { flexDirection: "row", borderRadius: 14, overflow: "hidden", width: "100%" },
  statItem:           { flex: 1, alignItems: "center", padding: 14 },
  statValue:          { fontSize: 20, fontWeight: "700" },
  statLabel:          { fontSize: 11, marginTop: 2 },
  statDivider:        { width: 1 },

  // Countdown
  countdownContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  countdownNumber:    { fontSize: 96, fontWeight: "900" },

  // Paused
  pausedTitle:        { fontSize: 22, fontWeight: "700", marginTop: 16 },
  pausedStats:        { fontSize: 14, marginTop: 8 },

  // Game header
  gameHeader:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 10 },
  timerContainer:     { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16 },
  timerText:          { fontSize: 16, fontWeight: "700" },
  comboBadge:         { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  comboText:          { fontSize: 13, fontWeight: "700" },

  progressTrack:      { height: 3, marginHorizontal: 16, borderRadius: 2, overflow: "hidden", marginBottom: 4 },
  progressFill:       { height: "100%", borderRadius: 2 },

  comboToast:         { alignSelf: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginVertical: 4 },
  comboToastText:     { fontSize: 14, fontWeight: "700" },

  // Question
  questionContainer:  { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  questionLabel:      { fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 },
  questionWord:       { fontSize: 32, fontWeight: "800", textAlign: "center" },

  // Options
  optionsContainer:   { paddingHorizontal: 16, gap: 10, paddingBottom: 12 },
  optionBtn:          { paddingVertical: 15, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5, alignItems: "center" },
  optionText:         { fontSize: 16, fontWeight: "500", textAlign: "center" },

  // Score row
  scoreRow:           { flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
  scoreItem:          { flexDirection: "row", alignItems: "center", gap: 5 },
  scoreValue:         { fontSize: 16, fontWeight: "700" },

  // Result
  resultContainer:    { flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 },
  resultTitle:        { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 14 },
  newRecordBanner:    { borderRadius: 10, padding: 10, alignItems: "center", marginBottom: 10 },
  newRecordText:      { fontSize: 15, fontWeight: "700" },
  leagueUpBanner:     { borderRadius: 10, padding: 10, alignItems: "center", marginBottom: 10 },
  leagueUpText:       { fontSize: 15, fontWeight: "700" },
  statCardsRow:       { flexDirection: "row", gap: 10, marginBottom: 10 },
  statCard:           { flex: 1, borderRadius: 14, padding: 14, alignItems: "center" },
  statCardValue:      { fontSize: 22, fontWeight: "800" },
  statCardLabel:      { fontSize: 11, marginTop: 4 },
  submitStatus:       { textAlign: "center", fontSize: 13, marginBottom: 8 },
  resultActions:      { flexDirection: "row", gap: 10, marginTop: "auto" as any },

  // Buttons
  primaryBtn:         { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14 },
  primaryBtnText:     { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn:       { alignItems: "center", justifyContent: "center", paddingVertical: 14, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1.5 },
  secondaryBtnText:   { fontSize: 15, fontWeight: "600" },
  linkText:           { fontSize: 14 },

  // Error
  errorTitle:         { fontSize: 18, fontWeight: "700", textAlign: "center", marginTop: 12, marginBottom: 8 },
  errorDesc:          { fontSize: 14, textAlign: "center", marginBottom: 24 },
});
