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
import { usePremium } from "@/hooks/usePremium";
import { KeywordText } from "@/components/KeywordText";
import { Sentence, SentenceStatus, MainStackParamList } from "@/types";

type StatusFilter = "all" | SentenceStatus;
type SentenceTab = "preset" | "mine";

const STATUS_FILTERS: Array<{ key: StatusFilter; labelKey: string }> = [
  { key: "all", labelKey: "sentences.filter_all" },
  { key: "new", labelKey: "sentences.filter_new" },
  { key: "learning", labelKey: "sentences.filter_learning" },
  { key: "learned", labelKey: "sentences.filter_learned" },
];

const STATUS_BAR_COLOR: Record<SentenceStatus, string> = {
  new: "#E53E3E",
  learning: "#3B8BD4",
  learned: "#2ECC71",
};

interface SentenceItemProps {
  sentence: Sentence & { effectiveStatus: SentenceStatus };
  isUserSentence: boolean;
  uiLanguage: string;
  targetLanguage: string;
  onLearn: () => void;
  onMarkLearned: () => void;
  onForgot: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  colors: ThemeColors;
  t: (k: string, opts?: Record<string, string>) => string;
}

function SentenceItem({
  sentence,
  isUserSentence,
  uiLanguage,
  targetLanguage,
  onLearn,
  onMarkLearned,
  onForgot,
  onEdit,
  onDelete,
  isFavorite,
  onToggleFavorite,
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
  const barColor = STATUS_BAR_COLOR[sentence.effectiveStatus];
  const keywordsText = sentence.keywords.filter(Boolean).join(", ");

  return (
    <View style={[itemStyles.card, { backgroundColor: colors.cardBackground }]}>
      <View style={[itemStyles.statusBar, { backgroundColor: barColor }]} />
      <View style={itemStyles.body}>
        <View style={itemStyles.iconRow}>
          {hasMismatch && (
            <Pressable
              onPress={handleMismatchPress}
              hitSlop={HIT}
              style={({ pressed }) => [pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="warning-outline" size={18} color={colors.warning ?? "#F59E0B"} />
            </Pressable>
          )}
          <Pressable
            onPress={onToggleFavorite}
            hitSlop={HIT}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={18}
              color={isFavorite ? "#E85D5D" : colors.textSecondary}
            />
          </Pressable>
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

        <KeywordText
          text={sentence.source_text}
          baseColor={colors.text}
          fontSize={15}
          colorSeed={String(sentence.id)}
        />
        <View style={itemStyles.targetRow}>
          <KeywordText
            text={sentence.target_text}
            baseColor={colors.textSecondary}
            fontSize={13}
            colorSeed={String(sentence.id)}
          />
        </View>

        {keywordsText ? (
          <View style={itemStyles.keywordsRow}>
            <Ionicons name="key-outline" size={11} color={colors.textTertiary} />
            <Text style={[itemStyles.keywords, { color: colors.textTertiary }]}>
              {keywordsText}
            </Text>
          </View>
        ) : null}

        {sentence.category_name ? (
          <View style={[itemStyles.categoryChip, { backgroundColor: colors.backgroundTertiary }]}>
            <Text style={[itemStyles.categoryText, { color: colors.textSecondary }]}>
              {sentence.category_name}
            </Text>
          </View>
        ) : null}

        <View style={itemStyles.actionRow}>
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ color: "#2ECC71", fontSize: 12, fontWeight: "500" }}>
                {t("sentences.status_learned")}
              </Text>
              <Feather name="check" size={13} color="#2ECC71" />
            </View>
          )}

          {sentence.effectiveStatus === "new" && (
            <Pressable onPress={onLearn}>
              {({ pressed }) => (
                <View
                  style={[
                    itemStyles.actionBtn,
                    {
                      borderColor: colors.border,
                      backgroundColor: pressed
                        ? colors.backgroundTertiary
                        : colors.backgroundSecondary,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                  ]}
                >
                  <Ionicons name="add-circle-outline" size={15} color={colors.textSecondary} />
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
                        ? colors.backgroundTertiary
                        : colors.backgroundSecondary,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={15}
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
                        ? colors.backgroundTertiary
                        : colors.backgroundSecondary,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    },
                  ]}
                >
                  <Ionicons name="refresh-outline" size={15} color={colors.textSecondary} />
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
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  statusBar: { height: 0, width: "100%" },
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
  keywordsRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  keywords: { fontSize: 12 },
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
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnText: {
    fontSize: 13,
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

        {/* Category chips */}
        <Text style={[filterStyles.sectionLabel, { color: colors.textTertiary }]}>
          {t("sentences.filter_category") || "Kategori"}
        </Text>
        <View style={filterStyles.chipsWrap}>
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
  const { isPremium } = usePremium();
  const {
    sentences,
    presetSentences,
    categories,
    favoriteIds,
    loadSentences,
    loadPresetSentences,
    loadCategories,
    loadFavorites,
    markAsLearned,
    markAsUnlearned,
    addToLearningList,
    deleteSentence,
    toggleFavorite,
  } = useSentenceStore();
  const { progressMap, loadProgress } = useProgressStore();

  const visibleCategories = isPremium ? categories : categories.filter((c) => c.is_free);

  const [activeTab, setActiveTab] = useState<SentenceTab>("preset");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  const activeFilterCount = (statusFilter !== "all" ? 1 : 0) + (categoryFilter !== "all" ? 1 : 0);

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
    await Promise.all([loadPresetSentences(undefined, isPremium), loadSentences(), loadProgress(), loadFavorites()]);
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
          !searchText ||
          s.source_text.toLowerCase().includes(searchText.toLowerCase()) ||
          s.target_text.toLowerCase().includes(searchText.toLowerCase()),
      );
  }, [sourceList, statusFilter, categoryFilter, searchText]);

  const tabCounts = useMemo(() => {
    const applyFilters = (base: typeof presetSentences, isPreset: boolean) =>
      base
        .map((s) => ({
          effectiveStatus: (isPreset ? (progressMap[s.id] ?? "new") : s.status) as SentenceStatus,
          category_id: s.category_id,
          source_text: s.source_text,
          target_text: s.target_text,
        }))
        .filter((s) => statusFilter === "all" || s.effectiveStatus === statusFilter)
        .filter((s) => categoryFilter === "all" || s.category_id === categoryFilter)
        .filter(
          (s) =>
            !searchText ||
            s.source_text.toLowerCase().includes(searchText.toLowerCase()) ||
            s.target_text.toLowerCase().includes(searchText.toLowerCase()),
        ).length;

    return {
      preset: applyFilters(presetSentences, true),
      mine: applyFilters(sentences, false),
    };
  }, [presetSentences, sentences, progressMap, statusFilter, categoryFilter, searchText]);

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
            onEdit={() =>
              navigation.navigate("EditSentence", {
                sentenceId: item.id,
                isPreset: item.is_preset,
              })
            }
            onDelete={() => handleDelete(item)}
            isFavorite={favoriteIds.includes(item.id)}
            onToggleFavorite={() => toggleFavorite(item.id, item.is_preset)}
            uiLanguage={uiLanguage}
            targetLanguage={targetLanguage}
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
