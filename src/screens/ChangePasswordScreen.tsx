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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuthStore";

type StrengthLevel = "weak" | "medium" | "strong";

function getPasswordStrength(password: string): StrengthLevel {
  if (password.length === 0) return "weak";
  const hasMin = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const score = [hasMin, hasNumber, hasUpper].filter(Boolean).length;
  if (score === 3) return "strong";
  if (score === 2) return "medium";
  return "weak";
}

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { verifyAndUpdatePassword } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const newPassRef = useRef<TextInput>(null);
  const confirmPassRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);

  const strength = getPasswordStrength(newPassword);
  const strengthColor =
    strength === "strong"
      ? colors.success ?? "#22c55e"
      : strength === "medium"
      ? colors.warning ?? "#f59e0b"
      : colors.error ?? "#ef4444";

  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasUpper = /[A-Z]/.test(newPassword);

  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length > 0 &&
    hasMinLength &&
    passwordsMatch &&
    confirmPassword.length > 0 &&
    !loading;

  const scrollToBottomField = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 80);
  };

  const handleSave = async () => {
    if (!canSubmit) return;
    if (!passwordsMatch) {
      Alert.alert(t("common.error"), t("profile.password_mismatch"));
      return;
    }
    setLoading(true);
    const res = await verifyAndUpdatePassword(currentPassword, newPassword);
    setLoading(false);
    if (res.success) {
      setSuccess(true);
    } else if (res.wrongPassword) {
      Alert.alert(t("common.error"), t("profile.wrong_password"));
    } else {
      Alert.alert(t("common.error"), res.error ?? t("profile.password_update_error"));
    }
  };

  if (success) {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.background }]} edges={["top"]}>
        <View style={[s.header, { borderBottomColor: colors.divider }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: colors.text }]}>{t("profile.change_password")}</Text>
          <View style={{ width: 26 }} />
        </View>
        <View style={s.successContainer}>
          <View style={[s.successIcon, { backgroundColor: (colors.success ?? "#22c55e") + "18" }]}>
            <Ionicons name="shield-checkmark-outline" size={48} color={colors.success ?? "#22c55e"} />
          </View>
          <Text style={[s.successTitle, { color: colors.text }]}>{t("common.ok")}</Text>
          <Text style={[s.successBody, { color: colors.textSecondary }]}>
            {t("profile.password_updated")}
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        {/* Header */}
        <View style={[s.header, { borderBottomColor: colors.divider }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </TouchableOpacity>
          <Text style={[s.headerTitle, { color: colors.text }]}>{t("profile.change_password")}</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[s.scroll, { paddingBottom: 24 + insets.bottom }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Current password */}
          <View style={[s.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>
              {t("profile.current_password")}
            </Text>
            <PasswordInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              show={showCurrent}
              onToggleShow={() => setShowCurrent((v) => !v)}
              placeholder="••••••••"
              colors={colors}
              returnKeyType="next"
              onSubmitEditing={() => newPassRef.current?.focus()}
            />
          </View>

          {/* New password + strength */}
          <View style={[s.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>
              {t("profile.new_password")}
            </Text>
            <PasswordInput
              ref={newPassRef}
              value={newPassword}
              onChangeText={setNewPassword}
              show={showNew}
              onToggleShow={() => setShowNew((v) => !v)}
              placeholder="••••••••"
              colors={colors}
              returnKeyType="next"
              onSubmitEditing={() => confirmPassRef.current?.focus()}
              onFocus={scrollToBottomField}
            />

            {newPassword.length > 0 && (
              <>
                {/* Strength bar */}
                <View style={s.strengthRow}>
                  {(["weak", "medium", "strong"] as StrengthLevel[]).map((level, i) => {
                    const active =
                      level === "weak"
                        ? true
                        : level === "medium"
                        ? strength === "medium" || strength === "strong"
                        : strength === "strong";
                    return (
                      <View
                        key={level}
                        style={[
                          s.strengthBar,
                          {
                            backgroundColor: active ? strengthColor : colors.border,
                          },
                        ]}
                      />
                    );
                  })}
                  <Text style={[s.strengthLabel, { color: strengthColor }]}>
                    {t(`profile.password_strength_${strength}`)}
                  </Text>
                </View>

                {/* Checklist */}
                <View style={s.checklist}>
                  <CheckItem
                    met={hasMinLength}
                    label={t("profile.password_min_length")}
                    colors={colors}
                  />
                  <CheckItem
                    met={hasNumber}
                    label={t("profile.password_has_number")}
                    colors={colors}
                  />
                  <CheckItem
                    met={hasUpper}
                    label={t("profile.password_has_upper")}
                    colors={colors}
                  />
                </View>
              </>
            )}
          </View>

          {/* Confirm password */}
          <View style={[s.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[s.sectionTitle, { color: colors.textSecondary }]}>
              {t("profile.confirm_new_password")}
            </Text>
            <PasswordInput
              ref={confirmPassRef}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              show={showConfirm}
              onToggleShow={() => setShowConfirm((v) => !v)}
              placeholder="••••••••"
              colors={colors}
              hasError={confirmPassword.length > 0 && !passwordsMatch}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              onFocus={scrollToBottomField}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <View style={s.hintRow}>
                <Ionicons name="alert-circle-outline" size={14} color={colors.error ?? "#ef4444"} />
                <Text style={[s.hintText, { color: colors.error ?? "#ef4444" }]}>
                  {t("profile.password_mismatch")}
                </Text>
              </View>
            )}
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

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PasswordInputProps {
  value: string;
  onChangeText: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  placeholder: string;
  colors: any;
  hasError?: boolean;
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
  onFocus?: () => void;
}

const PasswordInput = React.forwardRef<TextInput, PasswordInputProps>(
  (
    { value, onChangeText, show, onToggleShow, placeholder, colors, hasError, returnKeyType, onSubmitEditing, onFocus },
    ref
  ) => (
    <View
      style={[
        s.inputRow,
        {
          backgroundColor: colors.background,
          borderColor: hasError ? (colors.error ?? "#ef4444") : colors.border,
        },
      ]}
    >
      <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={{ marginRight: 8 }} />
      <TextInput
        ref={ref}
        style={[s.input, { color: colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        secureTextEntry={!show}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        onFocus={onFocus}
      />
      <TouchableOpacity onPress={onToggleShow} hitSlop={8}>
        <Ionicons
          name={show ? "eye-off-outline" : "eye-outline"}
          size={18}
          color={colors.textTertiary}
        />
      </TouchableOpacity>
    </View>
  )
);

interface CheckItemProps {
  met: boolean;
  label: string;
  colors: any;
}

function CheckItem({ met, label, colors }: CheckItemProps) {
  return (
    <View style={s.checkItem}>
      <Ionicons
        name={met ? "checkmark-circle" : "ellipse-outline"}
        size={14}
        color={met ? (colors.success ?? "#22c55e") : colors.textTertiary}
      />
      <Text style={[s.checkLabel, { color: met ? (colors.success ?? "#22c55e") : colors.textTertiary }]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  sectionTitle: { fontSize: 13, fontWeight: "500", marginBottom: -2 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  input: { flex: 1, fontSize: 15 },

  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: { fontSize: 12, fontWeight: "600", minWidth: 42, textAlign: "right" },

  checklist: { gap: 6 },
  checkItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  checkLabel: { fontSize: 12 },

  hintRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  hintText: { fontSize: 12 },

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
  successBtn: { marginTop: 8, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 14 },
  successBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
