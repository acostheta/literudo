-- get_comments_with_profile ahora expone el target para que las respuestas
-- puedan reenviarlo al formulario (Postgres exige dropear por el tipo de retorno)
DROP FUNCTION IF EXISTS get_comments_with_profile(uuid, integer, integer, text);

CREATE OR REPLACE FUNCTION get_comments_with_profile(
  p_post_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_target_type TEXT DEFAULT 'post'
)
RETURNS TABLE (
  id UUID,
  target_id UUID,
  target_type TEXT,
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
    c.id, c.target_id, c.target_type, c.content, c.created_at,
    c.parent_id, c.user_id,
    p.name AS user_name,
    p.avatar_url AS user_avatar
  FROM comments c
  JOIN profiles p ON p.id = c.user_id
  WHERE c.target_id = p_post_id AND c.target_type = p_target_type
  ORDER BY c.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
