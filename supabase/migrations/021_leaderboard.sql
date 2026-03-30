-- ============================================================
-- Migration 021: Weekly Leaderboard
-- - Adds leaderboard_visible column to profiles
-- - Creates get_weekly_leaderboard() RPC function
-- ============================================================

-- 1. Add opt-out column to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS leaderboard_visible BOOLEAN NOT NULL DEFAULT true;

-- 2. Weekly leaderboard RPC
--    Returns all users who have activity this week, ranked by:
--      learned_rank  → weekly_learned DESC
--      studied_rank  → weekly_studied DESC
--    Only includes users where leaderboard_visible = true.
--    Uses SECURITY DEFINER so authenticated users can read other
--    users' aggregate counts without accessing raw rows (RLS bypass
--    is intentional and safe here — only aggregates are returned).

CREATE OR REPLACE FUNCTION get_weekly_leaderboard()
RETURNS TABLE (
  user_id       UUID,
  display_name  TEXT,
  avatar_url    TEXT,
  weekly_learned BIGINT,
  weekly_studied BIGINT,
  learned_rank  BIGINT,
  studied_rank  BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH week_start AS (
    -- ISO week: Monday 00:00 UTC
    SELECT date_trunc('week', NOW() AT TIME ZONE 'UTC') AS ws
  ),

  -- Preset sentence learning (user_progress table)
  preset_learned AS (
    SELECT user_id, COUNT(*) AS cnt
    FROM user_progress
    WHERE learned_at >= (SELECT ws FROM week_start)
      AND state = 'learned'
    GROUP BY user_id
  ),

  -- User's own sentence learning (user_sentences table)
  own_learned AS (
    SELECT user_id, COUNT(*) AS cnt
    FROM user_sentences
    WHERE learned_at >= (SELECT ws FROM week_start)
      AND state = 'learned'
    GROUP BY user_id
  ),

  -- Combined learned count per user
  total_learned AS (
    SELECT user_id, SUM(cnt) AS weekly_learned
    FROM (
      SELECT user_id, cnt FROM preset_learned
      UNION ALL
      SELECT user_id, cnt FROM own_learned
    ) combined
    GROUP BY user_id
  ),

  -- Quiz/study activity this week
  total_studied AS (
    SELECT user_id, COUNT(*) AS weekly_studied
    FROM quiz_results
    WHERE answered_at >= (SELECT ws FROM week_start)
    GROUP BY user_id
  ),

  -- Join with profiles, filter invisible users and zero-activity users
  combined AS (
    SELECT
      p.id                                          AS user_id,
      COALESCE(p.display_name, 'Anonim')           AS display_name,
      p.avatar_url,
      COALESCE(tl.weekly_learned, 0)               AS weekly_learned,
      COALESCE(ts.weekly_studied, 0)               AS weekly_studied
    FROM profiles p
    LEFT JOIN total_learned tl ON tl.user_id = p.id
    LEFT JOIN total_studied  ts ON ts.user_id = p.id
    WHERE p.leaderboard_visible = true
      AND (
        COALESCE(tl.weekly_learned, 0) > 0
        OR COALESCE(ts.weekly_studied, 0) > 0
      )
  )

  SELECT
    user_id,
    display_name,
    avatar_url,
    weekly_learned,
    weekly_studied,
    RANK() OVER (ORDER BY weekly_learned DESC, weekly_studied DESC) AS learned_rank,
    RANK() OVER (ORDER BY weekly_studied DESC, weekly_learned DESC) AS studied_rank
  FROM combined
  ORDER BY weekly_learned DESC, weekly_studied DESC;
$$;

-- 3. Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION get_weekly_leaderboard() TO authenticated;
