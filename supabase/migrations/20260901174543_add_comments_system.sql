-- Comments system for Literudo

-- Drop old comments table if it exists (from schema.sql)
DROP TABLE IF EXISTS comments;

-- Comments table with threading support
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- RLS Policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Public read for all comments
CREATE POLICY "Comments are viewable by everyone" ON comments
  FOR SELECT USING (true);

-- Only authenticated users can insert (must match their user_id)
CREATE POLICY "Authenticated users can insert comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own comments
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own comments, admins can delete any
CREATE POLICY "Authors and admins can delete comments" ON comments
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'Administrador'
    )
  );

-- Function to get comments with profile info
CREATE OR REPLACE FUNCTION get_comments_with_profile(
  p_post_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  parent_id UUID,
  user_id UUID,
  user_name TEXT,
  user_avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.content,
    c.created_at,
    c.parent_id,
    c.user_id,
    p.name AS user_name,
    p.avatar_url AS user_avatar
  FROM comments c
  JOIN profiles p ON p.id = c.user_id
  WHERE c.post_id = p_post_id
  ORDER BY c.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get total comment count for a post
CREATE OR REPLACE FUNCTION get_comment_count(p_post_id UUID)
RETURNS INT AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INT FROM comments WHERE post_id = p_post_id);
END;
$$ LANGUAGE plpgsql;
