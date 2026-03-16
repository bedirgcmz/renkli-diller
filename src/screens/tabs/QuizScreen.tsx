import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePremium } from "@/hooks/usePremium";
import { parseKeywords } from "@/utils/keywords";
import { FREE_QUIZ_DAILY_LIMIT } from "@/utils/constants";
import { Sentence, TextSegment } from "@/types";

type QuizMode = "multiple_choice" | "fill_blank";

interface MCQuestion {
  type: "multiple_choice";
  sentence: Sentence;
  options: string[];
  correctAnswer: string;
}

interface FBQuestion {
  type: "fill_blank";
  sentence: Sentence;
  questionText: string;
  answer: string;
}

type Question = MCQuestion | FBQuestion;

function stripMarkers(text: string): string {
  return text.replace(/([*#%@+&{~])(.*?)\1/g, "$2");
}

function KeywordText({
  text,
  baseColor,
  fontSize,
}: {
  text: string;
  baseColor: string;
  fontSize: number;
}) {
  const segments: TextSegment[] = parseKeywords(text);
  return (
    <Text style={{ flexWrap: "wrap" }}>
      {segments.map((seg, i) => (
        <Text
          key={i}
          style={{
            color: seg.color ?? baseColor,
            fontStyle: seg.isItalic ? "italic" : "normal",
            fontSize,
            lineHeight: fontSize * 1.5,
          }}
        >
          {seg.text}
        </Text>
      ))}
    </Text>
  );
}

function generateMCQuestion(sentence: Sentence, allSentences: Sentence[]): MCQuestion | null {
  const others = allSentences.filter((s) => s.id !== sentence.id);
  if (others.length < 3) return null;

  const wrong = [...others]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((s) => stripMarkers(s.source_text));
  const correct = stripMarkers(sentence.source_text);
  const options = [...wrong, correct].sort(() => Math.random() - 0.5);

  return { type: "multiple_choice", sentence, options, correctAnswer: correct };
}

function generateFBQuestion(sentence: Sentence): FBQuestion | null {
  // Try keywords array first, then parsed segments
  const kws = sentence.keywords.filter((k) => k.trim());
  let answer: string | null = null;

  if (kws.length > 0) {
    answer = kws[Math.floor(Math.random() * kws.length)];
  } else {
    const coloredSegs = parseKeywords(sentence.source_text).filter((s) => s.color !== null);
    if (coloredSegs.length > 0) {
      answer = coloredSegs[Math.floor(Math.random() * coloredSegs.length)].text;
    }
  }

  if (!answer) return null;

  const plainSource = stripMarkers(sentence.source_text);
  const escaped = answer.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const questionText = plainSource.replace(new RegExp(escaped, "i"), "___");

  return { type: "fill_blank", sentence, questionText, answer };
}

function buildSession(
  sentences: Sentence[],
  mode: QuizMode,
  count: number,
): Question[] {
  const shuffled = [...sentences].sort(() => Math.random() - 0.5);
  const questions: Question[] = [];

  for (const sentence of shuffled) {
    if (questions.length >= count) break;
    const q =
      mode === "multiple_choice"
        ? generateMCQuestion(sentence, sentences)
        : generateFBQuestion(sentence);
    if (q) questions.push(q);
  }

  return questions;
}

export default function QuizScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { sentences, loadSentences } = useSentenceStore();
  const { recordQuizResult } = useProgressStore();
  const { uiLanguage } = useSettingsStore();
  const { isPremium } = usePremium();

  const [mode, setMode] = useState<QuizMode>("multiple_choice");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [input, setInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadSentences();
    return () => {
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    };
  }, []);

  // Usable sentences: prefer learning, fallback to all
  const learningSentences = sentences.filter((s) => s.status === "learning");
  const quizSentences = learningSentences.length >= 4 ? learningSentences : sentences;

  const sessionSize = isPremium ? 20 : FREE_QUIZ_DAILY_LIMIT;
  const dailyLimitReached = !isPremium && dailyCount >= FREE_QUIZ_DAILY_LIMIT;

  const startSession = () => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    const qs = buildSession(quizSentences, mode, sessionSize);
    setQuestions(qs);
    setCurrentIdx(0);
    setSelectedOption(null);
    setShowResult(false);
    setInput("");
    setShowHint(false);
    setScore({ correct: 0, total: 0 });
    setSessionComplete(false);
  };

  useEffect(() => {
    if (quizSentences.length > 0) startSession();
  }, [mode, sentences.length]);

  const currentQ = questions[currentIdx];

  const handleAnswer = (answer: string) => {
    if (showResult) return;
    const correct = currentQ.type === "fill_blank"
      ? answer.trim().toLowerCase() === (currentQ as FBQuestion).answer.toLowerCase()
      : answer === (currentQ as MCQuestion).correctAnswer;

    setIsCorrect(correct);
    setShowResult(true);
    setSelectedOption(answer);
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setDailyCount((c) => c + 1);

    recordQuizResult({
      user_id: "",
      sentence_id: currentQ.sentence.id,
      correct,
      question_type: currentQ.type,
    });

    // Auto-advance after 1.5s for MC
    if (currentQ.type === "multiple_choice") {
      nextTimerRef.current = setTimeout(goNext, 1500);
    }
  };

  const goNext = () => {
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    const next = currentIdx + 1;
    if (next >= questions.length) {
      setSessionComplete(true);
    } else {
      setCurrentIdx(next);
      setSelectedOption(null);
      setShowResult(false);
      setInput("");
      setShowHint(false);
    }
  };

  const fbQ = currentQ?.type === "fill_blank" ? (currentQ as FBQuestion) : null;
  const mcQ = currentQ?.type === "multiple_choice" ? (currentQ as MCQuestion) : null;
  const hint = fbQ ? fbQ.answer.slice(0, 2) + "…" : "";

  // Not enough sentences
  if (quizSentences.length < 4 && !sentences.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (quizSentences.length < 2) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📚</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Quiz için en az 2 cümle gereklidir.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("quiz.title")}</Text>
        <View style={[styles.scoreBadge, { backgroundColor: colors.primary + "18" }]}>
          <Text style={[styles.scoreText, { color: colors.primary }]}>
            ✓ {score.correct}/{score.total}
          </Text>
        </View>
      </View>

      {/* Mode selector */}
      <View style={[styles.segmentContainer, { backgroundColor: colors.backgroundSecondary }]}>
        {(["multiple_choice", "fill_blank"] as QuizMode[]).map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              styles.segmentTab,
              mode === m && [styles.segmentTabActive, { backgroundColor: colors.surface }],
            ]}
            onPress={() => setMode(m)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: mode === m ? colors.text : colors.textSecondary },
              ]}
            >
              {m === "multiple_choice" ? t("quiz.multiple_choice") : t("quiz.fill_blank")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress bar */}
      {questions.length > 0 && (
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${((currentIdx + (showResult ? 1 : 0)) / questions.length) * 100}%`,
              },
            ]}
          />
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Daily limit banner */}
        {dailyLimitReached && (
          <View style={[styles.limitBanner, { backgroundColor: colors.warning + "22", borderColor: colors.warning }]}>
            <Text style={[styles.limitText, { color: colors.warning }]}>
              {t("quiz.daily_limit_reached")} — {t("quiz.upgrade_for_unlimited")}
            </Text>
          </View>
        )}

        {/* Session complete */}
        {sessionComplete ? (
          <View style={[styles.doneCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.doneIcon}>🎉</Text>
            <Text style={[styles.doneTitle, { color: colors.text }]}>
              {score.correct}/{score.total} {t("quiz.score")}
            </Text>
            <Text style={[styles.doneSubtitle, { color: colors.textSecondary }]}>
              {Math.round((score.correct / Math.max(score.total, 1)) * 100)}%{" "}
              {t("quiz.correct").toLowerCase()}
            </Text>
            <TouchableOpacity
              style={[styles.restartBtn, { backgroundColor: colors.primary }]}
              onPress={startSession}
              activeOpacity={0.85}
            >
              <Text style={styles.restartBtnText}>Yeni Oturum</Text>
            </TouchableOpacity>
          </View>
        ) : currentQ ? (
          <>
            {/* Question card */}
            <View style={[styles.questionCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.questionNum, { color: colors.textTertiary }]}>
                {currentIdx + 1}/{questions.length}
              </Text>

              {/* Target sentence (question prompt) */}
              <View style={styles.questionPrompt}>
                <KeywordText
                  text={currentQ.sentence.target_text}
                  baseColor={colors.text}
                  fontSize={18}
                />
              </View>

              {/* Fill blank question text */}
              {fbQ && (
                <View style={[styles.blankBox, { backgroundColor: colors.backgroundSecondary }]}>
                  <Text style={[styles.blankText, { color: colors.textSecondary }]}>
                    {fbQ.questionText}
                  </Text>
                </View>
              )}
            </View>

            {/* Multiple choice options */}
            {mcQ && (
              <View style={styles.optionsContainer}>
                {mcQ.options.map((opt, idx) => {
                  let bg = colors.surface;
                  let borderColor = colors.border;
                  let textColor = colors.text;

                  if (showResult) {
                    if (opt === mcQ.correctAnswer) {
                      bg = "#2ECC7122";
                      borderColor = "#2ECC71";
                      textColor = "#2ECC71";
                    } else if (opt === selectedOption && opt !== mcQ.correctAnswer) {
                      bg = "#E53E3E22";
                      borderColor = "#E53E3E";
                      textColor = "#E53E3E";
                    }
                  } else if (opt === selectedOption) {
                    bg = colors.primary + "22";
                    borderColor = colors.primary;
                  }

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.optionBtn, { backgroundColor: bg, borderColor }]}
                      onPress={() => handleAnswer(opt)}
                      disabled={showResult || dailyLimitReached}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.optionText, { color: textColor }]}>{opt}</Text>
                      {showResult && opt === mcQ.correctAnswer && (
                        <Ionicons name="checkmark-circle" size={18} color="#2ECC71" />
                      )}
                      {showResult && opt === selectedOption && opt !== mcQ.correctAnswer && (
                        <Ionicons name="close-circle" size={18} color="#E53E3E" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Fill blank input */}
            {fbQ && (
              <View style={styles.fbContainer}>
                {showHint && (
                  <Text style={[styles.hintText, { color: colors.primary }]}>
                    💡 {t("quiz.hint")}: {hint}
                  </Text>
                )}

                <TextInput
                  style={[
                    styles.fbInput,
                    {
                      backgroundColor: showResult
                        ? isCorrect
                          ? "#2ECC7122"
                          : "#E53E3E22"
                        : colors.backgroundSecondary,
                      borderColor: showResult
                        ? isCorrect
                          ? "#2ECC71"
                          : "#E53E3E"
                        : colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Cevabınızı yazın..."
                  placeholderTextColor={colors.textTertiary}
                  editable={!showResult}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={() => { if (!showResult && input.trim()) handleAnswer(input); }}
                />

                {showResult && (
                  <Text
                    style={[
                      styles.feedbackText,
                      { color: isCorrect ? "#2ECC71" : "#E53E3E" },
                    ]}
                  >
                    {isCorrect ? t("quiz.correct") : `${t("quiz.incorrect")} ${t("quiz.correct_answer_is")} "${fbQ.answer}"`}
                  </Text>
                )}

                <View style={styles.fbButtonRow}>
                  {!showHint && !showResult && (
                    <TouchableOpacity
                      style={[styles.hintBtn, { borderColor: colors.border }]}
                      onPress={() => setShowHint(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.hintBtnText, { color: colors.textSecondary }]}>
                        💡 {t("quiz.hint")}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {!showResult ? (
                    <TouchableOpacity
                      style={[
                        styles.submitBtn,
                        { backgroundColor: colors.primary, opacity: input.trim() ? 1 : 0.5 },
                      ]}
                      onPress={() => { if (input.trim()) handleAnswer(input); }}
                      disabled={!input.trim() || dailyLimitReached}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.submitBtnText}>{t("quiz.submit")}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                      onPress={goNext}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.submitBtnText}>{t("quiz.next_question")}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {/* MC result feedback */}
            {mcQ && showResult && (
              <View
                style={[
                  styles.resultBanner,
                  { backgroundColor: isCorrect ? "#2ECC7118" : "#E53E3E18" },
                ]}
              >
                <Text
                  style={[styles.resultText, { color: isCorrect ? "#2ECC71" : "#E53E3E" }]}
                >
                  {isCorrect ? t("quiz.correct") : `${t("quiz.incorrect")} ${t("quiz.correct_answer_is")} "${mcQ.correctAnswer}"`}
                </Text>
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyIcon: { fontSize: 44 },
  emptyText: { fontSize: 15, textAlign: "center", paddingHorizontal: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  scoreBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  scoreText: { fontSize: 13, fontWeight: "700" },
  segmentContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
  },
  segmentTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 9,
  },
  segmentTabActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentLabel: { fontSize: 13, fontWeight: "500" },
  progressTrack: {
    height: 3,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: { height: 3, borderRadius: 2 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  limitBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  limitText: { fontSize: 13, lineHeight: 18 },
  questionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  questionNum: { fontSize: 12, marginBottom: 10 },
  questionPrompt: { marginBottom: 12 },
  blankBox: {
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  blankText: { fontSize: 15, lineHeight: 22 },
  optionsContainer: { gap: 10, marginBottom: 12 },
  optionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
  },
  optionText: { fontSize: 15, flex: 1 },
  resultBanner: {
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  resultText: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  fbContainer: { gap: 10 },
  hintText: { fontSize: 13, fontWeight: "500" },
  fbInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  feedbackText: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  fbButtonRow: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
  hintBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  hintBtnText: { fontSize: 13 },
  submitBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  doneCard: {
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  doneIcon: { fontSize: 52 },
  doneTitle: { fontSize: 20, fontWeight: "700" },
  doneSubtitle: { fontSize: 14 },
  restartBtn: {
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 8,
  },
  restartBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
