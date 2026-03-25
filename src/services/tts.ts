import * as Speech from "expo-speech";

const DEFAULT_RATE = 0.85;

export function speak(text: string, language?: string, rate?: number) {
  Speech.speak(text, { language, rate: rate ?? DEFAULT_RATE });
}

export function stopSpeaking() {
  Speech.stop();
}
