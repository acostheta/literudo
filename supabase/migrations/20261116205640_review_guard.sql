-- Control de transiciones de revisión para artículos y galerías.
--
-- Reglas:
--   * un no-administrador solo inserta borradores o envía a revisión;
--   * solo el admin aprueba o rechaza;
--   * el autor publica/despublica sin nueva revisión;
--   * editar contenido aprobado/publicado deja el post visible pero marca
--     needs_review para que un admin lo revise;
--   * solo el admin limpia el flag o toca los campos de revisión.

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

    IF OLD.status IN ('aprobado', 'publicado')
       AND NEW.status IN ('aprobado', 'publicado')
       AND (
         NEW.title IS DISTINCT FROM OLD.title
         OR NEW.slug IS DISTINCT FROM OLD.slug
         OR to_jsonb(NEW)->>'excerpt' IS DISTINCT FROM to_jsonb(OLD)->>'excerpt'
         OR to_jsonb(NEW)->>'description' IS DISTINCT FROM to_jsonb(OLD)->>'description'
         OR to_jsonb(NEW)->>'content' IS DISTINCT FROM to_jsonb(OLD)->>'content'
       ) THEN
      NEW.needs_review := true;
    ELSE
      NEW.needs_review := OLD.needs_review;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS review_guard ON public.posts;
CREATE TRIGGER review_guard
  BEFORE INSERT OR UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_content_review();

DROP TRIGGER IF EXISTS review_guard ON public.gallery_posts;
CREATE TRIGGER review_guard
  BEFORE INSERT OR UPDATE ON public.gallery_posts
  FOR EACH ROW EXECUTE FUNCTION public.enforce_content_review();
