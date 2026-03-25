import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import type { ThemeColors } from "@/providers/ThemeProvider";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useI18n } from "@/providers/I18nProvider";
import { MainStackParamList, SupportedLanguage } from "@/types";
import { TimePicker, LangPicker } from "@/components/SettingsPicker";
import {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelDailyReminder,
  parseReminderTime,
} from "@/services/notifications";

const DAILY_GOAL_OPTIONS = [5, 10, 20, 30];

function SectionTitle({ label, colors }: { label: string; colors: ThemeColors }) {
  return (
    <Text style={[sStyles.sectionTitle, { color: colors.textSecondary }]}>{label}</Text>
  );
}

function SettingRow({
  icon,
  label,
  children,
  colors,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
  colors: ThemeColors;
}) {
  return (
    <View style={[sStyles.row, { borderBottomColor: colors.divider }]}>
      <View style={sStyles.rowLeft}>
        <Text style={sStyles.rowIcon}>{icon}</Text>
        <Text style={[sStyles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <View style={sStyles.rowRight}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { colors, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { changeLanguage } = useI18n();
  const {
    uiLanguage,
    targetLanguage,
    dailyGoal,
    notifications,
    reminderTime,
    setUILanguage,
    setTargetLanguage,
    setTheme,
    setDailyGoal,
    setNotifications,
    setReminderTime,
  } = useSettingsStore();
  const { user, signOut } = useAuthStore();

  const handleUILanguageChange = async (lang: SupportedLanguage) => {
    await changeLanguage(lang);
  };

  const handleTargetLanguageChange = async (lang: SupportedLanguage) => {
    await setTargetLanguage(lang);
  };

  const handleThemeToggle = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
    toggleTheme();
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(t("settings.notifications"), t("settings.notif_permission_denied"));
        return;
      }
      const { hour, minute } = parseReminderTime(reminderTime);
      await scheduleDailyReminder(hour, minute, t("settings.notif_title"), t("settings.notif_body"));
      setNotifications(true);
    } else {
      await cancelDailyReminder();
      setNotifications(false);
    }
  };

  const handleReminderTimeChange = async (time: string) => {
    await setReminderTime(time);
    if (notifications) {
      const { hour, minute } = parseReminderTime(time);
      await scheduleDailyReminder(hour, minute, t("settings.notif_title"), t("settings.notif_body"));
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t("settings.delete_account"),
      t("settings.delete_account_warning"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: () => {
            signOut();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t("settings.title")}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Dil Ayarları ─────────────────────────────── */}
        <SectionTitle label={t("settings.ui_language").toUpperCase()} colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={[sStyles.row, { borderBottomColor: colors.divider }]}>
            <View style={sStyles.rowLeft}>
              <Text style={sStyles.rowIcon}>🌐</Text>
              <Text style={[sStyles.rowLabel, { color: colors.text }]}>
                {t("settings.ui_language")}
              </Text>
            </View>
            <LangPicker
              value={uiLanguage}
              onChange={handleUILanguageChange}
              colors={colors}
            />
          </View>
          <View style={[sStyles.row, { borderBottomColor: "transparent" }]}>
            <View style={sStyles.rowLeft}>
              <Text style={sStyles.rowIcon}>🎯</Text>
              <Text style={[sStyles.rowLabel, { color: colors.text }]}>
                {t("settings.target_language")}
              </Text>
            </View>
            <LangPicker
              value={targetLanguage}
              onChange={handleTargetLanguageChange}
              colors={colors}
            />
          </View>
        </View>

        {/* ── Görünüm ───────────────────────────────────── */}
        <SectionTitle label={t("settings.theme").toUpperCase()} colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <SettingRow icon="🌙" label={t("settings.dark")} colors={colors}>
            <Switch
              value={isDark}
              onValueChange={handleThemeToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </SettingRow>
        </View>

        {/* ── Hedef ─────────────────────────────────────── */}
        <SectionTitle label={t("settings.daily_goal").toUpperCase()} colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={[sStyles.row, { borderBottomColor: "transparent" }]}>
            <View style={sStyles.rowLeft}>
              <Text style={sStyles.rowIcon}>📅</Text>
              <Text style={[sStyles.rowLabel, { color: colors.text }]}>
                {t("settings.daily_goal")}
              </Text>
            </View>
            <View style={sStyles.goalChips}>
              {DAILY_GOAL_OPTIONS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    sStyles.goalChip,
                    {
                      backgroundColor: dailyGoal === g ? colors.primary : colors.backgroundSecondary,
                      borderColor: dailyGoal === g ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setDailyGoal(g)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      sStyles.goalChipText,
                      { color: dailyGoal === g ? "#fff" : colors.textSecondary },
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ── Bildirimler ───────────────────────────────── */}
        <SectionTitle label={t("settings.notifications").toUpperCase()} colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={[sStyles.row, { borderBottomColor: notifications ? colors.divider : "transparent" }]}>
            <View style={sStyles.rowLeft}>
              <Text style={sStyles.rowIcon}>🔔</Text>
              <Text style={[sStyles.rowLabel, { color: colors.text }]}>
                {t("settings.notifications")}
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          {notifications && (
            <View style={[sStyles.row, { borderBottomColor: "transparent" }]}>
              <View style={sStyles.rowLeft}>
                <Text style={sStyles.rowIcon}>🕐</Text>
                <Text style={[sStyles.rowLabel, { color: colors.text }]}>
                  {t("settings.reminder_time")}
                </Text>
              </View>
              <View style={sStyles.rowRight}>
                <TimePicker
                  value={reminderTime}
                  onChange={handleReminderTimeChange}
                  colors={colors}
                />
              </View>
            </View>
          )}
        </View>

        {/* ── Hesap ─────────────────────────────────────── */}
        <SectionTitle label={t("settings.account").toUpperCase()} colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={[sStyles.row, { borderBottomColor: colors.divider }]}>
            <View style={sStyles.rowLeft}>
              <Text style={sStyles.rowIcon}>✉️</Text>
              <Text style={[sStyles.rowLabel, { color: colors.text }]}>Email</Text>
            </View>
            <Text style={[sStyles.rowValue, { color: colors.textSecondary }]} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
          <TouchableOpacity
            style={[sStyles.row, { borderBottomColor: "transparent" }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
          >
            <View style={sStyles.rowLeft}>
              <Text style={sStyles.rowIcon}>🗑️</Text>
              <Text style={[sStyles.rowLabel, { color: colors.error }]}>
                {t("settings.delete_account")}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* ── Hakkında ──────────────────────────────────── */}
        <SectionTitle label={t("settings.about").toUpperCase()} colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <View style={[sStyles.row, { borderBottomColor: "transparent" }]}>
            <View style={sStyles.rowLeft}>
              <Text style={sStyles.rowIcon}>ℹ️</Text>
              <Text style={[sStyles.rowLabel, { color: colors.text }]}>
                {t("settings.version")}
              </Text>
            </View>
            <Text style={[sStyles.rowValue, { color: colors.textSecondary }]}>1.0.0</Text>
          </View>
        </View>

        <View style={{ height: 32 }} />
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
  scroll: { padding: 16 },
  section: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
});

const sStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 6,
    marginTop: 14,
    marginLeft: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  rowIcon: { fontSize: 18 },
  rowLabel: { fontSize: 15 },
  rowRight: { flexShrink: 0 },
  rowValue: { fontSize: 13, maxWidth: 160 },
  goalChips: { flexDirection: "row", gap: 6 },
  goalChip: {
    width: 36,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  goalChipText: { fontSize: 12, fontWeight: "600" },
});
