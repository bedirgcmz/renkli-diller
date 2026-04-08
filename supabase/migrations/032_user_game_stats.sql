-- ============================================================
-- Migration 032: User Game Stats Table
-- One row per user. Tracks league, cumulative score, personal bests.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_game_stats (
  user_id              UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  league               TEXT NOT NULL DEFAULT 'bronze' CHECK (league IN ('bronze', 'silver', 'gold')),
  cumulative_score     INTEGER NOT NULL DEFAULT 0 CHECK (cumulative_score >= 0),
  games_played         INTEGER NOT NULL DEFAULT 0 CHECK (games_played >= 0),
  best_speed_round     INTEGER NOT NULL DEFAULT 0 CHECK (best_speed_round >= 0),
  best_word_rain       INTEGER NOT NULL DEFAULT 0 CHECK (best_word_rain >= 0),
  last_played_at       TIMESTAMPTZ,
  league_updated_at    TIMESTAMPTZ DEFAULT NOW(),
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_game_stats ENABLE ROW LEVEL SECURITY;

-- User reads/writes own row
CREATE POLICY "users manage own game stats"
  ON user_game_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Leaderboard: other users can read league info (no sensitive data here)
CREATE POLICY "authenticated users read league info"
  ON user_game_stats FOR SELECT
  USING (auth.role() = 'authenticated');
