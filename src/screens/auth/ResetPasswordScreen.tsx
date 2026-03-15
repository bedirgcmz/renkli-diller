import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/types";

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList, "ResetPassword">>();
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    const { success, error: resetError } = await resetPassword(email);
    if (!success) {
      setError(resetError || t("common.error"));
      return;
    }
    setMessage(t("onboarding.forgot_password"));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("onboarding.forgot_password")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("onboarding.email")}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>{t("onboarding.reset_password")}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
        <Text style={styles.link}>{t("onboarding.sign_in")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  button: {
    height: 48,
    backgroundColor: "#007AFF",
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
    color: "#2a8",
  },
  error: {
    marginTop: 8,
    color: "#d00",
  },
  link: {
    marginTop: 16,
    color: "#007AFF",
    textAlign: "center",
  },
});
