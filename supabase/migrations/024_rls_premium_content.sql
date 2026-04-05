-- ============================================================
-- Migration 024: Server-side RLS for premium content
--
-- Problem: sentences, reading_texts, and reading_text_keywords had
-- USING (true) policies. Any authenticated user could query the
-- Supabase API directly and read all premium content, bypassing
-- client-side filters entirely.
--
-- Fix: Replace with policies that only expose premium content to
-- users whose profiles.is_premium = true.
--
-- The helper function is_premium_user() is marked STABLE so
-- PostgreSQL evaluates it once per query, not once per row.
-- ============================================================

-- Helper: returns the current user's premium status.
-- SECURITY DEFINER reads profiles without triggering profiles RLS.
CREATE OR REPLACE FUNCTION is_premium_user()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public AS $$
  SELECT COALESCE(is_premium, false) FROM profiles WHERE id = auth.uid();
$$;

-- ── sentences ────────────────────────────────────────────────────────────────
-- Free users only see sentences belonging to free categories.
-- Premium users see everything.

DROP POLICY "Everyone can read sentences" ON sentences;

CREATE POLICY "sentences_select"
  ON sentences FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM categories
      WHERE id = sentences.category_id AND is_free = true
    )
    OR is_premium_user()
  );

-- ── reading_texts ─────────────────────────────────────────────────────────────
-- Free users only see non-premium texts.
-- Premium users see everything.

DROP POLICY "reading_texts_select_all" ON reading_texts;

CREATE POLICY "reading_texts_select"
  ON reading_texts FOR SELECT
  USING (is_premium = false OR is_premium_user());

-- ── reading_text_keywords ─────────────────────────────────────────────────────
-- Keywords follow the same access rules as their parent reading text.

DROP POLICY "reading_text_keywords_select_all" ON reading_text_keywords;

CREATE POLICY "reading_text_keywords_select"
  ON reading_text_keywords FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reading_texts rt
      WHERE rt.id = reading_text_keywords.reading_text_id
        AND (rt.is_premium = false OR is_premium_user())
    )
  );
