import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList, SupportedLanguage } from "@/types";
import { useI18n } from "@/providers/I18nProvider";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useTheme } from "@/hooks/useTheme";

const LANGUAGE_OPTIONS: Array<{ label: string; value: SupportedLanguage; emoji: string }> = [
  { label: "Türkçe", value: "tr", emoji: "🇹🇷" },
  { label: "English", value: "en", emoji: "🇬🇧" },
  { label: "Svenska", value: "sv", emoji: "🇸🇪" },
  { label: "Deutsch", value: "de", emoji: "🇩🇪" },
  { label: "Español", value: "es", emoji: "🇪🇸" },
  { label: "Français", value: "fr", emoji: "🇫🇷" },
  { label: "Português", value: "pt", emoji: "🇧🇷" },
];

function LanguagePicker({
  label,
  value,
  onSelect,
  options,
  buttonColor,
}: {
  label: string;
  value: SupportedLanguage;
  onSelect: (value: SupportedLanguage) => void;
  options: Array<{ label: string; value: SupportedLanguage; emoji: string }>;
  buttonColor: string;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.pickerWrapper}>
      <Text style={[styles.pickerLabel, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity
        style={[styles.pickerButton, { borderColor: buttonColor }]}
        onPress={() => setOpen((prev) => !prev)}
        activeOpacity={0.8}
      >
        <Text style={[styles.pickerButtonText, { color: buttonColor }]}>
          {selected?.emoji} {selected?.label}
        </Text>
        <Text style={[styles.pickerChevron, { color: buttonColor }]}>▼</Text>
      </TouchableOpacity>

      {open ? (
        <View
          style={[
            styles.pickerOptions,
            { borderColor: buttonColor, backgroundColor: colors.surfaceSecondary },
          ]}
        >
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.pickerOption}
              onPress={() => {
                setOpen(false);
                onSelect(option.value);
              }}
            >
              <Text style={[styles.pickerOptionText, { color: colors.text }]}>
                {option.emoji} {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default function WelcomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "Welcome">>();
  const { colors } = useTheme();
  const { uiLanguage, targetLanguage, setTargetLanguage } = useSettingsStore();
  const { changeLanguage } = useI18n();

  const [selectedUiLanguage, setSelectedUiLanguage] = useState<SupportedLanguage>(uiLanguage);
  const [selectedTargetLanguage, setSelectedTargetLanguage] =
    useState<SupportedLanguage>(targetLanguage);
  const [warning, setWarning] = useState<string | null>(null);

  const appName = useMemo(() => {
    const letters = "Parlio".split("");
    const palette = [
      colors.accent,
      colors.premiumAccent,
      colors.primary,
      colors.secondary,
      colors.text,
    ];
    return letters.map((letter, index) => (
      <Text key={index} style={[styles.titleLetter, { color: palette[index % palette.length] }]}>
        {letter}
      </Text>
    ));
  }, [colors]);

  const onUiLanguageChange = async (lang: SupportedLanguage) => {
    setWarning(null);
    setSelectedUiLanguage(lang);
    await changeLanguage(lang);
  };

  const onTargetLanguageChange = async (lang: SupportedLanguage) => {
    setWarning(null);
    setSelectedTargetLanguage(lang);
    await setTargetLanguage(lang);
  };

  const handleStart = () => {
    if (selectedUiLanguage === selectedTargetLanguage) {
      setWarning(
        t("onboarding.select_target_language") +
          " - " +
          t("onboarding.select_ui_language") +
          " farklı olmalıdır.",
      );
      return;
    }
    navigation.navigate("AuthFlow");
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View
            style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.text }]}
          >
            <Text style={[styles.title, { color: colors.text }]}>{appName}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t("onboarding.welcome_subtitle")}
            </Text>

            <View style={styles.inputs}>
              <LanguagePicker
                label={t("onboarding.select_ui_language")}
                value={selectedUiLanguage}
                onSelect={onUiLanguageChange}
                options={LANGUAGE_OPTIONS}
                buttonColor={colors.accent}
              />
              <LanguagePicker
                label={t("onboarding.select_target_language")}
                value={selectedTargetLanguage}
                onSelect={onTargetLanguageChange}
                options={LANGUAGE_OPTIONS}
                buttonColor={colors.premiumAccent}
              />
              {warning ? (
                <Text style={[styles.warning, { color: colors.error }]}>{warning}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.startButton, { backgroundColor: colors.accent }]}
              onPress={handleStart}
              activeOpacity={0.8}
            >
              <Text style={styles.startButtonText}>{t("onboarding.get_started")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  card: {
    borderRadius: 18,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 8,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  titleLetter: {
    fontSize: 34,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  inputs: {
    marginBottom: 20,
  },
  pickerWrapper: {
    marginBottom: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pickerButtonText: {
    fontSize: 16,
  },
  pickerChevron: {
    fontSize: 14,
  },
  pickerOptions: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.6)",
    overflow: "hidden",
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  pickerOptionText: {
    fontSize: 16,
  },
  warning: {
    marginTop: 6,
    fontSize: 13,
  },
  startButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
