-- Add user-defined tag to user_sentences (user's own sentences)
ALTER TABLE user_sentences
  ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_user_sentences_user_tag
  ON user_sentences (user_id, tag)
  WHERE tag IS NOT NULL;

-- Add user-defined tag to user_progress (preset sentences in learning list)
-- Tag is stored here because user_progress is the per-user record for preset sentences
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_user_progress_user_tag
  ON user_progress (user_id, tag)
  WHERE tag IS NOT NULL;
