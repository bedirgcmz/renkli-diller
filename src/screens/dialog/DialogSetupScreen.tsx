import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useDialogStore, DialogDifficultyFilter } from "@/store/useDialogStore";
import { DialogCategory, HomeStackParamList, MainStackParamList, DIALOG_LIMIT_FREE_TOTAL } from "@/types";
import { SupportedLanguage } from "@/types";

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const ACCENT = "#06B6D4";

const DIFFICULTY_CONFIG: {
  value: DialogDifficultyFilter;
  labelKey: string;
  descKey: string;
  color: string;
}[] = [
  { value: 1, labelKey: "dialog.setup.difficulty_easy",   descKey: "dialog.setup.difficulty_easy_desc",   color: "#49C98A" },
  { value: 2, labelKey: "dialog.setup.difficulty_medium", descKey: "dialog.setup.difficulty_medium_desc", color: "#F59E0B" },
  { value: 3, labelKey: "dialog.setup.difficulty_hard",   descKey: "dialog.setup.difficulty_hard_desc",   color: "#E85D5D" },
];

function getCategoryTitle(cat: DialogCategory, lang: SupportedLanguage): string {
  const key = `title_${lang}` as keyof DialogCategory;
  return (cat[key] as string) || cat.title_en;
}

export default function DialogSetupScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();

  const { user } = useAuthStore();
  const isPremium = user?.is_premium ?? false;
  const { uiLanguage } = useSettingsStore();

  const {
    categories,
    selectedCategory,
    selectedDifficulty,
    limitStatus,
    loading,
    fetchCategories,
    fetchLimitStatus,
    setSelectedCategory,
    setSelectedDifficulty,
    startSession,
    reset,
  } = useDialogStore();

  const [limitModalVisible, setLimitModalVisible] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    reset();
    fetchCategories();
    if (user) fetchLimitStatus(user.id, isPremium);
  }, [user]);

  const handleStart = async () => {
    if (!selectedCategory || !selectedDifficulty || !user) return;

    // Check limit before starting
    if (limitStatus && !limitStatus.canPlay) {
      setLimitModalVisible(true);
      return;
    }

    setStarting(true);
    const ok = await startSession(user.id, isPremium);
    setStarting(false);

    if (ok) {
      navigation.navigate("DialogPlay");
      return;
    }

    const latestError = useDialogStore.getState().error;
    if (latestError === "no_scenarios") {
      Alert.alert(t("common.error"), t("dialog.setup.no_scenarios"));
    } else if (latestError === "invalid_scenario") {
      Alert.alert(t("common.error"), t("dialog.setup.start_failed"));
    }
  };

  const canStart = !!selectedCategory && !!selectedDifficulty && !starting;
  const handleGoPremium = () => {
    setLimitModalVisible(false);
    navigation.getParent<NativeStackNavigationProp<MainStackParamList>>()?.navigate("Paywall");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("dialog.setup.title")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Difficulty section */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          {t("dialog.setup.pick_difficulty").toUpperCase()}
        </Text>
        <View style={styles.difficultyRow}>
          {DIFFICULTY_CONFIG.map((d) => {
            const active = selectedDifficulty === d.value;
            return (
              <TouchableOpacity
                key={d.value}
                style={[
                  styles.difficultyChip,
                  {
                    backgroundColor: active ? d.color : colors.cardBackground,
                    borderColor: active ? d.color : colors.border,
                  },
                ]}
                onPress={() => setSelectedDifficulty(active ? null : d.value)}
                activeOpacity={0.75}
              >
                <Text style={[styles.difficultyLabel, { color: active ? "#fff" : colors.text }]}>
                  {t(d.labelKey)}
                </Text>
                <Text style={[styles.difficultyDesc, { color: active ? "#ffffffBB" : colors.textTertiary }]}>
                  {t(d.descKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category section */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          {t("dialog.setup.pick_category").toUpperCase()}
        </Text>

        {loading ? (
          <ActivityIndicator color={ACCENT} style={{ marginTop: 24 }} />
        ) : (
          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const active = selectedCategory?.id === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: active ? ACCENT + "20" : colors.cardBackground,
                      borderColor: active ? ACCENT : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedCategory(active ? null : cat)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.categoryIcon}>{cat.icon ?? "💬"}</Text>
                  <Text
                    style={[styles.categoryTitle, { color: active ? ACCENT : colors.text }]}
                    numberOfLines={2}
                  >
                    {getCategoryTitle(cat, uiLanguage as SupportedLanguage)}
                  </Text>
                  {active && (
                    <Ionicons name="checkmark-circle" size={16} color={ACCENT} style={styles.categoryCheck} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky bottom start button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {limitStatus && !limitStatus.canPlay ? (
          <TouchableOpacity
            style={[styles.startBtn, { backgroundColor: colors.border }]}
            onPress={() => setLimitModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.startBtnText, { color: colors.textSecondary }]}>
              {limitStatus.blockedReason === "total_limit"
                ? t("dialog.limit.total_free_title")
                : t("dialog.limit.daily_free_title")}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.startBtn,
              { backgroundColor: canStart ? ACCENT : colors.border },
            ]}
            onPress={handleStart}
            disabled={!canStart}
            activeOpacity={0.8}
          >
            {starting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="chatbubbles-outline" size={18} color={canStart ? "#fff" : colors.textSecondary} />
                <Text style={[styles.startBtnText, { color: canStart ? "#fff" : colors.textSecondary }]}>
                  {t("dialog.setup.start_button")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Limit Modal */}
      <LimitModal
        visible={limitModalVisible}
        onClose={() => setLimitModalVisible(false)}
        blockedReason={limitStatus?.blockedReason ?? null}
        isPremium={isPremium}
        totalCompleted={limitStatus?.totalCompleted ?? 0}
        t={t}
        colors={colors}
        onGoPremium={handleGoPremium}
      />
    </SafeAreaView>
  );
}

function LimitModal({
  visible,
  onClose,
  blockedReason,
  isPremium,
  totalCompleted,
  t,
  colors,
  onGoPremium,
}: {
  visible: boolean;
  onClose: () => void;
  blockedReason: "daily_limit" | "total_limit" | null;
  isPremium: boolean;
  totalCompleted: number;
  t: (key: string) => string;
  colors: any;
  onGoPremium: () => void;
}) {
  if (!blockedReason) return null;

  const isTotalLimit = blockedReason === "total_limit";
  const isDailyPremium = isPremium && blockedReason === "daily_limit";

  const title = isTotalLimit
    ? t("dialog.limit.total_free_title")
    : isDailyPremium
    ? t("dialog.limit.daily_premium_title")
    : t("dialog.limit.daily_free_title");

  const body = isTotalLimit
    ? t("dialog.limit.total_free_body")
    : isDailyPremium
    ? t("dialog.limit.daily_premium_body")
    : t("dialog.limit.daily_free_body");

  const showPremiumCta = !isPremium;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={styles.modalEmoji}>{isTotalLimit ? "🏆" : "⏰"}</Text>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.modalBody, { color: colors.textSecondary }]}>{body}</Text>

          {!isTotalLimit && !isPremium && (
            <View style={[styles.progressRow, { backgroundColor: colors.background }]}>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {totalCompleted} / {DIALOG_LIMIT_FREE_TOTAL}
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min((totalCompleted / DIALOG_LIMIT_FREE_TOTAL) * 100, 100)}%` as any,
                      backgroundColor: "#06B6D4",
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {showPremiumCta && (
            <TouchableOpacity
              style={[styles.premiumBtn, { backgroundColor: "#8B5CF6" }]}
              onPress={onGoPremium}
            >
              <Ionicons name="star" size={16} color="#fff" />
              <Text style={styles.premiumBtnText}>{t("dialog.limit.go_premium")}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>
              {isDailyPremium
                ? t("dialog.limit.come_back_tomorrow")
                : t("dialog.limit.maybe_later")}
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  header:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn:         { width: 40, alignItems: "flex-start" },
  headerTitle:     { fontSize: 20, fontWeight: "700" },
  scroll:          { paddingHorizontal: 16, paddingTop: 8 },
  sectionLabel:    { fontSize: 12, fontWeight: "600", letterSpacing: 0.6, marginBottom: 10, marginTop: 16 },

  difficultyRow:   { flexDirection: "row", gap: 10, marginBottom: 4 },
  difficultyChip:  { flex: 1, borderRadius: 14, borderWidth: 1.5, padding: 12, alignItems: "center" },
  difficultyLabel: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  difficultyDesc:  { fontSize: 10, textAlign: "center", lineHeight: 13 },

  categoryGrid:    { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryCard:    { width: "47%", borderRadius: 14, borderWidth: 1.5, padding: 14, alignItems: "center", position: "relative" },
  categoryIcon:    { fontSize: 26, marginBottom: 8 },
  categoryTitle:   { fontSize: 13, fontWeight: "600", textAlign: "center", lineHeight: 17 },
  categoryCheck:   { position: "absolute", top: 8, right: 8 },

  bottomBar:       { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
  startBtn:        { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 16 },
  startBtnText:    { fontSize: 16, fontWeight: "700" },

  modalOverlay:    { flex: 1, backgroundColor: "#00000088", alignItems: "center", justifyContent: "center" },
  modalCard:       { width: "85%", borderRadius: 20, padding: 24, alignItems: "center" },
  modalEmoji:      { fontSize: 40, marginBottom: 12 },
  modalTitle:      { fontSize: 18, fontWeight: "700", textAlign: "center", marginBottom: 8 },
  modalBody:       { fontSize: 14, textAlign: "center", lineHeight: 20, marginBottom: 16 },
  progressRow:     { width: "100%", borderRadius: 10, padding: 12, marginBottom: 16, gap: 8 },
  progressText:    { fontSize: 12, textAlign: "center" },
  progressTrack:   { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill:    { height: "100%", borderRadius: 3 },
  premiumBtn:      { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 13, paddingHorizontal: 24, borderRadius: 14, marginBottom: 12 },
  premiumBtnText:  { color: "#fff", fontSize: 15, fontWeight: "700" },
  closeBtn:        { paddingVertical: 8 },
  closeBtnText:    { fontSize: 14 },
});
