import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/providers/ThemeProvider";
import { SupportedLanguage } from "@/types";

const LANGUAGE_CODES: Record<SupportedLanguage, string> = {
  tr: "tr-TR",
  en: "en-US",
  sv: "sv-SE",
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  pt: "pt-BR",
};

function stripMarkers(text: string): string {
  return text.replace(/([*#%@+&{~])(.*?)\1/g, "$2");
}

interface AudioButtonProps {
  text: string;
  language: SupportedLanguage;
  size?: number;
  color?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  text,
  language,
  size = 28,
  color,
}) => {
  const [speaking, setSpeaking] = useState(false);
  const { colors } = useTheme();

  const handlePress = async () => {
    if (speaking) {
      await Speech.stop();
      setSpeaking(false);
      return;
    }

    const plainText = stripMarkers(text);
    if (!plainText.trim()) return;

    setSpeaking(true);
    Speech.speak(plainText, {
      language: LANGUAGE_CODES[language],
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      activeOpacity={0.7}
    >
      <Ionicons
        name={speaking ? "stop-circle" : "volume-high-outline"}
        size={size}
        color={color ?? colors.primary}
      />
    </TouchableOpacity>
  );
};
