-- ============================================================
-- Migration 027: RLS policy for sentence_visuals
--
-- Allow all authenticated users to read generated visuals.
-- Table contains no sensitive data; visuals are public assets.
-- ============================================================

ALTER TABLE sentence_visuals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sentence_visuals_select_authenticated"
  ON sentence_visuals
  FOR SELECT
  TO authenticated
  USING (true);
