import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  AppState,
  AppStateStatus,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import { BGMusicPickerModal } from "@/components/BGMusicPickerModal";
import GameDailyLimitModal from "@/components/GameDailyLimitModal";
import { useTheme } from "@/hooks/useTheme";
import { HomeStackParamList } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useGameStore } from "@/store/useGameStore";
import { useAudioSettingsStore } from "@/store/useAudioSettingsStore";
import { useGameAudio } from "@/audio/useGameAudio";
import {
  GameDifficultyFilter,
  GamePhase,
  GameSubmitResult,
  GameVocabularyItem,
  RawSessionStats,
} from "@/types/game";
import { buildGamePool, shuffle } from "@/utils/gamePoolBuilder";
import "react-native-get-random-values";

type Nav = NativeStackNavigationProp<HomeStackParamList>;
type Route = RouteProp<HomeStackParamList, "MemoryMatch">;

type CardSide = "source" | "target";

interface MemoryCard {
  id: string;
  pairId: string;
  side: CardSide;
  text: string;
}

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const GAME_DURATION = 90;
const ROUND_PAIR_COUNT = 8;
const TIME_PENALTY_SEC = 2;
const CORRECT_DELAY_MS = 260;
const WRONG_DELAY_MS = 750;
const LAST_10_THRESHOLD = 10;
const COMBO_X2 = 3;
const COMBO_X3 = 6;

const DIFFICULTY_OPTIONS: { key: GameDifficultyFilter }[] = [
  { key: "mixed" },
  { key: "easy" },
  { key: "medium" },
  { key: "hard" },
];

function buildCards(items: GameVocabularyItem[]): MemoryCard[] {
  return shuffle(
    items.flatMap((item) => [
      {
        id: `${item.id}_source`,
        pairId: item.id,
        side: "source" as const,
        text: item.sourceText,
      },
      {
        id: `${item.id}_target`,
        pairId: item.id,
        side: "target" as const,
        text: item.targetText,
      },
    ])
  );
}

