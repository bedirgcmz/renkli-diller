import { create } from "zustand";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SupportedLanguage } from "@/types";
import { syncDailyReminderSchedule } from "@/services/notifications";

interface Settings {
  uiLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  theme: "light" | "dark";
  dailyGoal: number;
  notifications: boolean;
  reminderTime: string; // HH:MM format
  autoModeSpeed: number; // 0.5 to 2.0
  showTranslations: boolean;
  ttsEnabled: boolean;
  ttsVoice: string;
}

interface SettingsState extends Settings {
  loading: boolean;
  initialized: boolean;
  loadedForUserId: string | null;

  // Actions
  setUILanguage: (lang: SupportedLanguage) => Promise<void>;
  setTargetLanguage: (lang: SupportedLanguage) => Promise<void>;
  setTheme: (theme: "light" | "dark") => Promise<void>;
  setDailyGoal: (goal: number) => Promise<void>;
  setNotifications: (enabled: boolean) => Promise<void>;
  setReminderTime: (time: string) => Promise<void>;
  setAutoModeSpeed: (speed: number) => Promise<void>;
  setShowTranslations: (show: boolean) => Promise<void>;
  setTTSEnabled: (enabled: boolean) => Promise<void>;
  setTTSVoice: (voice: string) => Promise<void>;
  loadSettings: (force?: boolean) => Promise<void>;
  saveSettings: (settings: Partial<Settings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  clear: () => void;
}

const DEFAULT_SETTINGS: Settings = {
  uiLanguage: "tr",
  targetLanguage: "en",
  theme: "light",
  dailyGoal: 10,
  notifications: false,
  reminderTime: "19:00",
  autoModeSpeed: 1.0,
  showTranslations: true,
  ttsEnabled: true,
  ttsVoice: "default",
};

const LEGACY_STORAGE_KEY = "user_settings";

function getSettingsStorageKey(userId: string | null): string {
  return userId ? `user_settings:${userId}` : "user_settings:guest";
}

async function persistSettingsToSupabase(userId: string, settings: Settings): Promise<void> {
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: userId,
      ui_language: settings.uiLanguage,
      target_language: settings.targetLanguage,
      theme: settings.theme,
      daily_goal: settings.dailyGoal,
      notifications: settings.notifications,
      reminder_time: settings.reminderTime,
      auto_mode_speed: settings.autoModeSpeed,
      show_translations: settings.showTranslations,
      tts_enabled: settings.ttsEnabled,
      tts_voice: settings.ttsVoice,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error && __DEV__) {
    console.error("Error saving settings to Supabase:", error);
  }
}

function toPersistedSettings(settings: Settings): Settings {
  return {
    uiLanguage: settings.uiLanguage,
    targetLanguage: settings.targetLanguage,
    theme: settings.theme,
    dailyGoal: settings.dailyGoal,
    notifications: settings.notifications,
    reminderTime: settings.reminderTime,
    autoModeSpeed: settings.autoModeSpeed,
    showTranslations: settings.showTranslations,
    ttsEnabled: settings.ttsEnabled,
    ttsVoice: settings.ttsVoice,
  };
}

