import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useColorScheme } from "react-native";
import { useSettingsStore } from "@/store/useSettingsStore";

type ThemeMode = "light" | "dark";

interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Interactive colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  premiumAccent: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Border and divider
  border: string;
  borderLight: string;
  divider: string;

  // Surface colors
  surface: string;
  surfaceSecondary: string;

  // Special colors for learning
  keyword: string;
  keywordBg: string;
}

const lightTheme: ThemeColors = {
  background: "#FFFFFF",
  backgroundSecondary: "#F8F9FA",
  backgroundTertiary: "#E9ECEF",

  text: "#212529",
  textSecondary: "#6C757D",
  textTertiary: "#ADB5BD",

  primary: "#3B8BD4",
  primaryLight: "#7BB7F0",
  primaryDark: "#2A6EA0",
  secondary: "#6C757D",
  accent: "#3B8BD4",
  premiumAccent: "#8B5CF6",

  success: "#2ECC71",
  warning: "#FFC107",
  error: "#E53E3E",
  info: "#17A2B8",

  border: "#DEE2E6",
  borderLight: "#F8F9FA",
  divider: "#E9ECEF",

  surface: "#FFFFFF",
  surfaceSecondary: "#F8F9FA",

  keyword: "#FF6B6B",
  keywordBg: "#FFF5F5",
};

const darkTheme: ThemeColors = {
  background: "#121220",
  backgroundSecondary: "#1E1E2E",
  backgroundTertiary: "#2C2C3A",

  text: "#FFFFFF",
  textSecondary: "#B3B3B3",
  textTertiary: "#808080",

  primary: "#5BA3E8",
  primaryLight: "#85C1FF",
  primaryDark: "#3B7FD2",
  secondary: "#B3B3B3",
  accent: "#5BA3E8",
  premiumAccent: "#8B5CF6",

  success: "#2ECC71",
  warning: "#FFC107",
  error: "#E53E3E",
  info: "#17A2B8",

  border: "#383838",
  borderLight: "#484848",
  divider: "#383838",

  surface: "#1E1E2E",
  surfaceSecondary: "#2C2C2E",

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
