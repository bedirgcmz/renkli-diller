import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";

const MODELS = {
  lite: "gemini-2.5-flash-lite:generateContent",
  flash: "gemini-2.5-flash:generateContent",
};

const GEMINI_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models/";

const LANGUAGE_NAMES: Record<string, string> = {
  tr: "Turkish",
  en: "English",
  sv: "Swedish",
  de: "German",
  es: "Spanish",
  fr: "French",
  pt: "Portuguese",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_INSTRUCTION = `You are a translation assistant for language learners.

Rules:
1. Translate naturally using simple, everyday spoken language. Never translate word-for-word.
2. Use common daily expressions (A2-B1 level). Avoid advanced, literary, or rare phrases.
3. Keep grammar simple and vocabulary familiar to learners.
4. If the source sentence contains text wrapped in double asterisks (**word**), you MUST wrap the equivalent translated expression in ** markers too. Preserve the exact same number of marked segments. Do not remove, merge, or add ** markers. Even if two source markers translate to the same word in the target language, each must have its own ** marker (e.g. **the more** you work, **the more** you learn).
5. Always close every ** marker you open. Never leave an unclosed **.
6. Return ONLY the translated sentence. No explanations, no alternatives, no extra text.`;

const TRIAL_DURATION_DAYS = 3;
const DAILY_LIMIT = 15;

function countMarkers(text: string): number {
  return (text.match(/\*\*[^*]+\*\*/g) ?? []).length;
}

async function callGemini(
  model: "lite" | "flash",
  userPrompt: string
): Promise<string | null> {
  const url = `${GEMINI_BASE}${MODELS[model]}?key=${GEMINI_API_KEY}`;

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }],
      },
    ],
    generationConfig: {
      temperature: 0.15,
      maxOutputTokens: 256,
      topP: 0.9,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error(`Gemini ${model} error:`, err);
    return null;
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
  // ── 1. Identify user from JWT ────────────────────────────────────────────────
  // Gateway verifies the JWT (verify_jwt = true in config).
  // We still need the token to identify the user and query their profile.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // ── 2. Check premium / trial access ─────────────────────────────────────────
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile } = await adminClient
    .from("profiles")
    .select("is_premium, ai_trial_started_at, ai_daily_count, ai_daily_date")
    .eq("id", user.id)
    .single();

  const isPremium = profile?.is_premium ?? false;

  if (!isPremium) {
    const now = new Date();
    let trialStartedAt: Date;

    if (!profile?.ai_trial_started_at) {
      // First use — start the trial server-side
      await adminClient
        .from("profiles")
        .update({ ai_trial_started_at: now.toISOString() })
        .eq("id", user.id);
      trialStartedAt = now;
    } else {
      trialStartedAt = new Date(profile.ai_trial_started_at);
    }

    const diffDays =
      (now.getTime() - trialStartedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays >= TRIAL_DURATION_DAYS) {
      return new Response(
        JSON.stringify({ error: "trial_expired" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Daily limit check ────────────────────────────────────────────────────
    const todayDate = now.toISOString().split("T")[0]; // YYYY-MM-DD (UTC)
    const aiDailyDate = profile?.ai_daily_date as string | null;
    const aiDailyCount = (profile?.ai_daily_count as number) ?? 0;

    let newDailyCount: number;
    if (aiDailyDate !== todayDate) {
      // New day — reset to 1 (this request counts as the first use)
      newDailyCount = 1;
    } else if (aiDailyCount >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: "daily_limit_reached" }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      newDailyCount = aiDailyCount + 1;
    }

    await adminClient
      .from("profiles")
      .update({ ai_daily_count: newDailyCount, ai_daily_date: todayDate })
      .eq("id", user.id);
  }

  // ── 3. Translate ─────────────────────────────────────────────────────────────
  try {
    const { sourceText, sourceLang, targetLang } = await req.json();

    if (!sourceText || !sourceLang || !targetLang) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof sourceText !== "string" || sourceText.length > 500) {
      return new Response(
        JSON.stringify({ error: "sourceText must be 500 characters or fewer" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sourceLanguage = LANGUAGE_NAMES[sourceLang] ?? sourceLang;
    const targetLanguage = LANGUAGE_NAMES[targetLang] ?? targetLang;
    const expectedMarkers = countMarkers(sourceText);

    const userPrompt = `Translate from ${sourceLanguage} to ${targetLanguage}:\n${sourceText}`;

    let translatedText = await callGemini("lite", userPrompt);
    let usedModel = "lite";

    const liteMarkerCount = translatedText ? countMarkers(translatedText) : -1;
    const markerMismatch = expectedMarkers > 0 && liteMarkerCount !== expectedMarkers;

    if (!translatedText || markerMismatch) {
      console.warn(
        `Lite fallback triggered. Expected markers: ${expectedMarkers}, got: ${liteMarkerCount}`
      );
      translatedText = await callGemini("flash", userPrompt);
      usedModel = "flash";
    }

    if (!translatedText) {
      return new Response(
        JSON.stringify({ error: "Translation service error" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ translatedText, model: usedModel }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[smooth-handler] translate error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  } catch (err) {
    console.error("[smooth-handler] unhandled error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
