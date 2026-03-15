import create from "zustand";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SupportedLanguage } from "@/types";

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
  loadSettings: () => Promise<void>;
  saveSettings: (settings: Partial<Settings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  uiLanguage: "tr",
  targetLanguage: "en",
  theme: "light",
  dailyGoal: 10,
  notifications: true,
  reminderTime: "19:00",
  autoModeSpeed: 1.0,
  showTranslations: true,
  ttsEnabled: true,
  ttsVoice: "default",
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  loading: false,
  initialized: false,

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

  loadSettings: async () => {
    set({ loading: true });
    try {
      // Try to load from AsyncStorage first
      const stored = await AsyncStorage.getItem('user_settings');
      if (stored) {
        const settings = JSON.parse(stored);
        set({ ...settings, loading: false, initialized: true });
        return;
      }

      // If no stored settings, try to load from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (settings) {
          set({
            ...settings,
            loading: false,
            initialized: true,
          });
          // Cache in AsyncStorage
          await AsyncStorage.setItem('user_settings', JSON.stringify(settings));
          return;
        }
      }

      // Use defaults
      set({ ...DEFAULT_SETTINGS, loading: false, initialized: true });
      await AsyncStorage.setItem('user_settings', JSON.stringify(DEFAULT_SETTINGS));
    } catch (error) {
      console.error('Error loading settings:', error);
      set({ ...DEFAULT_SETTINGS, loading: false, initialized: true });
    }
  },

  saveSettings: async (updates) => {
    const currentSettings = get();
    const newSettings = { ...currentSettings, ...updates };

    try {
      // Save to AsyncStorage
      await AsyncStorage.setItem('user_settings', JSON.stringify(newSettings));

      // Save to Supabase if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            ...newSettings,
            updated_at: new Date().toISOString(),
          });

        if (error) {
          console.error('Error saving settings to Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },

  resetToDefaults: async () => {
    set({ ...DEFAULT_SETTINGS });
    await get().saveSettings(DEFAULT_SETTINGS);
  },
}));
