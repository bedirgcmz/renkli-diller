import React from 'react';
import { View, ViewStyle } from 'react-native';

type LinearGradientType = typeof import('expo-linear-gradient').LinearGradient;
let LinearGradient: LinearGradientType | null = null;
try {
  LinearGradient = require('expo-linear-gradient').LinearGradient as LinearGradientType;
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
        colors={colors as [string, string, ...string[]]}
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
