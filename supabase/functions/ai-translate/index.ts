import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { sourceText, sourceLang, targetLang } = await req.json();

    if (!sourceText || !sourceLang || !targetLang) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sourceLanguage = LANGUAGE_NAMES[sourceLang] ?? sourceLang;
    const targetLanguage = LANGUAGE_NAMES[targetLang] ?? targetLang;

    const prompt = `You are a language learning translation assistant.
Translate the following sentence from ${sourceLanguage} to ${targetLanguage}.

Rules:
1. Translate naturally and idiomatically — daily conversation style, NOT literal/dictionary style.
2. Capture idioms, expressions, colloquialisms, and culturally natural phrasing accurately.
3. If the source sentence contains **marked text** (wrapped in double asterisks), you MUST wrap the equivalent expression in the target language with ** markers too. Preserve the same number of marked segments.
4. Return ONLY the translated sentence. No explanations, no alternatives, no extra text.

Sentence: "${sourceText}"`;

    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
          topP: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", err);
      return new Response(
        JSON.stringify({ error: "Translation service error" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await response.json();
    const translatedText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    if (!translatedText) {
      return new Response(
        JSON.stringify({ error: "Empty translation response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ translatedText }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
