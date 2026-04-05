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

  if (data?.error === "trial_expired") {
    throw new Error("trial_expired");
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return { translatedText: data.translatedText };
}

// ── Trial management ──────────────────────────────────────────────────────────
// The Edge Function is the authoritative source — it sets ai_trial_started_at
// in profiles on first use. AsyncStorage is a local cache for fast UI rendering.

export async function getAITrialStartDate(): Promise<Date | null> {
  // 1. Try local cache first
  try {
    const stored = await AsyncStorage.getItem(AI_TRIAL_START_KEY);
    if (stored) return new Date(stored);
  } catch {
    // ignore storage errors
  }

  // 2. Cache miss — fetch from DB (covers reinstall / cleared storage)
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_trial_started_at")
      .eq("id", user.id)
      .single();

    const dbDate = profile?.ai_trial_started_at as string | null;
    if (dbDate) {
      // Populate cache for next time
      await AsyncStorage.setItem(AI_TRIAL_START_KEY, dbDate).catch(() => {});
      return new Date(dbDate);
    }
  } catch {
    // ignore network errors
  }

  return null;
}

export async function initAITrial(): Promise<Date | null> {
  // Server sets the trial date on first translation.
  // This just ensures the local cache is populated.
  return getAITrialStartDate();
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
    // Trial not started yet — will start on first translation
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
