import * as Speech from "expo-speech";

export function speak(text: string, language?: string, rate?: number) {
  Speech.speak(text, { language, rate });
}

export function stopSpeaking() {
  Speech.stop();
}
