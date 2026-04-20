import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  Pressable,
  Modal,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import type { ThemeColors } from "@/providers/ThemeProvider";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { KeywordText } from "@/components/KeywordText";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Sentence, SentenceDifficulty, SentenceStatus, MainStackParamList } from "@/types";

type StatusFilter = "all" | SentenceStatus;
type DifficultyFilter = "all" | SentenceDifficulty;
type SentenceTab = "preset" | "mine";

const DIFFICULTY_FILTERS: Array<{ key: DifficultyFilter; labelKey: string }> = [
  { key: "all", labelKey: "sentences.difficulty_all" },
  { key: "beginner", labelKey: "sentences.difficulty_beginner" },
  { key: "intermediate", labelKey: "sentences.difficulty_intermediate" },
  { key: "advanced", labelKey: "sentences.difficulty_advanced" },
];

const STATUS_FILTERS: Array<{ key: StatusFilter; labelKey: string }> = [
  { key: "all", labelKey: "sentences.filter_all" },
  { key: "new", labelKey: "sentences.filter_new" },
  { key: "learning", labelKey: "sentences.filter_learning" },
  { key: "learned", labelKey: "sentences.filter_learned" },
];

interface SentenceItemProps {
  sentence: Sentence & { effectiveStatus: SentenceStatus };
  isUserSentence: boolean;
  uiLanguage: string;
  targetLanguage: string;
  isDark: boolean;
  onLearn: () => void;
  onMarkLearned: () => void;
  onForgot: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  colors: ThemeColors;
  t: (k: string, opts?: Record<string, string>) => string;
}

