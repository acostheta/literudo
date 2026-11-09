-- Portada: una sola llamada para artículos, galerías, autor, portada y conteos.
-- Cada viaje navegador->Supabase cuesta ~350 ms desde fuera de us-west-2; la
-- portada hacía cuatro en serie. Esta función los colapsa en uno.
--
-- SECURITY INVOKER: respeta el RLS de quien llama (anónimo solo ve publicado).

CREATE OR REPLACE FUNCTION public.get_home_feed()
RETURNS TABLE (
  item_id UUID,
  item_type TEXT,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  description TEXT,
  created_at TIMESTAMPTZ,
  author_name TEXT,
  author_avatar TEXT,
  cover_url TEXT,
  image_count INT,
  embed_count INT,
  comments_n INT,
  likes_n INT,
  liked BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  WITH items AS (
    SELECT p.id AS id, 'post'::text AS item_type, p.title, p.slug,
           p.excerpt, NULL::text AS description, p.created_at, p.author_id
    FROM public.posts p
    WHERE p.status = 'publicado'
    UNION ALL
    SELECT g.id, 'gallery', g.title, g.slug,
           NULL, g.description, g.created_at, g.author_id
    FROM public.gallery_posts g
    WHERE g.status = 'publicado'
  )
  SELECT
    i.id,
    i.item_type,
    i.title,
    i.slug,
    i.excerpt,
    i.description,
    i.created_at,
    pr.name,
    pr.avatar_url,
    CASE WHEN i.item_type = 'gallery' THEN (
      SELECT gi.image_url FROM public.gallery_images gi
      WHERE gi.gallery_post_id = i.id
      ORDER BY gi.sort_order
      LIMIT 1
    ) END,
    CASE WHEN i.item_type = 'gallery' THEN (
      SELECT count(*)::int FROM public.gallery_images gi
      WHERE gi.gallery_post_id = i.id
    ) ELSE 0 END,
    CASE WHEN i.item_type = 'gallery' THEN (
      SELECT count(*)::int FROM public.gallery_embeds ge
      WHERE ge.gallery_post_id = i.id
    ) ELSE 0 END,
    (SELECT count(*)::int FROM public.comments c
      WHERE c.target_id = i.id AND c.target_type = i.item_type),
    (SELECT count(*)::int FROM public.reactions r
      WHERE r.target_id = i.id AND r.target_type = i.item_type),
    EXISTS (SELECT 1 FROM public.reactions r
      WHERE r.target_id = i.id AND r.target_type = i.item_type
        AND r.user_id = auth.uid())
  FROM items i
  LEFT JOIN public.profiles pr ON pr.id = i.author_id
  ORDER BY i.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_home_feed() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_home_feed() TO anon, authenticated;
