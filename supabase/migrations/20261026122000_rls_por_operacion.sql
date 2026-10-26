-- Permisos de Literudo: una politica por operacion, sin FOR ALL y sin
-- consultar profiles desde una politica (siempre public.is_admin()).
--
-- Reglas:
--   * anonimo lee solo publicado;
--   * Usuario gestiona lo suyo;
--   * Administrador todo;
--   * gallery_images/gallery_embeds solo sobre galerias propias.
--
-- Un UPDATE/DELETE bloqueado por RLS afecta 0 filas, no lanza error:
-- supabase/tests/rls.test.sql comprueba los conteos.

-- ---------------------------------------------------------------------------
-- Lectura de un objetivo polimorfico (comments.target_id + target_type).
-- SECURITY INVOKER a proposito: aplica el RLS de quien consulta, asi que un
-- borrador ajeno no cuenta como visible.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.can_read_target(p_target_id UUID, p_target_type TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT CASE p_target_type
    WHEN 'post' THEN EXISTS (SELECT 1 FROM posts p WHERE p.id = p_target_id)
    WHEN 'gallery' THEN EXISTS (SELECT 1 FROM gallery_posts g WHERE g.id = p_target_id)
    ELSE false
  END;
$$;

GRANT EXECUTE ON FUNCTION public.can_read_target(UUID, TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles public read" ON public.profiles;
DROP POLICY IF EXISTS "Profiles self update" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin all" ON public.profiles;

CREATE POLICY "perfiles_lectura_publica" ON public.profiles
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "perfiles_edicion_propia" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "perfiles_alta_admin" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "perfiles_actualizacion_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "perfiles_borrado_admin" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- El correo es dato personal: solo el propio usuario (o un Administrador por
-- RPC) lo lee. El resto de columnas sigue siendo publico via la politica.
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (id, name, role, status, avatar_url, about_me, created_at)
  ON public.profiles TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.mi_perfil()
RETURNS TABLE (id UUID, name TEXT, email TEXT, role TEXT, status TEXT,
               avatar_url TEXT, about_me TEXT, created_at TIMESTAMPTZ)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.name, p.email, p.role, p.status, p.avatar_url, p.about_me, p.created_at
  FROM public.profiles p
  WHERE p.id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.mi_perfil() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mi_perfil() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_profiles()
RETURNS TABLE (id UUID, name TEXT, email TEXT, role TEXT, status TEXT,
               avatar_url TEXT, about_me TEXT, created_at TIMESTAMPTZ)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Solo un Administrador puede listar usuarios' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT p.id, p.name, p.email, p.role, p.status, p.avatar_url, p.about_me, p.created_at
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_profiles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_profiles() TO authenticated;

-- ---------------------------------------------------------------------------
-- posts
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Posts son públicos o para admin/autor" ON public.posts;
DROP POLICY IF EXISTS "Public can read published posts" ON public.posts;
DROP POLICY IF EXISTS "Solo autor o admin puede modificar" ON public.posts;
DROP POLICY IF EXISTS "Usuarios pueden crear posts" ON public.posts;

CREATE POLICY "articulos_lectura" ON public.posts
  FOR SELECT TO anon, authenticated
  USING (status = 'publicado' OR author_id = auth.uid() OR public.is_admin());

CREATE POLICY "articulos_alta_autor" ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "articulos_actualizacion_autor" ON public.posts
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "articulos_actualizacion_admin" ON public.posts
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "articulos_borrado_autor" ON public.posts
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "articulos_borrado_admin" ON public.posts
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- gallery_posts
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Gallery posts public read" ON public.gallery_posts;
DROP POLICY IF EXISTS "Gallery posts author insert" ON public.gallery_posts;
DROP POLICY IF EXISTS "Gallery posts author update" ON public.gallery_posts;
DROP POLICY IF EXISTS "Gallery posts author delete" ON public.gallery_posts;
DROP POLICY IF EXISTS "Gallery posts admin all" ON public.gallery_posts;

CREATE POLICY "galerias_lectura" ON public.gallery_posts
  FOR SELECT TO anon, authenticated
  USING (status = 'publicado' OR author_id = auth.uid() OR public.is_admin());

CREATE POLICY "galerias_alta_autor" ON public.gallery_posts
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "galerias_actualizacion_autor" ON public.gallery_posts
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "galerias_actualizacion_admin" ON public.gallery_posts
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "galerias_borrado_autor" ON public.gallery_posts
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "galerias_borrado_admin" ON public.gallery_posts
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- gallery_images / gallery_embeds: siempre a traves de la galeria propia.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Gallery images public read" ON public.gallery_images;
DROP POLICY IF EXISTS "Gallery images author insert" ON public.gallery_images;
DROP POLICY IF EXISTS "Gallery images author delete" ON public.gallery_images;
DROP POLICY IF EXISTS "Gallery images admin all" ON public.gallery_images;

CREATE POLICY "galeria_imagenes_lectura" ON public.gallery_images
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "galeria_imagenes_alta_autor" ON public.gallery_images
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.gallery_posts g
    WHERE g.id = gallery_post_id AND g.author_id = auth.uid()
  ));

