import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useDialogStore } from "@/store/useDialogStore";
import { HomeStackParamList } from "@/types";

type Nav = NativeStackNavigationProp<HomeStackParamList>;

const ACCENT  = "#06B6D4";
const GOLD    = "#F59E0B";
const PURPLE  = "#8B5CF6";

export default function DialogCompleteScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();
  const isPremium = user?.is_premium ?? false;

  const {
    turns,
    sessionCorrectFirstTry,
    sessionWrongAttempts,
    activeScenario,
    selectedCategory,
    selectedDifficulty,
    startSession,
  } = useDialogStore();

  const totalTurns      = turns.length;
  const accuracy        = totalTurns > 0 ? Math.round((sessionCorrectFirstTry / totalTurns) * 100) : 0;
  const isPerfect       = sessionCorrectFirstTry === totalTurns && sessionWrongAttempts === 0;

  const emoji = isPerfect ? "🏆" : accuracy >= 70 ? "⭐" : "💪";

  const handlePlayAgain = async () => {
    if (!user || !selectedCategory || !selectedDifficulty) {
      navigation.navigate("DialogSetup");
      return;
    }
    const ok = await startSession(user.id, isPremium);
    if (ok) {
      navigation.replace("DialogPlay");
    } else {
      // Limit hit or no scenarios — go back to setup
      navigation.navigate("DialogSetup");
    }
  };

  const handleBackHome = () => {
    navigation.navigate("HomeMain");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      <View style={styles.inner}>
        {/* Trophy / emoji */}
        <Text style={styles.emoji}>{emoji}</Text>

        <Text style={[styles.title, { color: colors.text }]}>
          {t("dialog.complete.title")}
        </Text>

        {/* Stats grid */}
        <View style={[styles.statsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <StatRow
            icon="checkmark-circle-outline"
            iconColor={ACCENT}
            label={t("dialog.complete.first_try_label")}
            value={`${sessionCorrectFirstTry} / ${totalTurns}`}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatRow
            icon="analytics-outline"
            iconColor={GOLD}
            label={t("dialog.complete.accuracy_label")}
            value={`${accuracy}%`}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatRow
            icon="close-circle-outline"
            iconColor="#EF4444"
            label={t("dialog.complete.wrong_attempts_label")}
            value={`${sessionWrongAttempts}`}
            colors={colors}
          />
        </View>

        {/* Score badge */}
        <View style={[styles.scoreBadge, { backgroundColor: ACCENT + "18" }]}>
          <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>
            {t("dialog.complete.score_label")}
          </Text>
          <Text style={[styles.scoreValue, { color: ACCENT }]}>
            {sessionCorrectFirstTry}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: PURPLE }]}
          onPress={handlePlayAgain}
          activeOpacity={0.85}
        >
          <Ionicons name="refresh-outline" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>{t("dialog.complete.play_again")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
          onPress={handleBackHome}
          activeOpacity={0.75}
        >
          <Ionicons name="home-outline" size={18} color={colors.text} />
          <Text style={[styles.secondaryBtnText, { color: colors.text }]}>
            {t("dialog.complete.back_home")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StatRow({
  icon,
  iconColor,
  label,
  value,
  colors,
}: {
  icon: any;
  iconColor: string;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={styles.statRow}>
      <View style={styles.statLeft}>
        <Ionicons name={icon} size={20} color={iconColor} />
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  inner:          { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, gap: 20 },

  emoji:          { fontSize: 64, marginBottom: 4 },
  title:          { fontSize: 26, fontWeight: "800", textAlign: "center" },

  statsCard:      { width: "100%", borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  statRow:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 14 },
  statLeft:       { flexDirection: "row", alignItems: "center", gap: 10 },
  statLabel:      { fontSize: 14 },
  statValue:      { fontSize: 16, fontWeight: "700" },
  divider:        { height: StyleSheet.hairlineWidth },

  scoreBadge:     { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 20, alignItems: "center" },
  scoreLabel:     { fontSize: 13, marginBottom: 4 },
  scoreValue:     { fontSize: 36, fontWeight: "900" },

  buttons:        { paddingHorizontal: 24, paddingBottom: 24, gap: 12 },
  primaryBtn:     { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 16 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryBtn:   { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5 },
  secondaryBtnText: { fontSize: 16, fontWeight: "600" },
});
