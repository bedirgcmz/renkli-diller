import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { parseKeywords } from "@/utils/keywords";
import { Sentence, SentenceCategory, SentenceStatus, MainStackParamList, TextSegment } from "@/types";

type StatusFilter = "all" | SentenceStatus;
type SentenceTab = "preset" | "mine";

const STATUS_FILTERS: Array<{ key: StatusFilter; labelKey: string }> = [
  { key: "all", labelKey: "sentences.filter_all" },
  { key: "learning", labelKey: "sentences.filter_learning" },
  { key: "learned", labelKey: "sentences.filter_learned" },
  { key: "new", labelKey: "sentences.filter_new" },
];

const ALL_CATEGORIES: SentenceCategory[] = [
  "daily_conversation",
  "business_english",
  "phrasal_verbs",
  "travel",
  "academic",
  "idioms",
  "grammar_patterns",
  "technology",
  "health",
  "social_modern",
];

const STATUS_BAR_COLOR: Record<SentenceStatus, string> = {
  new: "#3B8BD4",
  learning: "#2ECC71",
  learned: "#E53E3E",
};

function KeywordLine({
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
    <Text numberOfLines={2}>
      {segments.map((seg, i) => (
        <Text
          key={i}
          style={{
            color: seg.color ?? baseColor,
            fontStyle: seg.isItalic ? "italic" : "normal",
            fontSize,
          }}
        >
          {seg.text}
        </Text>
      ))}
    </Text>
  );
}

interface SentenceItemProps {
  sentence: Sentence;
  isUserSentence: boolean;
  onLearn: () => void;
  onLearned: () => void;
  onForget: () => void;
  onEdit: () => void;
  onDelete: () => void;
  colors: any;
  t: (k: string) => string;
}

