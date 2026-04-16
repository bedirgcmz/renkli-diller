-- ============================================================
-- Migration 045: Fix submit_game_score premium override + null validation
-- Aligns the game score RPC with the live premium access helper and
-- rejects malformed/null payloads with stable JSON errors.
-- ============================================================

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
  v_user_id           UUID := auth.uid();
  v_score             INTEGER;
  v_accuracy          NUMERIC(5,2);
  v_daily_count       INTEGER;
  v_is_premium        BOOLEAN;
  v_daily_limit       INTEGER;
  v_old_best          INTEGER := 0;
  v_new_best_speed    INTEGER;
  v_new_best_rain     INTEGER;
  v_new_best_memory   INTEGER;
  v_old_league        TEXT := 'bronze';
  v_new_league        TEXT;
  v_league_changed    BOOLEAN := FALSE;
  v_rows_inserted     INTEGER;
  v_cum_score         INTEGER;
  v_weekly_rank       INTEGER;
  v_min_pool_size     INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('error', 'unauthenticated');
  END IF;

  IF p_session_id IS NULL THEN
    RETURN jsonb_build_object('error', 'invalid_stats');
  END IF;

  IF p_game_type IS NULL OR p_game_type NOT IN ('speed_round', 'word_rain', 'memory_match') THEN
    RETURN jsonb_build_object('error', 'invalid_game_type');
  END IF;

  IF p_correct IS NULL
     OR p_wrong IS NULL
     OR p_missed IS NULL
     OR p_duration_sec IS NULL
     OR p_combo_max IS NULL
     OR p_level_reached IS NULL
     OR p_pool_size IS NULL THEN
    RETURN jsonb_build_object('error', 'invalid_stats');
  END IF;

  IF p_correct < 0 OR p_wrong < 0 OR p_missed < 0 THEN
    RETURN jsonb_build_object('error', 'invalid_stats');
  END IF;

  IF p_duration_sec < 0 OR p_level_reached < 1 OR p_pool_size < 0 THEN
    RETURN jsonb_build_object('error', 'invalid_stats');
  END IF;

  IF p_combo_max < 0 OR p_combo_max > p_correct THEN
    RETURN jsonb_build_object('error', 'invalid_combo');
  END IF;

  IF p_filter_used IS NULL
     OR p_filter_used NOT IN ('global', 'user_learning', 'user_learned', 'mixed') THEN
    RETURN jsonb_build_object('error', 'invalid_filter');
  END IF;

  IF NULLIF(BTRIM(COALESCE(p_source_lang, '')), '') IS NULL
     OR NULLIF(BTRIM(COALESCE(p_target_lang, '')), '') IS NULL THEN
    RETURN jsonb_build_object('error', 'invalid_language');
  END IF;

  v_min_pool_size := CASE
    WHEN p_game_type = 'word_rain' THEN 15
    WHEN p_game_type = 'speed_round' THEN 10
    ELSE 8
  END;

  IF p_pool_size < v_min_pool_size THEN
    RETURN jsonb_build_object('error', 'invalid_pool_size');
  END IF;

  IF p_game_type <> 'word_rain' AND (p_missed <> 0 OR p_level_reached <> 1) THEN
    RETURN jsonb_build_object('error', 'invalid_stats');
  END IF;

  IF (p_correct + p_wrong + p_missed) <= 0 THEN
    RETURN jsonb_build_object('error', 'invalid_stats');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM game_scores
    WHERE session_id = p_session_id
  ) THEN
    RETURN jsonb_build_object('error', 'duplicate_session');
  END IF;

  SELECT COALESCE(is_premium_user(), false) INTO v_is_premium;
  v_daily_limit := CASE WHEN v_is_premium THEN 9999 ELSE 3 END;

  SELECT COUNT(*) INTO v_daily_count
  FROM game_scores
  WHERE user_id = v_user_id
    AND game_type = p_game_type
    AND DATE(played_at AT TIME ZONE 'UTC') = DATE(NOW() AT TIME ZONE 'UTC');

  IF v_daily_count >= v_daily_limit THEN
    RETURN jsonb_build_object('error', 'daily_limit_reached');
  END IF;

  SELECT
    league,
    CASE
      WHEN p_game_type = 'speed_round' THEN best_speed_round
      WHEN p_game_type = 'word_rain' THEN best_word_rain
      ELSE best_memory_match
    END
  INTO v_old_league, v_old_best
  FROM user_game_stats
  WHERE user_id = v_user_id;

  v_old_league := COALESCE(v_old_league, 'bronze');
  v_old_best := COALESCE(v_old_best, 0);

  v_score := (p_correct * 10) + (p_combo_max * 5);
  IF p_game_type = 'word_rain' THEN
    v_score := v_score + ((GREATEST(p_level_reached, 1) - 1) * 20);
  END IF;

  v_accuracy := CASE
    WHEN (p_correct + p_wrong) > 0
      THEN ROUND(p_correct::NUMERIC / (p_correct + p_wrong) * 100, 2)
    ELSE 0
  END;

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

  IF v_rows_inserted = 0 THEN
    RETURN jsonb_build_object('error', 'duplicate_session');
  END IF;

  v_new_best_speed := CASE
    WHEN p_game_type = 'speed_round' AND v_score > v_old_best THEN v_score
    ELSE COALESCE((SELECT best_speed_round FROM user_game_stats WHERE user_id = v_user_id), 0)
  END;

  v_new_best_rain := CASE
    WHEN p_game_type = 'word_rain' AND v_score > v_old_best THEN v_score
    ELSE COALESCE((SELECT best_word_rain FROM user_game_stats WHERE user_id = v_user_id), 0)
  END;

  v_new_best_memory := CASE
    WHEN p_game_type = 'memory_match' AND v_score > v_old_best THEN v_score
    ELSE COALESCE((SELECT best_memory_match FROM user_game_stats WHERE user_id = v_user_id), 0)
  END;

  INSERT INTO user_game_stats (
    user_id, cumulative_score, games_played,
    best_speed_round, best_word_rain, best_memory_match,
    last_played_at, league
  ) VALUES (
    v_user_id, v_score, 1,
    v_new_best_speed, v_new_best_rain, v_new_best_memory,
    NOW(), 'bronze'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    cumulative_score = user_game_stats.cumulative_score + v_score,
    games_played = user_game_stats.games_played + 1,
    best_speed_round = v_new_best_speed,
    best_word_rain = v_new_best_rain,
    best_memory_match = v_new_best_memory,
    last_played_at = NOW();

  SELECT cumulative_score INTO v_cum_score
  FROM user_game_stats
  WHERE user_id = v_user_id;

  v_new_league := CASE
    WHEN v_cum_score >= 5000 THEN 'gold'
    WHEN v_cum_score >= 1000 THEN 'silver'
    ELSE 'bronze'
  END;

  IF v_new_league != v_old_league AND (
    (v_new_league = 'gold' AND v_old_league IN ('bronze', 'silver')) OR
    (v_new_league = 'silver' AND v_old_league = 'bronze')
  ) THEN
    UPDATE user_game_stats
    SET league = v_new_league, league_updated_at = NOW()
    WHERE user_id = v_user_id;
    v_league_changed := TRUE;
  ELSE
    v_new_league := v_old_league;
  END IF;

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
    'score', v_score,
    'accuracy', v_accuracy,
    'personal_best_broken', v_score > v_old_best,
    'old_best', v_old_best,
    'league', v_new_league,
    'league_changed', v_league_changed,
    'old_league', v_old_league,
    'weekly_rank', v_weekly_rank,
    'cumulative_score', v_cum_score
  );
END;
$$;

GRANT EXECUTE ON FUNCTION submit_game_score(UUID, TEXT, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, INTEGER, TEXT, TEXT, TEXT) TO authenticated;
