import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/hooks/useTheme";
import { useAchievementStore } from "@/store/useAchievementStore";
import { ACHIEVEMENTS } from "@/utils/achievements";

export default function AchievementsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { unlockedIds, unlockedDates } = useAchievementStore();

  const unlockedCount = unlockedIds.length;
  const total = ACHIEVEMENTS.length;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t("achievements.title")}
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Badge count */}
      <View style={[styles.badgeRow, { backgroundColor: colors.primary + "15" }]}>
        <Text style={styles.badgeIcon}>🏆</Text>
        <Text style={[styles.badgeText, { color: colors.primary }]}>
          {t("achievements.badge", { unlocked: unlockedCount, total })}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = unlockedIds.includes(achievement.id);
          const date = unlockedDates[achievement.id];

          return (
            <View
              key={achievement.id}
              style={[
                styles.card,
                {
                  backgroundColor: colors.cardBackground,
                  opacity: unlocked ? 1 : 0.5,
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: unlocked ? colors.primary + "20" : colors.border },
                ]}
              >
                <Text style={[styles.icon, !unlocked && styles.iconLocked]}>
                  {unlocked ? achievement.icon : "🔒"}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={[styles.title, { color: colors.text }]}>
                  {unlocked ? t(achievement.title_key) : "???"}
                </Text>
                <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                  {t(achievement.description_key)}
                </Text>
                {unlocked && date && (
                  <Text style={[styles.date, { color: colors.textTertiary }]}>
                    {t("achievements.unlocked_on", { date: formatDate(date) })}
                  </Text>
                )}
              </View>
              {unlocked && (
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              )}
            </View>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>
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
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  badgeIcon: { fontSize: 18 },
  badgeText: { fontSize: 14, fontWeight: "700" },
  scroll: { padding: 16, gap: 10 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 24 },
  iconLocked: { opacity: 0.5 },
  info: { flex: 1 },
  title: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  description: { fontSize: 12, lineHeight: 17 },
  date: { fontSize: 11, marginTop: 4 },
});
