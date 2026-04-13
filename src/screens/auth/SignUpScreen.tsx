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
import { Ionicons } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/hooks/useTheme";

interface SignUpProps {
  onSwitchToSignIn?: () => void;
}

export default function SignUpScreen({ onSwitchToSignIn }: SignUpProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const signUp = useAuthStore((s) => s.signUp);
  const loading = useAuthStore((s) => s.loading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationPending, setVerificationPending] = useState(false);

  const validate = () => {
    if (!email || !email.includes("@")) {
      setError(t("onboarding.email") + " " + t("common.error"));
      return false;
    }
    if (!password || password.length < 6) {
      setError(t("onboarding.password") + " " + t("common.error"));
      return false;
    }
    if (password !== confirmPassword) {
      setError(t("onboarding.confirm_password") + " " + t("common.error"));
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    setError(null);
    if (!validate()) return;

    const { success, error: signUpError } = await signUp(email.trim(), password, fullName);
    if (!success) {
      setError(signUpError || t("common.error"));
      return;
    }

    setVerificationPending(true);
  };

  if (verificationPending) {
    return (
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.successIcon, { backgroundColor: colors.accent + "18" }]}>
            <Ionicons name="mail-open-outline" size={34} color={colors.accent} />
          </View>

          <Text style={[styles.title, styles.successTitle, { color: colors.text }]}>
            {t("onboarding.check_email_title")}
          </Text>

          <Text style={[styles.successBody, { color: colors.textSecondary }]}>
            {t("onboarding.check_email_body", { email: email.trim() })}
          </Text>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.accent }]}
            onPress={() => onSwitchToSignIn?.()}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>{t("onboarding.sign_in")}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>{t("onboarding.sign_up")}</Text>

        <View style={[styles.inputGroup, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t("onboarding.email")}
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
          />
        </View>

        <View style={[styles.inputGroup, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t("onboarding.password")}
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            returnKeyType="next"
          />
          <TouchableOpacity
            style={styles.eyeToggle}
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Text style={[styles.eyeText, { color: colors.accent }]}>
              {" "}
              {showPassword ? t("onboarding.hide_password") : t("onboarding.show_password")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.inputGroup, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t("onboarding.confirm_password")}
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            returnKeyType="done"
          />
        </View>

        <View style={[styles.inputGroup, { borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={t("onboarding.full_name")}
            placeholderTextColor={colors.textSecondary}
            value={fullName}
            onChangeText={setFullName}
            returnKeyType="done"
          />
        </View>

        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.accent }]}
          onPress={handleSignUp}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{t("onboarding.sign_up")}</Text>
          )}
        </TouchableOpacity>

        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={14}
            style={styles.appleBtn}
            onPress={async () => {
              const { success, error: message } = await useAuthStore.getState().signInWithApple();
              if (!success && message) setError(message);
            }}
          />
        )}

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onSwitchToSignIn?.()}>
            <Text style={[styles.link, { color: colors.accent }]}>
              {t("onboarding.already_have_account")}
            </Text>
          </TouchableOpacity>
        </View>
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
    textAlign: "center",
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  successTitle: {
    marginBottom: 12,
  },
  successBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 12,
  },
  inputGroup: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 16,
  },
  eyeToggle: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  eyeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  primaryButton: {
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  appleBtn: {
    width: "100%",
    height: 48,
    marginTop: 12,
  },
  actions: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
  },
  link: {
    fontSize: 14,
  },
  error: {
    marginTop: 12,
    fontSize: 13,
  },
});
