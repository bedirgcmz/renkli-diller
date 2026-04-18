import React, { useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "@/store/useAuthStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useNetworkStore } from "@/store/useNetworkStore";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useGameStore } from "@/store/useGameStore";
import { useOfflineQueueStore } from "@/store/useOfflineQueueStore";
import { useReadingStore } from "@/store/useReadingStore";
import { View, Text, StyleSheet, ActivityIndicator, Alert, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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
  const insets = useSafeAreaInsets();
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

  // Network store
  const reconnectCount = useNetworkStore((s) => s.reconnectCount);
  const isOnline = useNetworkStore((s) => s.isOnline);
  const initializeNetwork = useNetworkStore((s) => s.initialize);

  // Track which reconnect events we've already handled
  const handledReconnectCount = useRef(0);
  // Track eager load per user so we don't repeat it on every render
  const eagerLoadedForUser = useRef<string | null>(null);

  // ── Auth initialisation ───────────────────────────────────────────────────
  useEffect(() => {
    initialize().catch((e) => console.error("[AppNavigator] init failed:", e));
  }, [initialize]);

  // ── Settings load (triggered on auth state change) ────────────────────────
  useEffect(() => {
    if (!initialized) return;
    loadSettings(true).catch((e) => console.error("[AppNavigator] settings load failed:", e));
  }, [initialized, user?.id, loadSettings]);

  // ── Network monitor: initialise once, clean up on unmount ─────────────────
  useEffect(() => {
    const cleanup = initializeNetwork();
    return cleanup;
  }, [initializeNetwork]);

  // ── Eager cache population: fires once per user when online + settings ready ─
  // Ensures all stores are loaded and cached on the first online session so
  // subsequent cold-starts work correctly offline. Without this, cache is only
  // written lazily (when individual screens are visited), meaning the user has
  // to visit every tab at least once before offline mode has anything to show.
  useEffect(() => {
    if (!user?.id) {
      // Reset on logout so next login triggers a fresh eager load
      eagerLoadedForUser.current = null;
      return;
    }
    if (!settingsReadyForCurrentUser) return;
    if (isOnline !== true) return; // null = unknown, false = offline — skip both
    if (eagerLoadedForUser.current === user.id) return; // already done for this user

    eagerLoadedForUser.current = user.id;

    console.log("[AppNavigator] eager cache population — user online, loading all stores");

    const { is_premium } = useAuthStore.getState().user ?? { is_premium: false };

    void useSentenceStore.getState().loadCategories();
    void useSentenceStore.getState().loadFavorites();
    void useSentenceStore.getState().loadSentences();
    void useProgressStore.getState().loadProgress();
    void useGameStore.getState().loadUserStats();
    void useGameStore.getState().retryPendingScore();
    void useSentenceStore.getState().loadPresetSentences(undefined, is_premium);
    void useReadingStore.getState().fetchProgress(user.id);
    void useReadingStore.getState().fetchNextText(user.id, false, is_premium);
  }, [user?.id, settingsReadyForCurrentUser, isOnline]);

  // ── Reconnect: refresh stores when connectivity is restored ───────────────
  useEffect(() => {
    // Ignore the initial value (reconnectCount starts at 0, only act on increments)
    if (reconnectCount === 0) return;
    // Skip if we've already handled this particular reconnect event
    if (reconnectCount <= handledReconnectCount.current) return;

    handledReconnectCount.current = reconnectCount;

    if (!user?.id) return;

    console.log("[AppNavigator] connectivity restored — draining queue then refreshing stores");

    // ── Queue-first reconnect ─────────────────────────────────────────────────
    // IMPORTANT: drain the offline queue BEFORE refreshing stores from the
    // network. If we refresh first, the server's stale state overwrites the
    // optimistic local state that the queue items are about to fix.
    //
    // Order:
    //  1. processQueue()      — commit pending progress/favorites/quiz/study
    //  2. retryPendingScore() — commit pending game scores (separate queue)
    //  3. parallel store refreshes — now safe, server has the correct state
    void (async () => {
      await useOfflineQueueStore.getState().processQueue();
      await useGameStore.getState().retryPendingScore();

      // Parallel store refreshes — cache-first, no spinner if data already visible
      void useSentenceStore.getState().loadCategories();
      void useSentenceStore.getState().loadFavorites();
      void useSentenceStore.getState().loadSentences();
      void useProgressStore.getState().loadProgress();
      void useGameStore.getState().loadUserStats();
      void useReadingStore.getState().fetchProgress(user.id);

      // Preset sentences depend on settings (lang pair / premium) —
      // only refresh if settings are ready so we use the correct cache key.
      if (settingsReadyForCurrentUser) {
        const { is_premium } = useAuthStore.getState().user ?? { is_premium: false };
        void useSentenceStore.getState().loadPresetSentences(undefined, is_premium);
        // NOTE: fetchNextText is intentionally NOT called here. Reconnect fires
        // while the user may already be mid-read (currentText set from cache).
        // Calling fetchNextText would overwrite the active text and show a spinner.
        // fetchProgress above is sufficient for stats sync; the reading text
        // refreshes naturally when the user navigates to the Reading tab.
      }
    })();
  }, [reconnectCount, user?.id, settingsReadyForCurrentUser]);

  // ── Language preference alert ──────────────────────────────────────────────
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

  // Show loading while initialising
  if (!initialized || !settingsReadyForCurrentUser || settingsLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={offlineStyles.root}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {passwordRecoveryActive ? (
            <Stack.Screen name="PasswordRecovery" component={CompleteResetPasswordScreen} />
          ) : user ? (
            <Stack.Screen name="Main" component={MainNavigator} />
          ) : (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="AuthFlow" component={AuthNavigator} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Global offline pill — rendered inside a transparent Modal so it
          appears above React Native Modal overlays (which use a separate
          UIWindow layer on iOS). pointerEvents="none" ensures touch events
          pass through to the content underneath. */}
      <Modal
        visible={isOnline === false}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => {}}
      >
        <View pointerEvents="none" style={offlineStyles.pillHost}>
          <View style={[offlineStyles.pill, { top: insets.top + 8 }]}>
            <Ionicons name="wifi-outline" size={13} color="#fff" />
            <Text style={offlineStyles.pillText}>{t("common.offline_indicator")}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const offlineStyles = StyleSheet.create({
  root: { flex: 1 },
  pillHost: { flex: 1 },
  pill: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(30,30,30,0.82)",
  },
  pillText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});
