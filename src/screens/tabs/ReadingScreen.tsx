import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ActivityIndicator,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useReadingStore } from "@/store/useReadingStore";
import { usePremium } from "@/hooks/usePremium";
import { KEYWORD_TEXT_COLORS } from "@/utils/constants";
import { parseKeywords, stripMarkers } from "@/utils/keywords";
import { ReadingTextKeyword, SupportedLanguage, HomeStackParamList, MainStackParamList } from "@/types";

// ── Constants ─────────────────────────────────────────────────────────────────

const LANG_CODE: Record<SupportedLanguage, string> = {
  tr: "tr-TR",
  en: "en-US",
  sv: "sv-SE",
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  pt: "pt-BR",
};

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "#49C98A",
  2: "#4DA3FF",
  3: "#FF6B6B",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

type Segment =
  | { isKeyword: false; text: string }
  | { isKeyword: true; text: string; positionIndex: number };

function parseBody(body: string): Segment[] {
  return parseKeywords(body).map((seg) =>
    seg.isPill
      ? { isKeyword: true as const, text: seg.text, positionIndex: seg.pillIndex ?? 0 }
      : { isKeyword: false as const, text: seg.text }
  );
}

function kwColor(posIdx: number, keywords: ReadingTextKeyword[], isDark: boolean): string {
  const kw = keywords.find((k) => k.position_index === posIdx);
  if (!kw) return isDark ? "#fff" : "#333";
  const palette = isDark ? KEYWORD_TEXT_COLORS.dark : KEYWORD_TEXT_COLORS.light;
  return palette[kw.color_index % palette.length];
}

function getField<T>(obj: any, key: string): T | null {
  return obj?.[key] ?? null;
}

// ── ReadingBody ───────────────────────────────────────────────────────────────

function ReadingBody({
  body,
  keywords,
  isDark,
  baseColor,
  fontSize = 16,
}: {
  body: string;
  keywords: ReadingTextKeyword[];
  isDark: boolean;
  baseColor: string;
  fontSize?: number;
}) {
  const paragraphs = body.split(/\n\n+/);
  return (
    <View>
      {paragraphs.map((para, pIdx) => (
        <Text
          key={pIdx}
          style={{
            color: baseColor,
            fontSize,
            lineHeight: fontSize * 1.7,
            marginTop: pIdx > 0 ? 14 : 0,
          }}
        >
          {parseBody(para).map((seg, sIdx) => {
            if (!seg.isKeyword) return <Text key={sIdx}>{seg.text}</Text>;
            const color = kwColor(seg.positionIndex, keywords, isDark);
            return (
              <Text key={sIdx} style={{ color, fontWeight: "700" }}>
                {seg.text}
              </Text>
            );
          })}
        </Text>
      ))}
    </View>
  );
}

// ── KeywordPreviewModal ───────────────────────────────────────────────────────

