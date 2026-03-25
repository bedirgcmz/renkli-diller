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

export default function App() {
  useEffect(() => {
    initRevenueCat().catch(() => {});
  }, []);

  // Handle OAuth deep link callbacks (e.g. Google sign-in redirect)
  useEffect(() => {
    const handleUrl = async (url: string) => {
      if (!url.includes("auth/callback")) return;

      // Supabase returns tokens in the URL fragment (#) or query string (?)
      const tokenString = url.includes("#") ? url.split("#")[1] : url.split("?")[1];
      if (!tokenString) return;

      const params = Object.fromEntries(
        tokenString.split("&").map((pair) => pair.split("=").map(decodeURIComponent))
      );

      const accessToken = params["access_token"];
      const refreshToken = params["refresh_token"];

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
    };

    // Handle URL that launched the app (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    // Handle URL while app is already open (warm start)
    const subscription = Linking.addEventListener("url", ({ url }) => handleUrl(url));
    return () => subscription.remove();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <I18nProvider>
            <ThemeProvider>
              <AppNavigator />
              <StatusBar style="auto" />
            </ThemeProvider>
          </I18nProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
