import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/types";

export default function SignInScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, "SignIn">>();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    const { success, error: signInError } = await signIn(email, password);
    if (!success) {
      setError(signInError || t("common.error"));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("onboarding.sign_in")}</Text>
      <TextInput
        style={styles.input}
        placeholder={t("onboarding.email")}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder={t("onboarding.password")}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>{t("onboarding.sign_in")}</Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.link}>{t("onboarding.sign_up")}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("ResetPassword")}>
          <Text style={styles.link}>{t("onboarding.forgot_password")}</Text>
        </TouchableOpacity>
      </View>
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
  actions: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  link: {
    color: "#007AFF",
  },
  error: {
    marginTop: 8,
    color: "#d00",
  },
});
