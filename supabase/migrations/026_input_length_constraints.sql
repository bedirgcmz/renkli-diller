-- ============================================================
-- Migration 026: Input length constraints
--
-- No SQL injection risk (parameterized queries) and no XSS risk
-- (React Native renders plain text). The concern is storage abuse
-- and Gemini API cost from unlimited text inputs.
--
-- NOT VALID: constraint applies to future writes only, does not
-- fail if existing rows exceed the limit.
-- ============================================================

-- profiles.display_name: shown publicly in leaderboard
ALTER TABLE profiles
  ADD CONSTRAINT display_name_max_length
  CHECK (display_name IS NULL OR char_length(display_name) <= 50)
  NOT VALID;

-- user_sentences: user-authored sentence content
ALTER TABLE user_sentences
  ADD CONSTRAINT source_text_max_length
  CHECK (char_length(source_text) <= 500)
  NOT VALID,
  ADD CONSTRAINT target_text_max_length
  CHECK (char_length(target_text) <= 500)
  NOT VALID;
