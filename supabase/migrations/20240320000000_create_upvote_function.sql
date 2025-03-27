-- Create the story_upvotes table if it doesn't exist
CREATE TABLE IF NOT EXISTS story_upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, story_id)
);

-- Create the upvote_story function
CREATE OR REPLACE FUNCTION upvote_story(p_story_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert the upvote record
  INSERT INTO story_upvotes (story_id, user_id)
  VALUES (p_story_id, p_user_id);

  -- Update the story's upvotes count
  UPDATE stories
  SET upvotes = upvotes + 1
  WHERE id = p_story_id;
END;
$$; 