function SentenceItem({
  sentence,
  isUserSentence,
  uiLanguage,
  targetLanguage,
  isDark,
  onLearn,
  onMarkLearned,
  onForgot,
  onEdit,
  onDelete,
  colors,
  t,
}: SentenceItemProps) {
  const hasMismatch =
    isUserSentence &&
    sentence.source_lang &&
    sentence.target_lang &&
    (sentence.source_lang !== uiLanguage || sentence.target_lang !== targetLanguage);

  const handleMismatchPress = () => {
    Alert.alert(
      t("sentences.lang_mismatch_title"),
      t("sentences.lang_mismatch_body", {
        sourceLang: t(`languages.${sentence.source_lang}`),
        targetLang: t(`languages.${sentence.target_lang}`),
        currentSource: t(`languages.${uiLanguage}`),
        currentTarget: t(`languages.${targetLanguage}`),
      }),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("sentences.lang_mismatch_edit"), onPress: onEdit },
      ],
    );
  };
  const statusMeta = {
    new: {
      label: t("sentences.status_new"),
      color: colors.textTertiary,
    },
    learning: {
      label: t("sentences.status_learning"),
      color: "#3B8BD4",
    },
    learned: {
      label: t("sentences.status_learned"),
      color: "#2ECC71",
    },
  }[sentence.effectiveStatus];

  return (
    <View
      style={[
        itemStyles.card,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={itemStyles.body}>
        <View style={itemStyles.topRow}>
          <View style={itemStyles.topRowLeft}>
            {sentence.is_ai_generated && (
              <View style={[itemStyles.aiBadge, { backgroundColor: colors.primary + "14" }]}>
                <Ionicons name="sparkles" size={11} color={colors.primary} />
              </View>
            )}
            {hasMismatch && (
              <Pressable
                onPress={handleMismatchPress}
                hitSlop={HIT}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <Ionicons name="warning-outline" size={15} color={colors.warning ?? "#F59E0B"} />
              </Pressable>
            )}
            {onEdit && (
              <Pressable
                onPress={onEdit}
                hitSlop={HIT}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <Ionicons name="create-outline" size={15} color={colors.textTertiary} />
              </Pressable>
            )}
            {isUserSentence && (
              <Pressable
                onPress={onDelete}
                hitSlop={HIT}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <Ionicons name="trash-outline" size={15} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>

          <View style={itemStyles.topRowRight}>
            {sentence.category_name ? (
              <View
                style={[
                  itemStyles.categoryChip,
                  {
                    backgroundColor: colors.backgroundSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[itemStyles.categoryText, { color: colors.textSecondary }]}
                >
                  {sentence.category_name}
                </Text>
              </View>
            ) : null}
            <FavoriteButton sentenceId={sentence.id} isPreset={sentence.is_preset} />
          </View>
        </View>

        <View style={itemStyles.copyBlock}>
          <KeywordText
            text={sentence.target_text}
            baseColor={colors.text}
            fontSize={16}
            colorSeed={String(sentence.id)}
          />
          <View
            style={[
              itemStyles.targetRow,
              {
                borderTopColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
              },
            ]}
          >
            <KeywordText
              text={sentence.source_text}
              baseColor={colors.textSecondary}
              fontSize={14}
              colorSeed={String(sentence.id)}
            />
          </View>
        </View>

        <View style={itemStyles.actionRow}>
          <View style={itemStyles.statusMeta}>
            <Text style={[itemStyles.statusText, { color: statusMeta.color }]}>
              {statusMeta.label}
            </Text>
            {sentence.effectiveStatus === "learned" ? (
              <Feather name="check" size={12} color={statusMeta.color} />
            ) : null}
          </View>

          {sentence.effectiveStatus === "new" && (
            <Pressable onPress={onLearn}>
              {({ pressed }) => (
                <View
                  style={[
                    itemStyles.actionBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor: pressed
                        ? colors.backgroundSecondary
                        : colors.backgroundSecondary,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    },
                  ]}
                >
                  <Ionicons name="add-circle-outline" size={14} color={colors.textSecondary} />
                  <Text
                    numberOfLines={1}
                    style={[itemStyles.actionBtnText, { color: colors.textSecondary }]}
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
                  style={[
                    itemStyles.actionBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor: pressed
                        ? colors.backgroundSecondary
                        : colors.backgroundSecondary,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text
                    numberOfLines={1}
                    style={[itemStyles.actionBtnText, { color: colors.textSecondary }]}
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
                  style={[
                    itemStyles.actionBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor: pressed
                        ? colors.backgroundSecondary
                        : colors.backgroundSecondary,
                      transform: [{ scale: pressed ? 0.97 : 1 }],
                    },
                  ]}
                >
                  <Ionicons name="refresh-outline" size={14} color={colors.textSecondary} />
                  <Text
                    numberOfLines={1}
                    style={[itemStyles.actionBtnText, { color: colors.textSecondary }]}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 14,
    borderWidth: 1,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 2,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    minHeight: 16,
  },
  topRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  topRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
    marginLeft: 8,
    minWidth: 0,
  },
  copyBlock: {
    gap: 6,
  },
  targetRow: {
    marginTop: 2,
    marginBottom: 4,
    borderTopWidth: 1,
  },
  categoryChip: {
    maxWidth: 112,
    minWidth: 0,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  statusMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 0,
    gap: 4,
    minHeight: 22,
    flexShrink: 0,
  },
  aiBadge: {
    width: 20,
    height: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: "600",
  },
});

// ─── Filter Modal ────────────────────────────────────────────────────────────

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  statusFilter: StatusFilter;
  setStatusFilter: (f: StatusFilter) => void;
  categoryFilter: number | "all";
  setCategoryFilter: (f: number | "all") => void;
  difficultyFilter: DifficultyFilter;
  setDifficultyFilter: (f: DifficultyFilter) => void;
  isPresetTab: boolean;
  categories: any[];
  uiLanguage: string;
  colors: any;
  isDark: boolean;
  t: (k: string) => string;
  activeFilterCount: number;
}

function FilterModal({
  visible,
  onClose,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  difficultyFilter,
  setDifficultyFilter,
  isPresetTab,
  categories,
  uiLanguage,
  colors,
  isDark,
  t,
  activeFilterCount,
}: FilterModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 60, duration: 140, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const chipActive = (active: boolean) => ({
    backgroundColor: active
      ? colors.primary
      : isDark
        ? "rgba(255,255,255,0.07)"
        : "rgba(0,0,0,0.05)",
    borderColor: active ? colors.primary : colors.border,
  });

  const chipTextColor = (active: boolean) => (active ? "#fff" : colors.textSecondary);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <Animated.View style={[filterStyles.backdrop, { opacity: fadeAnim }]}>
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />
      </Animated.View>

      <Animated.View
        style={[
          filterStyles.panel,
          {
            backgroundColor: colors.cardBackground,
            shadowColor: "#000",
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Header */}
        <View style={filterStyles.panelHeader}>
          <Text style={[filterStyles.panelTitle, { color: colors.text }]}>
            {t("sentences.filter_title") || "Filtrele"}
          </Text>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            {activeFilterCount > 0 && (
              <Pressable
                onPress={() => {
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setDifficultyFilter("all");
                }}
              >
                <Text style={{ color: colors.primary, fontSize: 13 }}>
                  {t("sentences.clear_filters") || "Temizle"}
                </Text>
              </Pressable>
            )}
            <Pressable onPress={onClose} hitSlop={HIT}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Status chips */}
        <Text style={[filterStyles.sectionLabel, { color: colors.textTertiary }]}>
          {t("sentences.filter_status") || "Durum"}
        </Text>
        <View style={filterStyles.chipsWrap}>
          {STATUS_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[filterStyles.chip, chipActive(statusFilter === f.key)]}
              onPress={() => setStatusFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[filterStyles.chipText, { color: chipTextColor(statusFilter === f.key) }]}
              >
                {t(f.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Difficulty chips — only for preset sentences */}
        {isPresetTab && (
          <>
            <Text style={[filterStyles.sectionLabel, { color: colors.textTertiary }]}>
              {t("sentences.filter_difficulty")}
            </Text>
            <View style={filterStyles.chipsWrap}>
              {DIFFICULTY_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[filterStyles.chip, chipActive(difficultyFilter === f.key)]}
                  onPress={() => setDifficultyFilter(f.key)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      filterStyles.chipText,
                      { color: chipTextColor(difficultyFilter === f.key) },
                    ]}
                  >
                    {t(f.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Category chips */}
        <Text style={[filterStyles.sectionLabel, { color: colors.textTertiary }]}>
          {t("sentences.filter_category") || "Kategori"}
        </Text>
        <View style={[filterStyles.chipsWrap, { marginBottom: 4 }]}>
          <TouchableOpacity
            style={[filterStyles.chip, chipActive(categoryFilter === "all")]}
            onPress={() => setCategoryFilter("all")}
            activeOpacity={0.8}
          >
            <Text
              style={[filterStyles.chipText, { color: chipTextColor(categoryFilter === "all") }]}
            >
              {t("sentences.filter_all")}
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[filterStyles.chip, chipActive(categoryFilter === cat.id)]}
              onPress={() => setCategoryFilter(cat.id)}
              activeOpacity={0.8}
            >
              <Text
                style={[filterStyles.chipText, { color: chipTextColor(categoryFilter === cat.id) }]}
              >
                {cat[`name_${uiLanguage}` as keyof typeof cat] as string}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
}

const filterStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  panel: {
    position: "absolute",
    top: 140,
    left: 12,
    right: 12,
    borderRadius: 16,
    padding: 16,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  panelTitle: { fontSize: 16, fontWeight: "700" },
  sectionLabel: { fontSize: 11, fontWeight: "600", marginBottom: 8, letterSpacing: 0.5 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chipsRow: { gap: 8, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: "500" },
});

// ─── Ana ekran ────────────────────────────────────────────────────────────────

export default function SentencesScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { uiLanguage, targetLanguage } = useSettingsStore();
  const isPremium = useAuthStore((s) => s.user?.is_premium ?? false);
  const {
    sentences,
    presetSentences,
    categories,
    loadSentences,
    loadPresetSentences,
    loadCategories,
    loadFavorites,
    markAsLearned,
    markAsUnlearned,
    addToLearningList,
    deleteSentence,
  } = useSentenceStore();
  const { progressMap, loadProgress } = useProgressStore();

  const visibleCategories = isPremium ? categories : categories.filter((c) => c.is_free);

  const [activeTab, setActiveTab] = useState<SentenceTab>("preset");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    (categoryFilter !== "all" ? 1 : 0) +
    (activeTab === "preset" && difficultyFilter !== "all" ? 1 : 0);

  // Tab underline color: primary for both modes (works well on dark & light)
  const tabActiveColor = isDark ? colors.primary : colors.primaryDark;

  useEffect(() => {
    loadCategories();
    loadPresetSentences(undefined, isPremium);
    loadSentences();
    loadProgress();
    loadFavorites();
  }, [isPremium, targetLanguage, uiLanguage]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadPresetSentences(undefined, isPremium),
      loadSentences(),
      loadProgress(),
      loadFavorites(),
    ]);
    setRefreshing(false);
  };

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
          activeTab === "mine" || difficultyFilter === "all" || s.difficulty === difficultyFilter,
      )
      .filter(
        (s) =>
          !searchText ||
          s.source_text.toLowerCase().includes(searchText.toLowerCase()) ||
          s.target_text.toLowerCase().includes(searchText.toLowerCase()) ||
          s.keywords.some((k) => k.toLowerCase().includes(searchText.toLowerCase())),
      );
  }, [sourceList, statusFilter, categoryFilter, difficultyFilter, activeTab, searchText]);

  const mismatchedCount = useMemo(
    () =>
      sentences.filter(
        (s) =>
          (s.target_lang && s.target_lang !== targetLanguage) ||
          (s.source_lang && s.source_lang !== uiLanguage),
      ).length,
    [sentences, targetLanguage, uiLanguage],
  );

  const tabCounts = useMemo(() => {
    const applyFilters = (base: typeof presetSentences, isPreset: boolean) =>
      base
        .map((s) => ({
          effectiveStatus: (isPreset ? (progressMap[s.id] ?? "new") : s.status) as SentenceStatus,
          category_id: s.category_id,
          difficulty: s.difficulty,
          source_text: s.source_text,
          target_text: s.target_text,
          keywords: s.keywords,
        }))
        .filter((s) => statusFilter === "all" || s.effectiveStatus === statusFilter)
        .filter((s) => categoryFilter === "all" || s.category_id === categoryFilter)
        .filter((s) => !isPreset || difficultyFilter === "all" || s.difficulty === difficultyFilter)
        .filter(
          (s) =>
            !searchText ||
            s.source_text.toLowerCase().includes(searchText.toLowerCase()) ||
            s.target_text.toLowerCase().includes(searchText.toLowerCase()) ||
            s.keywords.some((k) => k.toLowerCase().includes(searchText.toLowerCase())),
        ).length;

    return {
      preset: applyFilters(presetSentences, true),
      mine: applyFilters(sentences, false),
    };
  }, [
    presetSentences,
    sentences,
    progressMap,
    statusFilter,
    categoryFilter,
    difficultyFilter,
    searchText,
  ]);

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
      {/* ── Başlık ───────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("sentences.title")}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("AITranslator")}
            style={[styles.filterBtn, { backgroundColor: colors.primary + "15", borderRadius: 10 }]}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            style={styles.filterBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name="options-outline"
              size={24}
              color={activeFilterCount > 0 ? colors.primary : colors.textSecondary}
            />
            {activeFilterCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Arama ────────────────────────────────────────────────────── */}
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

      {/* ── Sekmeler (underline style) ────────────────────────────────── */}
      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {(["preset", "mine"] as SentenceTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <View style={styles.tabInner}>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? colors.text : colors.textSecondary },
                    isActive && styles.tabLabelActive,
                  ]}
                >
                  {tab === "preset" ? t("sentences.preset_sentences") : t("sentences.my_sentences")}
                </Text>
                <View
                  style={[
                    styles.tabCount,
                    {
                      backgroundColor: isActive
                        ? colors.primary + "22"
                        : colors.backgroundSecondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tabCountText,
                      { color: isActive ? colors.primary : colors.textTertiary },
                    ]}
                  >
                    {tabCounts[tab]}
                  </Text>
                </View>
              </View>
              {isActive && (
                <View style={[styles.tabUnderline, { backgroundColor: tabActiveColor }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Cümle listesi ────────────────────────────────────────────── */}
      <FlatList
        data={displayed}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        ListHeaderComponent={
          activeTab === "mine" && mismatchedCount > 0 ? (
            <View
              style={[
                bannerStyles.banner,
                {
                  backgroundColor: colors.warning ? colors.warning + "18" : "#F59E0B18",
                  borderColor: colors.warning ?? "#F59E0B",
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.warning ?? "#F59E0B"}
                style={{ marginTop: 1 }}
              />
              <Text style={[bannerStyles.bannerText, { color: colors.textSecondary }]}>
                {t("sentences.lang_change_info")}
              </Text>
            </View>
          ) : null
        }
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
            onEdit={
              item.is_preset
                ? undefined
                : () =>
                    navigation.navigate("EditSentence", {
                      sentenceId: item.id,
                      isPreset: item.is_preset,
                    })
            }
            onDelete={() => handleDelete(item)}
            uiLanguage={uiLanguage}
            targetLanguage={targetLanguage}
            isDark={isDark}
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

      {/* Filter Modal */}
      <FilterModal
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        isPresetTab={activeTab === "preset"}
        categories={visibleCategories}
        uiLanguage={uiLanguage}
        colors={colors}
        isDark={isDark}
        t={t}
        activeFilterCount={activeFilterCount}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  headerTitle: { fontSize: 22, fontWeight: "700" },
  filterBtn: {
    position: "relative",
    padding: 6,
  },
  filterBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  // Underline tabs
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 8,
    marginTop: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    position: "relative",
  },
  tabInner: { flexDirection: "row", alignItems: "center", gap: 6 },
  tabLabel: { fontSize: 14, fontWeight: "500" },
  tabLabelActive: { fontWeight: "700" },
  tabCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  tabCountText: { fontSize: 11, fontWeight: "600" },
  tabUnderline: {
    position: "absolute",
    bottom: -1,
    left: 12,
    right: 12,
    height: 2.5,
    borderRadius: 2,
  },
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

const bannerStyles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
});
