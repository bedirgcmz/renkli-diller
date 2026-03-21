import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePremium } from "@/hooks/usePremium";
import { MainStackParamList } from "@/types";
import PDFExportModal from "@/components/PDFExportModal";
import ActivityChart from "@/components/ActivityChart";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { user, signOut, uploadAvatar, removeAvatar, updateProfile } = useAuthStore();
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.display_name || "");
  const [nameSaving, setNameSaving] = useState(false);
  const nameInputRef = useRef<TextInput>(null);
  const { sentences, loadSentences } = useSentenceStore();
  const { stats, progressMap, progress, loadProgress } = useProgressStore();
  const { dailyGoal } = useSettingsStore();
  const { isPremium } = usePremium();
  const [pdfModalVisible, setPdfModalVisible] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);

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

  const initials = (user?.display_name || user?.email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const startEditName = () => {
    setNameValue(user?.display_name || "");
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const saveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === user?.display_name) {
      setEditingName(false);
      return;
    }
    setNameSaving(true);
    const res = await updateProfile({ display_name: trimmed });
    setNameSaving(false);
    setEditingName(false);
    if (!res.success) Alert.alert(t("common.error"), res.error);
  };

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

  const handleAvatarPress = () => setPhotoSheetVisible(true);

  const pickFromCamera = async () => {
    setPhotoSheetVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled) await doUpload(result.assets[0].uri, result.assets[0].base64 ?? undefined);
  };

  const pickFromGallery = async () => {
    setPhotoSheetVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled) await doUpload(result.assets[0].uri, result.assets[0].base64 ?? undefined);
  };

  const handleRemovePhoto = () => {
    setPhotoSheetVisible(false);
    Alert.alert(t("profile.photo_remove"), t("profile.photo_remove_confirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.yes"),
        style: "destructive",
        onPress: async () => {
          setAvatarUploading(true);
          const res = await removeAvatar();
          setAvatarUploading(false);
          if (res.success) {
            setAvatarLoadError(false);
            setAvatarKey(0);
          } else {
            Alert.alert(t("common.error"), res.error ?? t("profile.photo_upload_error"));
          }
        },
      },
    ]);
  };

  const doUpload = async (uri: string, base64?: string) => {
    setAvatarUploading(true);
    setAvatarLoadError(false);
    const res = await uploadAvatar(uri, base64);
    setAvatarUploading(false);
    if (res.success) {
      setAvatarKey((k) => k + 1);
    } else {
      Alert.alert(t("common.error"), res.error ?? t("profile.photo_upload_error"));
    }
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
      icon: "play-circle-outline",
      label: t("profile.auto_mode"),
      onPress: () => navigation.navigate("AutoMode"),
    },
    {
      icon: "mail-outline",
      label: t("profile.change_email"),
      onPress: () => navigation.navigate("ChangeEmail"),
    },
    {
      icon: "lock-closed-outline",
      label: t("profile.change_password"),
      onPress: () => navigation.navigate("ChangePassword"),
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
          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: colors.primary }]}
            onPress={handleAvatarPress}
            activeOpacity={0.8}
          >
            {user?.avatar_url && !avatarLoadError ? (
              <Image
                source={{ uri: avatarKey > 0 ? `${user.avatar_url}?v=${avatarKey}` : user.avatar_url }}
                style={styles.avatarImage}
                onError={() => setAvatarLoadError(true)}
              />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
            {avatarUploading ? (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#fff" size="small" />
              </View>
            ) : (
              <View style={styles.avatarCameraIcon}>
                <Ionicons name="camera" size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              {editingName ? (
                <TextInput
                  ref={nameInputRef}
                  style={[styles.nameInput, { color: colors.text, borderBottomColor: colors.primary }]}
                  value={nameValue}
                  onChangeText={setNameValue}
                  onSubmitEditing={saveName}
                  returnKeyType="done"
                  autoCapitalize="words"
                  maxLength={40}
                />
              ) : (
                <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                  {user?.display_name || user?.email?.split("@")[0] || "—"}
                </Text>
              )}
              <TouchableOpacity onPress={editingName ? saveName : startEditName} hitSlop={10} disabled={nameSaving} style={styles.nameEditBtn}>
                {nameSaving ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons
                    name={editingName ? "checkmark-circle" : "pencil-outline"}
                    size={18}
                    color={editingName ? colors.primary : colors.textSecondary}
                  />
                )}
              </TouchableOpacity>
              {isPremium && !editingName && (
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
              value: stats.totalQuizQuestions > 0 ? `${Math.round(stats.quizAccuracy)}%` : "—",
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

        {/* Activity chart */}
        <ActivityChart progress={progress} />

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

      {/* Photo action sheet */}
      <Modal
        visible={photoSheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPhotoSheetVisible(false)}
      >
        <Pressable style={styles.sheetBackdrop} onPress={() => setPhotoSheetVisible(false)}>
          <Pressable style={[styles.sheet, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sheetTitle, { color: colors.textSecondary }]}>
              {t("profile.change_photo")}
            </Text>
            <TouchableOpacity style={styles.sheetItem} onPress={pickFromCamera}>
              <Ionicons name="camera-outline" size={22} color={colors.text} />
              <Text style={[styles.sheetItemText, { color: colors.text }]}>{t("profile.photo_camera")}</Text>
            </TouchableOpacity>
            <View style={[styles.sheetDivider, { backgroundColor: colors.divider }]} />
            <TouchableOpacity style={styles.sheetItem} onPress={pickFromGallery}>
              <Ionicons name="image-outline" size={22} color={colors.text} />
              <Text style={[styles.sheetItemText, { color: colors.text }]}>{t("profile.photo_gallery")}</Text>
            </TouchableOpacity>
            {!!user?.avatar_url && (
              <>
                <View style={[styles.sheetDivider, { backgroundColor: colors.divider }]} />
                <TouchableOpacity style={styles.sheetItem} onPress={handleRemovePhoto}>
                  <Ionicons name="trash-outline" size={22} color={colors.error} />
                  <Text style={[styles.sheetItemText, { color: colors.error }]}>{t("profile.photo_remove")}</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={[styles.sheetDivider, { backgroundColor: colors.divider }]} />
            <TouchableOpacity style={styles.sheetItem} onPress={() => setPhotoSheetVisible(false)}>
              <Text style={[styles.sheetItemText, { color: colors.textSecondary }]}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, gap: 0 },
  screenTitle: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
  nameInput: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    borderBottomWidth: 1.5,
    paddingBottom: 2,
  },
  nameEditBtn: { marginLeft: 6 },
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
  avatarImage: { width: 54, height: 54, borderRadius: 27 },
  avatarOverlay: {
    position: "absolute",
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#555",
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  userName: { fontSize: 17, fontWeight: "600", flex: 1 },
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
  sheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    paddingTop: 8,
  },
  sheetTitle: {
    textAlign: "center",
    fontSize: 13,
    paddingVertical: 12,
  },
  sheetDivider: { height: StyleSheet.hairlineWidth },
  sheetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sheetItemText: { fontSize: 16 },
});
