-- ============================================================
-- Migration 042: Add is_learned flag to user_dialog_progress
--
-- Purpose:
--   Allow users to explicitly mark a dialog scenario as "learned".
--   Learned scenarios are deprioritised in the smart selection
--   algorithm (shown only when all fresh/unlearned options are
--   exhausted) and surfaced in the "Learned Dialogs" screen.
-- ============================================================

ALTER TABLE public.user_dialog_progress
  ADD COLUMN IF NOT EXISTS is_learned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS learned_at timestamptz;

-- Index for the LearnedDialogsScreen query (user's learned scenarios)
CREATE INDEX IF NOT EXISTS idx_udp_user_learned
  ON public.user_dialog_progress(user_id, is_learned)
  WHERE is_learned = true;
