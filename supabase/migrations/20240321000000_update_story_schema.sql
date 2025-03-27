-- Drop existing quizzes table if it exists
DROP TABLE IF EXISTS quizzes;

-- Update stories table to use JSONB for vocabulary and grammar
ALTER TABLE stories
  ALTER COLUMN vocabulary TYPE JSONB USING COALESCE(to_jsonb(vocabulary), '[]'::jsonb),
  ALTER COLUMN grammar TYPE JSONB USING COALESCE(to_jsonb(grammar), '[]'::jsonb);

-- Add quizzes column to stories table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'stories'
    AND column_name = 'quizzes'
  ) THEN
    ALTER TABLE stories
      ADD COLUMN quizzes JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$; 