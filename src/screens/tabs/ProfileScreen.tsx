import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePremium } from "@/hooks/usePremium";
import { MainStackParamList } from "@/types";
import PDFExportModal from "@/components/PDFExportModal";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { user, signOut } = useAuthStore();
  const { sentences, loadSentences } = useSentenceStore();
  const { stats, progressMap, progress, loadProgress } = useProgressStore();
  const { dailyGoal } = useSettingsStore();
  const { isPremium } = usePremium();
  const [pdfModalVisible, setPdfModalVisible] = useState(false);

  useEffect(() => {
    loadSentences();
    loadProgress();
  }, []);

  const totalStudied = Object.keys(progressMap).length;
  const learnedCount = Object.values(progressMap).filter((s) => s === "learned").length;
  const learningCount = Object.values(progressMap).filter((s) => s === "learning").length;
  const today = new Date().toISOString().split("T")[0];
  const todayLearned = progress.filter(
    (p) => p.state === "learned" && p.learned_at?.startsWith(today),
  ).length;
  const dailyGoalProgress = Math.min(todayLearned / dailyGoal, 1);

  const initials = (user?.full_name || user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = () => {
    Alert.alert(
      t("profile.sign_out"),
      t("profile.confirm_signout"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("common.yes"), style: "destructive", onPress: () => signOut() },
      ],
    );
  };

  const menuItems: Array<{
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    color?: string;
    badge?: string;
  }> = [
    {
      icon: "grid-outline",
      label: t("sentences.preset_sentences"),
      onPress: () => navigation.navigate("CategoryBrowser"),
    },
    {
      icon: "document-text-outline",
      label: t("profile.export_pdf"),
      onPress: () => {
        if (!isPremium) {
          Alert.alert(t("common.premium_badge"), t("add_sentence.upgrade_to_add_more"));
          return;
        }
        setPdfModalVisible(true);
      },
      badge: isPremium ? undefined : t("common.premium_badge"),
    },
    {
      icon: "settings-outline",
      label: t("profile.settings"),
      onPress: () => navigation.navigate("Settings"),
    },
    ...(!isPremium
      ? [
          {
            icon: "star-outline" as keyof typeof Ionicons.glyphMap,
            label: t("premium.title"),
            onPress: () => navigation.navigate("Paywall"),
            color: colors.premiumAccent,
            badge: "✨",
          },
        ]
      : []),
    {
      icon: "log-out-outline",
      label: t("profile.sign_out"),
      onPress: handleSignOut,
      color: colors.error,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={[styles.screenTitle, { color: colors.text }]}>{t("profile.title")}</Text>

        {/* Avatar + user info */}
        <View style={[styles.userCard, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {user?.full_name || t("profile.title")}
              </Text>
              {isPremium && (
                <View style={[styles.premiumBadge, { backgroundColor: colors.premiumAccent + "22" }]}>
                  <Text style={[styles.premiumBadgeText, { color: colors.premiumAccent }]}>
                    ✨ {t("common.premium_badge")}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Streak + Daily Goal */}
        <View style={styles.streakRow}>
          <View style={[styles.streakCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={[styles.streakNumber, { color: colors.text }]}>
              {stats.currentStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: colors.textSecondary }]}>
              {t("profile.streak")}
            </Text>
          </View>

          <View style={[styles.goalCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.goalTitle, { color: colors.text }]}>
              {t("profile.today_goal")}
            </Text>
            <Text style={[styles.goalProgress, { color: colors.textSecondary }]}>
              {todayLearned}/{dailyGoal}
            </Text>
            <View style={[styles.goalTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.goalFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${dailyGoalProgress * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            { label: t("profile.sentences_studied"), value: totalStudied, icon: "📖" },
            { label: t("profile.sentences_learned"), value: learnedCount, icon: "✅" },
            {
              label: t("profile.quiz_accuracy"),
              value: `${Math.round(stats.quizAccuracy)}%`,
              icon: "🎯",
            },
            { label: t("profile.learning"), value: learningCount, icon: "📝" },
          ].map((stat, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={2}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Menu */}
        <View style={[styles.menuCard, { backgroundColor: colors.cardBackground }]}>
          {menuItems.map((item, idx) => (
            <View key={idx}>
              {idx > 0 && (
                <View style={[styles.menuDivider, { backgroundColor: colors.divider }]} />
              )}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={item.color ?? colors.text}
                  />
                  <Text
                    style={[
                      styles.menuItemLabel,
                      { color: item.color ?? colors.text },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.badge && (
                    <View
                      style={[styles.menuBadge, { backgroundColor: colors.premiumAccent + "22" }]}
                    >
                      <Text
                        style={[styles.menuBadgeText, { color: colors.premiumAccent }]}
                      >
                        {item.badge}
                      </Text>
                    </View>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <PDFExportModal visible={pdfModalVisible} onClose={() => setPdfModalVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, gap: 0 },
  screenTitle: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    gap: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  userName: { fontSize: 17, fontWeight: "600", flexShrink: 1 },
  premiumBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  premiumBadgeText: { fontSize: 11, fontWeight: "700" },
  userEmail: { fontSize: 13 },
  streakRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  streakCard: {
    width: 110,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  streakIcon: { fontSize: 28 },
  streakNumber: { fontSize: 28, fontWeight: "800" },
  streakLabel: { fontSize: 12 },
  goalCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  goalTitle: { fontSize: 13, fontWeight: "600" },
  goalProgress: { fontSize: 22, fontWeight: "700" },
  goalTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  goalFill: { height: 6, borderRadius: 3 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    width: "47%",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 11, textAlign: "center" },
  menuCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  menuItemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuItemLabel: { fontSize: 15, fontWeight: "500" },
  menuBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  menuBadgeText: { fontSize: 11, fontWeight: "700" },
  menuDivider: { height: StyleSheet.hairlineWidth, marginLeft: 50 },
});