export default function MemoryMatchScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { filter, difficultyFilter = "mixed", forceTutorial } = route.params;
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isSmallScreen = screenHeight < 760;

  const { user } = useAuthStore();
  const isPremium = useAuthStore((s) => s.user?.is_premium ?? false);
  const { targetLanguage, uiLanguage } = useSettingsStore();
  const {
    tutorialSeen,
    markTutorialSeen,
    submitScore,
    dailyLimitReached,
    setDailyLimitReached,
    retryPendingScore,
  } = useGameStore();

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
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficultyFilter>(difficultyFilter);
  const [poolError, setPoolError] = useState<"empty" | "network" | null>(null);
  const [isPoolRefreshing, setIsPoolRefreshing] = useState(false);
  const [pool, setPool] = useState<GameVocabularyItem[]>([]);
  const [poolSize, setPoolSize] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [matchedCardIds, setMatchedCardIds] = useState<string[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [wrongCardIds, setWrongCardIds] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [submitResult, setSubmitResult] = useState<GameSubmitResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const limitReached = dailyLimitReached.memory_match;
  const sessionIdRef = useRef<string>(generateUUID());
  const loadRequestIdRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const shuffledPoolRef = useRef<GameVocabularyItem[]>([]);
  const poolIndexRef = useRef(0);
  const phaseRef = useRef<GamePhase>("loading");
  const resolvingRef = useRef(false);
  const endedRef = useRef(false);
  const penaltyOpacity = useRef(new Animated.Value(0)).current;
  const penaltyTranslateY = useRef(new Animated.Value(-10)).current;
  const penaltyScale = useRef(new Animated.Value(0.96)).current;

  const { startBgMusic, stopBgMusic, playSfx } = useGameAudio({
    bgMusicEnabled,
    sfxEnabled,
    bgTrackId: gameBgTrack["memory_match"] ?? "bg2",
    gameActive: phase === "playing",
  });

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    return () => {
      clearAllTimers();
      stopBgMusic();
    };
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (
        appStateRef.current === "active" &&
        nextState !== "active" &&
        phaseRef.current === "playing"
      ) {
        handlePause();
      }
      if (nextState === "active") {
        void retryPendingScore();
      }
      appStateRef.current = nextState;
    });
    return () => sub.remove();
  }, [retryPendingScore]);

  useEffect(() => {
    loadAudioSettings();
  }, []);

  useEffect(() => {
    if (!user) return;
    void loadPool({
      preservePhase: phaseRef.current === "ready" || phaseRef.current === "tutorial",
    });
    void retryPendingScore();
  }, [user, selectedDifficulty, filter, uiLanguage, targetLanguage]);

  function clearAllTimers() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (transitionRef.current) clearTimeout(transitionRef.current);
  }

  function resetPoolCursor(items: GameVocabularyItem[]) {
    shuffledPoolRef.current = shuffle([...items]);
    poolIndexRef.current = 0;
  }

  function getNextRoundItems(): GameVocabularyItem[] {
    if (pool.length === 0) return [];

    const nextItems: GameVocabularyItem[] = [];
    const seenIds = new Set<string>();
    let safety = 0;

    while (nextItems.length < ROUND_PAIR_COUNT && safety < pool.length * 4) {
      if (poolIndexRef.current >= shuffledPoolRef.current.length) {
        shuffledPoolRef.current = shuffle([...pool]);
        poolIndexRef.current = 0;
      }

      const candidate = shuffledPoolRef.current[poolIndexRef.current++];
      if (!candidate || seenIds.has(candidate.id)) {
        safety++;
        continue;
      }

      seenIds.add(candidate.id);
      nextItems.push(candidate);
      safety++;
    }

    return nextItems;
  }

  function startNextRound(round = 1) {
    const roundItems = getNextRoundItems();
    if (roundItems.length < ROUND_PAIR_COUNT) {
      endGame();
      return;
    }

    setRoundNumber(round);
    setMatchedCardIds([]);
    setSelectedCardIds([]);
    setWrongCardIds([]);
    setCards(buildCards(roundItems));
    resolvingRef.current = false;
  }

  async function loadPool(options?: { preservePhase?: boolean }) {
    const preservePhase = options?.preservePhase ?? false;
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;

    if (preservePhase) {
      setIsPoolRefreshing(true);
    } else {
      setPhase("loading");
    }
    setPoolError(null);

    try {
      const { items, meta } = await buildGamePool({
        userId: user!.id,
        filter,
        difficultyFilter: selectedDifficulty,
        gameType: "memory_match",
        sourceLang: uiLanguage,
        targetLang: targetLanguage,
      });

      if (requestId !== loadRequestIdRef.current) return;

      if (!meta.isEnough) {
        setPoolError("empty");
        setPool([]);
        setPoolSize(0);
        return;
      }

      setPool(items);
      setPoolSize(meta.usable);
      resetPoolCursor(items);
      setPoolError(null);

      if (!preservePhase) {
        if (forceTutorial || !tutorialSeen.memory_match) {
          setPhase("tutorial");
        } else {
          setPhase("ready");
        }
      }
    } catch {
      if (requestId !== loadRequestIdRef.current) return;
      setPoolError("network");
    } finally {
      if (requestId === loadRequestIdRef.current) {
        setIsPoolRefreshing(false);
      }
    }
  }

  function handleTutorialDone() {
    markTutorialSeen("memory_match");
    setPhase("ready");
  }

  function startCountdown() {
    if (dailyLimitReached.memory_match && !isPremium) {
      setShowLimitModal(true);
      return;
    }

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

  function startGame() {
    clearAllTimers();
    endedRef.current = false;
    resolvingRef.current = false;
    sessionIdRef.current = generateUUID();
    setTimeLeft(GAME_DURATION);
    setCorrect(0);
    setWrong(0);
    setCombo(0);
    setComboMax(0);
    setSubmitResult(null);
    setSubmitError(null);
    resetPoolCursor(pool);
    setPhase("playing");
    startBgMusic();
    startNextRound(1);
    startTimer();
  }

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
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

  function endGame() {
    if (endedRef.current) return;
    endedRef.current = true;
    clearAllTimers();
    stopBgMusic();
    playSfx("finish");
    setPhase("result");
    setTimeout(() => submitGameScore(), 0);
  }

  async function submitGameScore() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const stats: RawSessionStats = {
      sessionId: sessionIdRef.current,
      gameType: "memory_match",
      correct,
      wrong,
      missed: 0,
      durationSec: GAME_DURATION - timeLeft,
      comboMax,
      levelReached: 1,
      poolSize,
      filterUsed: filter,
      sourceLang: uiLanguage,
      targetLang: targetLanguage,
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
        setDailyLimitReached("memory_match", true);
        setShowLimitModal(true);
      }
    }
  }

  function handlePause() {
    if (phaseRef.current !== "playing") return;
    stopTimer();
    setPhase("paused");
  }

  function handleResume() {
    if (phaseRef.current !== "paused") return;
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
    if (limitReached && !isPremium) {
      setShowLimitModal(true);
      return;
    }
    setDailyLimitReached("memory_match", false);
    void loadPool();
  }

  function applyWrongPenalty(): boolean {
    let depleted = false;
    setTimeLeft((prev) => {
      const next = Math.max(0, prev - TIME_PENALTY_SEC);
      if (next <= 0) {
        depleted = true;
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
      return next;
    });
    return depleted;
  }

  function showTimePenaltyFeedback() {
    penaltyOpacity.stopAnimation();
    penaltyTranslateY.stopAnimation();
    penaltyScale.stopAnimation();

    penaltyOpacity.setValue(0);
    penaltyTranslateY.setValue(-10);
    penaltyScale.setValue(0.96);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(penaltyOpacity, {
          toValue: 1,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(penaltyTranslateY, {
          toValue: 10,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(penaltyScale, {
          toValue: 1,
          duration: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(penaltyOpacity, {
          toValue: 0,
          duration: 380,
          delay: 120,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(penaltyTranslateY, {
          toValue: 52,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(penaltyScale, {
          toValue: 0.92,
          duration: 500,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }

  function handleCardPress(card: MemoryCard) {
    if (phase !== "playing" || resolvingRef.current) return;
    if (matchedCardIds.includes(card.id) || selectedCardIds.includes(card.id)) return;

    if (selectedCardIds.length === 0) {
      setSelectedCardIds([card.id]);
      return;
    }

    const firstCard = cards.find((entry) => entry.id === selectedCardIds[0]);
    if (!firstCard) {
      setSelectedCardIds([card.id]);
      return;
    }

    const pairSelection = [firstCard.id, card.id];
    setSelectedCardIds(pairSelection);
    resolvingRef.current = true;

    const isMatch = firstCard.pairId === card.pairId && firstCard.side !== card.side;

    if (isMatch) {
      const nextCorrect = correct + 1;
      const nextCombo = combo + 1;
      const nextComboMax = Math.max(comboMax, nextCombo);

      setCorrect(nextCorrect);
      setCombo(nextCombo);
      setComboMax(nextComboMax);
      playSfx(nextCombo === COMBO_X2 || nextCombo === COMBO_X3 ? "levelUp" : "correct");

      transitionRef.current = setTimeout(() => {
        setMatchedCardIds((prev) => [...prev, ...pairSelection]);
        setSelectedCardIds([]);
        resolvingRef.current = false;

        const totalMatchedCards = matchedCardIds.length + 2;
        if (totalMatchedCards >= ROUND_PAIR_COUNT * 2 && phaseRef.current === "playing") {
          startNextRound(roundNumber + 1);
        }
      }, CORRECT_DELAY_MS);
      return;
    }

    playSfx("wrong");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setWrong((prev) => prev + 1);
    setCombo(0);
    setWrongCardIds(pairSelection);
    showTimePenaltyFeedback();
    const depleted = applyWrongPenalty();

    transitionRef.current = setTimeout(() => {
      setSelectedCardIds([]);
      setWrongCardIds([]);
      resolvingRef.current = false;
      if (depleted) {
        endGame();
      }
    }, WRONG_DELAY_MS);
  }

  const accuracy = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0;
  const localScore = correct * 10 + comboMax * 5;
  const timerColor = timeLeft <= LAST_10_THRESHOLD ? colors.error : colors.primary;
  const comboLabel = combo >= COMBO_X3 ? "🔥 x3" : combo >= COMBO_X2 ? "⚡ x2" : null;
  const roundPairsMatched = matchedCardIds.length / 2;
  const cardGap = 8;
  const boardWidth = screenWidth - 32;
  const cardWidth = Math.max(68, Math.floor((boardWidth - cardGap * 3) / 4));

  const difficultyBadge = t(`games.difficulty.${selectedDifficulty}` as const);

  if (poolError && phase === "loading") {
    return (
      <>
        <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top"]}>
          <View style={styles.centerContent}>
            <Ionicons name="sad-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.errorTitle, { color: colors.text }]}>
              {poolError === "empty" ? t("games.common.pool_empty") : t("games.common.pool_empty_global")}
            </Text>
            <Text style={[styles.errorDesc, { color: colors.textSecondary }]}>
              {poolError === "empty" ? t("games.memory_match.pool_empty_cta") : ""}
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.primaryBtnText}>{t("games.common.back_hub")}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <GameDailyLimitModal visible={showLimitModal} onClose={() => setShowLimitModal(false)} />
      </>
    );
  }

  if (phase === "tutorial") {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.tutorialContainer}>
          <Text style={[styles.tutorialEmoji, isSmallScreen && { fontSize: 38, marginBottom: 10 }]}>🧠</Text>
          <Text style={[styles.tutorialTitle, { color: colors.text }, isSmallScreen && { fontSize: 18 }]}>
            {t("games.memory_match.tutorial_title")}
          </Text>
          <Text style={[styles.tutorialBody, { color: colors.textSecondary }, isSmallScreen && { fontSize: 13 }]}>
            {t("games.memory_match.tutorial_body")}
          </Text>
          <View style={styles.tutorialPatternRow}>
            {t("games.memory_match.pattern").split(" • ").map((item) => (
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

  if (phase === "loading" || phase === "ready") {
    const isLoading = phase === "loading";
    return (
      <>
        <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top"]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t("games.memory_match.name")}</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={styles.centerContent}>
            {isLoading ? (
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>{t("games.common.loading_pool")}</Text>
            ) : (
              <>
                <Text style={[styles.readyEmoji, isSmallScreen && { fontSize: 38, marginBottom: 8 }]}>🧠</Text>
                <Text style={[styles.readyTitle, { color: colors.text }, isSmallScreen && { fontSize: 20 }]}>
                  {t("games.common.countdown_ready")}
                </Text>
                <Text style={[styles.readyPattern, { color: colors.textSecondary }]}>
                  {t("games.memory_match.pattern")}
                </Text>

                <View style={[styles.readyMetaRow, { backgroundColor: colors.cardBackground }]}>
                  <MetaPill label={t("games.memory_match.pool_label")} value={difficultyBadge} colors={colors} />
                  <MetaDivider colors={colors} />
                  <MetaPill
                    label={t("games.memory_match.language_label")}
                    value={`${uiLanguage.toUpperCase()} -> ${targetLanguage.toUpperCase()}`}
                    colors={colors}
                  />
                </View>

                <View style={styles.difficultySection}>
                  <Text style={[styles.difficultyTitle, { color: colors.textSecondary }]}>
                    {t("games.hub.memory_difficulty_label")}
                  </Text>
                  <View style={styles.difficultyChips}>
                    {DIFFICULTY_OPTIONS.map(({ key }) => {
                      const active = selectedDifficulty === key;
                      return (
                        <TouchableOpacity
                          key={key}
                          onPress={() => setSelectedDifficulty(key)}
                          style={[
                            styles.difficultyChip,
                            {
                              backgroundColor: active ? colors.primary : colors.cardBackground,
                              borderColor: active ? colors.primary : colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.difficultyChipText,
                              { color: active ? "#fff" : colors.text },
                            ]}
                          >
                            {t(`games.difficulty.${key}`)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {(isPoolRefreshing || poolError) && (
                    <View style={styles.difficultyFeedbackRow}>
                      {isPoolRefreshing ? (
                        <>
                          <ActivityIndicator size="small" color={colors.primary} />
                          <Text style={[styles.difficultyFeedbackText, { color: colors.textSecondary }]}>
                            {t("games.common.loading_pool")}
                          </Text>
                        </>
                      ) : (
                        <Text
                          style={[
                            styles.difficultyFeedbackText,
                            { color: poolError === "empty" ? colors.error : colors.textSecondary },
                          ]}
                        >
                          {poolError === "empty"
                            ? t("games.memory_match.pool_empty_cta")
                            : t("games.common.pool_empty_global")}
                        </Text>
                      )}
                    </View>
                  )}
                </View>

                <View style={[styles.statsPreview, { backgroundColor: colors.cardBackground }]}>
                  <StatItem
                    label={t("games.common.personal_best")}
                    value={(useGameStore.getState().userStats?.bestMemoryMatch ?? 0).toLocaleString()}
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
                  style={[
                    styles.primaryBtn,
                    {
                      backgroundColor: colors.primary,
                      marginTop: 24,
                      opacity: isPoolRefreshing || poolError ? 0.5 : 1,
                    },
                  ]}
                  disabled={isPoolRefreshing || !!poolError}
                  onPress={startCountdown}
                >
                  <Ionicons name="play" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryBtnText}>{t("games.common.start_game")}</Text>
                </TouchableOpacity>

                <View style={styles.readyAudioRow}>
                  <TouchableOpacity style={styles.readyAudioBtn} onPress={() => setBgMusicEnabled(!bgMusicEnabled)}>
                    <Ionicons
                      name={bgMusicEnabled ? "musical-notes" : "musical-notes-outline"}
                      size={18}
                      color={bgMusicEnabled ? colors.primary : colors.textTertiary}
                    />
                    <Text style={[styles.readyAudioLabel, { color: bgMusicEnabled ? colors.text : colors.textTertiary }]}>
                      {t("games.audio.bg_music")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.readyAudioBtn} onPress={() => setSfxEnabled(!sfxEnabled)}>
                    <Ionicons
                      name={sfxEnabled ? "volume-high" : "volume-mute"}
                      size={18}
                      color={sfxEnabled ? colors.primary : colors.textTertiary}
                    />
                    <Text style={[styles.readyAudioLabel, { color: sfxEnabled ? colors.text : colors.textTertiary }]}>
                      {t("games.audio.sfx")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.readyAudioBtn} onPress={() => setMusicPickerVisible(true)}>
                    <Ionicons name="list-outline" size={16} color={colors.primary} />
                    <Text style={[styles.readyAudioLabel, { color: colors.primary }]}>{t("games.audio.pick_music")}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          <BGMusicPickerModal
            visible={musicPickerVisible}
            initialTrackId={gameBgTrack["memory_match"] ?? "bg2"}
            onConfirm={(trackId) => {
              setGameBgTrack("memory_match", trackId);
              setMusicPickerVisible(false);
            }}
            onCancel={() => setMusicPickerVisible(false)}
          />
        </SafeAreaView>
        <GameDailyLimitModal visible={showLimitModal} onClose={() => setShowLimitModal(false)} />
      </>
    );
  }

  if (phase === "countdown") {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.countdownContainer}>
          <Text style={[styles.countdownNumber, { color: colors.primary }]}>{countdown}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === "paused") {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
        <View style={styles.centerContent}>
          <Ionicons name="pause-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.pausedTitle, { color: colors.text }]}>{t("games.common.paused_title")}</Text>
          <Text style={[styles.pausedStats, { color: colors.textSecondary }]}>
            {t("games.memory_match.paused_stats", { correct, wrong, score: localScore })}
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
            onPress={handleResume}
          >
            <Text style={styles.primaryBtnText}>{t("games.common.resume")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 12 }}>
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>{t("games.common.back_hub")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === "result") {
    const score = submitResult?.score ?? localScore;
    const isNewRecord = submitResult?.personalBestBroken ?? false;

    return (
      <>
        <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
          <View style={styles.resultContainer}>
            <Text style={[styles.resultTitle, { color: colors.text }]}>{t("games.result.title_memory")}</Text>

            {isNewRecord && (
              <View style={[styles.newRecordBanner, { backgroundColor: colors.warning + "25" }]}>
                <Text style={[styles.newRecordText, { color: colors.warning }]}>
                  🏆 {t("games.common.personal_best_new")}
                </Text>
              </View>
            )}

            {submitResult?.leagueChanged && (
              <View style={[styles.leagueUpBanner, { backgroundColor: colors.success + "20" }]}>
                <Text style={[styles.leagueUpText, { color: colors.success }]}>
                  🎊 {t("games.league.promoted", { league: submitResult.league })}
                </Text>
              </View>
            )}

            <View style={styles.statCardsRow}>
              <StatCard label={t("games.result.score")} value={score.toLocaleString()} color={colors.primary} colors={colors} />
              <StatCard label={t("games.result.accuracy")} value={`${accuracy}%`} color={colors.success} colors={colors} />
              <StatCard label={t("games.result.combo")} value={`x${comboMax}`} color="#F59E0B" colors={colors} />
            </View>

            <View style={styles.statCardsRow}>
              <StatCard label={t("games.result.correct")} value={correct.toString()} color={colors.success} colors={colors} />
              <StatCard label={t("games.result.wrong")} value={wrong.toString()} color={colors.error} colors={colors} />
              {submitResult?.weeklyRank ? (
                <StatCard label={t("games.hub.leaderboard_title")} value={`#${submitResult.weeklyRank}`} color={colors.primary} colors={colors} />
              ) : (
                <StatCard label={t("games.hub.no_rank")} value="—" color={colors.border} colors={colors} />
              )}
            </View>

            {isSubmitting && (
              <Text style={[styles.submitStatus, { color: colors.textSecondary }]}>{t("games.common.score_submitting")}</Text>
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
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>{t("games.common.back_hub")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
        <GameDailyLimitModal visible={showLimitModal} onClose={() => setShowLimitModal(false)} />
      </>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: colors.background }]} edges={["top"]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.penaltyFeedback,
          {
            opacity: penaltyOpacity,
            transform: [{ translateY: penaltyTranslateY }, { scale: penaltyScale }],
          },
        ]}
      >
        <Text style={[styles.penaltyFeedbackText, { color: colors.error }]}>
          {t("games.memory_match.time_penalty_feedback", { seconds: TIME_PENALTY_SEC })}
        </Text>
      </Animated.View>

      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={handlePause} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="pause" size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={[styles.timerContainer, { backgroundColor: timerColor + "15" }]}>
            <Ionicons name="time-outline" size={15} color={timerColor} />
            <Text style={[styles.timerText, { color: timerColor }]}>{timeLeft}s</Text>
          </View>
          {comboLabel && (
            <View style={[styles.comboBadge, { backgroundColor: "#F59E0B20" }]}>
              <Text style={[styles.comboText, { color: "#F59E0B" }]}>{comboLabel}</Text>
            </View>
          )}
        </View>

        <View style={styles.audioIcons}>
          <TouchableOpacity onPress={() => setBgMusicEnabled(!bgMusicEnabled)} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
            <Ionicons
              name={bgMusicEnabled ? "musical-notes" : "musical-notes-outline"}
              size={18}
              color={bgMusicEnabled ? colors.primary : colors.textTertiary}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSfxEnabled(!sfxEnabled)} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
            <Ionicons
              name={sfxEnabled ? "volume-high" : "volume-mute"}
              size={18}
              color={sfxEnabled ? colors.primary : colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.topStatsRow}>
        <TopBadge label={t("games.memory_match.round_label")} value={roundNumber.toString()} colors={colors} />
        <TopBadge label={t("games.memory_match.matched_label")} value={`${roundPairsMatched}/${ROUND_PAIR_COUNT}`} colors={colors} />
        <TopBadge label={t("games.memory_match.pool_label")} value={difficultyBadge} colors={colors} />
      </View>

      <View style={styles.boardWrap}>
        <View style={[styles.board, { gap: cardGap }]}>
          {cards.map((card) => {
            const matched = matchedCardIds.includes(card.id);
            const selected = selectedCardIds.includes(card.id);
            const wrongSelected = wrongCardIds.includes(card.id);

            let bgColor = colors.cardBackground;
            let borderColor = colors.border;
            let textColor = colors.text;

            if (matched) {
              bgColor = colors.success + "18";
              borderColor = colors.success;
              textColor = colors.success;
            } else if (wrongSelected) {
              bgColor = colors.error + "12";
              borderColor = colors.error;
              textColor = colors.error;
            } else if (selected) {
              bgColor = colors.primary + "18";
              borderColor = colors.primary;
              textColor = colors.primary;
            }

            return (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.82}
                disabled={matched}
                onPress={() => handleCardPress(card)}
                style={[
                  styles.card,
                  {
                    width: cardWidth,
                    backgroundColor: bgColor,
                    borderColor,
                    opacity: matched ? 0.55 : 1,
                  },
                ]}
              >
                <Text style={[styles.cardLang, { color: colors.textSecondary }]}>
                  {card.side === "source" ? uiLanguage.toUpperCase() : targetLanguage.toUpperCase()}
                </Text>
                <Text
                  style={[styles.cardText, { color: textColor }, isSmallScreen && { fontSize: 13 }]}
                  adjustsFontSizeToFit
                  minimumFontScale={0.78}
                  numberOfLines={3}
                >
                  {card.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={[styles.scoreRow, { borderTopColor: colors.border }]}>
        <ScoreItem icon="checkmark-circle" color={colors.success} value={correct} />
        <ScoreItem icon="close-circle" color={colors.error} value={wrong} />
        <ScoreItem icon="flash" color="#F59E0B" value={localScore} />
      </View>
    </SafeAreaView>
  );
}

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

function TopBadge({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={[styles.topBadge, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.topBadgeLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.topBadgeValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function MetaPill({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.metaPill}>
      <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function MetaDivider({ colors }: { colors: any }) {
  return <View style={[styles.metaDivider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  loadingText: { fontSize: 15, marginTop: 12, textAlign: "center" },
  tutorialContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  tutorialEmoji: { fontSize: 52, marginBottom: 16 },
  tutorialTitle: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  tutorialBody: { fontSize: 15, lineHeight: 23, textAlign: "center", marginBottom: 20 },
  tutorialPatternRow: { flexDirection: "row", gap: 8, marginBottom: 32 },
  patternTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  patternTagText: { fontSize: 13, fontWeight: "500" },
  readyEmoji: { fontSize: 52, marginBottom: 12 },
  readyTitle: { fontSize: 24, fontWeight: "700", marginBottom: 6 },
  readyPattern: { fontSize: 13, marginBottom: 20 },
  difficultySection: { width: "100%", marginBottom: 16 },
  difficultyTitle: { fontSize: 12, fontWeight: "600", marginBottom: 8, textAlign: "center" },
  difficultyChips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 },
  difficultyFeedbackRow: {
    minHeight: 24,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  difficultyFeedbackText: { fontSize: 12, textAlign: "center" },
  difficultyChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  difficultyChipText: { fontSize: 13, fontWeight: "600" },
  readyMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    overflow: "hidden",
    width: "100%",
    marginBottom: 16,
  },
  metaPill: { flex: 1, alignItems: "center", paddingVertical: 12, paddingHorizontal: 10 },
  metaLabel: { fontSize: 11, marginBottom: 2 },
  metaValue: { fontSize: 14, fontWeight: "700" },
  metaDivider: { width: 1, alignSelf: "stretch" },
  statsPreview: { flexDirection: "row", borderRadius: 14, overflow: "hidden", width: "100%" },
  statItem: { flex: 1, alignItems: "center", padding: 14 },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1 },
  countdownContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  countdownNumber: { fontSize: 96, fontWeight: "900" },
  pausedTitle: { fontSize: 22, fontWeight: "700", marginTop: 16 },
  pausedStats: { fontSize: 14, marginTop: 8 },
  linkText: { fontSize: 14 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: 14,
    paddingHorizontal: 18,
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 18,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: "700" },
  readyAudioRow: { flexDirection: "row", gap: 8, marginTop: 16 },
  readyAudioBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 8 },
  readyAudioLabel: { fontSize: 13, fontWeight: "500" },
  errorTitle: { fontSize: 18, fontWeight: "700", marginTop: 12, textAlign: "center" },
  errorDesc: { fontSize: 14, marginTop: 8, marginBottom: 24, textAlign: "center" },
  penaltyFeedback: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: "center",
  },
  penaltyFeedbackText: { fontSize: 18, fontWeight: "800" },
  gameHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerCenter: { alignItems: "center", gap: 8 },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  timerText: { fontSize: 16, fontWeight: "700" },
  comboBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  comboText: { fontSize: 13, fontWeight: "700" },
  audioIcons: { flexDirection: "row", alignItems: "center", gap: 10 },
  topStatsRow: { flexDirection: "row", gap: 8, paddingHorizontal: 16, marginBottom: 14 },
  topBadge: { flex: 1, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 10, alignItems: "center" },
  topBadgeLabel: { fontSize: 11, marginBottom: 2 },
  topBadgeValue: { fontSize: 14, fontWeight: "700" },
  boardWrap: { flex: 1, paddingHorizontal: 16, paddingBottom: 10 },
  board: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start" },
  card: {
    minHeight: 78,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 10,
    justifyContent: "space-between",
  },
  cardLang: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  cardText: { fontSize: 14, fontWeight: "700", lineHeight: 18 },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  scoreItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  scoreValue: { fontSize: 15, fontWeight: "700" },
  resultContainer: { flex: 1, paddingHorizontal: 20, paddingVertical: 24 },
  resultTitle: { fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 16 },
  newRecordBanner: { alignSelf: "center", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 12 },
  newRecordText: { fontSize: 14, fontWeight: "700" },
  leagueUpBanner: { alignSelf: "center", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 16 },
  leagueUpText: { fontSize: 14, fontWeight: "700" },
  statCardsRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  statCard: { flex: 1, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 12, alignItems: "center" },
  statCardValue: { fontSize: 24, fontWeight: "800" },
  statCardLabel: { fontSize: 12, marginTop: 4 },
  submitStatus: { textAlign: "center", marginTop: 14, fontSize: 13 },
  resultActions: { flexDirection: "row", gap: 10, marginTop: 24 },
});
