import React, { useEffect, useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VisualBadgeProps {
  imageUrl?: string;
  size: number;
  borderRadius?: number;
  /** Background color of the badge container */
  backgroundColor: string;
  /** Border color; pass "transparent" to hide */
  borderColor: string;
  /** Overflow amount on each side — expands image beyond container (clipped by overflow:hidden) */
  imageOverflow?: { top: number; bottom: number; horizontal: number };
  /** Placeholder icon color */
  placeholderColor: string;
}

export function VisualBadge({
  imageUrl,
  size,
  borderRadius = 10,
  backgroundColor,
  borderColor,
  imageOverflow = { top: 22, bottom: 22, horizontal: 30 },
  placeholderColor,
}: VisualBadgeProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  // Reset when image URL changes (card swipe / sentence change)
  useEffect(() => {
    setImgLoaded(false);
  }, [imageUrl]);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
          backgroundColor,
          borderColor,
        },
      ]}
    >
      {/* Placeholder — hidden once image is loaded */}
      {!imgLoaded && (
        <Ionicons name="image-outline" size={Math.round(size * 0.32)} color={placeholderColor} />
      )}

      {/* Image — absolutely positioned, overflow clipped by container */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            {
              top: -imageOverflow.top,
              left: -imageOverflow.horizontal,
              right: -imageOverflow.horizontal,
              bottom: -imageOverflow.bottom,
            },
          ]}
          resizeMode="contain"
          onLoad={() => setImgLoaded(true)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  image: {
    position: "absolute",
  },
});
