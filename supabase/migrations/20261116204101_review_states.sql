-- Nuevos estados de revisión para artículos y galerías.
-- `publicado` sigue siendo el único estado visible; `aprobado` es la
-- aprobación del admin y `needs_review` marca contenido editado tras aprobar.

ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_status_check
  CHECK (status IN ('borrador', 'en_revision', 'aprobado', 'publicado', 'rechazado'));

ALTER TABLE public.gallery_posts DROP CONSTRAINT IF EXISTS gallery_posts_status_check;
ALTER TABLE public.gallery_posts ADD CONSTRAINT gallery_posts_status_check
  CHECK (status IN ('borrador', 'en_revision', 'aprobado', 'publicado', 'rechazado'));

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_note TEXT;

ALTER TABLE public.gallery_posts
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_note TEXT;

-- Un rechazo siempre explica el motivo.
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_review_note_check;
ALTER TABLE public.posts ADD CONSTRAINT posts_review_note_check
  CHECK (status <> 'rechazado' OR (review_note IS NOT NULL AND length(btrim(review_note)) > 0));

ALTER TABLE public.gallery_posts DROP CONSTRAINT IF EXISTS gallery_posts_review_note_check;
ALTER TABLE public.gallery_posts ADD CONSTRAINT gallery_posts_review_note_check
  CHECK (status <> 'rechazado' OR (review_note IS NOT NULL AND length(btrim(review_note)) > 0));