function KeywordPreviewModal({
  visible,
  onClose,
  keywords,
  uiLanguage,
  targetLanguage,
  isDark,
  colors,
  t,
}: {
  visible: boolean;
  onClose: () => void;
  keywords: ReadingTextKeyword[];
  uiLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  isDark: boolean;
  colors: any;
  t: any;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={kStyles.backdrop} onPress={onClose}>
        <Pressable style={[kStyles.sheet, { backgroundColor: colors.cardBackground }]} onPress={() => {}}>
          {/* Header */}
          <View style={[kStyles.sheetHeader, { borderBottomColor: colors.divider }]}>
            <Text style={[kStyles.sheetTitle, { color: colors.text }]}>
              {t("reading.keywords_preview")}
            </Text>
            <Pressable onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Language header row */}
          <View style={[kStyles.langHeader, { borderBottomColor: colors.divider }]}>
            <Text style={[kStyles.langLabel, { color: colors.textTertiary }]}>
              {uiLanguage.toUpperCase()}
            </Text>
            <View style={{ flex: 1 }} />
            <Text style={[kStyles.langLabel, { color: colors.textTertiary }]}>
              {targetLanguage.toUpperCase()}
            </Text>
          </View>

          {/* Keyword rows */}
          {keywords.map((kw) => {
            const palette = isDark ? KEYWORD_TEXT_COLORS.dark : KEYWORD_TEXT_COLORS.light;
            const color = palette[kw.color_index % palette.length];
            const sourceWord = getField<string>(kw, `keyword_${uiLanguage}`) ?? "—";
            const targetWord = getField<string>(kw, `keyword_${targetLanguage}`) ?? "—";
            return (
              <View key={kw.id} style={[kStyles.kwRow, { borderBottomColor: colors.divider }]}>
                <Text style={[kStyles.kwWord, { color }]}>{sourceWord}</Text>
                <Ionicons name="arrow-forward-outline" size={14} color={colors.textTertiary} />
                <Text style={[kStyles.kwWord, { color }]}>{targetWord}</Text>
              </View>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const kStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },
  sheet: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700" },
  langHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  langLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  kwRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  kwWord: { fontSize: 15, fontWeight: "600", flex: 1 },
});

// ── VocabQuizModal ────────────────────────────────────────────────────────────

function buildQuizQuestions(
  keywords: ReadingTextKeyword[],
  uiLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage,
) {
  // Build array of {question (source word), answer (target word), options}
  const all = keywords.filter(
    (kw) => getField<string>(kw, `keyword_${uiLanguage}`) && getField<string>(kw, `keyword_${targetLanguage}`),
  );
  if (all.length < 2) return [];

  return all.map((kw) => {
    const question = getField<string>(kw, `keyword_${uiLanguage}`) ?? "";
    const correct = getField<string>(kw, `keyword_${targetLanguage}`) ?? "";
    // Distractors: pick other keywords' target words
    const distractors = all
      .filter((k) => k.id !== kw.id)
      .map((k) => getField<string>(k, `keyword_${targetLanguage}`) ?? "")
      .filter(Boolean)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);
    const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
    return { question, correct, options, color_index: kw.color_index };
  });
}

type QuizQuestion = ReturnType<typeof buildQuizQuestions>[number];

function VocabQuizModal({
  visible,
  onClose,
  keywords,
  uiLanguage,
  targetLanguage,
  isDark,
  colors,
  t,
}: {
  visible: boolean;
  onClose: () => void;
  keywords: ReadingTextKeyword[];
  uiLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  isDark: boolean;
  colors: any;
  t: any;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (visible) {
      const qs = buildQuizQuestions(keywords, uiLanguage, targetLanguage);
      setQuestions(qs);
      setCurrentQ(0);
      setSelected(null);
      setScore(0);
      setDone(false);
    }
  }, [visible, keywords, uiLanguage, targetLanguage]);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === questions[currentQ].correct;
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  };

  if (questions.length === 0) return null;
  const q = questions[currentQ];
  const palette = isDark ? KEYWORD_TEXT_COLORS.dark : KEYWORD_TEXT_COLORS.light;
  const qColor = palette[q.color_index % palette.length];

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={qStyles.overlay}>
        <View style={[qStyles.sheet, { backgroundColor: colors.cardBackground }]}>
          {/* Header */}
          <View style={[qStyles.header, { borderBottomColor: colors.divider }]}>
            <Text style={[qStyles.title, { color: colors.text }]}>{t("reading.quiz_title")}</Text>
            <Pressable onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {done ? (
            /* Result screen */
            <View style={qStyles.resultContainer}>
              <Text style={qStyles.resultEmoji}>
                {score === questions.length ? "🎉" : score >= questions.length / 2 ? "👍" : "💪"}
              </Text>
              <Text style={[qStyles.resultTitle, { color: colors.text }]}>
                {t("reading.quiz_well_done")}
              </Text>
              <Text style={[qStyles.resultScore, { color: colors.primary }]}>
                {t("reading.quiz_result").replace("{score}", String(score)).replace("{total}", String(questions.length))}
              </Text>
              <TouchableOpacity
                style={[qStyles.closeBtn, { backgroundColor: colors.primary }]}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={qStyles.closeBtnText}>{t("reading.quiz_finish")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Question screen */
            <View style={qStyles.questionContainer}>
              {/* Progress */}
              <Text style={[qStyles.progress, { color: colors.textTertiary }]}>
                {currentQ + 1} / {questions.length}
              </Text>

              {/* Question word */}
              <View style={[qStyles.questionBox, { backgroundColor: qColor + "15", borderColor: qColor + "30" }]}>
                <Text style={[qStyles.questionWord, { color: qColor }]}>{q.question}</Text>
                <Text style={[qStyles.questionHint, { color: colors.textTertiary }]}>
                  {uiLanguage.toUpperCase()} → {targetLanguage.toUpperCase()}
                </Text>
              </View>

              {/* Options */}
              <View style={qStyles.optionsContainer}>
                {q.options.map((opt, idx) => {
                  const isSelected = selected === opt;
                  const isCorrect = opt === q.correct;
                  let bg = colors.backgroundSecondary;
                  let border = colors.border;
                  let textColor = colors.text;
                  if (selected) {
                    if (isCorrect) { bg = "#49C98A20"; border = "#49C98A"; textColor = "#49C98A"; }
                    else if (isSelected) { bg = "#FF6B6B20"; border = "#FF6B6B"; textColor = "#FF6B6B"; }
                  }
                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[qStyles.option, { backgroundColor: bg, borderColor: border }]}
                      onPress={() => handleSelect(opt)}
                      activeOpacity={0.8}
                      disabled={!!selected}
                    >
                      <Text style={[qStyles.optionText, { color: textColor }]}>{opt}</Text>
                      {selected && isCorrect && (
                        <Ionicons name="checkmark-circle" size={18} color="#49C98A" />
                      )}
                      {selected && isSelected && !isCorrect && (
                        <Ionicons name="close-circle" size={18} color="#FF6B6B" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Next button */}
              {selected && (
                <TouchableOpacity
                  style={[qStyles.nextBtn, { backgroundColor: colors.primary }]}
                  onPress={handleNext}
                  activeOpacity={0.85}
                >
                  <Text style={qStyles.nextBtnText}>
                    {currentQ < questions.length - 1 ? t("reading.quiz_next") : t("reading.quiz_finish")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const qStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 17, fontWeight: "700" },
  questionContainer: { padding: 20, gap: 16 },
  progress: { fontSize: 12, fontWeight: "600", textAlign: "right" },
  questionBox: {
    alignItems: "center",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  questionWord: { fontSize: 26, fontWeight: "800" },
  questionHint: { fontSize: 11, fontWeight: "500" },
  optionsContainer: { gap: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  optionText: { fontSize: 16, fontWeight: "500" },
  nextBtn: {
    marginTop: 4,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  nextBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  resultContainer: {
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  resultEmoji: { fontSize: 52 },
  resultTitle: { fontSize: 20, fontWeight: "700" },
  resultScore: { fontSize: 16, fontWeight: "600" },
  closeBtn: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    alignItems: "center",
  },
  closeBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ReadingScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const { uiLanguage, targetLanguage } = useSettingsStore();
  const { isPremium } = usePremium();
  const navigation = useNavigation<CompositeNavigationProp<
    NativeStackNavigationProp<HomeStackParamList>,
    NativeStackNavigationProp<MainStackParamList>
  >>();
  const {
    currentText,
    keywords,
    loading,
    fetchNextText,
    fetchProgress,
    markAsRead,
    markAsLearned,
    getLearnedCount,
    getReadingStreak,
  } = useReadingStore();

  const [kwModalVisible, setKwModalVisible] = useState(false);
  const [quizVisible, setQuizVisible] = useState(false);
  const [speaking, setSpeaking] = useState<"source" | "target" | "slow" | null>(null);
  const [markedThisSession, setMarkedThisSession] = useState(false);

  const userId = user?.id ?? "";

  useEffect(() => {
    if (!userId) return;
    fetchProgress(userId);
    fetchNextText(userId);
  }, [userId]);

  // Strip ** markers for TTS
  const speakText = useCallback(
    async (lang: SupportedLanguage, type: "source" | "target") => {
      if (speaking) {
        await Speech.stop();
        setSpeaking(null);
        return;
      }
      const bodyKey = `body_${lang}`;
      const raw = getField<string>(currentText, bodyKey);
      if (!raw) return;
      setSpeaking(type);
      Speech.speak(stripMarkers(raw), {
        language: LANG_CODE[lang],
        rate: 0.85,
        onDone: () => setSpeaking(null),
        onStopped: () => setSpeaking(null),
        onError: () => setSpeaking(null),
      });
    },
    [speaking, currentText],
  );

  const speakTextSlow = useCallback(
    async () => {
      if (speaking) {
        await Speech.stop();
        setSpeaking(null);
        return;
      }
      const raw = getField<string>(currentText, `body_${targetLanguage}`);
      if (!raw) return;
      setSpeaking("slow");
      Speech.speak(stripMarkers(raw), {
        language: LANG_CODE[targetLanguage],
        rate: 0.4,
        onDone: () => setSpeaking(null),
        onStopped: () => setSpeaking(null),
        onError: () => setSpeaking(null),
      });
    },
    [speaking, currentText, targetLanguage],
  );

  const handleShare = useCallback(async () => {
    if (!currentText) return;
    const textTitle = getField<string>(currentText, `title_${uiLanguage}`) ?? "";
    const message = t("reading.share_text").replace("{title}", textTitle);
    await Share.share({ message });
  }, [currentText, uiLanguage, t]);

  const handleMarkLearned = async () => {
    if (!userId || !currentText) return;
    await markAsLearned(userId, currentText.id);
    setMarkedThisSession(true);
    // Load next after brief delay so UI shows the success state
    setTimeout(() => {
      setMarkedThisSession(false);
      fetchNextText(userId);
    }, 1200);
  };

  const handleMarkRead = async () => {
    if (!userId || !currentText) return;
    await markAsRead(userId, currentText.id);
    fetchNextText(userId);
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const title =
    getField<string>(currentText, `title_${uiLanguage}`) ??
    getField<string>(currentText, "title_en") ??
    "";

  const sourceBody =
    getField<string>(currentText, `body_${uiLanguage}`) ?? "";

  const targetBody =
    getField<string>(currentText, `body_${targetLanguage}`) ?? "";

  const CATEGORY_LABELS: Record<string, string> = {
    daily_life: t("reading.category_daily_life"),
    travel: t("reading.category_travel"),
    work: t("reading.category_work"),
  };

  const streak = getReadingStreak();
  const learnedCount = getLearnedCount();
  const isPaywalled = !!(currentText?.is_premium && !isPremium);

  const difficulty = currentText?.difficulty ?? 1;
  const diffColor = DIFFICULTY_COLORS[difficulty];
  const diffLabel = t(
    difficulty === 1
      ? "reading.difficulty_beginner"
      : difficulty === 2
        ? "reading.difficulty_intermediate"
        : "reading.difficulty_advanced",
  );
  const readingMins = currentText?.estimated_reading_seconds
    ? Math.ceil(currentText.estimated_reading_seconds / 60)
    : null;

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!currentText) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🎉</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t("reading.no_more_texts")}</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            {t("reading.no_more_subtitle")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("reading.title")}</Text>
        <View style={styles.headerActions}>
          {/* Share */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}
            onPress={handleShare}
            activeOpacity={0.75}
          >
            <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Keyword preview */}
          {keywords.length > 0 && (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => setKwModalVisible(true)}
              activeOpacity={0.75}
            >
              <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          {/* Source TTS (premium only) */}
          {isPremium && (
            <TouchableOpacity
              style={[
                styles.iconBtn,
                {
                  backgroundColor:
                    speaking === "source" ? colors.primary + "20" : colors.backgroundSecondary,
                },
              ]}
              onPress={() => speakText(uiLanguage, "source")}
              activeOpacity={0.75}
            >
              <Ionicons
                name={speaking === "source" ? "stop-circle" : "volume-medium-outline"}
                size={20}
                color={speaking === "source" ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
          )}
          {/* Target TTS */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor:
                  speaking === "target" ? colors.primary + "20" : colors.backgroundSecondary,
              },
            ]}
            onPress={() => speakText(targetLanguage, "target")}
            activeOpacity={0.75}
          >
            <Ionicons
              name={speaking === "target" ? "stop-circle" : "volume-high-outline"}
              size={20}
              color={speaking === "target" ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Slow TTS */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor:
                  speaking === "slow" ? colors.primary + "20" : colors.backgroundSecondary,
              },
            ]}
            onPress={speakTextSlow}
            activeOpacity={0.75}
          >
            {speaking === "slow" ? (
              <Ionicons name="stop-circle" size={20} color={colors.primary} />
            ) : (
              <MaterialIcons name="slow-motion-video" size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>

          {/* Vocab quiz (premium) */}
          {isPremium && keywords.length >= 2 && (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => setQuizVisible(true)}
              activeOpacity={0.75}
            >
              <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Stats strip ───────────────────────────────────────────── */}
      {(streak > 0 || learnedCount > 0) && (
        <View style={[styles.statsStrip, { borderBottomColor: colors.divider }]}>
          {streak > 0 && (
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{streak}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
                {t("reading.streak")}
              </Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>📖</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{learnedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.textTertiary }]}>
              {t("reading.texts_completed")}
            </Text>
          </View>
        </View>
      )}

      {/* ── Body ───────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={[styles.categoryChip, { backgroundColor: colors.backgroundSecondary }]}>
            <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
              {CATEGORY_LABELS[currentText.category] ?? currentText.category}
            </Text>
          </View>
          <View style={[styles.diffChip, { backgroundColor: diffColor + "20" }]}>
            <View style={[styles.diffDot, { backgroundColor: diffColor }]} />
            <Text style={[styles.diffText, { color: diffColor }]}>{diffLabel}</Text>
          </View>
          {readingMins && (
            <Text style={[styles.readTime, { color: colors.textTertiary }]}>
              ~{readingMins} {t("reading.min_read")}
            </Text>
          )}
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

        {/* Source body */}
        <View style={[styles.langSection, { borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }]}>
          <Text style={[styles.langTag, { color: colors.textTertiary }]}>
            {uiLanguage.toUpperCase()}
          </Text>
          <ReadingBody
            body={sourceBody}
            keywords={keywords}
            isDark={isDark}
            baseColor={colors.text}
            fontSize={16}
          />
        </View>

        {/* Target body */}
        <View style={[styles.langSection, { borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }]}>
          <Text style={[styles.langTag, { color: colors.textTertiary }]}>
            {targetLanguage.toUpperCase()}
          </Text>
          <ReadingBody
            body={targetBody}
            keywords={keywords}
            isDark={isDark}
            baseColor={colors.textSecondary}
            fontSize={15}
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Footer actions ─────────────────────────────────────────── */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.divider,
          },
        ]}
      >
        {isPaywalled ? (
          <View style={styles.actionRow}>
            <View style={[styles.paywallBanner, { backgroundColor: colors.backgroundSecondary, borderColor: colors.premiumAccent + "40" }]}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.premiumAccent} />
              <Text style={[styles.paywallText, { color: colors.text }]}>
                {t("reading.premium_required")}
              </Text>
              <TouchableOpacity
                style={[styles.paywallBtn, { backgroundColor: colors.premiumAccent }]}
                onPress={() => navigation.navigate("Paywall")}
                activeOpacity={0.85}
              >
                <Text style={styles.paywallBtnText}>{t("reading.unlock_premium")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : markedThisSession ? (
          <View style={styles.successRow}>
            <Ionicons name="checkmark-circle" size={22} color="#49C98A" />
            <Text style={[styles.successText, { color: "#49C98A" }]}>{t("reading.mark_learned")} ✓</Text>
          </View>
        ) : (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.readBtn, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
              onPress={handleMarkRead}
              activeOpacity={0.8}
            >
              <Text style={[styles.readBtnText, { color: colors.textSecondary }]}>
                {t("reading.mark_read")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.learnedBtn, { backgroundColor: colors.primary }]}
              onPress={handleMarkLearned}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.learnedBtnText}>{t("reading.mark_learned")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Keyword preview modal ──────────────────────────────────── */}
      <KeywordPreviewModal
        visible={kwModalVisible}
        onClose={() => setKwModalVisible(false)}
        keywords={keywords}
        uiLanguage={uiLanguage}
        targetLanguage={targetLanguage}
        isDark={isDark}
        colors={colors}
        t={t}
      />

      {/* ── Vocabulary quiz modal (premium) ───────────────────────── */}
      <VocabQuizModal
        visible={quizVisible}
        onClose={() => setQuizVisible(false)}
        keywords={keywords}
        uiLanguage={uiLanguage}
        targetLanguage={targetLanguage}
        isDark={isDark}
        colors={colors}
        t={t}
      />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 32 },
  emptyIcon: { fontSize: 52 },
  emptyTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "700", flexShrink: 1 },
  headerActions: { flexDirection: "row", gap: 6 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: { paddingHorizontal: 20 },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: { fontSize: 12, fontWeight: "500" },
  diffChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  diffText: { fontSize: 12, fontWeight: "600" },
  readTime: { fontSize: 12, marginLeft: 2 },

  title: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
    marginBottom: 20,
  },

  langSection: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  langTag: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  readBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  readBtnText: { fontSize: 14, fontWeight: "600" },
  learnedBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    borderRadius: 14,
    gap: 7,
  },
  learnedBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 13,
    gap: 8,
  },
  successText: { fontSize: 15, fontWeight: "700" },

  statsStrip: {
    flexDirection: "row",
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  statItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  statEmoji: { fontSize: 14 },
  statValue: { fontSize: 13, fontWeight: "700" },
  statLabel: { fontSize: 12 },

  paywallBanner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  paywallText: { flex: 1, fontSize: 13, fontWeight: "500" },
  paywallBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  paywallBtnText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
