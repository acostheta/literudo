-- Línea base de Literudo, reconstruida de la DB viva (mayo 2026).
--
-- Las tablas base se crearon fuera del repo y solo existían en producción.
-- Esta migración permite reconstruir el esquema desde cero con
-- `supabase db reset`, que es como se validan las migraciones.
--
-- En el remoto NO se ejecuta: se marca como aplicada con
-- `supabase migration repair --status applied 20260502000000`.
-- Aun así es idempotente por si hay que correrla a mano.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- 1. Perfiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Usuario',
  created_at TIMESTAMPTZ DEFAULT now(),
  avatar_url TEXT,
  about_me TEXT,
  status TEXT DEFAULT 'activo',
  CONSTRAINT profiles_email_key UNIQUE (email)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Artículos
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB NOT NULL,
  excerpt TEXT,
  cover_url TEXT,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'borrador',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT posts_slug_key UNIQUE (slug),
  CONSTRAINT posts_status_check CHECK (status IN ('borrador', 'publicado'))
);

CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts (slug);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 3. Trigger que crea el perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Usuario Nuevo'),
    new.email
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Event trigger de Supabase que activa RLS en tablas nuevas.
-- Se recrea la función (no el event trigger, que gestiona la plataforma)
-- porque la migración de lockdown le revoca EXECUTE.
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table', 'partitioned table')
  LOOP
    IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
    END IF;
  END LOOP;
END;
$$;

-- 5. Storage: buckets y políticas vigentes.
-- Los buckets también están declarados en config.toml para el stack local;
-- este INSERT mantiene el remoto y el local con el mismo estado.
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true), ('posts', 'posts', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('gallery', 'gallery', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
CREATE POLICY "Avatar Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Avatar Upload Access" ON storage.objects;
CREATE POLICY "Avatar Upload Access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'posts');

DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
CREATE POLICY "Admin Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'posts');

DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Admin Update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'posts') WITH CHECK (bucket_id = 'posts');

DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'posts');

DROP POLICY IF EXISTS "Gallery Public Access" ON storage.objects;
CREATE POLICY "Gallery Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Gallery Upload" ON storage.objects;
CREATE POLICY "Gallery Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Gallery Delete" ON storage.objects;
CREATE POLICY "Gallery Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'gallery' AND (storage.foldername(name))[1] = (auth.uid())::text
  );
