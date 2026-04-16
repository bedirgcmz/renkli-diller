import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { View, ActivityIndicator, Alert } from "react-native";
import { useTranslation } from "react-i18next";

// Screens
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import WelcomeScreen from "@/screens/onboarding/WelcomeScreen";
import CompleteResetPasswordScreen from "@/screens/auth/CompleteResetPasswordScreen";
import i18n from "@/i18n";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { t } = useTranslation();
  const { user, initialized, initialize, passwordRecoveryActive } = useAuthStore();
  const uiLanguage = useSettingsStore((s) => s.uiLanguage);
  const targetLanguage = useSettingsStore((s) => s.targetLanguage);
  const settingsInitialized = useSettingsStore((s) => s.initialized);
  const settingsLoading = useSettingsStore((s) => s.loading);
  const loadedForUserId = useSettingsStore((s) => s.loadedForUserId);
  const pendingLanguagePreferenceNotice = useSettingsStore((s) => s.pendingLanguagePreferenceNotice);
  const clearPendingLanguagePreferenceNotice = useSettingsStore((s) => s.clearPendingLanguagePreferenceNotice);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const currentUserId = user?.id ?? null;
  const settingsReadyForCurrentUser = settingsInitialized && loadedForUserId === currentUserId;

  useEffect(() => {
    initialize().catch((e) => console.error("[AppNavigator] init failed:", e));
  }, [initialize]);

  useEffect(() => {
    if (!initialized) return;
    loadSettings(true).catch((e) => console.error("[AppNavigator] settings load failed:", e));
  }, [initialized, user?.id, loadSettings]);

  useEffect(() => {
    if (!user || !pendingLanguagePreferenceNotice) return;
    if (!settingsReadyForCurrentUser || settingsLoading) return;
    if (i18n.language !== pendingLanguagePreferenceNotice.uiLanguage) return;

    Alert.alert(
      t("onboarding.saved_language_settings_title"),
      t("onboarding.saved_language_settings_body", {
        pair: `${uiLanguage.toUpperCase()}-${targetLanguage.toUpperCase()}`,
        moreTab: t("tabs.more"),
        settingsLabel: t("common.settings"),
      }),
      [
        {
          text: t("common.ok"),
          onPress: clearPendingLanguagePreferenceNotice,
        },
      ],
    );
  }, [
    clearPendingLanguagePreferenceNotice,
    pendingLanguagePreferenceNotice,
    settingsLoading,
    settingsReadyForCurrentUser,
    t,
    targetLanguage,
    uiLanguage,
    user,
  ]);

  // Show loading while initializing
  if (!initialized || !settingsReadyForCurrentUser || settingsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {passwordRecoveryActive ? (
          <Stack.Screen name="PasswordRecovery" component={CompleteResetPasswordScreen} />
        ) : user ? (
          // User is authenticated - show main app
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          // User is not authenticated - show auth flow
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="AuthFlow" component={AuthNavigator} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
