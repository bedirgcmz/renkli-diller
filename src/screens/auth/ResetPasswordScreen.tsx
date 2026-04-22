import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/types";
import { useTheme } from "@/hooks/useTheme";
import { useNetworkStore } from "@/store/useNetworkStore";

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, "ResetPassword">>();
  const { colors } = useTheme();
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const loading = useAuthStore((s) => s.loading);
  const isOnline = useNetworkStore((s) => s.isOnline);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOfflineAuthError = (value?: string) => {
    const normalized = value?.toLowerCase() ?? "";
    return (
      normalized.includes("network request failed") ||
      normalized.includes("failed to fetch") ||
      normalized.includes("network error") ||
      normalized.includes("internet") ||
      normalized.includes("offline")
    );
  };

  const handleReset = async () => {
    setError(null);
    setMessage(null);

    if (!email || !email.includes("@")) {
      setError(t("onboarding.email") + " " + t("common.error"));
      return;
    }
    if (isOnline === false) {
      setError(t("onboarding.offline_reset_password"));
      return;
    }

    const { success, error: resetError } = await resetPassword(email.trim());
    if (!success) {
      setError(
        isOfflineAuthError(resetError)
          ? t("onboarding.offline_reset_password")
          : resetError || t("common.error"),
      );
      return;
    }

    setMessage(t("onboarding.reset_password_sent", { email: email.trim() }));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {isOnline === false ? (
          <View
            style={[
              styles.offlineBanner,
              {
                backgroundColor: colors.warning + "14",
                borderColor: colors.warning + "32",
              },
            ]}
          >
            <Text style={[styles.offlineBannerText, { color: colors.text }]}>
              {t("onboarding.offline_reset_password")}
            </Text>
          </View>
        ) : null}

        <Text style={[styles.title, { color: colors.text }]}>
          {t("onboarding.forgot_password")}
        </Text>

        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder={t("onboarding.email")}
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="done"
        />

        {message ? (
          <Text style={[styles.message, { color: colors.success }]}>{message}</Text>
        ) : null}
        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={handleReset}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t("onboarding.reset_password")}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Auth")}>
          <Text style={[styles.link, { color: colors.accent }]}>{t("onboarding.sign_in")}</Text>
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
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  offlineBanner: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
  },
  offlineBannerText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
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
  error: {
    marginTop: 8,
    fontSize: 14,
  },
  link: {
    marginTop: 16,
    fontSize: 14,
    textAlign: "center",
  },
});