async function reconcileNotificationState(settings: Settings): Promise<Settings> {
  const syncOk = await syncDailyReminderSchedule({
    enabled: settings.notifications,
    reminderTime: settings.reminderTime,
    uiLanguage: settings.uiLanguage,
    dailyGoal: settings.dailyGoal,
  });

  if (!settings.notifications || syncOk) {
    return settings;
  }

  return {
    ...settings,
    notifications: false,
  };
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  loading: false,
  initialized: false,
  loadedForUserId: null,

  setUILanguage: async (lang) => {
    set({ uiLanguage: lang });
    await get().saveSettings({ uiLanguage: lang });
  },

  setTargetLanguage: async (lang) => {
    set({ targetLanguage: lang });
    await get().saveSettings({ targetLanguage: lang });
  },

  setTheme: async (theme) => {
    set({ theme });
    await get().saveSettings({ theme });
  },

  setDailyGoal: async (goal) => {
    set({ dailyGoal: goal });
    await get().saveSettings({ dailyGoal: goal });
  },

  setNotifications: async (enabled) => {
    set({ notifications: enabled });
    await get().saveSettings({ notifications: enabled });
  },

  setReminderTime: async (time) => {
    set({ reminderTime: time });
    await get().saveSettings({ reminderTime: time });
  },

  setAutoModeSpeed: async (speed) => {
    set({ autoModeSpeed: speed });
    await get().saveSettings({ autoModeSpeed: speed });
  },

  setShowTranslations: async (show) => {
    set({ showTranslations: show });
    await get().saveSettings({ showTranslations: show });
  },

  setTTSEnabled: async (enabled) => {
    set({ ttsEnabled: enabled });
    await get().saveSettings({ ttsEnabled: enabled });
  },

  setTTSVoice: async (voice) => {
    set({ ttsVoice: voice });
    await get().saveSettings({ ttsVoice: voice });
  },

  loadSettings: async (force = false) => {
    set({ loading: true });
    try {
      const userId = await getCurrentUserId();
      const storageKey = getSettingsStorageKey(userId);
      const guestStorageKey = getSettingsStorageKey(null);
      if (!force && get().initialized && get().loadedForUserId === userId) {
        set({ loading: false });
        return;
      }

      // Try to load from AsyncStorage first
      let stored = await AsyncStorage.getItem(storageKey);
      if (!stored) {
        const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy) {
          stored = legacy;
          await AsyncStorage.setItem(storageKey, legacy).catch(() => {});
          await AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {});
        }
      }
      if (stored) {
        const settings = JSON.parse(stored) as Settings;
        const resolvedSettings = await reconcileNotificationState({
          ...DEFAULT_SETTINGS,
          ...settings,
        });
        set({
          ...resolvedSettings,
          loading: false,
          initialized: true,
          loadedForUserId: userId,
        });
        await AsyncStorage.setItem(storageKey, JSON.stringify(toPersistedSettings(resolvedSettings)));
        return;
      }

      // If no local user-specific settings, try to load from Supabase
      if (userId) {
        const { data: settings } = await supabase
          .from("user_settings")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (settings) {
          const mapped: Settings = {
            uiLanguage: settings.ui_language ?? DEFAULT_SETTINGS.uiLanguage,
            targetLanguage: settings.target_language ?? DEFAULT_SETTINGS.targetLanguage,
            theme: settings.theme ?? DEFAULT_SETTINGS.theme,
            dailyGoal: settings.daily_goal ?? DEFAULT_SETTINGS.dailyGoal,
            notifications: settings.notifications ?? DEFAULT_SETTINGS.notifications,
            reminderTime: settings.reminder_time ?? DEFAULT_SETTINGS.reminderTime,
            autoModeSpeed: settings.auto_mode_speed ?? DEFAULT_SETTINGS.autoModeSpeed,
            showTranslations: settings.show_translations ?? DEFAULT_SETTINGS.showTranslations,
            ttsEnabled: settings.tts_enabled ?? DEFAULT_SETTINGS.ttsEnabled,
            ttsVoice: settings.tts_voice ?? DEFAULT_SETTINGS.ttsVoice,
          };
          const resolvedSettings = await reconcileNotificationState(mapped);
          set({ ...resolvedSettings, loading: false, initialized: true, loadedForUserId: userId });
          await AsyncStorage.setItem(storageKey, JSON.stringify(toPersistedSettings(resolvedSettings)));
          return;
        }
      }

      // If a guest picked languages before logging in, migrate those choices
      // into the authenticated user's settings on first login.
      if (userId) {
        const guestStored = await AsyncStorage.getItem(guestStorageKey);
        if (guestStored) {
          const settings = JSON.parse(guestStored) as Settings;
          const resolvedSettings = await reconcileNotificationState({
            ...DEFAULT_SETTINGS,
            ...settings,
          });

          set({
            ...resolvedSettings,
            loading: false,
            initialized: true,
            loadedForUserId: userId,
          });

          await AsyncStorage.setItem(storageKey, JSON.stringify(toPersistedSettings(resolvedSettings)));
          await persistSettingsToSupabase(userId, resolvedSettings);
          return;
        }
      }

      // Use defaults
      const resolvedDefaults = await reconcileNotificationState(DEFAULT_SETTINGS);
      set({ ...resolvedDefaults, loading: false, initialized: true, loadedForUserId: userId });
      await AsyncStorage.setItem(storageKey, JSON.stringify(toPersistedSettings(resolvedDefaults)));
    } catch (error) {
      if (__DEV__) console.error("Error loading settings:", error);
      set({ ...DEFAULT_SETTINGS, loading: false, initialized: true, loadedForUserId: null });
    }
  },

  saveSettings: async (updates) => {
    const currentSettings = get();
    const requestedSettings: Settings = {
      uiLanguage: updates.uiLanguage ?? currentSettings.uiLanguage,
      targetLanguage: updates.targetLanguage ?? currentSettings.targetLanguage,
      theme: updates.theme ?? currentSettings.theme,
      dailyGoal: updates.dailyGoal ?? currentSettings.dailyGoal,
      notifications: updates.notifications ?? currentSettings.notifications,
      reminderTime: updates.reminderTime ?? currentSettings.reminderTime,
      autoModeSpeed: updates.autoModeSpeed ?? currentSettings.autoModeSpeed,
      showTranslations: updates.showTranslations ?? currentSettings.showTranslations,
      ttsEnabled: updates.ttsEnabled ?? currentSettings.ttsEnabled,
      ttsVoice: updates.ttsVoice ?? currentSettings.ttsVoice,
    };

    try {
      const userId = await getCurrentUserId();
      const storageKey = getSettingsStorageKey(userId);
      const resolvedSettings = await reconcileNotificationState(requestedSettings);

      set({
        ...resolvedSettings,
        loadedForUserId: userId,
      });

      // Save to AsyncStorage
      await AsyncStorage.setItem(storageKey, JSON.stringify(toPersistedSettings(resolvedSettings)));
      await AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {});

      // Save to Supabase if user is logged in
      if (userId) {
        await persistSettingsToSupabase(userId, resolvedSettings);
      }
    } catch (error) {
      if (__DEV__) console.error("Error saving settings:", error);
    }
  },

  resetToDefaults: async () => {
    set((state) => ({
      ...DEFAULT_SETTINGS,
      loading: false,
      initialized: true,
      loadedForUserId: state.loadedForUserId,
    }));
    await get().saveSettings(DEFAULT_SETTINGS);
  },

  clear: () =>
    set({
      ...DEFAULT_SETTINGS,
      loading: false,
      initialized: false,
      loadedForUserId: null,
    }),
}));
