-- ============================================================
-- Migration 025: Server-side AI trial tracking
--
-- Problem: AI translation trial start date was stored only in
-- AsyncStorage (client-controlled). Users could reset it by clearing
-- app data, getting unlimited AI access.
--
-- Fix:
--   1. Add ai_trial_started_at column to profiles.
--      The Edge Function sets this on first translation (server-side).
--   2. Extend the guard trigger to block direct client writes to
--      this column, same pattern as is_premium.
-- ============================================================

-- 1. Add column
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_trial_started_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Extend guard trigger to also protect ai_trial_started_at
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

  RETURN NEW;
END;
$$;
-- Note: the trigger trg_guard_is_premium already exists (migration 023)
-- and calls this function — no need to recreate it.
