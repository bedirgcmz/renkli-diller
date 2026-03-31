-- ============================================================
-- Migration 022: Fix user_settings FK to ON DELETE CASCADE
-- user_settings was manually created with NO ACTION (confdeltype=a)
-- which blocks auth.admin.deleteUser(). Changed to CASCADE so
-- deleting from auth.users automatically removes user_settings rows.
-- ============================================================

ALTER TABLE user_settings
  DROP CONSTRAINT user_settings_user_id_fkey,
  ADD CONSTRAINT user_settings_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
