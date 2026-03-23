import React, { useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { GradientView } from "@/components/GradientView";
import { HomeStackParamList, MainStackParamList } from "@/types";

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList>,
  NativeStackNavigationProp<MainStackParamList>
>;

const { width } = Dimensions.get("window");
const CARD_GAP = 12;
const CARD_WIDTH = (width - 32 - CARD_GAP) / 2;

interface ActivityCard {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  titleKey: string;
  descKey: string;
  onPress: (nav: Nav) => void;
}

// ─── Hero Header ──────────────────────────────────────────────────────────────

function HeroHeader() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const { stats, progress, loadProgress } = useProgressStore();
  const { dailyGoal } = useSettingsStore();

  useEffect(() => {
    loadProgress();
  }, []);

  const todayLearned = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return progress.filter(
      (p) => p.state === "learned" && p.learned_at?.startsWith(today),
    ).length;
  }, [progress]);

  const hour = new Date().getHours();
  const greetingKey =
    hour < 12
      ? "home.greeting_morning"
      : hour < 18
        ? "home.greeting_afternoon"
        : "home.greeting_evening";
  const greetingEmoji = hour < 12 ? "🌅" : hour < 18 ? "☀️" : "🌙";

  const firstName = user?.display_name?.split(" ")[0] ?? "";
  const goalProgress = Math.min(todayLearned / Math.max(dailyGoal, 1), 1);
  const progressPct = `${Math.round(goalProgress * 100)}%`;

  const cardGradient: [string, string] = isDark
    ? ["rgba(77,163,255,0.10)", "rgba(139,92,246,0.10)"]
    : ["rgba(77,163,255,0.07)", "rgba(139,92,246,0.07)"];

  const borderColor = isDark ? "rgba(139,92,246,0.18)" : "rgba(77,163,255,0.15)";
  const progressBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  return (
    <View
      style={[
        heroStyles.card,
        {
          borderColor,
          shadowColor: isDark ? "#8B5CF6" : "#4DA3FF",
        },
      ]}
    >
      <GradientView
        colors={cardGradient}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Greeting row */}
      <View style={heroStyles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={[heroStyles.greeting, { color: colors.text }]}>
            {greetingEmoji} {t(greetingKey)}{firstName ? `, ${firstName}` : ""}!
          </Text>
          <Text style={[heroStyles.subtitle, { color: colors.textTertiary }]}>
            {todayLearned >= dailyGoal
              ? t("home.goal_done")
              : t("home.goal_hint")}
          </Text>
        </View>

        {/* Streak badge */}
        {stats.currentStreak > 0 && (
          <View style={[heroStyles.streakBadge, { backgroundColor: isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.12)" }]}>
            <Text style={heroStyles.streakFire}>🔥</Text>
            <Text style={[heroStyles.streakCount, { color: "#F59E0B" }]}>
              {stats.currentStreak}
            </Text>
            <Text style={[heroStyles.streakLabel, { color: "#F59E0B" }]}>
              {t("home.streak_days")}
            </Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      <View style={heroStyles.progressSection}>
        <View style={heroStyles.progressLabelRow}>
          <Text style={[heroStyles.progressLabel, { color: colors.textSecondary }]}>
            {t("home.daily_goal")}
          </Text>
          <Text style={[heroStyles.progressCount, { color: colors.textSecondary }]}>
            <Text style={{ color: colors.primary, fontWeight: "700" }}>{todayLearned}</Text>
            {" / "}{dailyGoal}
          </Text>
        </View>
        <View style={[heroStyles.progressTrack, { backgroundColor: progressBg }]}>
          <GradientView
            colors={["#4DA3FF", "#49C98A"]}
            style={[heroStyles.progressFill, { width: progressPct as any }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </View>
    </View>
  );
}

const heroStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    padding: 18,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 19,
    fontWeight: "700",
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  streakFire: { fontSize: 14 },
  streakCount: { fontSize: 16, fontWeight: "700" },
  streakLabel: { fontSize: 11, fontWeight: "500" },
  progressSection: {
    gap: 7,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: { fontSize: 12, fontWeight: "500" },
  progressCount: { fontSize: 12 },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 7,
    borderRadius: 4,
  },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();

  const cards: ActivityCard[] = [
    {
      icon: "book-outline",
      iconColor: "#4DA3FF",
      titleKey: "home.card_learn_title",
      descKey: "home.card_learn_desc",
      onPress: (nav) => nav.navigate("Learn", { initialTab: "study" }),
    },
    {
      icon: "school-outline",
      iconColor: "#F59E0B",
      titleKey: "home.card_quiz_title",
      descKey: "home.card_quiz_desc",
      onPress: (nav) => nav.navigate("Quiz"),
    },
    {
      icon: "headset-outline",
      iconColor: "#49C98A",
      titleKey: "home.card_listen_title",
      descKey: "home.card_listen_desc",
      onPress: (nav) => nav.navigate("Learn", { initialTab: "listening" }),
    },
    {
      icon: "newspaper-outline",
      iconColor: "#E85D5D",
      titleKey: "home.card_read_title",
      descKey: "home.card_read_desc",
      onPress: (nav) => nav.navigate("Reading"),
    },
    {
      icon: "play-circle-outline",
      iconColor: "#8B5CF6",
      titleKey: "home.card_auto_title",
      descKey: "home.card_auto_desc",
      onPress: (nav) => nav.navigate("AutoMode"),
    },
    {
      icon: "grid-outline",
      iconColor: "#F97316",
      titleKey: "home.card_explore_title",
      descKey: "home.card_explore_desc",
      onPress: (nav) => nav.navigate("CategoryBrowser"),
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>{t("app_name")}</Text>

        <HeroHeader />

        <View style={styles.grid}>
          {cards.map((card, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: colors.cardBackground }]}
              onPress={() => card.onPress(navigation)}
              activeOpacity={0.75}
            >
              <View style={styles.cardInner}>
                <View style={[styles.iconCircle, { backgroundColor: card.iconColor + "1A" }]}>
                  <Ionicons name={card.icon} size={28} color={card.iconColor} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t(card.titleKey)}</Text>
                <Text style={[styles.cardDesc, { color: colors.textTertiary }]}>
                  {t(card.descKey)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  cardInner: {
    alignItems: "center",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    textAlign: "center",
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
});