CREATE POLICY "galeria_imagenes_actualizacion_autor" ON public.gallery_images
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.gallery_posts g
    WHERE g.id = gallery_post_id AND g.author_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.gallery_posts g
    WHERE g.id = gallery_post_id AND g.author_id = auth.uid()
  ));

CREATE POLICY "galeria_imagenes_borrado_autor" ON public.gallery_images
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.gallery_posts g
    WHERE g.id = gallery_post_id AND g.author_id = auth.uid()
  ));

CREATE POLICY "galeria_imagenes_alta_admin" ON public.gallery_images
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "galeria_imagenes_actualizacion_admin" ON public.gallery_images
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "galeria_imagenes_borrado_admin" ON public.gallery_images
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Gallery embeds public read" ON public.gallery_embeds;
DROP POLICY IF EXISTS "Gallery embeds author insert" ON public.gallery_embeds;
DROP POLICY IF EXISTS "Gallery embeds author delete" ON public.gallery_embeds;
DROP POLICY IF EXISTS "Gallery embeds admin all" ON public.gallery_embeds;

CREATE POLICY "galeria_embeds_lectura" ON public.gallery_embeds
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "galeria_embeds_alta_autor" ON public.gallery_embeds
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.gallery_posts g
    WHERE g.id = gallery_post_id AND g.author_id = auth.uid()
  ));

CREATE POLICY "galeria_embeds_actualizacion_autor" ON public.gallery_embeds
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.gallery_posts g
    WHERE g.id = gallery_post_id AND g.author_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.gallery_posts g
    WHERE g.id = gallery_post_id AND g.author_id = auth.uid()
  ));

CREATE POLICY "galeria_embeds_borrado_autor" ON public.gallery_embeds
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.gallery_posts g
    WHERE g.id = gallery_post_id AND g.author_id = auth.uid()
  ));

CREATE POLICY "galeria_embeds_alta_admin" ON public.gallery_embeds
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "galeria_embeds_actualizacion_admin" ON public.gallery_embeds
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "galeria_embeds_borrado_admin" ON public.gallery_embeds
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- comments: los comentarios de un borrador no son publicos.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Authors and admins can delete comments" ON public.comments;

CREATE POLICY "comentarios_lectura" ON public.comments
  FOR SELECT TO anon, authenticated
  USING (
    user_id = auth.uid()
    OR public.can_read_target(target_id, target_type)
    OR public.is_admin()
  );

CREATE POLICY "comentarios_alta" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.can_read_target(target_id, target_type)
  );

CREATE POLICY "comentarios_edicion_propia" ON public.comments
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "comentarios_borrado_propio" ON public.comments
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "comentarios_borrado_admin" ON public.comments
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- storage.objects: lectura publica, escritura solo con sesion.
-- shortcut: la subida no se limita a la carpeta del usuario porque el avatar
-- se guarda en la raiz del bucket; restringirlo pide cambiar las rutas del
-- formulario. Cuando se haga, cambiar WITH CHECK por foldername[1] = uid.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Gallery Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Gallery Upload" ON storage.objects;
DROP POLICY IF EXISTS "Gallery Delete" ON storage.objects;

CREATE POLICY "archivos_lectura_publica" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id IN ('avatars', 'posts', 'gallery'));

CREATE POLICY "archivos_alta_autenticada" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('avatars', 'posts', 'gallery'));

CREATE POLICY "archivos_actualizacion_admin" ON storage.objects
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "archivos_borrado_propio" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'gallery'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );

CREATE POLICY "archivos_borrado_admin" ON storage.objects
  FOR DELETE TO authenticated
  USING (public.is_admin());
