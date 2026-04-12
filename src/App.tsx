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
import { supabase } from "@/lib/supabase";

// Achievements
import { AchievementToast } from "@/components/AchievementToast";
import { useAchievementStore } from "@/store/useAchievementStore";
import { useAuthStore } from "@/store/useAuthStore";

// Module-level dedup guard — prevents double setSession when both
// openAuthSessionAsync and Linking fire for the same callback URL.
// Combines URL match + time window: same URL within 3s is a duplicate,
// but the same URL after 3s (e.g. re-login) is allowed through.
let lastHandledAuthUrl: string | null = null;
let lastHandledAuthTime = 0;
const AUTH_DEDUP_WINDOW_MS = 3000;

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
      if (!url.includes("auth/callback") && !url.includes("auth/reset-password")) return;

      // Dedup: skip if same URL arrived within the dedup window (cold-start double-fire).
      // Allows the same URL after the window expires (e.g. re-login with same provider).
      const now = Date.now();
      if (lastHandledAuthUrl === url && now - lastHandledAuthTime < AUTH_DEDUP_WINDOW_MS) return;
      lastHandledAuthUrl = url;
      lastHandledAuthTime = now;

      console.log("HANDLE AUTH URL:", url);

      const tokenString = url.includes("#") ? url.split("#")[1] : url.split("?")[1];
      if (!tokenString) {
        if (url.includes("auth/reset-password")) {
          clearPasswordRecovery();
        }
        return;
      }

      const params = Object.fromEntries(
        tokenString.split("&").map((pair) => pair.split("=").map(decodeURIComponent))
      );

      const accessToken = params["access_token"];
      const refreshToken = params["refresh_token"];

      console.log("TOKENS FOUND:", { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });

      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (url.includes("auth/reset-password")) {
          if (!error && data.session) {
            activatePasswordRecovery();
          } else {
            clearPasswordRecovery();
            console.error("[App] password recovery session error:", error?.message ?? "missing_session");
          }
        }
      } else if (url.includes("auth/reset-password")) {
        clearPasswordRecovery();
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
                <StatusBar style="auto" />
              </OnboardingProvider>
            </ThemeProvider>
          </I18nProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
