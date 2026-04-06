-- Allow 'new' state for user_sentences so that "remove from list" can revert
-- a sentence back to unstarted without deleting it.
ALTER TABLE user_sentences
  DROP CONSTRAINT IF EXISTS user_sentences_state_check;

ALTER TABLE user_sentences
  ADD CONSTRAINT user_sentences_state_check
  CHECK (state IN ('new', 'learning', 'learned'));
