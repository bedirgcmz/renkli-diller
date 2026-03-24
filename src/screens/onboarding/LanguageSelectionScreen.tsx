import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { AuthStackParamList, SupportedLanguage } from "@/types";

export default function LanguageSelectionScreen() {
  const { t } = useTranslation();
  const setUILanguage = useSettingsStore((s) => s.setUILanguage);
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  const selectLanguage = async (lang: string) => {
    await setUILanguage(lang as SupportedLanguage);
    navigation.navigate("Auth");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("onboarding.select_ui_language")}</Text>
      {[
        { label: t("languages.tr"), value: "tr" },
        { label: t("languages.en"), value: "en" },
        { label: t("languages.sv"), value: "sv" },
        { label: t("languages.de"), value: "de" },
        { label: t("languages.es"), value: "es" },
        { label: t("languages.fr"), value: "fr" },
        { label: t("languages.pt"), value: "pt" },
      ].map((lang) => (
        <TouchableOpacity
          key={lang.value}
          style={styles.button}
          onPress={() => selectLanguage(lang.value)}
        >
          <Text style={styles.buttonText}>{lang.label}</Text>
        </TouchableOpacity>
      ))}
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
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 24,
  },
  button: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
  },
});
