import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "@/types";

export default function SignUpScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList, "SignUp">>();
  const signUp = useAuthStore((s) => s.signUp);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    const { success, error: signUpError } = await signUp(email, password, fullName);
    if (!success) {
      setError(signUpError || t("common.error"));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("onboarding.sign_up")}</Text>
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
      <TextInput
        style={styles.input}
        placeholder={t("onboarding.confirm_password")}
        value={fullName}
        onChangeText={setFullName}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>{t("onboarding.sign_up")}</Text>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
          <Text style={styles.link}>{t("onboarding.sign_in")}</Text>
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
