-- Migration 020: Extend quiz_results.quiz_type to include 'build_sentence'
--
-- The original CHECK constraint only allowed 'multiple_choice' | 'fill_blank'.
-- BuildSentence exercises also write to quiz_results for daily-limit tracking,
-- so we need to allow the new value.

ALTER TABLE quiz_results
  DROP CONSTRAINT IF EXISTS quiz_results_quiz_type_check;

ALTER TABLE quiz_results
  ADD CONSTRAINT quiz_results_quiz_type_check
  CHECK (quiz_type IN ('multiple_choice', 'fill_blank', 'build_sentence'));
