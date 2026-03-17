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
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { parseKeywords, getPillColor } from "@/utils/keywords";
import { Sentence, SentenceStatus, MainStackParamList } from "@/types";

type StatusFilter = "all" | SentenceStatus;
type SentenceTab = "preset" | "mine";

const STATUS_FILTERS: Array<{ key: StatusFilter; labelKey: string }> = [
  { key: "all", labelKey: "sentences.filter_all" },
  { key: "new", labelKey: "sentences.filter_new" },
  { key: "learning", labelKey: "sentences.filter_learning" },
  { key: "learned", labelKey: "sentences.filter_learned" },
];

// Durum bar renkleri: KIRMIZI=new, MAVİ=learning, YEŞİL=learned
const STATUS_BAR_COLOR: Record<SentenceStatus, string> = {
  new: "#E53E3E",
  learning: "#3B8BD4",
  learned: "#2ECC71",
};

function KeywordLine({
  text,
  baseColor,
  fontSize,
  colorSeed,
}: {
  text: string;
  baseColor: string;
  fontSize: number;
  colorSeed: string;
}) {
  const { isDark } = useTheme();
  const segments = parseKeywords(text);
  return (
    <Text style={{ color: baseColor, fontSize }}>
      {segments.map((seg, i) => {
        if (seg.isPill && seg.pillIndex !== null) {
          const color = getPillColor(seg.pillIndex, isDark, colorSeed);
          return (
            <Text
              key={i}
              style={{
                backgroundColor: color.bg,
                color: color.text,
                fontSize,
                fontWeight: "700",
                borderRadius: 8,
                paddingHorizontal: 5,
              }}
            >
              {` ${seg.text} `}
            </Text>
          );
        }
        return (
          <Text key={i} style={{ color: baseColor, fontSize }}>
            {seg.text}
          </Text>
        );
      })}
    </Text>
  );
}

interface SentenceItemProps {
  sentence: Sentence & { effectiveStatus: SentenceStatus };
  isUserSentence: boolean;
  onLearn: () => void;
  onMarkLearned: () => void;
  onForgot: () => void;
  onEdit: () => void;
  onDelete: () => void;
  colors: any;
  t: (k: string) => string;
}

