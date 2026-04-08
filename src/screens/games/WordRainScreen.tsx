import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
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
import { useAudioSettingsStore } from "@/store/useAudioSettingsStore";
import { useGameAudio } from "@/audio/useGameAudio";
import { BGMusicPickerModal } from "@/components/BGMusicPickerModal";
import GameDailyLimitModal from "@/components/GameDailyLimitModal";
import {
  GamePhase,
  GameVocabularyItem,
  RawSessionStats,
  GameSubmitResult,
} from "@/types/game";
import {
  buildGamePool,
  buildDistractors,
  shuffle,
} from "@/utils/gamePoolBuilder";
import { HomeStackParamList } from "@/types";
import "react-native-get-random-values";

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type Nav = NativeStackNavigationProp<HomeStackParamList>;
type Route = RouteProp<HomeStackParamList, "WordRain">;

// ---- Game constants ----
const MAX_LIVES = 3;
const LEVEL_UP_EVERY = 10;  // correct answers per level
const BASE_FALL_MS = 3200;
const MIN_FALL_MS = 900;
const FALL_STEP_MS = 220;   // ms faster per level
const CORRECT_DELAY_MS = 300;
const WRONG_DELAY_MS = 750;
const COMBO_X2 = 3;
const COMBO_X3 = 6;
const COMBO_X4 = 10;

function getFallDuration(level: number): number {
  return Math.max(MIN_FALL_MS, BASE_FALL_MS - (level - 1) * FALL_STEP_MS);
}

function getComboMultiplier(combo: number): number {
  if (combo >= COMBO_X4) return 4;
  if (combo >= COMBO_X3) return 3;
  if (combo >= COMBO_X2) return 2;
  return 1;
}

type AnswerState = "idle" | "correct" | "wrong" | "missed";

