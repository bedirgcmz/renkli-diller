import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/useAuthStore";

export default function CompleteResetPasswordScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const updatePassword = useAuthStore((s) => s.updatePassword);
  const clearPasswordRecovery = useAuthStore((s) => s.clearPasswordRecovery);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);

    if (password.trim().length < 6) {
      setError(t("settings.password_too_short"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("settings.password_mismatch"));
      return;
    }

    setSubmitting(true);
    const result = await updatePassword(password);
    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? t("settings.password_update_error"));
      return;
    }

    setMessage(t("settings.password_updated"));
    clearPasswordRecovery();
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>{t("settings.change_password")}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t("onboarding.forgot_password")}
        </Text>

        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder={t("settings.new_password")}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          textContentType="newPassword"
        />

        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder={t("settings.confirm_new_password")}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          textContentType="newPassword"
        />

        {message ? <Text style={[styles.message, { color: colors.success }]}>{message}</Text> : null}
        {error ? <Text style={[styles.message, { color: colors.error }]}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t("settings.change_password")}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  button: {
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  message: {
    marginTop: 8,
    fontSize: 14,
  },
});
