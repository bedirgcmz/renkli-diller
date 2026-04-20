-- ============================================================
-- Migration 046: Remove deprecated sentence tag columns
-- App code no longer reads or writes sentence tags.
-- ============================================================

DROP INDEX IF EXISTS public.idx_user_sentences_user_tag;
DROP INDEX IF EXISTS public.idx_user_progress_user_tag;

ALTER TABLE public.user_sentences
  DROP COLUMN IF EXISTS tag;

ALTER TABLE public.user_progress
  DROP COLUMN IF EXISTS tag;
