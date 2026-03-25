import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { useAchievementStore } from "@/store/useAchievementStore";
import { ACHIEVEMENTS } from "@/utils/achievements";

const TOAST_DURATION = 3000;
const SLIDE_DURATION = 300;
const BOTTOM_OFFSET = 90;

export function AchievementToast() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { pendingToast, clearToast } = useAchievementStore();
  const slideAnim = useRef(new Animated.Value(120)).current;
  const currentToastId = useRef<string | null>(null);

  useEffect(() => {
    if (!pendingToast || pendingToast === currentToastId.current) return;
    currentToastId.current = pendingToast;

    // Slide in
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: SLIDE_DURATION,
      useNativeDriver: true,
    }).start();

    // Slide out after duration
    const timer = setTimeout(() => {
      Animated.timing(slideAnim, {
        toValue: 120,
        duration: SLIDE_DURATION,
        useNativeDriver: true,
      }).start(() => {
        clearToast();
        currentToastId.current = null;
      });
    }, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, [pendingToast]);

  if (!pendingToast) return null;

  const achievement = ACHIEVEMENTS.find((a) => a.id === pendingToast);
  if (!achievement) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.cardBackground, transform: [{ translateY: slideAnim }], bottom: BOTTOM_OFFSET },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primary + "20" }]}>
        <Text style={styles.icon}>{achievement.icon}</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.label, { color: colors.primary }]}>
          🏆 {t("achievements.new_achievement")}
        </Text>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {t(achievement.title_key)}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 22 },
  textWrap: { flex: 1 },
  label: { fontSize: 11, fontWeight: "700", marginBottom: 2 },
  title: { fontSize: 14, fontWeight: "600" },
});
