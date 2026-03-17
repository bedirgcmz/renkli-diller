import React from 'react';
import { View, ViewStyle } from 'react-native';

let LinearGradient: any = null;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient;
} catch {}

interface Props {
  colors: string[];
  style?: ViewStyle | ViewStyle[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
}

export function GradientView({ colors, style, start, end, children }: Props) {
  if (LinearGradient) {
    return (
      <LinearGradient
        colors={colors}
        start={start ?? { x: 0, y: 0 }}
        end={end ?? { x: 1, y: 0 }}
        style={style}
      >
        {children}
      </LinearGradient>
    );
  }
  return (
    <View style={[style, { backgroundColor: colors[0] }]}>
      {children}
    </View>
  );
}