function SentenceItem({
  sentence,
  isUserSentence,
  onLearn,
  onMarkLearned,
  onForgot,
  onEdit,
  onDelete,
  colors,
  t,
}: SentenceItemProps) {
  const barColor = STATUS_BAR_COLOR[sentence.effectiveStatus];
  const keywordsText = sentence.keywords.filter(Boolean).join(", ");

  return (
    <View style={[itemStyles.card, { backgroundColor: colors.cardBackground }]}>
      <View style={[itemStyles.statusBar, { backgroundColor: barColor }]} />
      <View style={itemStyles.body}>
        <View style={itemStyles.iconRow}>
          <Pressable
            onPress={onEdit}
            hitSlop={HIT}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
          </Pressable>
          {isUserSentence && (
            <Pressable
              onPress={onDelete}
              hitSlop={HIT}
              style={({ pressed }) => [pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
            </Pressable>
          )}
        </View>

        <KeywordLine
          text={sentence.source_text}
          baseColor={colors.text}
          fontSize={15}
          colorSeed={String(sentence.id)}
        />
        <View style={itemStyles.targetRow}>
          <KeywordLine
            text={sentence.target_text}
            baseColor={colors.textSecondary}
            fontSize={13}
            colorSeed={String(sentence.id)}
          />
        </View>

        {keywordsText ? (
          <Text style={[itemStyles.keywords, { color: colors.textTertiary }]}>
            🔑 {keywordsText}
          </Text>
        ) : null}

        {sentence.category_name ? (
          <View style={[itemStyles.categoryChip, { backgroundColor: colors.backgroundTertiary }]}>
            <Text style={[itemStyles.categoryText, { color: colors.textSecondary }]}>
              {sentence.category_name}
            </Text>
          </View>
        ) : null}

        {/* Durum text (sol) + aksiyon butonu (sağ) */}
        <View style={itemStyles.actionRow}>
          {/* Sol: durum text */}
          {sentence.effectiveStatus === "new" && (
            <Text style={{ color: colors.textTertiary, fontSize: 12 }}>
              {t("sentences.status_new")}
            </Text>
          )}
          {sentence.effectiveStatus === "learning" && (
            <Text style={{ color: "#3B8BD4", fontSize: 12, fontWeight: "500" }}>
              {t("sentences.status_learning")}
            </Text>
          )}
          {sentence.effectiveStatus === "learned" && (
            <Text style={{ color: "#2ECC71", fontSize: 12, fontWeight: "500" }}>
              {t("sentences.status_learned")}
            </Text>
          )}

          {/* Sağ: aksiyon butonu */}
          {sentence.effectiveStatus === "new" && (
            <Pressable onPress={onLearn}>
              {({ pressed }) => (
                <View
                  style={{
                    alignSelf: "flex-start",
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "#3B8BD4",
                    overflow: "hidden",
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    backgroundColor: pressed ? "#3B8BD418" : "transparent",
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="add-circle-outline" size={15} color="#3B8BD4" />
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      marginLeft: 6,
                      color: "#3B8BD4",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {t("learn.add_to_list")}
                  </Text>
                </View>
              )}
            </Pressable>
          )}

          {sentence.effectiveStatus === "learning" && (
            <Pressable onPress={onMarkLearned}>
              {({ pressed }) => (
                <View
                  style={{
                    alignSelf: "flex-start",
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "#2ECC71",
                    overflow: "hidden",
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    backgroundColor: pressed ? "#2ECC7118" : "transparent",
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="checkmark-circle-outline" size={15} color="#2ECC71" />
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      marginLeft: 6,
                      color: "#2ECC71",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {t("learn.mark_learned")}
                  </Text>
                </View>
              )}
            </Pressable>
          )}

          {sentence.effectiveStatus === "learned" && (
            <Pressable onPress={onForgot}>
              {({ pressed }) => (
                <View
                  style={{
                    alignSelf: "flex-start",
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: "#E53E3E",
                    overflow: "hidden",
                    paddingHorizontal: 6,
                    paddingVertical: 4,
                    backgroundColor: pressed ? "#E53E3E18" : "transparent",
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="refresh-outline" size={15} color="#E53E3E" />
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      marginLeft: 6,
                      color: "#E53E3E",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {t("learn.mark_unlearned")}
                  </Text>
                </View>
              )}
            </Pressable>
          )}
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  statusBar: { height: 6, width: "100%" },
  body: { padding: 6, paddingHorizontal: 12 },
  iconRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginBottom: 4,
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
  categoryText: { fontSize: 11 },
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
    alignItems: "center",
  },
});

// ─── Ana ekran ────────────────────────────────────────────────────────────────

export default function SentencesScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { uiLanguage } = useSettingsStore();
  const {
    sentences,
    presetSentences,
    categories,
    loading,
    loadSentences,
    loadPresetSentences,
    loadCategories,
    markAsLearned,
    markAsUnlearned,
    addToLearningList,
    deleteSentence,
  } = useSentenceStore();
  const { progressMap, loadProgress } = useProgressStore();

  const [activeTab, setActiveTab] = useState<SentenceTab>("preset");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategories();
    loadPresetSentences();
    loadSentences();
    loadProgress();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadPresetSentences(), loadSentences(), loadProgress()]);
    setRefreshing(false);
  };

  // Preset cümlelere progressMap'ten durum ekle
  const sourceList = useMemo(() => {
    const base = activeTab === "preset" ? presetSentences : sentences;
    return base.map((s) => ({
      ...s,
      effectiveStatus: (s.is_preset ? (progressMap[s.id] ?? "new") : s.status) as SentenceStatus,
    }));
  }, [activeTab, presetSentences, sentences, progressMap]);

  const displayed = useMemo(() => {
    return sourceList
      .filter((s) => statusFilter === "all" || s.effectiveStatus === statusFilter)
      .filter((s) => categoryFilter === "all" || s.category_id === categoryFilter)
      .filter(
        (s) =>
          !searchText ||
          s.source_text.toLowerCase().includes(searchText.toLowerCase()) ||
          s.target_text.toLowerCase().includes(searchText.toLowerCase()),
      );
  }, [sourceList, statusFilter, categoryFilter, searchText]);

  const handleDelete = (sentence: Sentence) => {
    Alert.alert(t("sentences.delete"), t("sentences.delete_confirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => deleteSentence(sentence.id),
      },
    ]);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* ── Sabit üst alan (başlık + filtreler) ─────────────────────── */}
      <View>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t("sentences.title")}</Text>
        </View>

        {/* Arama */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
          ]}
        >
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

        {/* Segment: Hazır / Benim */}
        <View style={[styles.segmentContainer, { backgroundColor: colors.backgroundSecondary }]}>
          {(["preset", "mine"] as SentenceTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.segmentTab,
                activeTab === tab && [styles.segmentTabActive, { backgroundColor: colors.surface }],
              ]}
              onPress={() => {
                setActiveTab(tab);
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
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

        {/* Durum filtreleri */}
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

        {/* Kategori filtreleri */}
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
                  categoryFilter === "all" ? colors.primary : colors.backgroundSecondary,
                borderColor: categoryFilter === "all" ? colors.primary : colors.border,
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
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                {
                  backgroundColor:
                    categoryFilter === cat.id ? colors.primary : colors.backgroundSecondary,
                  borderColor: categoryFilter === cat.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setCategoryFilter(cat.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: categoryFilter === cat.id ? "#fff" : colors.textSecondary },
                ]}
              >
                {cat[`name_${uiLanguage}` as keyof typeof cat] as string}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Scrollable cümle listesi ─────────────────────────────────── */}
      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={styles.list}
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
            onMarkLearned={() => markAsLearned(item.id)}
            onForgot={() => markAsUnlearned(item.id)}
            onEdit={() => navigation.navigate("EditSentence", { sentenceId: item.id })}
            onDelete={() => handleDelete(item)}
            colors={colors}
            t={t}
          />
        )}
      />

      {/* FAB */}
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
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
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
    borderRadius: 25,
    padding: 4,
    marginBottom: 8,
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
  chipsRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 6 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "500" },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingBottom: 90, paddingTop: 4 },
  emptyContainer: { alignItems: "center", paddingTop: 60, gap: 10 },
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
