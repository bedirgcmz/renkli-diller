import React from "react";
import { Pressable, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";

interface ReportIconButtonProps {
  onPress: () => void;
  size?: number;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  color?: string;
}

export function ReportIconButton({
  onPress,
  size = 32,
  iconSize = 18,
  style,
  backgroundColor,
  color,
}: ReportIconButtonProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: backgroundColor ?? "transparent",
          opacity: pressed ? 0.68 : 1,
          transform: [{ scale: pressed ? 0.94 : 1 }],
        },
        style,
      ]}
    >
      <Ionicons
        name="flag-outline"
        size={iconSize}
        color={color ?? colors.textSecondary}
      />
    </Pressable>
  );
}

