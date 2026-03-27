import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AI_TRIAL_START_KEY = "@ai_trial_start";
const TRIAL_DURATION_DAYS = 3;

export interface TranslateResult {
  translatedText: string;
}

export async function translateWithAI(
  sourceText: string,
  sourceLang: string,
  targetLang: string
): Promise<TranslateResult> {
  const { data, error } = await supabase.functions.invoke("smooth-handler", {
    body: { sourceText, sourceLang, targetLang },
  });

  if (error) {
    throw new Error(error.message ?? "Translation failed");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return { translatedText: data.translatedText };
}

// ── Trial management ──────────────────────────────────────────────────────────

export async function getAITrialStartDate(): Promise<Date | null> {
  try {
    const stored = await AsyncStorage.getItem(AI_TRIAL_START_KEY);
    if (!stored) return null;
    return new Date(stored);
  } catch {
    return null;
  }
}

export async function initAITrial(): Promise<Date> {
  const existing = await getAITrialStartDate();
  if (existing) return existing;

  const now = new Date();
  await AsyncStorage.setItem(AI_TRIAL_START_KEY, now.toISOString());
  return now;
}

export async function getAITrialStatus(isPremium: boolean): Promise<{
  hasAccess: boolean;
  daysLeft: number;
  trialStarted: boolean;
}> {
  if (isPremium) {
    return { hasAccess: true, daysLeft: Infinity, trialStarted: true };
  }

  const startDate = await getAITrialStartDate();
  if (!startDate) {
    // Trial not started yet — will start on first open
    return { hasAccess: true, daysLeft: TRIAL_DURATION_DAYS, trialStarted: false };
  }

  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, TRIAL_DURATION_DAYS - diffDays);

  return {
    hasAccess: daysLeft > 0,
    daysLeft,
    trialStarted: true,
  };
}
