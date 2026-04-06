-- ============================================================
-- Migration 029: AI Translator daily limit columns
--
-- Adds per-day usage tracking for the 3-day free trial.
-- Free users get 15 translations/day. Edge Function (service role)
-- owns these columns — direct client writes are blocked by the
-- existing guard trigger.
-- ============================================================

-- 1. Add columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_daily_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_daily_date  DATE DEFAULT NULL;

-- 2. Extend guard trigger to protect new columns
CREATE OR REPLACE FUNCTION guard_is_premium_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF (NEW.is_premium IS DISTINCT FROM OLD.is_premium)
     AND current_role = 'authenticated' THEN
    RAISE EXCEPTION 'is_premium cannot be modified directly. Use the set_premium() RPC.';
  END IF;

  IF (NEW.ai_trial_started_at IS DISTINCT FROM OLD.ai_trial_started_at)
     AND current_role = 'authenticated' THEN
    RAISE EXCEPTION 'ai_trial_started_at cannot be modified directly.';
  END IF;

  IF ((NEW.ai_daily_count IS DISTINCT FROM OLD.ai_daily_count)
      OR (NEW.ai_daily_date IS DISTINCT FROM OLD.ai_daily_date))
     AND current_role = 'authenticated' THEN
    RAISE EXCEPTION 'ai_daily_count and ai_daily_date cannot be modified directly.';
  END IF;

  RETURN NEW;
END;
$$;
-- Note: trigger trg_guard_is_premium already exists (migration 023) — no recreation needed.
