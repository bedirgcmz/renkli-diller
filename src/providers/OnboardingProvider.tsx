import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  COACH_DONE: "@parlio/onboarding_coach_marks_done",
  HINT_LEARNED: "@parlio/hint_learned",
  HINT_ADD_TO_LEARNING: "@parlio/hint_add_to_learning",
  HINT_REMOVE_LEARNING: "@parlio/hint_remove_learning",
  HINT_QUIZ_DONE: "@parlio/hint_quiz_done",
  HINT_ADD_SENTENCE: "@parlio/hint_add_sentence",
  HINT_AI_TRANSLATE: "@parlio/hint_ai_translate",
};

export type HintKey =
  | "learned"
  | "addToLearning"
  | "removeLearning"
  | "quizDone"
  | "addSentence"
  | "aiTranslate";

const HINT_KEY_MAP: Record<HintKey, string> = {
  learned: KEYS.HINT_LEARNED,
  addToLearning: KEYS.HINT_ADD_TO_LEARNING,
  removeLearning: KEYS.HINT_REMOVE_LEARNING,
  quizDone: KEYS.HINT_QUIZ_DONE,
  addSentence: KEYS.HINT_ADD_SENTENCE,
  aiTranslate: KEYS.HINT_AI_TRANSLATE,
};

interface OnboardingContextType {
  isCoachMarksDone: boolean;
  isReady: boolean;
  markCoachMarksDone: () => void;
  isHintShown: (key: HintKey) => boolean;
  markHintShown: (key: HintKey) => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  isCoachMarksDone: true,
  isReady: false,
  markCoachMarksDone: () => {},
  isHintShown: () => true,
  markHintShown: () => {},
});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isCoachMarksDone, setIsCoachMarksDone] = useState(true);
  const [shownHints, setShownHints] = useState<Set<HintKey>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const storageKeys = [KEYS.COACH_DONE, ...Object.values(HINT_KEY_MAP)];
        const entries = await AsyncStorage.multiGet(storageKeys);
        const map = Object.fromEntries(entries.map(([k, v]) => [k, v ?? ""]));

        setIsCoachMarksDone(map[KEYS.COACH_DONE] === "true");

        const shown = new Set<HintKey>();
        for (const [hintKey, storageKey] of Object.entries(HINT_KEY_MAP) as [
          HintKey,
          string,
        ][]) {
          if (map[storageKey] === "true") shown.add(hintKey);
        }
        setShownHints(shown);
      } catch {}
      setIsReady(true);
    };
    load();
  }, []);

  const markCoachMarksDone = useCallback(() => {
    setIsCoachMarksDone(true);
    AsyncStorage.setItem(KEYS.COACH_DONE, "true").catch(() => {});
  }, []);

  const isHintShown = useCallback(
    (key: HintKey) => shownHints.has(key),
    [shownHints],
  );

  const markHintShown = useCallback((key: HintKey) => {
    setShownHints((prev) => new Set([...prev, key]));
    AsyncStorage.setItem(HINT_KEY_MAP[key], "true").catch(() => {});
  }, []);

  return (
    <OnboardingContext.Provider
      value={{ isCoachMarksDone, isReady, markCoachMarksDone, isHintShown, markHintShown }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);
