import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/hooks/useTheme";
import { usePremium } from "@/hooks/usePremium";
import { MainStackParamList } from "@/types";

interface Props {
  children: React.ReactNode;
  /** Override default Paywall navigation on lock press */
  onUpgradePress?: () => void;
}

/**
 * Renders `children` as-is when the user is premium.
 * When not premium, dims the content and overlays a lock badge.
 * Tapping the overlay navigates to the Paywall (or calls `onUpgradePress`).
 */
export default function PremiumGate({ children, onUpgradePress }: Props) {
  const { isPremium } = usePremium();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  if (isPremium) return <>{children}</>;

  const handlePress = () => {
    onUpgradePress ? onUpgradePress() : navigation.navigate("Paywall");
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.dimmed}>{children}</View>
      <TouchableOpacity
        style={[styles.overlay, { backgroundColor: colors.background + "D0" }]}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        <View style={[styles.badge, { backgroundColor: colors.premiumAccent + "22" }]}>
          <Ionicons name="lock-closed" size={14} color={colors.premiumAccent} />
          <Text style={[styles.badgeText, { color: colors.premiumAccent }]}>
            {t("common.premium_badge")}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 12,
  },
  dimmed: {
    opacity: 0.35,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
