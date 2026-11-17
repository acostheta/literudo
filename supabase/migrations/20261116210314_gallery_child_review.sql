-- Cambiar imágenes o embeds de una galería aprobada/publicada también es una
-- edición: se marca needs_review aunque la fila de gallery_posts no cambie.
-- El guard de contenido permite marcar el flag (nunca limpiarlo) a no-admins.

CREATE OR REPLACE FUNCTION public.enforce_content_review()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  admin boolean := public.is_admin();
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT admin AND NEW.status NOT IN ('borrador', 'en_revision') THEN
      RAISE EXCEPTION 'Solo un Administrador puede aprobar o publicar'
        USING ERRCODE = '42501';
    END IF;
    NEW.needs_review := false;
    NEW.reviewed_by := NULL;
    NEW.reviewed_at := NULL;
    NEW.review_note := NULL;
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT admin AND NOT (
      (OLD.status = 'borrador'  AND NEW.status = 'en_revision') OR
      (OLD.status = 'rechazado' AND NEW.status = 'en_revision') OR
      (OLD.status = 'aprobado'  AND NEW.status = 'publicado') OR
      (OLD.status = 'publicado' AND NEW.status = 'aprobado')
    ) THEN
      RAISE EXCEPTION 'Solo un Administrador puede aprobar o rechazar'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF NOT admin THEN
    NEW.reviewed_by := OLD.reviewed_by;
    NEW.reviewed_at := OLD.reviewed_at;
    NEW.review_note := OLD.review_note;

    IF (OLD.status IN ('aprobado', 'publicado')
        AND NEW.status IN ('aprobado', 'publicado')
        AND (
          NEW.title IS DISTINCT FROM OLD.title
          OR NEW.slug IS DISTINCT FROM OLD.slug
          OR to_jsonb(NEW)->>'excerpt' IS DISTINCT FROM to_jsonb(OLD)->>'excerpt'
          OR to_jsonb(NEW)->>'description' IS DISTINCT FROM to_jsonb(OLD)->>'description'
          OR to_jsonb(NEW)->>'content' IS DISTINCT FROM to_jsonb(OLD)->>'content'
        ))
       OR (NEW.needs_review AND NOT OLD.needs_review) THEN
      NEW.needs_review := true;
    ELSE
      NEW.needs_review := OLD.needs_review;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.flag_gallery_review()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_parent uuid := COALESCE(NEW.gallery_post_id, OLD.gallery_post_id);
BEGIN
  IF NOT public.is_admin() THEN
    UPDATE public.gallery_posts
    SET needs_review = true
    WHERE id = v_parent AND status IN ('aprobado', 'publicado');
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS review_guard_images ON public.gallery_images;
CREATE TRIGGER review_guard_images
  AFTER INSERT OR UPDATE OR DELETE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.flag_gallery_review();

DROP TRIGGER IF EXISTS review_guard_embeds ON public.gallery_embeds;
CREATE TRIGGER review_guard_embeds
  AFTER INSERT OR UPDATE OR DELETE ON public.gallery_embeds
  FOR EACH ROW EXECUTE FUNCTION public.flag_gallery_review();
