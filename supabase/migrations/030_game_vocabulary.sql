-- ============================================================
-- Migration 030: Game Vocabulary Table
-- Global curated word pool used in game modes (Speed Round, Word Rain)
-- ============================================================

CREATE TABLE IF NOT EXISTS game_vocabulary (
  id            BIGSERIAL PRIMARY KEY,
  source_lang   TEXT NOT NULL,
  target_lang   TEXT NOT NULL,
  source_text   TEXT NOT NULL,
  target_text   TEXT NOT NULL,
  difficulty    SMALLINT NOT NULL CHECK (difficulty IN (1, 2, 3)),
  length_bucket TEXT NOT NULL CHECK (length_bucket IN ('short', 'medium', 'long')),
  category      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Duplicate protection: same lang pair + same texts cannot appear twice
CREATE UNIQUE INDEX IF NOT EXISTS game_vocabulary_unique_pair
  ON game_vocabulary (source_lang, target_lang, LOWER(TRIM(source_text)), LOWER(TRIM(target_text)));

-- Query indexes
CREATE INDEX IF NOT EXISTS game_vocabulary_lang_diff
  ON game_vocabulary (target_lang, source_lang, difficulty);

CREATE INDEX IF NOT EXISTS game_vocabulary_lang_bucket
  ON game_vocabulary (target_lang, length_bucket);

-- RLS
ALTER TABLE game_vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read vocabulary"
  ON game_vocabulary FOR SELECT
  USING (auth.role() = 'authenticated');
