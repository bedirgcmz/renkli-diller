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
--     2. OR premium_override (active + not expired)
--     3. OR (RC unverified AND is_premium) — offline/Expo Go fallback
-- ============================================================

-- 1. Add override columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS premium_override boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_override_reason text,
  ADD COLUMN IF NOT EXISTS premium_override_expires_at timestamptz;

-- 2. Update is_premium_user() to honour override + expiry (used in RLS policies)
CREATE OR REPLACE FUNCTION public.is_premium_user()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT
    COALESCE(is_premium, false)
    OR (
      COALESCE(premium_override, false)
      AND (
        premium_override_expires_at IS NULL
        OR premium_override_expires_at > now()
      )
    )
  FROM profiles
  WHERE id = auth.uid();
$$;

-- 3. RPC: grant a manual override (service_role / admin only)
--    expires_in_days: NULL = permanent, otherwise sets expiry from now()
CREATE OR REPLACE FUNCTION grant_premium_override(
  target_user_id uuid,
  reason text DEFAULT NULL,
  expires_in_days integer DEFAULT NULL
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  UPDATE profiles
  SET premium_override = true,
      premium_override_reason = reason,
      premium_override_expires_at = CASE
        WHEN expires_in_days IS NOT NULL
        THEN now() + (expires_in_days || ' days')::interval
        ELSE NULL
      END
  WHERE id = target_user_id;
END;
$$;

-- 4. RPC: revoke a manual override (service_role / admin only)
CREATE OR REPLACE FUNCTION revoke_premium_override(target_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public AS $$
BEGIN
  UPDATE profiles
  SET premium_override = false,
      premium_override_reason = NULL,
      premium_override_expires_at = NULL
  WHERE id = target_user_id;
END;
$$;

-- Only service_role (backend/admin) can call these — intentionally NOT granted to authenticated
REVOKE ALL ON FUNCTION grant_premium_override(uuid, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION grant_premium_override(uuid, text, integer) FROM authenticated;
REVOKE ALL ON FUNCTION revoke_premium_override(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION revoke_premium_override(uuid) FROM authenticated;
