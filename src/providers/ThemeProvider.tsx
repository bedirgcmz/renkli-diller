import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useColorScheme } from "react-native";
import { useSettingsStore } from "@/store/useSettingsStore";

type ThemeMode = "light" | "dark";

export interface ThemeColors {
  // Background colors
  background: string;
  backgroundGradient: [string, string];
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Text colors
  text: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;

  // Interactive colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  accentSoft: string;
  premiumAccent: string;

  // Status colors
  success: string;
  successDark: string;
  warning: string;
  error: string;
  info: string;

  // Border and divider
  border: string;
  borderLight: string;
  divider: string;

  // Surface colors
  surface: string;
  cardBackground: string;
  surfaceSecondary: string;

  // Special colors for learning
  keyword: string;
  keywordBg: string;
}

const lightTheme: ThemeColors = {
  background: "#FAF8F4",
  backgroundGradient: ["#FFF6E9", "#F7DAF3"],
  backgroundSecondary: "#ECE7DF",
  backgroundTertiary: "#E6E0D7",

  text: "#1A1A2E",
  textPrimary: "#1A1A2E",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",

  primary: "#4DA3FF",
  primaryLight: "#7CC4FF",
  primaryDark: "#2A6EA0",
  secondary: "#6B7280",
  accent: "#4DA3FF",
  accentSoft: "#7CC4FF",
  premiumAccent: "#8B5CF6",

  success: "#49C98A",
  successDark: "#2FAF72",
  warning: "#F59E0B",
  error: "#E85D5D",
  info: "#17A2B8",

  border: "#E6E0D7",
  borderLight: "#ECE7DF",
  divider: "#E6E0D7",

  surface: "#F4F1EB",
  cardBackground: "#F4F1EB",
  surfaceSecondary: "#ECE7DF",

  keyword: "#FF6B6B",
  keywordBg: "#FFF5F5",
};

const darkTheme: ThemeColors = {
  background: "#0B1020",
  backgroundGradient: ["#121A33", "#0F2740"],
  backgroundSecondary: "#1D2642",
  backgroundTertiary: "#2A3558",

  text: "#E6EAF2",
  textPrimary: "#E6EAF2",
  textSecondary: "#9CA3AF",
  textTertiary: "#6B7280",

  primary: "#4DA3FF",
  primaryLight: "#7CC4FF",
  primaryDark: "#3B7FD2",
  secondary: "#9CA3AF",
  accent: "#4DA3FF",
  accentSoft: "#7CC4FF",
  premiumAccent: "#8B5CF6",

  success: "#49C98A",
  successDark: "#2FAF72",
  warning: "#F59E0B",
  error: "#E85D5D",
  info: "#17A2B8",

  border: "#2A3558",
  borderLight: "#1D2642",
  divider: "#2A3558",

  surface: "#151C32",
  cardBackground: "#151C32",
  surfaceSecondary: "#1D2642",

  keyword: "#FF6B6B",
  keywordBg: "#2C1818",
};

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { theme: settingsTheme, setTheme: setSettingsTheme } = useSettingsStore();

  // Use settings theme, fallback to system theme
  const theme: ThemeMode = settingsTheme || systemColorScheme || "light";
  const isDark = theme === "dark";
  const colors = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    // Initialize theme from settings
    if (!settingsTheme && (systemColorScheme === "light" || systemColorScheme === "dark")) {
      setSettingsTheme(systemColorScheme);
    }
  }, [settingsTheme, systemColorScheme, setSettingsTheme]);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setSettingsTheme(newTheme);
  };

  const setTheme = (newTheme: ThemeMode) => {
    setSettingsTheme(newTheme);
  };

  const value = useMemo(
    () => ({
      theme,
      colors,
      isDark,
      toggleTheme,
      setTheme,
    }),
    [theme, colors, isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
