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
import { useTheme } from "@/hooks/useTheme";

interface SignInProps {
  onSwitchToSignUp?: () => void;
  onForgotPassword?: () => void;
}

export default function SignInScreen({ onSwitchToSignUp, onForgotPassword }: SignInProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const signIn = useAuthStore((s) => s.signIn);
  const loading = useAuthStore((s) => s.loading);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    if (!email || !email.includes("@")) {
      setError(t("onboarding.email") + " " + t("common.error"));
      return false;
    }
    if (!password || password.length < 6) {
      setError(t("onboarding.password") + " " + t("common.error"));
      return false;
    }
    return true;
  };

  const handleSignIn = async () => {
    setError(null);
    if (!validate()) return;

    const { success, error: signInError } = await signIn(email.trim(), password);
    if (!success) {
      setError(signInError || t("common.error"));
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: colors.text }]}>{t("onboarding.sign_in")}</Text>

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
            textContentType="password"
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.eyeToggle}
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Text style={[styles.eyeText, { color: colors.accent }]}>
              {" "}
              {showPassword ? "Gizle" : "Göster"}
            </Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.accent }]}
          onPress={handleSignIn}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>{t("onboarding.sign_in")}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.accent }]}
          onPress={async () => {
            const { success, error: message } = await useAuthStore.getState().signInWithGoogle();
            if (!success) {
              setError(message || t("common.error"));
            }
          }}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>
            {t("onboarding.google")}
          </Text>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onSwitchToSignUp?.()}>
            <Text style={[styles.link, { color: colors.accent }]}>
              {t("onboarding.dont_have_account")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onForgotPassword?.()}>
            <Text style={[styles.link, { color: colors.accent }]}>
              {t("onboarding.forgot_password")}
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
  secondaryButton: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  secondaryButtonText: {
    fontWeight: "700",
  },
  actions: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  link: {
    fontSize: 14,
  },
  error: {
    marginTop: 12,
    fontSize: 13,
  },
});
