import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useDialogStore } from "@/store/useDialogStore";
import { supabase } from "@/lib/supabase";
import { MainStackParamList } from "@/types";

type Nav = NativeStackNavigationProp<MainStackParamList>;

const PURPLE  = "#8B5CF6";
const ACCENT  = "#06B6D4";

const DIFFICULTY_COLORS: Record<number, string> = {
  1: "#10B981",
  2: "#F59E0B",
  3: "#EF4444",
};

interface LearnedEntry {
  scenarioId: string;
  title: string;
  categoryTitle: string;
  difficulty: number;
  totalSessions: number;
  bestAccuracy: number | null;
  learnedAt: string | null;
}

export default function LearnedDialogsScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const isPremium = user?.is_premium ?? false;

  const { startSession, categories, fetchCategories } = useDialogStore();

  const [entries, setEntries] = useState<LearnedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [replayingId, setReplayingId] = useState<string | null>(null);

  const lang = i18n.language?.slice(0, 2) ?? "en";
  const titleKey = `title_${lang}` as any;
  const categoryTitleKey = `title_${lang}` as any;

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Ensure categories are loaded for title lookup
      if (categories.length === 0) await fetchCategories();

      const { data } = await supabase
        .from("user_dialog_progress")
        .select(`
          scenario_id,
          total_completed_sessions,
          best_first_try_accuracy,
          learned_at,
          dialog_scenarios (
            id,
            title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt,
            difficulty,
            category_id,
            dialog_categories (
              title_tr, title_en, title_sv, title_de, title_es, title_fr, title_pt
            )
          )
        `)
        .eq("user_id", user.id)
        .eq("is_learned", true)
        .order("learned_at", { ascending: false });

      const mapped: LearnedEntry[] = (data ?? []).map((row: any) => {
        const sc = row.dialog_scenarios;
        const cat = sc?.dialog_categories;
        return {
          scenarioId: row.scenario_id,
          title: sc?.[titleKey] ?? sc?.title_en ?? "",
          categoryTitle: cat?.[categoryTitleKey] ?? cat?.title_en ?? "",
          difficulty: sc?.difficulty ?? 1,
          totalSessions: row.total_completed_sessions ?? 0,
          bestAccuracy: row.best_first_try_accuracy ?? null,
          learnedAt: row.learned_at,
        };
      });

      setEntries(mapped);
    } finally {
      setLoading(false);
    }
  }, [user, lang]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReplay = async (entry: LearnedEntry) => {
    if (!user) return;
    setReplayingId(entry.scenarioId);

    const ok = await startSession(user.id, isPremium, entry.scenarioId);
    setReplayingId(null);

    if (ok) {
      (navigation as any).navigate("Tabs", {
        screen: "Home",
        params: {
          screen: "DialogPlay",
        },
      });
      return;
    }

    const latestError = useDialogStore.getState().error;
    if (latestError === "no_scenarios") {
      Alert.alert(t("common.error"), t("dialog.setup.no_scenarios"));
    } else if (latestError === "invalid_scenario") {
      Alert.alert(t("common.error"), t("dialog.setup.start_failed"));
    } else if (latestError) {
      Alert.alert(t("common.error"), t("dialog.setup.start_failed"));
    }
  };

  const diffLabel = (d: number) =>
    t(`dialog.learned_dialogs.difficulty_${d}` as any);

  const renderItem = ({ item }: { item: LearnedEntry }) => (
    <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS[item.difficulty] + "20" }]}>
          <Text style={[styles.diffText, { color: DIFFICULTY_COLORS[item.difficulty] }]}>
            {diffLabel(item.difficulty)}
          </Text>
        </View>
        <Text style={[styles.categoryText, { color: colors.textSecondary }]}>
          {item.categoryTitle}
        </Text>
      </View>

      <Text style={[styles.scenarioTitle, { color: colors.text }]} numberOfLines={2}>
        {item.title}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Ionicons name="repeat-outline" size={13} color={colors.textTertiary} />
          <Text style={[styles.statChipText, { color: colors.textSecondary }]}>
            {t("dialog.learned_dialogs.played_count", { count: item.totalSessions })}
          </Text>
        </View>
        {item.bestAccuracy !== null && (
          <View style={styles.statChip}>
            <Ionicons name="trophy-outline" size={13} color={ACCENT} />
            <Text style={[styles.statChipText, { color: ACCENT }]}>
              {t("dialog.learned_dialogs.best_accuracy", { accuracy: Math.round(item.bestAccuracy) })}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.replayBtn, { backgroundColor: PURPLE }]}
        onPress={() => handleReplay(item)}
        activeOpacity={0.85}
        disabled={replayingId !== null}
      >
        {replayingId === item.scenarioId ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="refresh-outline" size={15} color="#fff" />
            <Text style={styles.replayBtnText}>{t("dialog.learned_dialogs.replay")}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("dialog.learned_dialogs.title")}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PURPLE} />
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🎓</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            {t("dialog.learned_dialogs.empty_title")}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            {t("dialog.learned_dialogs.empty_subtitle")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.scenarioId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  header:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle:  { fontSize: 18, fontWeight: "700" },

  centered:     { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 12 },
  emptyEmoji:   { fontSize: 52, marginBottom: 4 },
  emptyTitle:   { fontSize: 18, fontWeight: "700", textAlign: "center" },
  emptySubtitle:{ fontSize: 14, textAlign: "center", lineHeight: 22 },

  list:         { padding: 16, gap: 12 },

  card:         { borderRadius: 18, borderWidth: 1, padding: 16, gap: 10 },
  cardHeader:   { flexDirection: "row", alignItems: "center", gap: 8 },
  diffBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  diffText:     { fontSize: 11, fontWeight: "700" },
  categoryText: { fontSize: 12, flex: 1 },
  scenarioTitle:{ fontSize: 15, fontWeight: "700", lineHeight: 21 },

  statsRow:     { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  statChip:     { flexDirection: "row", alignItems: "center", gap: 4 },
  statChipText: { fontSize: 12 },

  replayBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, marginTop: 2 },
  replayBtnText:{ color: "#fff", fontSize: 14, fontWeight: "700" },
});
