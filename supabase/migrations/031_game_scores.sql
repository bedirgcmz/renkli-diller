-- ============================================================
-- Migration 031: Game Scores Table
-- Stores every completed game session result.
-- session_id (UUID) ensures no duplicate submits.
-- ============================================================

CREATE TABLE IF NOT EXISTS game_scores (
  id             BIGSERIAL PRIMARY KEY,
  user_id        UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  game_type      TEXT NOT NULL CHECK (game_type IN ('speed_round', 'word_rain')),
  score          INTEGER NOT NULL CHECK (score >= 0),
  accuracy       NUMERIC(5,2) CHECK (accuracy >= 0 AND accuracy <= 100),
  combo_max      INTEGER CHECK (combo_max >= 0),
  correct_count  INTEGER NOT NULL DEFAULT 0 CHECK (correct_count >= 0),
  wrong_count    INTEGER NOT NULL DEFAULT 0 CHECK (wrong_count >= 0),
  missed_count   INTEGER DEFAULT 0 CHECK (missed_count >= 0),
  duration_sec   INTEGER NOT NULL CHECK (duration_sec >= 0),
  level_reached  INTEGER DEFAULT 1 CHECK (level_reached >= 1),
  pool_size      INTEGER,
  filter_used    TEXT CHECK (filter_used IN ('global', 'user_learning', 'user_learned', 'mixed')),
  source_lang    TEXT,
  target_lang    TEXT,
  league_at_play TEXT CHECK (league_at_play IN ('bronze', 'silver', 'gold')),
  session_id     UUID NOT NULL,
  played_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Duplicate submit protection
CREATE UNIQUE INDEX IF NOT EXISTS game_scores_session_unique
  ON game_scores (session_id);

-- Leaderboard queries
CREATE INDEX IF NOT EXISTS game_scores_type_score
  ON game_scores (game_type, score DESC);

CREATE INDEX IF NOT EXISTS game_scores_user_type_date
  ON game_scores (user_id, game_type, played_at DESC);

-- RLS
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users insert own scores"
  ON game_scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "authenticated users read leaderboard"
  ON game_scores FOR SELECT
  USING (auth.role() = 'authenticated');
