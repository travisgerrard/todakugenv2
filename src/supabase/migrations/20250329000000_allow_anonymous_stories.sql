-- Add policy to allow anonymous user stories from test endpoints
CREATE POLICY "Allow anonymous user story insertion"
  ON stories FOR INSERT
  WITH CHECK (user_id = '00000000-0000-0000-0000-000000000000');

-- Allow public access to the anonymous user profile if it doesn't exist
-- First, check if anonymous user exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = '00000000-0000-0000-0000-000000000000'
  ) THEN
    -- Create the anonymous user profile
    INSERT INTO profiles (
      id, 
      email, 
      full_name, 
      wanikani_level, 
      genki_chapter, 
      tadoku_level
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      'anonymous@todakureader.com',
      'Anonymous User',
      1,
      1,
      1
    );
  END IF;
END
$$;

