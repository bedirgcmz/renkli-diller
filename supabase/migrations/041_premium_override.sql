-- ============================================================
-- Migration 041: Separate manual premium grants from RC-synced state
--
-- Problem:
--   profiles.is_premium serves dual purpose:
--     1. Synced from RevenueCat (set via set_premium() RPC on upgrade)
--     2. Manual test/support grants (set directly via service_role SQL)
--   There is no revoke mechanism — once set to true, it stays true.
--   Combined with the client-side `rcActive || profile.is_premium` logic,
--   an expired subscriber whose profiles.is_premium was never cleared
--   will appear premium indefinitely.
--
-- Fix:
--   Add premium_override column for intentional manual grants.
--   profiles.is_premium remains RC-synced state only.
--   Auth store uses tripartite logic:
--     1. rcActive (RC subscription active)
--     2. OR premium_override (explicit manual grant)
--     3. OR (RC unverified AND is_premium) — offline/Expo Go fallback
-- ============================================================

-- 1. Add override column
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS premium_override boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_override_reason text;

-- 2. Update is_premium_user() to honour override (used in RLS policies)
CREATE OR REPLACE FUNCTION public.is_premium_user()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT COALESCE(is_premium, false) OR COALESCE(premium_override, false)
  FROM profiles
  WHERE id = auth.uid();
$$;

-- 3. RPC for service_role / admin use: grant a manual override
--    Run as SECURITY DEFINER so it cannot be called by client SDK directly
--    (clients cannot call it because GRANT is to service_role only, not authenticated)
CREATE OR REPLACE FUNCTION grant_premium_override(target_user_id uuid, reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  UPDATE profiles
  SET premium_override = true,
      premium_override_reason = reason
  WHERE id = target_user_id;
END;
$$;

-- Only service_role (backend/admin) can call this — intentionally NOT granted to authenticated
REVOKE ALL ON FUNCTION grant_premium_override(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION grant_premium_override(uuid, text) FROM authenticated;
