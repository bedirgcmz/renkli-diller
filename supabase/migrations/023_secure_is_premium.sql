-- ============================================================
-- Migration 023: Protect profiles.is_premium from client writes
--
-- Problem: RLS UPDATE policy on profiles allowed any authenticated
-- user to write is_premium=true directly via the Supabase client,
-- bypassing RevenueCat validation entirely.
--
-- Fix:
--   1. Trigger blocks direct is_premium changes from the
--      'authenticated' role (i.e. any client SDK call).
--   2. set_premium() RPC runs as SECURITY DEFINER (postgres role),
--      bypassing the trigger. Only activates premium (sets to true).
--      Deactivation happens server-side via service_role or webhooks.
-- ============================================================

-- 1. Trigger function: block authenticated role from changing is_premium
CREATE OR REPLACE FUNCTION guard_is_premium_update()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF (NEW.is_premium IS DISTINCT FROM OLD.is_premium)
     AND current_role = 'authenticated' THEN
    RAISE EXCEPTION 'is_premium cannot be modified directly. Use the set_premium() RPC.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_guard_is_premium
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION guard_is_premium_update();

-- 2. RPC: set_premium — only activates premium, never deactivates from client
--    Runs as SECURITY DEFINER so it bypasses the trigger above.
CREATE OR REPLACE FUNCTION set_premium()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  UPDATE profiles
  SET is_premium = true
  WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION set_premium() TO authenticated;
