-- Comentarios en galerías + "Me Gustas"

-- 1. comentarios pasan a target polimórfico (post | gallery)
--    La FK a posts se elimina: comments recae sobre dos tablas distintas.
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE comments RENAME COLUMN post_id TO target_id;
ALTER TABLE comments
  ADD COLUMN target_type TEXT NOT NULL DEFAULT 'post'
  CHECK (target_type IN ('post', 'gallery'));

DROP INDEX IF EXISTS idx_comments_post_id;
CREATE INDEX idx_comments_target ON comments(target_id, target_type);

-- ponytail: sin FK sobre target, la existencia del objetivo se confía al
-- cliente; si algún día molesta, un trigger de verificación lo cubre.

-- 2. reacciones ("Me Gustas")
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'gallery')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (target_id, target_type, user_id)
);

CREATE INDEX idx_reactions_target ON reactions(target_id, target_type);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reacciones visibles para todos" ON reactions
  FOR SELECT USING (true);

CREATE POLICY "Inserta su propia reaccion" ON reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Borra su propia reaccion" ON reactions
  FOR DELETE USING (auth.uid() = user_id);

-- 3. RPCs: las antiguas se borran para evitar sobreload por renombrado de parámetro
DROP FUNCTION IF EXISTS get_comment_count(uuid);

CREATE OR REPLACE FUNCTION get_comment_count(
  p_post_id UUID,
  p_target_type TEXT DEFAULT 'post'
) RETURNS INT AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INT FROM comments
          WHERE target_id = p_post_id AND target_type = p_target_type);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_reaction_count(
  p_post_id UUID,
  p_target_type TEXT DEFAULT 'post'
) RETURNS INT AS $$
BEGIN
  RETURN (SELECT COUNT(*)::INT FROM reactions
          WHERE target_id = p_post_id AND target_type = p_target_type);
END;
$$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS get_comments_with_profile(uuid, integer, integer);

CREATE OR REPLACE FUNCTION get_comments_with_profile(
  p_post_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0,
  p_target_type TEXT DEFAULT 'post'
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
    c.id, c.content, c.created_at, c.parent_id, c.user_id,
    p.name AS user_name,
    p.avatar_url AS user_avatar
  FROM comments c
  JOIN profiles p ON p.id = c.user_id
  WHERE c.target_id = p_post_id AND c.target_type = p_target_type
  ORDER BY c.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- 4. conteos de la portada: una llamada por tipo en vez de una por entrada
--    (los nombres de retorno evitan chocar con los de las columnas tabulares)
CREATE OR REPLACE FUNCTION get_counts(
  p_target_ids UUID[],
  p_target_type TEXT DEFAULT 'post'
)
RETURNS TABLE (item_id UUID, comments_n INT, likes_n INT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.item,
    COALESCE(c.n, 0)::INT,
    COALESCE(r.n, 0)::INT
  FROM unnest(p_target_ids) AS v(item)
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS n FROM comments
    WHERE target_id = v.item AND target_type = p_target_type
  ) c ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) AS n FROM reactions
    WHERE target_id = v.item AND target_type = p_target_type
  ) r ON true;
END;
$$ LANGUAGE plpgsql;

REVOKE ALL ON FUNCTION get_counts(uuid[], text) FROM anon;
GRANT EXECUTE ON FUNCTION get_counts(uuid[], text) TO anon, authenticated;