function SentenceItem({
  sentence,
  isUserSentence,
  onLearn,
  onLearned,
  onForget,
  onEdit,
  onDelete,
  colors,
  t,
}: SentenceItemProps) {
  const barColor = STATUS_BAR_COLOR[sentence.status];
  const keywordsText = sentence.keywords.filter(Boolean).join(", ");

  return (
    <View style={[itemStyles.card, { backgroundColor: colors.surface }]}>
      <View style={[itemStyles.statusBar, { backgroundColor: barColor }]} />
      <View style={itemStyles.body}>
        {/* Edit/Delete icons — top right */}
        <View style={itemStyles.iconRow}>
          <TouchableOpacity onPress={onEdit} hitSlop={HIT} activeOpacity={0.7}>
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          {isUserSentence && (
            <TouchableOpacity onPress={onDelete} hitSlop={HIT} activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sentences */}
        <KeywordLine text={sentence.source_text} baseColor={colors.text} fontSize={15} />
        <View style={itemStyles.targetRow}>
          <KeywordLine
            text={sentence.target_text}
            baseColor={colors.textSecondary}
            fontSize={13}
          />
        </View>

        {/* Keywords */}
        {keywordsText ? (
          <Text style={[itemStyles.keywords, { color: colors.textTertiary }]}>
            🔑 {keywordsText}
          </Text>
        ) : null}

        {/* Category */}
        <View
          style={[itemStyles.categoryChip, { backgroundColor: colors.backgroundTertiary }]}
        >
          <Text style={[itemStyles.categoryText, { color: colors.textSecondary }]}>
            {t(`categories.${sentence.category}`)}
          </Text>
        </View>

        {/* Action buttons */}
        <View style={itemStyles.actionRow}>
          {sentence.status !== "learning" ? (
            <TouchableOpacity
              style={[itemStyles.actionBtn, { backgroundColor: "#2ECC7118" }]}
              onPress={onLearn}
              activeOpacity={0.8}
            >
              <Text style={[itemStyles.actionBtnText, { color: "#2ECC71" }]}>
                {t("learn.add_to_list")}
              </Text>
            </TouchableOpacity>
          ) : null}

          {sentence.status !== "learned" ? (
            <TouchableOpacity
              style={[itemStyles.actionBtn, { backgroundColor: colors.primary + "18" }]}
              onPress={onLearned}
              activeOpacity={0.8}
            >
              <Text style={[itemStyles.actionBtnText, { color: colors.primary }]}>
                {t("learn.mark_learned")}
              </Text>
            </TouchableOpacity>
          ) : null}

          {sentence.status !== "new" ? (
            <TouchableOpacity
              style={[itemStyles.actionBtn, { backgroundColor: "#E53E3E18" }]}
              onPress={onForget}
              activeOpacity={0.8}
            >
              <Text style={[itemStyles.actionBtnText, { color: "#E53E3E" }]}>
                {t("learn.mark_unlearned")}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

const itemStyles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  statusBar: { height: 4, width: "100%" },
  body: { padding: 12 },
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginBottom: 6,
  },
  targetRow: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  keywords: { fontSize: 12, marginTop: 6 },
  categoryChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    marginTop: 6,
  },
  categoryText: { fontSize: 11, textTransform: "capitalize" },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 7,
  },
  actionBtnText: { fontSize: 12, fontWeight: "600" },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SentencesScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { uiLanguage } = useSettingsStore();
  const {
    sentences,
    presetSentences,
    loading,
    loadSentences,
    loadPresetSentences,
    markAsLearned,
    markAsUnlearned,
    addToLearningList,
    deleteSentence,
  } = useSentenceStore();

  const [activeTab, setActiveTab] = useState<SentenceTab>("preset");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<SentenceCategory | "all">("all");
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPresetSentences();
    loadSentences({ isPreset: false });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadPresetSentences(), loadSentences({ isPreset: false })]);
    setRefreshing(false);
  };

  // Source of truth: preset tab uses presetSentences, mine tab uses sentences
  const sourceList = activeTab === "preset" ? presetSentences : sentences;

  const displayed = useMemo(() => {
    return sourceList
      .filter(() => true) // already filtered by source
      .filter((s) => statusFilter === "all" || s.status === statusFilter)
      .filter((s) => categoryFilter === "all" || s.category === categoryFilter)
      .filter(
        (s) =>
          !searchText ||
          s.source_text.toLowerCase().includes(searchText.toLowerCase()) ||
          s.target_text.toLowerCase().includes(searchText.toLowerCase()),
      );
  }, [sourceList, statusFilter, categoryFilter, searchText]);

  const handleDelete = (sentence: Sentence) => {
    Alert.alert(
      t("sentences.delete"),
      t("sentences.delete_confirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => deleteSentence(sentence.id),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("sentences.title")}</Text>
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t("sentences.search_placeholder")}
          placeholderTextColor={colors.textTertiary}
          value={searchText}
          onChangeText={setSearchText}
          clearButtonMode="while-editing"
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText("")}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Segment control */}
      <View style={[styles.segmentContainer, { backgroundColor: colors.backgroundSecondary }]}>
        {(["preset", "mine"] as SentenceTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.segmentTab,
              activeTab === tab && [styles.segmentTabActive, { backgroundColor: colors.surface }],
            ]}
            onPress={() => { setActiveTab(tab); setStatusFilter("all"); setCategoryFilter("all"); }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentLabel,
                { color: activeTab === tab ? colors.text : colors.textSecondary },
              ]}
            >
              {tab === "preset" ? t("sentences.preset_sentences") : t("sentences.my_sentences")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.chip,
              {
                backgroundColor:
                  statusFilter === f.key ? colors.primary : colors.backgroundSecondary,
                borderColor: statusFilter === f.key ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setStatusFilter(f.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.chipText,
                { color: statusFilter === f.key ? "#fff" : colors.textSecondary },
              ]}
            >
              {t(f.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        <TouchableOpacity
          style={[
            styles.chip,
            {
              backgroundColor:
                categoryFilter === "all" ? colors.accent : colors.backgroundSecondary,
              borderColor: categoryFilter === "all" ? colors.accent : colors.border,
            },
          ]}
          onPress={() => setCategoryFilter("all")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.chipText,
              { color: categoryFilter === "all" ? "#fff" : colors.textSecondary },
            ]}
          >
            {t("sentences.filter_all")}
          </Text>
        </TouchableOpacity>
        {ALL_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.chip,
              {
                backgroundColor:
                  categoryFilter === cat ? colors.accent : colors.backgroundSecondary,
                borderColor: categoryFilter === cat ? colors.accent : colors.border,
              },
            ]}
            onPress={() => setCategoryFilter(cat)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.chipText,
                { color: categoryFilter === cat ? "#fff" : colors.textSecondary },
              ]}
            >
              {t(`categories.${cat}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {t("learn.no_sentences")}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <SentenceItem
            sentence={item}
            isUserSentence={!item.is_preset}
            onLearn={() => addToLearningList(item.id)}
            onLearned={() => markAsLearned(item.id)}
            onForget={() => markAsUnlearned(item.id)}
            onEdit={() => navigation.navigate("EditSentence", { sentenceId: item.id })}
            onDelete={() => handleDelete(item)}
            colors={colors}
            t={t}
          />
        )}
      />

      {/* FAB — Cümle ekle */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate("AddSentence")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
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
    paddingVertical: 7,
    borderRadius: 9,
  },
  segmentTabActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentLabel: { fontSize: 13, fontWeight: "500" },
  chipsRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "500" },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyIcon: { fontSize: 44 },
  emptyText: { fontSize: 15 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
