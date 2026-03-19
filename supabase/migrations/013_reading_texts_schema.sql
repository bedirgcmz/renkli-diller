-- ============================================================
-- Migration 013: Reading Texts Feature
-- Tables: reading_texts, reading_text_keywords, user_reading_progress
-- ============================================================

-- ── 1. reading_texts ─────────────────────────────────────────────────────────
CREATE TABLE reading_texts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text UNIQUE NOT NULL,           -- e.g. 'daily-life-morning-coffee'
  category         text NOT NULL,                  -- 'daily_life' | 'travel' | 'work' | 'food' | etc.
  difficulty       smallint NOT NULL DEFAULT 1     -- 1=beginner 2=intermediate 3=advanced
                   CHECK (difficulty BETWEEN 1 AND 3),
  is_premium       boolean NOT NULL DEFAULT false,
  order_index      integer NOT NULL DEFAULT 0,     -- lower = shown earlier (first 10 free)
  estimated_reading_seconds integer,               -- e.g. 90 → "~1.5 min"

  -- Titles (all 7 UI languages)
  title_tr         text,
  title_en         text,
  title_sv         text,
  title_de         text,
  title_es         text,
  title_fr         text,
  title_pt         text,

  -- Body text with **keyword** markers (all 7 UI languages)
  -- Keywords are marked as **word** in order; position matches reading_text_keywords.position_index
  body_tr          text,
  body_en          text,
  body_sv          text,
  body_de          text,
  body_es          text,
  body_fr          text,
  body_pt          text,

  created_at       timestamptz NOT NULL DEFAULT now()
);

-- ── 2. reading_text_keywords ─────────────────────────────────────────────────
-- Each row = one keyword in a text.
-- position_index (0-based) maps to the N-th **...**  occurrence in each body column.
-- color_index (0-5) is fixed at seed time → same word gets same color in all languages.
CREATE TABLE reading_text_keywords (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_text_id   uuid NOT NULL REFERENCES reading_texts(id) ON DELETE CASCADE,
  position_index    smallint NOT NULL CHECK (position_index BETWEEN 0 AND 5), -- max 6 keywords
  color_index       smallint NOT NULL CHECK (color_index BETWEEN 0 AND 9),    -- maps to palette

  -- Keyword translation in all 7 languages (must match what appears between ** in body)
  keyword_tr        text,
  keyword_en        text,
  keyword_sv        text,
  keyword_de        text,
  keyword_es        text,
  keyword_fr        text,
  keyword_pt        text,

  UNIQUE (reading_text_id, position_index)
);

-- ── 3. user_reading_progress ─────────────────────────────────────────────────
CREATE TABLE user_reading_progress (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reading_text_id   uuid NOT NULL REFERENCES reading_texts(id) ON DELETE CASCADE,
  status            text NOT NULL DEFAULT 'read'   -- 'read' | 'learned'
                   CHECK (status IN ('read', 'learned')),
  completed_at      timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, reading_text_id)
);

-- ── 4. Indexes ────────────────────────────────────────────────────────────────
CREATE INDEX idx_reading_texts_category      ON reading_texts(category);
CREATE INDEX idx_reading_texts_order         ON reading_texts(order_index);
CREATE INDEX idx_reading_texts_premium       ON reading_texts(is_premium);
CREATE INDEX idx_rtk_reading_text_id         ON reading_text_keywords(reading_text_id);
CREATE INDEX idx_rtk_position                ON reading_text_keywords(reading_text_id, position_index);
CREATE INDEX idx_urp_user_id                 ON user_reading_progress(user_id);
CREATE INDEX idx_urp_user_text               ON user_reading_progress(user_id, reading_text_id);
CREATE INDEX idx_urp_status                  ON user_reading_progress(user_id, status);

-- ── 5. RLS Policies ───────────────────────────────────────────────────────────
ALTER TABLE reading_texts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_text_keywords  ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reading_progress  ENABLE ROW LEVEL SECURITY;

-- reading_texts: publicly readable
CREATE POLICY "reading_texts_select_all"
  ON reading_texts FOR SELECT
  USING (true);

-- reading_text_keywords: publicly readable
CREATE POLICY "reading_text_keywords_select_all"
  ON reading_text_keywords FOR SELECT
  USING (true);

-- user_reading_progress: users manage their own rows only
CREATE POLICY "urp_select_own"
  ON user_reading_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "urp_insert_own"
  ON user_reading_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "urp_update_own"
  ON user_reading_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "urp_delete_own"
  ON user_reading_progress FOR DELETE
  USING (auth.uid() = user_id);
