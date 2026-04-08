-- ============================================================
-- Migration 033: Game RPC Functions
--   1. submit_game_score    — server-side score calc + anti-cheat
--   2. check_inactivity_demotion — league demotion on inactivity
--   3. get_game_leaderboard — weekly/alltime leaderboard
-- ============================================================

-- ----------------------------------------------------------------
-- 1. submit_game_score
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION submit_game_score(
  p_session_id    UUID,
  p_game_type     TEXT,
  p_correct       INTEGER,
  p_wrong         INTEGER,
  p_missed        INTEGER,
  p_duration_sec  INTEGER,
  p_combo_max     INTEGER,
  p_level_reached INTEGER,
  p_pool_size     INTEGER,
  p_filter_used   TEXT,
  p_source_lang   TEXT,
  p_target_lang   TEXT
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id          UUID := auth.uid();
  v_score            INTEGER;
  v_accuracy         NUMERIC(5,2);
  v_daily_count      INTEGER;
  v_is_premium       BOOLEAN;
  v_daily_limit      INTEGER;
  v_old_best         INTEGER := 0;
  v_new_best_speed   INTEGER;
  v_new_best_rain    INTEGER;
  v_old_league       TEXT := 'bronze';
  v_new_league       TEXT;
  v_league_changed   BOOLEAN := FALSE;
  v_rows_inserted    INTEGER;
  v_cum_score        INTEGER;
  v_weekly_rank      INTEGER;
  v_stats_exists     BOOLEAN;
BEGIN
  -- Basic input validation
  IF p_correct < 0 OR p_wrong < 0 OR p_missed < 0 THEN
    RETURN jsonb_build_object('error', 'invalid_stats');
  END IF;
  IF p_combo_max > GREATEST(p_correct, 1) THEN
    RETURN jsonb_build_object('error', 'invalid_combo');
  END IF;
  IF p_game_type NOT IN ('speed_round', 'word_rain') THEN
    RETURN jsonb_build_object('error', 'invalid_game_type');
  END IF;

  -- Server-side daily limit (profiles.id = auth.uid())
  SELECT is_premium INTO v_is_premium FROM profiles WHERE id = v_user_id;
  v_daily_limit := CASE WHEN v_is_premium THEN 9999 ELSE 3 END;

  SELECT COUNT(*) INTO v_daily_count
  FROM game_scores
  WHERE user_id = v_user_id
    AND game_type = p_game_type
    AND DATE(played_at AT TIME ZONE 'UTC') = CURRENT_DATE;

  IF v_daily_count >= v_daily_limit THEN
    RETURN jsonb_build_object('error', 'daily_limit_reached');
  END IF;

  -- Read existing stats (for old best + league, BEFORE update)
  SELECT
    league,
    CASE WHEN p_game_type = 'speed_round' THEN best_speed_round ELSE best_word_rain END
  INTO v_old_league, v_old_best
  FROM user_game_stats WHERE user_id = v_user_id;

  v_old_league := COALESCE(v_old_league, 'bronze');
  v_old_best   := COALESCE(v_old_best, 0);

  -- Server-side score calculation
  v_score := (p_correct * 10) + (p_combo_max * 5);
  IF p_game_type = 'word_rain' THEN
    v_score := v_score + ((GREATEST(p_level_reached, 1) - 1) * 20);
  END IF;

  -- Accuracy
  v_accuracy := CASE
    WHEN (p_correct + p_wrong) > 0
    THEN ROUND(p_correct::NUMERIC / (p_correct + p_wrong) * 100, 2)
    ELSE 0
  END;

  -- Insert (session_id UNIQUE → duplicate guard)
  INSERT INTO game_scores (
    user_id, game_type, score, accuracy, combo_max,
    correct_count, wrong_count, missed_count, duration_sec,
    level_reached, pool_size, filter_used, source_lang, target_lang,
    league_at_play, session_id
  ) VALUES (
    v_user_id, p_game_type, v_score, v_accuracy, p_combo_max,
    p_correct, p_wrong, p_missed, p_duration_sec,
    p_level_reached, p_pool_size, p_filter_used, p_source_lang, p_target_lang,
    v_old_league, p_session_id
  )
  ON CONFLICT (session_id) DO NOTHING;

  GET DIAGNOSTICS v_rows_inserted = ROW_COUNT;

  -- Duplicate session: do NOT update stats
  IF v_rows_inserted = 0 THEN
    RETURN jsonb_build_object('error', 'duplicate_session');
  END IF;

  -- Compute new best values
  v_new_best_speed := CASE
    WHEN p_game_type = 'speed_round' AND v_score > v_old_best THEN v_score
    ELSE COALESCE((SELECT best_speed_round FROM user_game_stats WHERE user_id = v_user_id), 0)
  END;

  v_new_best_rain := CASE
    WHEN p_game_type = 'word_rain' AND v_score > v_old_best THEN v_score
    ELSE COALESCE((SELECT best_word_rain FROM user_game_stats WHERE user_id = v_user_id), 0)
  END;

  -- Upsert user_game_stats (only runs if insert above succeeded)
  INSERT INTO user_game_stats (
    user_id, cumulative_score, games_played,
    best_speed_round, best_word_rain, last_played_at, league
  ) VALUES (
    v_user_id, v_score, 1,
    v_new_best_speed, v_new_best_rain, NOW(), 'bronze'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    cumulative_score = user_game_stats.cumulative_score + v_score,
    games_played     = user_game_stats.games_played + 1,
    best_speed_round = v_new_best_speed,
    best_word_rain   = v_new_best_rain,
    last_played_at   = NOW();

  -- Read updated cumulative score
  SELECT cumulative_score INTO v_cum_score
  FROM user_game_stats WHERE user_id = v_user_id;

  -- League promotion check (demotion handled separately)
  v_new_league := CASE
    WHEN v_cum_score >= 5000 THEN 'gold'
    WHEN v_cum_score >= 1000 THEN 'silver'
    ELSE 'bronze'
  END;

  IF v_new_league != v_old_league AND (
    (v_new_league = 'gold'   AND v_old_league IN ('bronze', 'silver')) OR
    (v_new_league = 'silver' AND v_old_league = 'bronze')
  ) THEN
    UPDATE user_game_stats
    SET league = v_new_league, league_updated_at = NOW()
    WHERE user_id = v_user_id;
    v_league_changed := TRUE;
  ELSE
    v_new_league := v_old_league;
  END IF;

  -- Weekly rank
  SELECT rank INTO v_weekly_rank FROM (
    SELECT
      user_id,
      RANK() OVER (ORDER BY MAX(score) DESC) AS rank
    FROM game_scores
    WHERE game_type = p_game_type
      AND played_at >= DATE_TRUNC('week', NOW() AT TIME ZONE 'UTC')
    GROUP BY user_id
  ) ranked
  WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'score',                v_score,
    'accuracy',             v_accuracy,
    'personal_best_broken', v_score > v_old_best,
    'old_best',             v_old_best,
    'league',               v_new_league,
    'league_changed',       v_league_changed,
    'old_league',           v_old_league,
    'weekly_rank',          v_weekly_rank,
    'cumulative_score',     v_cum_score
  );
END;
$$;

GRANT EXECUTE ON FUNCTION submit_game_score(UUID, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT) TO authenticated;


-- ----------------------------------------------------------------
-- 2. check_inactivity_demotion
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_inactivity_demotion()
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id    UUID := auth.uid();
  v_league     TEXT;
  v_last_played TIMESTAMPTZ;
  v_days       INTEGER;
  v_new_league TEXT;
BEGIN
  SELECT league, last_played_at
  INTO v_league, v_last_played
  FROM user_game_stats WHERE user_id = v_user_id;

  -- No stats yet → nothing to demote
  IF v_league IS NULL OR v_last_played IS NULL THEN
    RETURN jsonb_build_object('demoted', false);
  END IF;

  -- Already at bottom
  IF v_league = 'bronze' THEN
    RETURN jsonb_build_object('demoted', false, 'league', 'bronze');
  END IF;

  v_days := EXTRACT(DAY FROM (NOW() - v_last_played))::INTEGER;
  v_new_league := v_league;

  -- Soft demotion thresholds (MVP: tolerant)
  -- 10+ days → bronze directly
  -- 5+ days  → one league down
  IF v_days >= 10 THEN
    v_new_league := 'bronze';
  ELSIF v_days >= 5 THEN
    IF v_league = 'gold'   THEN v_new_league := 'silver'; END IF;
    IF v_league = 'silver' THEN v_new_league := 'bronze'; END IF;
  END IF;

  IF v_new_league != v_league THEN
    UPDATE user_game_stats
    SET league = v_new_league, league_updated_at = NOW()
    WHERE user_id = v_user_id;

    RETURN jsonb_build_object(
      'demoted',       true,
      'old_league',    v_league,
      'new_league',    v_new_league,
      'days_inactive', v_days
    );
  END IF;

  RETURN jsonb_build_object(
    'demoted',       false,
    'league',        v_league,
    'days_inactive', v_days
  );
END;
$$;

GRANT EXECUTE ON FUNCTION check_inactivity_demotion() TO authenticated;


-- ----------------------------------------------------------------
-- 3. get_game_leaderboard
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_game_leaderboard(
  p_game_type TEXT,
  p_period    TEXT DEFAULT 'weekly',
  p_limit     INTEGER DEFAULT 50
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id     UUID := auth.uid();
  v_date_filter TIMESTAMPTZ;
  v_result      JSONB;
  v_my_rank     INTEGER;
BEGIN
  IF p_game_type NOT IN ('speed_round', 'word_rain') THEN
    RETURN jsonb_build_object('error', 'invalid_game_type');
  END IF;

  v_date_filter := CASE
    WHEN p_period = 'weekly'
    THEN DATE_TRUNC('week', NOW() AT TIME ZONE 'UTC')
    ELSE '2000-01-01'::TIMESTAMPTZ
  END;

  -- My rank (separate query so it's not capped by p_limit)
  SELECT rank INTO v_my_rank FROM (
    SELECT
      user_id,
      RANK() OVER (ORDER BY MAX(score) DESC) AS rank
    FROM game_scores
    WHERE game_type = p_game_type AND played_at >= v_date_filter
    GROUP BY user_id
  ) r WHERE user_id = v_user_id;

  -- Top N entries
  SELECT jsonb_build_object(
    'my_rank', v_my_rank,
    'entries', COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'rank',         r.rank,
          'user_id',      r.user_id,
          'display_name', COALESCE(p.display_name, 'Oyuncu_' || LEFT(r.user_id::TEXT, 6)),
          'avatar_url',   p.avatar_url,
          'score',        r.best_score,
          'league',       COALESCE(s.league, 'bronze')
        ) ORDER BY r.rank
      ),
      '[]'::jsonb
    )
  ) INTO v_result
  FROM (
    SELECT
      user_id,
      MAX(score) AS best_score,
      RANK() OVER (ORDER BY MAX(score) DESC) AS rank
    FROM game_scores
    WHERE game_type = p_game_type AND played_at >= v_date_filter
    GROUP BY user_id
  ) r
  JOIN profiles p ON r.user_id = p.id
  LEFT JOIN user_game_stats s ON r.user_id = s.user_id
  WHERE r.rank <= p_limit;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION get_game_leaderboard(TEXT, TEXT, INTEGER) TO authenticated;
