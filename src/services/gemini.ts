import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AI_TRIAL_START_KEY = "@ai_trial_start";
const AI_TRIAL_DAILY_COUNT_KEY = "@ai_trial_daily_count";
const AI_TRIAL_DAILY_DATE_KEY = "@ai_trial_daily_date";

export const TRIAL_DURATION_DAYS = 3;
export const TRIAL_DAILY_LIMIT = 15;

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
    // error.context contains the raw response text for non-2xx responses
    try {
      const body = typeof error.context === "string"
        ? JSON.parse(error.context)
        : error.context;
      if (body?.error === "trial_expired") throw new Error("trial_expired");
      if (body?.error === "daily_limit_reached") throw new Error("daily_limit_reached");
      if (body?.error) throw new Error(body.error);
    } catch (parseErr) {
      if (parseErr instanceof Error && parseErr.message !== error.message) {
        throw parseErr; // re-throw the specific error (trial_expired, daily_limit_reached, etc.)
      }
    }
    throw new Error(error.message ?? "Translation failed");
  }

  if (data?.error === "trial_expired") {
    throw new Error("trial_expired");
  }

  if (data?.error === "daily_limit_reached") {
    throw new Error("daily_limit_reached");
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

// ── Daily count (local cache) ─────────────────────────────────────────────────

export async function getDailyCount(): Promise<{ count: number; date: string }> {
  const today = new Date().toISOString().split("T")[0];
  try {
    const storedDate = await AsyncStorage.getItem(AI_TRIAL_DAILY_DATE_KEY);
    if (storedDate !== today) {
      return { count: 0, date: today };
    }
    const stored = await AsyncStorage.getItem(AI_TRIAL_DAILY_COUNT_KEY);
    return { count: stored ? parseInt(stored, 10) : 0, date: today };
  } catch {
    return { count: 0, date: today };
  }
}

export async function incrementLocalDailyCount(): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const { count } = await getDailyCount();
  const newCount = count + 1;
  try {
    await AsyncStorage.setItem(AI_TRIAL_DAILY_COUNT_KEY, String(newCount));
    await AsyncStorage.setItem(AI_TRIAL_DAILY_DATE_KEY, today);
  } catch {
    // ignore storage errors
  }
  return newCount;
}

// ── Status ────────────────────────────────────────────────────────────────────

export async function getAITrialStatus(isPremium: boolean): Promise<{
  hasAccess: boolean;
  daysLeft: number;
  trialStarted: boolean;
  dailyCount: number;
  dailyLimitReached: boolean;
}> {
  if (isPremium) {
    return { hasAccess: true, daysLeft: Infinity, trialStarted: true, dailyCount: 0, dailyLimitReached: false };
  }

  const startDate = await getAITrialStartDate();
  if (!startDate) {
    // Trial not started yet — will start on first translation
    return { hasAccess: true, daysLeft: TRIAL_DURATION_DAYS, trialStarted: false, dailyCount: 0, dailyLimitReached: false };
  }

  const now = new Date();
  const diffMs = now.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, TRIAL_DURATION_DAYS - diffDays);

  if (daysLeft === 0) {
    return { hasAccess: false, daysLeft: 0, trialStarted: true, dailyCount: 0, dailyLimitReached: false };
  }

  const { count: dailyCount } = await getDailyCount();
  const dailyLimitReached = dailyCount >= TRIAL_DAILY_LIMIT;

  return {
    hasAccess: !dailyLimitReached,
    daysLeft,
    trialStarted: true,
    dailyCount,
    dailyLimitReached,
  };
}
