import create from "zustand";
import { SupportedLanguage } from "@/types";

interface SettingsState {
  uiLanguage: SupportedLanguage;
  targetLanguage: SupportedLanguage;
  theme: "light" | "dark";
  setUILanguage: (lang: SupportedLanguage) => void;
  setTargetLanguage: (lang: SupportedLanguage) => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  uiLanguage: "tr",
  targetLanguage: "en",
  theme: "light",
  setUILanguage: (lang) => set({ uiLanguage: lang }),
  setTargetLanguage: (lang) => set({ targetLanguage: lang }),
  setTheme: (theme) => set({ theme }),
}));
