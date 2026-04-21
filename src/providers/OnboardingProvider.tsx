import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuthStore } from "@/store/useAuthStore";

const KEYS = {
  HINT_LEARNED: "@parlio/hint_learned",
  HINT_ADD_TO_LEARNING: "@parlio/hint_add_to_learning",
  HINT_REMOVE_LEARNING: "@parlio/hint_remove_learning",
  HINT_QUIZ_DONE: "@parlio/hint_quiz_done",
  HINT_ADD_SENTENCE: "@parlio/hint_add_sentence",
  HINT_AI_TRANSLATE: "@parlio/hint_ai_translate",
  HINT_PREMIUM_INTRO: "@parlio/hint_premium_intro",
};

export type HintKey =
  | "learned"
  | "addToLearning"
  | "removeLearning"
  | "quizDone"
  | "addSentence"
  | "aiTranslate"
  | "premiumIntro";

const HINT_KEY_MAP: Record<HintKey, string> = {
  learned: KEYS.HINT_LEARNED,
  addToLearning: KEYS.HINT_ADD_TO_LEARNING,
  removeLearning: KEYS.HINT_REMOVE_LEARNING,
  quizDone: KEYS.HINT_QUIZ_DONE,
  addSentence: KEYS.HINT_ADD_SENTENCE,
  aiTranslate: KEYS.HINT_AI_TRANSLATE,
  premiumIntro: KEYS.HINT_PREMIUM_INTRO,
};

function getScopedKey(baseKey: string, userId: string | null): string {
  return userId ? `${baseKey}:${userId}` : `${baseKey}:guest`;
}

interface OnboardingContextType {
  isReady: boolean;
  isHintShown: (key: HintKey) => boolean;
  markHintShown: (key: HintKey) => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  isReady: false,
  isHintShown: () => true,
  markHintShown: () => {},
});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const [isReady, setIsReady] = useState(false);
  const [shownHints, setShownHints] = useState<Set<HintKey>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsReady(false);
      setShownHints(new Set());

      try {
        const storageKeys = [
          ...Object.values(HINT_KEY_MAP).map((key) => getScopedKey(key, userId)),
        ];
        const entries = await AsyncStorage.multiGet(storageKeys);
        const map = Object.fromEntries(entries.map(([k, v]) => [k, v ?? ""]));

        if (cancelled) return;

        const shown = new Set<HintKey>();
        for (const [hintKey, storageKey] of Object.entries(HINT_KEY_MAP) as [
          HintKey,
          string,
        ][]) {
          if (map[getScopedKey(storageKey, userId)] === "true") shown.add(hintKey);
        }
        setShownHints(shown);
      } catch {
        if (cancelled) return;
        setShownHints(new Set());
      }

      if (!cancelled) {
        setIsReady(true);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isHintShown = useCallback(
    (key: HintKey) => shownHints.has(key),
    [shownHints],
  );

  const markHintShown = useCallback((key: HintKey) => {
    setShownHints((prev) => new Set([...prev, key]));
    AsyncStorage.setItem(getScopedKey(HINT_KEY_MAP[key], userId), "true").catch(() => {});
  }, [userId]);

  return (
    <OnboardingContext.Provider
      value={{ isReady, isHintShown, markHintShown }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
