import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuthStore";

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { user, updateEmail, updatePassword } = useAuthStore();

  const [newEmail, setNewEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleEmailChange = async () => {
    const trimmed = newEmail.trim();
    if (!trimmed) return;
    setEmailLoading(true);
    const res = await updateEmail(trimmed);
    setEmailLoading(false);
    if (res.success) {
      Alert.alert(t("common.ok"), t("profile.email_sent"));
      setNewEmail("");
    } else {
      Alert.alert(t("common.error"), res.error ?? t("profile.email_update_error"));
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      Alert.alert(t("common.error"), t("profile.password_too_short"));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t("common.error"), t("profile.password_mismatch"));
      return;
    }
    setPasswordLoading(true);
    const res = await updatePassword(newPassword);
    setPasswordLoading(false);
    if (res.success) {
      Alert.alert(t("common.ok"), t("profile.password_updated"));
      setNewPassword("");
      setConfirmPassword("");
    } else {
      Alert.alert(t("common.error"), res.error ?? t("profile.password_update_error"));
    }
  };

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={[s.header, { borderBottomColor: colors.divider }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: colors.text }]}>
            {t("profile.edit_profile")}
          </Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Current email info */}
          <View style={[s.infoCard, { backgroundColor: colors.cardBackground }]}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
            <Text style={[s.infoText, { color: colors.textSecondary }]}>{user?.email}</Text>
          </View>

          {/* Change Email */}
          <View style={[s.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[s.sectionTitle, { color: colors.text }]}>
              {t("profile.change_email")}
            </Text>
            <TextInput
              style={[s.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder={t("profile.new_email")}
              placeholderTextColor={colors.textTertiary}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[s.button, { backgroundColor: colors.primary }, (!newEmail.trim() || emailLoading) && s.buttonDisabled]}
              onPress={handleEmailChange}
              disabled={!newEmail.trim() || emailLoading}
              activeOpacity={0.8}
            >
              <Text style={s.buttonText}>
                {emailLoading ? t("common.loading") : t("profile.save_changes")}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Change Password */}
          <View style={[s.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[s.sectionTitle, { color: colors.text }]}>
              {t("profile.change_password")}
            </Text>
            <View style={[s.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <TextInput
                style={[s.inputInner, { color: colors.text }]}
                placeholder={t("profile.new_password")}
                placeholderTextColor={colors.textTertiary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <View style={[s.inputRow, { borderColor: colors.border, backgroundColor: colors.background }]}>
              <TextInput
                style={[s.inputInner, { color: colors.text }]}
                placeholder={t("profile.confirm_new_password")}
                placeholderTextColor={colors.textTertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} hitSlop={8}>
                <Ionicons
                  name={showConfirm ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[s.button, { backgroundColor: colors.primary }, (!newPassword || !confirmPassword || passwordLoading) && s.buttonDisabled]}
              onPress={handlePasswordChange}
              disabled={!newPassword || !confirmPassword || passwordLoading}
              activeOpacity={0.8}
            >
              <Text style={s.buttonText}>
                {passwordLoading ? t("common.loading") : t("profile.save_changes")}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  scroll: { padding: 20, gap: 16 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    padding: 14,
  },
  infoText: { fontSize: 14 },
  section: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  inputInner: { flex: 1, fontSize: 15 },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.45 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
