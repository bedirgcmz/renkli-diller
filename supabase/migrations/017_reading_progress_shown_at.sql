-- Migration 017: Daily text rotation support
-- Adds shown_at (date of assignment) and expands status constraint

ALTER TABLE user_reading_progress
  ADD COLUMN IF NOT EXISTS shown_at date;

-- Backfill shown_at for existing completed rows
UPDATE user_reading_progress
SET shown_at = completed_at::date
WHERE shown_at IS NULL AND completed_at IS NOT NULL;

-- Make completed_at nullable (assigned rows don't have it yet)
ALTER TABLE user_reading_progress
  ALTER COLUMN completed_at DROP NOT NULL;

-- Expand status constraint to include 'completed' and 'assigned'
ALTER TABLE user_reading_progress
  DROP CONSTRAINT IF EXISTS user_reading_progress_status_check;

ALTER TABLE user_reading_progress
  ADD CONSTRAINT user_reading_progress_status_check
  CHECK (status IN ('read', 'learned', 'completed', 'assigned'));

-- Index for daily lookup
CREATE INDEX IF NOT EXISTS idx_urp_user_shown_status
  ON user_reading_progress (user_id, shown_at, status);
