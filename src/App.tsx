import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Linking } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Providers
import { ThemeProvider } from "@/providers/ThemeProvider";
import { I18nProvider } from "@/providers/I18nProvider";

// Navigation
import AppNavigator from "@/navigation/AppNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Services
import { initRevenueCat } from "@/services/revenueCat";
import { supabase } from "@/lib/supabase";

// Achievements
import { AchievementToast } from "@/components/AchievementToast";
import { useAchievementStore } from "@/store/useAchievementStore";

// Module-level dedup guard — prevents double setSession when both
// openAuthSessionAsync and Linking fire for the same callback URL.
let lastHandledAuthUrl: string | null = null;

export default function App() {
  const loadAchievements = useAchievementStore((s) => s.loadAchievements);

  useEffect(() => {
    initRevenueCat().catch(() => {});
    loadAchievements().catch((e) => console.error("[App] loadAchievements error:", e));
  }, []);

  // Shared handler for both cold-start and warm-start auth deep links.
  useEffect(() => {
    const handleAuthCallback = async (url: string) => {
      if (!url.includes("auth/callback") && !url.includes("auth/reset-password")) return;

      // Dedup: skip if this exact URL was already handled
      if (lastHandledAuthUrl === url) return;
      lastHandledAuthUrl = url;

      console.log("HANDLE AUTH URL:", url);

      const tokenString = url.includes("#") ? url.split("#")[1] : url.split("?")[1];
      if (!tokenString) return;

      const params = Object.fromEntries(
        tokenString.split("&").map((pair) => pair.split("=").map(decodeURIComponent))
      );

      const accessToken = params["access_token"];
      const refreshToken = params["refresh_token"];

      console.log("TOKENS FOUND:", { hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
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
              <AppNavigator />
              <AchievementToast />
              <StatusBar style="auto" />
            </ThemeProvider>
          </I18nProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
