import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
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

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

// Rotated per sentence index for variety
const SENTENCE_ICONS = ["🦜", "🐸", "🐨", "🦊", "🐼", "🦁", "🐬", "🦋", "🐙", "🐧"];

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
  icon,
  label,
  colors,
}: {
  sentence: Sentence;
  icon: string;
  label: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const sourceText = stripMarkers(sentence.source_text);
  return (
    <View style={[sourceStyles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.text }]}>
      <Text style={[sourceStyles.label, { color: colors.textTertiary }]}>{label}</Text>
      <View style={sourceStyles.row}>
        <Text style={sourceStyles.icon}>{icon}</Text>
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
  icon: {
    fontSize: 26,
    lineHeight: 32,
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
}: {
  title: string;
  desc: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={emptyStyles.container}>
      <Text style={emptyStyles.emoji}>📚</Text>
      <Text style={[emptyStyles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[emptyStyles.desc, { color: colors.textSecondary }]}>{desc}</Text>
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
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function BuildSentenceScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();

  const { sentences, presetSentences, loadSentences, loadPresetSentences } = useSentenceStore();
  const { progressMap, loadProgress } = useProgressStore();
  const { targetLanguage, uiLanguage } = useSettingsStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);

  // Word chip state — rebuilt whenever sentence changes
  const [wordBank, setWordBank] = useState<WordChip[]>([]);
  const [dropZone, setDropZone] = useState<WordChip[]>([]);
  const [correctOrder, setCorrectOrder] = useState<string[]>([]);

  // Shuffle once at session start; ref so it doesn't re-shuffle on re-render
  const shuffledRef = useRef<Sentence[]>([]);

  useEffect(() => {
    setInitialized(false);
    Promise.all([loadSentences(), loadPresetSentences(), loadProgress()]).finally(() =>
      setInitialized(true)
    );
  }, [targetLanguage, uiLanguage]);

  // Build & shuffle the learning list once after data loads
  useEffect(() => {
    if (!initialized) return;
    const all: Sentence[] = [
      ...sentences,
      ...presetSentences.filter((s) => progressMap[s.id] !== undefined),
    ];
    const learning = all.filter(
      (s) => s.status === "learning" || progressMap[s.id] === "learning"
    );
    shuffledRef.current = [...learning].sort(() => Math.random() - 0.5);
    setCurrentIndex(0);
  }, [initialized]);

  const learningSentences = shuffledRef.current;
  const total = learningSentences.length;
  const currentSentence = learningSentences[currentIndex] ?? null;
  const sentenceIcon = SENTENCE_ICONS[currentIndex % SENTENCE_ICONS.length];

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

  // ── Loading ──────────────────────────────────────────────────────────────
  if (!initialized) {
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
        />
      </SafeAreaView>
    );
  }

  // ── Main ─────────────────────────────────────────────────────────────────
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
          icon={sentenceIcon}
          label={t("build_sentence.source_label")}
          colors={colors}
        />

        {/* Drop zone placeholder */}
        <View style={[styles.dropZonePlaceholder, { borderColor: colors.border }]}>
          <Text style={{ color: colors.textTertiary, fontSize: 13 }}>
            {t("build_sentence.drop_hint")}
          </Text>
        </View>

        {/* Word bank — static chip display (interaction added next task) */}
        <View style={styles.wordBankContainer}>
          <View style={styles.chipRow}>
            {wordBank.map((chip) => (
              <View
                key={chip.id}
                style={[
                  styles.chip,
                  { backgroundColor: colors.cardBackground, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.chipText, { color: colors.text }]}>{chip.display}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  dropZonePlaceholder: {
    marginHorizontal: 16,
    marginTop: 16,
    minHeight: 80,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  wordBankContainer: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
