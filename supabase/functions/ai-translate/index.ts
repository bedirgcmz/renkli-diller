import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
4. If the source sentence contains text wrapped in double asterisks (**word**), you MUST wrap the equivalent translated expression in ** markers too. Preserve the exact same number of marked segments. Do not remove, merge, or add ** markers.
5. Return ONLY the translated sentence. No explanations, no alternatives, no extra text.`;

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
      maxOutputTokens: 100,
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
    const { sourceText, sourceLang, targetLang } = await req.json();

    if (!sourceText || !sourceLang || !targetLang) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
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
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ translatedText, model: usedModel }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
