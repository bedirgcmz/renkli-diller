import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Linking } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Providers
import { ThemeProvider } from "@/providers/ThemeProvider";
import { I18nProvider } from "@/providers/I18nProvider";
import { OnboardingProvider } from "@/providers/OnboardingProvider";

// Navigation
import AppNavigator from "@/navigation/AppNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Services
import { establishSessionFromCallbackUrl, isAuthCallbackUrl } from "@/lib/authCallback";

// Achievements
import { AchievementToast } from "@/components/AchievementToast";
import { NotificationSyncBridge } from "@/components/NotificationSyncBridge";
import { useAchievementStore } from "@/store/useAchievementStore";
import { useAuthStore } from "@/store/useAuthStore";

export default function App() {
  const loadAchievements = useAchievementStore((s) => s.loadAchievements);
  const clearAchievements = useAchievementStore((s) => s.clear);
  const activatePasswordRecovery = useAuthStore((s) => s.activatePasswordRecovery);
  const clearPasswordRecovery = useAuthStore((s) => s.clearPasswordRecovery);
  const userId = useAuthStore((s) => s.user?.id ?? null);

  useEffect(() => {
    if (!userId) {
      clearAchievements();
      return;
    }
    loadAchievements().catch((e) => console.error("[App] loadAchievements error:", e));
  }, [userId, loadAchievements, clearAchievements]);

  // Shared handler for both cold-start and warm-start auth deep links.
  useEffect(() => {
    const handleAuthCallback = async (url: string) => {
      if (!isAuthCallbackUrl(url)) return;

      console.log("HANDLE AUTH URL:", url);

      const result = await establishSessionFromCallbackUrl(url);

      if (url.includes("auth/reset-password")) {
        if (result.session) {
          activatePasswordRecovery();
        } else {
          clearPasswordRecovery();
          if (result.error) {
            console.error("[App] password recovery session error:", result.error);
          }
        }
      } else if (result.error && !result.duplicate) {
        console.error("[App] auth callback session error:", result.error);
      } else if (!result.session && !result.duplicate) {
        console.error("[App] auth callback missing session");
      }
    };

    // Cold-start: app was killed and opened via deep link
    Linking.getInitialURL()
      .then((url) => {
        if (url) handleAuthCallback(url).catch((e) => console.error("[App] cold-start auth error:", e));
      })
      .catch((e) => console.error("[App] getInitialURL error:", e));

    // Warm-start: app is already running and receives a deep link
    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleAuthCallback(url).catch((e) => console.error("[App] warm-start auth error:", e));
    });

    return () => subscription.remove();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <I18nProvider>
            <ThemeProvider>
              <OnboardingProvider>
                <AppNavigator />
                <AchievementToast />
                <NotificationSyncBridge />
                <StatusBar style="auto" />
              </OnboardingProvider>
            </ThemeProvider>
          </I18nProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
