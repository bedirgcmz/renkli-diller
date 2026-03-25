import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSentenceStore } from "@/store/useSentenceStore";
import { useTheme } from "@/hooks/useTheme";

interface FavoriteButtonProps {
  sentenceId: string;
  isPreset: boolean;
  size?: number;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  sentenceId,
  isPreset,
  size = 18,
}) => {
  const { colors } = useTheme();
  const isFavorite = useSentenceStore((s) => s.favoriteIds.includes(sentenceId));
  const toggleFavorite = useSentenceStore((s) => s.toggleFavorite);

  return (
    <Pressable
      onPress={() => toggleFavorite(sentenceId, isPreset)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => (pressed ? { opacity: 0.6 } : undefined)}
    >
      <Ionicons
        name={isFavorite ? "heart" : "heart-outline"}
        size={size}
        color={isFavorite ? "#E85D5D" : colors.textSecondary}
      />
    </Pressable>
  );
};
