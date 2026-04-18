import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useNetworkStore } from "@/store/useNetworkStore";

export default function ChangeEmailScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { user, updateEmail } = useAuthStore();

  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim());
  const isUnchanged = newEmail.trim().toLowerCase() === user?.email?.toLowerCase();
  const canSubmit = isValidEmail && !isUnchanged && !loading;

  const handleSave = async () => {
    if (!canSubmit) return;
    if (useNetworkStore.getState().isOnline === false) {
      Alert.alert(t("common.offline_title"), t("common.offline_body"));
      return;
    }
    setLoading(true);
    const res = await updateEmail(newEmail.trim());
    setLoading(false);
    if (res.success) {
      setSuccess(true);
    } else {
      Alert.alert(t("common.error"), res.error ?? t("profile.email_update_error"));
    }
  };

  if (success) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={[s.header, { borderBottomColor: colors.divider }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: colors.text }]}>{t("profile.change_email")}</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={s.successContainer}>
          <View style={[s.successIcon, { backgroundColor: colors.primary + "18" }]}>
            <Ionicons name="mail-open-outline" size={48} color={colors.primary} />
          </View>
          <Text style={[s.successTitle, { color: colors.text }]}>{t("common.ok")}</Text>
          <Text style={[s.successBody, { color: colors.textSecondary }]}>
            {t("profile.email_sent")}
          </Text>
          <Text style={[s.successNote, { color: colors.textTertiary }]}>
            {t("profile.email_confirmation_note")}
          </Text>
          <TouchableOpacity
            style={[s.successBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
          >
            <Text style={s.successBtnText}>{t("common.done")}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {/* Header */}
        <View style={[s.header, { borderBottomColor: colors.divider }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: colors.text }]}>{t("profile.change_email")}</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Current email card */}
          <View style={[s.currentCard, { backgroundColor: colors.cardBackground }]}>
            <View style={[s.currentIconBox, { backgroundColor: colors.primary + "18" }]}>
              <Ionicons name="mail-outline" size={20} color={colors.primary} />
            </View>
            <View style={s.currentTexts}>
              <Text style={[s.currentLabel, { color: colors.textSecondary }]}>
                {t("settings.account")}
              </Text>
              <Text style={[s.currentEmail, { color: colors.text }]} numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
          </View>

          {/* Input section */}
          <View style={[s.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>
              {t("profile.new_email")}
            </Text>
            <View
              style={[
                s.inputRow,
                {
                  backgroundColor: colors.background,
                  borderColor: newEmail.length > 0 && !isValidEmail ? colors.error : colors.border,
                },
              ]}
            >
              <Ionicons name="at-outline" size={18} color={colors.textTertiary} style={{ marginRight: 8 }} />
              <TextInput
                ref={inputRef}
                style={[s.input, { color: colors.text }]}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="yeni@email.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              {newEmail.length > 0 && (
                <TouchableOpacity onPress={() => setNewEmail("")} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>

            {isUnchanged && newEmail.length > 0 && (
              <View style={s.hintRow}>
                <Ionicons name="information-circle-outline" size={14} color={colors.warning} />
                <Text style={[s.hintText, { color: colors.warning }]}>
                  Yeni e-posta mevcut adresle aynı.
                </Text>
              </View>
            )}

            {/* Info note */}
            <View style={[s.noteBox, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
              <Text style={[s.noteText, { color: colors.primary }]}>
                {t("profile.email_confirmation_note")}
              </Text>
            </View>
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[s.saveBtn, { backgroundColor: colors.primary }, !canSubmit && s.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={s.saveBtnText}>{t("profile.save_changes")}</Text>
              </>
            )}
          </TouchableOpacity>
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
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  scroll: { padding: 20, gap: 16 },

  currentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  currentIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  currentTexts: { flex: 1 },
  currentLabel: { fontSize: 12, marginBottom: 3 },
  currentEmail: { fontSize: 15, fontWeight: "600" },

  card: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldLabel: { fontSize: 13, fontWeight: "500", marginBottom: 2 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  input: { flex: 1, fontSize: 15 },
  hintRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  hintText: { fontSize: 12 },
  noteBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  noteText: { flex: 1, fontSize: 12, lineHeight: 18 },

  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  // Success state
  successContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  successIcon: { width: 88, height: 88, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  successTitle: { fontSize: 24, fontWeight: "800" },
  successBody: { fontSize: 16, textAlign: "center", lineHeight: 24 },
  successNote: { fontSize: 13, textAlign: "center", lineHeight: 20, marginTop: -4 },
  successBtn: { marginTop: 8, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 14 },
  successBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
