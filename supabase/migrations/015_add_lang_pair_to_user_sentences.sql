-- Add language pair metadata to user_sentences
-- so we can warn users when their sentences were added in a different language pair

ALTER TABLE user_sentences
  ADD COLUMN IF NOT EXISTS source_lang TEXT,
  ADD COLUMN IF NOT EXISTS target_lang TEXT;

-- Existing rows get NULL — the app will treat NULL as "unknown / no mismatch warning"