export default function WordRainScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { filter } = route.params;
  const { height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 700;

  const { user } = useAuthStore();
  const isPremium = useAuthStore((s) => s.user?.is_premium ?? false);
  const { targetLanguage, uiLanguage } = useSettingsStore();
  const { tutorialSeen, markTutorialSeen, submitScore } = useGameStore();

  const {
    bgMusicEnabled,
    sfxEnabled,
    gameBgTrack,
    setBgMusicEnabled,
    setSfxEnabled,
    setGameBgTrack,
    load: loadAudioSettings,
  } = useAudioSettingsStore();

  const [musicPickerVisible, setMusicPickerVisible] = useState(false);

  // ---- Phase ----
  const [phase, setPhase] = useState<GamePhase>("loading");

  const { startBgMusic, stopBgMusic, playSfx } = useGameAudio({
    bgMusicEnabled,
    sfxEnabled,
    bgTrackId: gameBgTrack["word_rain"] ?? "bg2",
    gameActive: phase === "playing",
  });
  const [poolError, setPoolError] = useState<"empty" | "network" | null>(null);

  // ---- Pool ----
  const [pool, setPool] = useState<GameVocabularyItem[]>([]);
  const [poolSize, setPoolSize] = useState(0);
  const shuffledPoolRef = useRef<GameVocabularyItem[]>([]);
  const poolIndexRef = useRef(0);

  // ---- Session ----
  const sessionIdRef = useRef<string>(generateUUID());
  const gameStartTimeRef = useRef(0);

  // ---- Game state (state + refs for stale closure safety) ----
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [missed, setMissed] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [level, setLevel] = useState(1);

  const livesRef   = useRef(MAX_LIVES);
  const correctRef = useRef(0);
  const wrongRef   = useRef(0);
  const missedRef  = useRef(0);
  const comboRef   = useRef(0);
  const comboMaxRef = useRef(0);
  const scoreRef   = useRef(0);
  const levelRef   = useRef(1);

  // ---- Current word ----
  const [currentWord, setCurrentWord] = useState<GameVocabularyItem | null>(null);
  const [currentOptions, setCurrentOptions] = useState<GameVocabularyItem[]>([]);
  const [correctId, setCorrectId] = useState<string>("");
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ---- Countdown ----
  const [countdown, setCountdown] = useState(3);

  // ---- Playfield layout (measured) ----
  const [playfieldHeight, setPlayfieldHeight] = useState(300);

  // ---- Fall animation ----
  const fallAnim = useRef(new Animated.Value(0)).current;
  const fallAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  // ---- Result ----
  const [submitResult, setSubmitResult] = useState<GameSubmitResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // ---- Timers ----
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- AppState ----
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // ----------------------------------------------------------------
  // Cleanup on unmount
  // ----------------------------------------------------------------
  useEffect(() => {
    return () => {
      fallAnimRef.current?.stop();
      if (transitionRef.current) clearTimeout(transitionRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // ----------------------------------------------------------------
  // AppState — auto pause
  // ----------------------------------------------------------------
  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (
        appStateRef.current === "active" &&
        nextState !== "active" &&
        phase === "playing"
      ) {
        handlePause();
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [phase]);

  // ----------------------------------------------------------------
  // Load pool + audio settings
  // ----------------------------------------------------------------
  useEffect(() => {
    loadAudioSettings();
  }, []);

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
        gameType: "word_rain",
        sourceLang: i18n.language,
        targetLang: targetLanguage,
      });

      if (!meta.isEnough) {
        setPoolError("empty");
        return;
      }

      setPool(items);
      setPoolSize(meta.usable);

      if (!tutorialSeen.word_rain) {
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
    markTutorialSeen("word_rain");
    setPhase("ready");
  }

  // ----------------------------------------------------------------
  // Ready → countdown → playing
  // ----------------------------------------------------------------
  function startCountdown() {
    setCountdown(3);
    setPhase("countdown");
    playSfx("countdown");

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
  // Start game — reset all state
  // ----------------------------------------------------------------
  function startGame() {
    livesRef.current   = MAX_LIVES;
    correctRef.current = 0;
    wrongRef.current   = 0;
    missedRef.current  = 0;
    comboRef.current   = 0;
    comboMaxRef.current = 0;
    scoreRef.current   = 0;
    levelRef.current   = 1;

    setLives(MAX_LIVES);
    setScore(0);
    setCorrect(0);
    setWrong(0);
    setMissed(0);
    setCombo(0);
    setComboMax(0);
    setLevel(1);
    setSubmitResult(null);
    setSubmitError(null);

    sessionIdRef.current    = generateUUID();
    gameStartTimeRef.current = Date.now();

    shuffledPoolRef.current = shuffle([...pool]);
    poolIndexRef.current    = 0;

    setPhase("playing");
    startBgMusic();
    // Let "playing" render before spawning first word
    setTimeout(() => spawnNextWord(), 150);
  }

  // ----------------------------------------------------------------
  // Pool cycling helper
  // ----------------------------------------------------------------
  function getNextItem(): GameVocabularyItem {
    if (poolIndexRef.current >= shuffledPoolRef.current.length) {
      shuffledPoolRef.current = shuffle([...pool]);
      poolIndexRef.current    = 0;
    }
    return shuffledPoolRef.current[poolIndexRef.current++];
  }

  // ----------------------------------------------------------------
  // Spawn next word + start fall animation
  // ----------------------------------------------------------------
  function spawnNextWord() {
    if (transitionRef.current) clearTimeout(transitionRef.current);

    const item       = getNextItem();
    const distractors = buildDistractors(item, pool, 3);
    const allOptions  = shuffle([item, ...distractors]);

    fallAnim.setValue(0);
    setCurrentWord(item);
    setCurrentOptions(allOptions);
    setCorrectId(item.id);
    setAnswerState("idle");
    setSelectedId(null);

    const duration = getFallDuration(levelRef.current);
    fallAnimRef.current = Animated.timing(fallAnim, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    });

    fallAnimRef.current.start(({ finished }) => {
      if (finished) {
        onWordMissed();
      }
    });
  }

  // ----------------------------------------------------------------
  // Word hit the ground
  // ----------------------------------------------------------------
  function onWordMissed() {
    setAnswerState("missed");
    missedRef.current += 1;
    setMissed(missedRef.current);
    comboRef.current = 0;
    setCombo(0);
    playSfx("missed");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    livesRef.current -= 1;
    setLives(livesRef.current);

    if (livesRef.current <= 0) {
      transitionRef.current = setTimeout(() => endGame(), WRONG_DELAY_MS);
    } else {
      transitionRef.current = setTimeout(() => spawnNextWord(), WRONG_DELAY_MS);
    }
  }

  // ----------------------------------------------------------------
  // Answer handling
  // ----------------------------------------------------------------
  const handleAnswer = useCallback(
    (optionId: string) => {
      if (answerState !== "idle" || phase !== "playing") return;

      // Stop the fall — prevents onWordMissed from firing (finished=false)
      fallAnimRef.current?.stop();
      setSelectedId(optionId);

      if (optionId === correctId) {
        setAnswerState("correct");

        const newCombo    = comboRef.current + 1;
        comboRef.current  = newCombo;
        const newComboMax = Math.max(comboMaxRef.current, newCombo);
        comboMaxRef.current = newComboMax;
        setCombo(newCombo);
        setComboMax(newComboMax);

        const newCorrect   = correctRef.current + 1;
        correctRef.current = newCorrect;
        setCorrect(newCorrect);

        const pts        = 10 * getComboMultiplier(newCombo) * levelRef.current;
        scoreRef.current += pts;
        setScore(scoreRef.current);

        // Level up?
        const newLevel = Math.floor(newCorrect / LEVEL_UP_EVERY) + 1;
        if (newLevel > levelRef.current) {
          levelRef.current = newLevel;
          setLevel(newLevel);
          playSfx("levelUp");
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          playSfx("correct");
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }

        transitionRef.current = setTimeout(() => spawnNextWord(), CORRECT_DELAY_MS);
      } else {
        setAnswerState("wrong");
        comboRef.current = 0;
        setCombo(0);
        wrongRef.current += 1;
        setWrong(wrongRef.current);
        playSfx("wrong");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        livesRef.current -= 1;
        setLives(livesRef.current);
        if (livesRef.current > 0) playSfx("lifeLost");

        if (livesRef.current <= 0) {
          transitionRef.current = setTimeout(() => endGame(), WRONG_DELAY_MS);
        } else {
          transitionRef.current = setTimeout(() => spawnNextWord(), WRONG_DELAY_MS);
        }
      }
    },
    [answerState, phase, correctId]
  );

  // ----------------------------------------------------------------
  // End game
  // ----------------------------------------------------------------
  function endGame() {
    fallAnimRef.current?.stop();
    stopBgMusic();
    playSfx("finish");
    setPhase("result");
    setTimeout(() => submitGameScore(), 0);
  }

  async function submitGameScore() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const durationSec = Math.round((Date.now() - gameStartTimeRef.current) / 1000);

    const stats: RawSessionStats = {
      sessionId:    sessionIdRef.current,
      gameType:     "word_rain",
      correct:      correctRef.current,
      wrong:        wrongRef.current,
      missed:       missedRef.current,
      durationSec,
      comboMax:     comboMaxRef.current,
      levelReached: levelRef.current,
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
      if (storeError === "daily_limit_reached") {
        setLimitReached(true);
        setShowLimitModal(true);
      }
    }
  }

  // ----------------------------------------------------------------
  // Pause / Resume
  // ----------------------------------------------------------------
  function handlePause() {
    if (phase !== "playing") return;
    fallAnimRef.current?.stop();
    setPhase("paused");
  }

  function handleResume() {
    if (phase !== "paused") return;
    setCountdown(3);
    setPhase("countdown");

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setPhase("playing");
          setTimeout(() => spawnNextWord(), 50);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function handlePlayAgain() {
    if (limitReached && !isPremium) {
      setShowLimitModal(true);
      return;
    }
    setSubmitResult(null);
    setSubmitError(null);
    setLimitReached(false);
    loadPool();
  }

  // ----------------------------------------------------------------
  // Derived
  // ----------------------------------------------------------------
  const accuracy    = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
  const comboLabel  = combo >= COMBO_X4 ? "🔥 x4" : combo >= COMBO_X3 ? "🔥 x3" : combo >= COMBO_X2 ? "⚡ x2" : null;
  const fallTransY  = fallAnim.interpolate({ inputRange: [0, 1], outputRange: [-70, playfieldHeight + 10] });

  // ----------------------------------------------------------------
  // Render — Pool error
  // ----------------------------------------------------------------
  if (poolError) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.centerContent}>
          <Ionicons name="sad-outline" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            {poolError === "empty" ? t("games.common.pool_empty") : t("games.common.pool_empty_global")}
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

  // ----------------------------------------------------------------
  // Render — Tutorial
  // ----------------------------------------------------------------
  if (phase === "tutorial") {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.tutorialContainer}>
          <Text style={[styles.tutorialEmoji, isSmallScreen && { fontSize: 36, marginBottom: 10 }]}>🌧</Text>
          <Text style={[styles.tutorialTitle, { color: colors.text }, isSmallScreen && { fontSize: 18 }]}>
            {t("games.word_rain.tutorial_title")}
          </Text>
          <Text style={[styles.tutorialBody, { color: colors.textSecondary }, isSmallScreen && { fontSize: 13 }]}>
            {t("games.word_rain.tutorial_body")}
          </Text>
          <View style={styles.tutorialPatternRow}>
            {t("games.word_rain.pattern").split(" • ").map((item) => (
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

  // ----------------------------------------------------------------
  // Render — Loading / Ready
  // ----------------------------------------------------------------
  if (phase === "loading" || phase === "ready") {
    const isLoading = phase === "loading";
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t("games.word_rain.name")}
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <View style={styles.centerContent}>
          {isLoading ? (
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {t("games.common.loading_pool")}
            </Text>
          ) : (
            <>
              <Text style={[styles.readyEmoji, isSmallScreen && { fontSize: 36, marginBottom: 8 }]}>🌧</Text>
              <Text style={[styles.readyTitle, { color: colors.text }, isSmallScreen && { fontSize: 20, marginBottom: 4 }]}>
                {t("games.common.countdown_ready")}
              </Text>
              <Text style={[styles.readyPattern, { color: colors.textSecondary }]}>
                {t("games.word_rain.pattern")}
              </Text>

              <View style={[styles.statsPreview, { backgroundColor: colors.cardBackground }]}>
                <StatItem
                  label={t("games.common.personal_best")}
                  value={(useGameStore.getState().userStats?.bestWordRain ?? 0).toLocaleString()}
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
                style={[styles.primaryBtn, { backgroundColor: "#4DA3FF", marginTop: 24 }]}
                onPress={startCountdown}
              >
                <Ionicons name="play" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>{t("games.common.start_game")}</Text>
              </TouchableOpacity>

              {/* Audio quick controls */}
              <View style={styles.readyAudioRow}>
                <TouchableOpacity style={styles.readyAudioBtn} onPress={() => setBgMusicEnabled(!bgMusicEnabled)}>
                  <Ionicons
                    name={bgMusicEnabled ? "musical-notes" : "musical-notes-outline"}
                    size={18}
                    color={bgMusicEnabled ? "#4DA3FF" : colors.textTertiary}
                  />
                  <Text style={[styles.readyAudioLabel, { color: bgMusicEnabled ? colors.text : colors.textTertiary }]}>
                    {t("games.audio.bg_music")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.readyAudioBtn} onPress={() => setSfxEnabled(!sfxEnabled)}>
                  <Ionicons
                    name={sfxEnabled ? "volume-high" : "volume-mute"}
                    size={18}
                    color={sfxEnabled ? "#4DA3FF" : colors.textTertiary}
                  />
                  <Text style={[styles.readyAudioLabel, { color: sfxEnabled ? colors.text : colors.textTertiary }]}>
                    {t("games.audio.sfx")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.readyAudioBtn} onPress={() => setMusicPickerVisible(true)}>
                  <Ionicons name="list-outline" size={16} color="#4DA3FF" />
                  <Text style={[styles.readyAudioLabel, { color: "#4DA3FF" }]}>
                    {t("games.audio.pick_music")}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <BGMusicPickerModal
          visible={musicPickerVisible}
          initialTrackId={gameBgTrack["word_rain"] ?? "bg2"}
          onConfirm={(trackId) => {
            setGameBgTrack("word_rain", trackId);
            setMusicPickerVisible(false);
          }}
          onCancel={() => setMusicPickerVisible(false)}
        />
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------------------
  // Render — Countdown
  // ----------------------------------------------------------------
  if (phase === "countdown") {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.countdownContainer}>
          <Text style={[styles.countdownNumber, { color: "#4DA3FF" }]}>{countdown}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ----------------------------------------------------------------
  // Render — Paused
  // ----------------------------------------------------------------
  if (phase === "paused") {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.centerContent}>
          <Ionicons name="pause-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.pausedTitle, { color: colors.text }]}>
            {t("games.common.paused_title")}
          </Text>
          <Text style={[styles.pausedStats, { color: colors.textSecondary }]}>
            {correct} {t("games.result.correct")} • {wrong} {t("games.result.wrong")} • {missed} {t("games.result.missed")}
          </Text>
          {/* Lives */}
          <View style={styles.livesRow}>
            {Array.from({ length: MAX_LIVES }).map((_, i) => (
              <Text key={i} style={[styles.lifeIcon, { opacity: i < lives ? 1 : 0.25 }]}>❤️</Text>
            ))}
          </View>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: "#4DA3FF", marginTop: 24 }]}
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

  // ----------------------------------------------------------------
  // Render — Result
  // ----------------------------------------------------------------
  if (phase === "result") {
    const finalScore   = submitResult?.score ?? scoreRef.current;
    const isNewRecord  = submitResult?.personalBestBroken ?? false;
    const leagueChanged = submitResult?.leagueChanged ?? false;

    return (
      <>
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.resultContainer}>
          <Text style={[styles.resultTitle, { color: colors.text }]}>
            {t("games.result.title_rain")}
          </Text>

          {isNewRecord && (
            <View style={[styles.newRecordBanner, { backgroundColor: colors.warning + "25" }]}>
              <Text style={[styles.newRecordText, { color: colors.warning }]}>
                🏆 {t("games.common.personal_best_new")}
              </Text>
            </View>
          )}

          {leagueChanged && submitResult && (
            <View style={[styles.leagueUpBanner, { backgroundColor: colors.success + "20" }]}>
              <Text style={[styles.leagueUpText, { color: colors.success }]}>
                🎊 {t("games.league.promoted", { league: submitResult.league })}
              </Text>
            </View>
          )}

          <View style={styles.statCardsRow}>
            <StatCard label={t("games.result.score")}    value={finalScore.toLocaleString()} color="#4DA3FF"      colors={colors} />
            <StatCard label={t("games.result.accuracy")} value={`${accuracy}%`}              color={colors.success} colors={colors} />
            <StatCard label={t("games.result.level")}    value={`${levelRef.current}`}       color="#F59E0B"        colors={colors} />
          </View>

          <View style={styles.statCardsRow}>
            <StatCard label={t("games.result.correct")} value={correct.toString()} color={colors.success} colors={colors} />
            <StatCard label={t("games.result.wrong")}   value={wrong.toString()}   color={colors.error}   colors={colors} />
            <StatCard label={t("games.result.missed")}  value={missed.toString()}  color={colors.textSecondary} colors={colors} />
          </View>

          <View style={styles.statCardsRow}>
            <StatCard label={t("games.result.combo")} value={`x${comboMaxRef.current}`} color="#F59E0B" colors={colors} />
            {submitResult?.weeklyRank ? (
              <StatCard
                label={t("games.hub.leaderboard_title")}
                value={`#${submitResult.weeklyRank}`}
                color="#4DA3FF"
                colors={colors}
              />
            ) : (
              <StatCard label="—" value="—" color={colors.border} colors={colors} />
            )}
            <View style={{ flex: 1 }} />
          </View>

          {isSubmitting && (
            <Text style={[styles.submitStatus, { color: colors.textSecondary }]}>
              {t("games.common.score_submitting")}
            </Text>
          )}
          {submitError && submitError !== "duplicate_session" && (
            <Text style={[styles.submitStatus, { color: colors.error }]}>
              {submitError === "daily_limit_reached"
                ? t("games.hub.daily_limit_reached")
                : t("games.common.score_failed")}
            </Text>
          )}

          <View style={styles.resultActions}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: "#4DA3FF", flex: 1 }]}
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
      <GameDailyLimitModal
        visible={showLimitModal}
        onClose={() => setShowLimitModal(false)}
      />
      </>
    );
  }

  // ----------------------------------------------------------------
  // Render — Playing
  // ----------------------------------------------------------------
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Game Header */}
      <View style={styles.gameHeader}>
        <TouchableOpacity
          onPress={handlePause}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="pause" size={22} color={colors.text} />
        </TouchableOpacity>

        {/* Lives */}
        <View style={styles.livesRow}>
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <Text key={i} style={[styles.lifeIcon, { opacity: i < lives ? 1 : 0.2 }]}>❤️</Text>
          ))}
        </View>

        {/* Score + Level + Audio toggles */}
        <View style={styles.scoreLevel}>
          <Text style={[styles.scoreLevelText, { color: colors.text }]}>
            {scoreRef.current}
          </Text>
          {comboLabel ? (
            <Text style={[styles.comboLabel, { color: "#F59E0B" }]}>{comboLabel}</Text>
          ) : (
            <Text style={[styles.scoreLevelText, { color: colors.textSecondary, fontSize: 11 }]}>
              {t("games.word_rain.level", { n: level })}
            </Text>
          )}
          <View style={styles.audioIcons}>
            <TouchableOpacity onPress={() => setBgMusicEnabled(!bgMusicEnabled)} hitSlop={{ top: 8, bottom: 8, left: 5, right: 5 }}>
              <Ionicons
                name={bgMusicEnabled ? "musical-notes" : "musical-notes-outline"}
                size={16}
                color={bgMusicEnabled ? "#4DA3FF" : colors.textTertiary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSfxEnabled(!sfxEnabled)} hitSlop={{ top: 8, bottom: 8, left: 5, right: 5 }}>
              <Ionicons
                name={sfxEnabled ? "volume-high" : "volume-mute"}
                size={16}
                color={sfxEnabled ? "#4DA3FF" : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Playfield */}
      <View
        style={styles.playfield}
        onLayout={(e) => setPlayfieldHeight(e.nativeEvent.layout.height)}
      >
        {/* Ground line */}
        <View style={[styles.groundLine, { borderColor: colors.border }]} />

        {currentWord && (
          <Animated.View
            style={[
              styles.fallingWordContainer,
              { transform: [{ translateY: fallTransY }] },
            ]}
          >
            <Text
              style={[
                styles.langLabel,
                { color: colors.textSecondary },
              ]}
            >
              {targetLanguage.toUpperCase()}
            </Text>
            <View
              style={[
                styles.wordBubble,
                {
                  backgroundColor:
                    answerState === "correct"
                      ? colors.success + "20"
                      : answerState === "wrong" || answerState === "missed"
                      ? colors.error + "15"
                      : colors.cardBackground,
                  borderColor:
                    answerState === "correct"
                      ? colors.success
                      : answerState === "wrong" || answerState === "missed"
                      ? colors.error
                      : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.wordText,
                  { color: colors.text },
                  isSmallScreen && { fontSize: 22 },
                ]}
                adjustsFontSizeToFit
                numberOfLines={1}
              >
                {currentWord.targetText}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Answer Buttons — 2x2 grid */}
      <View style={styles.optionsGrid}>
        {[0, 1].map((row) => (
          <View key={row} style={styles.optionsRow}>
            {currentOptions.slice(row * 2, row * 2 + 2).map((option) => {
              const isSelected = selectedId === option.id;
              const isCorrect  = option.id === correctId;

              let bgColor     = colors.cardBackground;
              let borderColor = colors.border;
              let textColor   = colors.text;

              if (answerState !== "idle") {
                if (isCorrect) {
                  bgColor     = colors.success + "20";
                  borderColor = colors.success;
                  textColor   = colors.success;
                } else if (isSelected && !isCorrect) {
                  bgColor     = colors.error + "15";
                  borderColor = colors.error;
                  textColor   = colors.error;
                }
              }

              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleAnswer(option.id)}
                  disabled={answerState !== "idle"}
                  activeOpacity={0.7}
                  style={[
                    styles.optionBtn,
                    { backgroundColor: bgColor, borderColor },
                  ]}
                >
                  <Text
                    style={[styles.optionText, { color: textColor }]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                  >
                    {option.sourceText}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
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

function StatCard({
  label,
  value,
  color,
  colors,
}: {
  label: string;
  value: string;
  color: string;
  colors: any;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.statCardValue, { color }]}>{value}</Text>
      <Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex:               { flex: 1 },
  header:             { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle:        { fontSize: 18, fontWeight: "700" },
  centerContent:      { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  loadingText:        { fontSize: 15, textAlign: "center" },

  // Tutorial
  tutorialContainer:  { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  tutorialEmoji:      { fontSize: 52, marginBottom: 16 },
  tutorialTitle:      { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  tutorialBody:       { fontSize: 15, lineHeight: 23, textAlign: "center", marginBottom: 20 },
  tutorialPatternRow: { flexDirection: "row", gap: 8, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" },
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
  gameHeader:         { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8 },
  livesRow:           { flexDirection: "row", gap: 4, alignItems: "center" },
  lifeIcon:           { fontSize: 20 },
  scoreLevel:         { alignItems: "flex-end" },
  scoreLevelText:     { fontSize: 15, fontWeight: "700" },
  comboLabel:         { fontSize: 12, fontWeight: "700" },
  audioIcons:         { flexDirection: "row", gap: 8, marginTop: 2 },
  readyAudioRow:      { flexDirection: "row", gap: 8, marginTop: 16 },
  readyAudioBtn:      { flex: 1, alignItems: "center", gap: 4 },
  readyAudioLabel:    { fontSize: 11, fontWeight: "500", textAlign: "center" },

  // Playfield
  playfield:          { flex: 1, overflow: "hidden", position: "relative" },
  groundLine:         { position: "absolute", bottom: 0, left: 0, right: 0, borderBottomWidth: 1.5, borderStyle: "dashed" },
  fallingWordContainer: { position: "absolute", top: 0, left: 0, right: 0, alignItems: "center", paddingHorizontal: 20 },
  langLabel:          { fontSize: 10, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  wordBubble:         { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16, borderWidth: 1.5, maxWidth: "100%" },
  wordText:           { fontSize: 26, fontWeight: "800", textAlign: "center" },

  // Answer buttons (2×2)
  optionsGrid:        { paddingHorizontal: 10, paddingBottom: 10, paddingTop: 6, gap: 6 },
  optionsRow:         { flexDirection: "row", gap: 6 },
  optionBtn:          { flex: 1, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center", minHeight: 48 },
  optionText:         { fontSize: 15, fontWeight: "500", textAlign: "center" },

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
