-- Auditoria de los cambios que solo un Administrador puede hacer.
-- El trigger escribe; nadie mas puede leer salvo el Administrador.

CREATE TABLE IF NOT EXISTS public.profiles_audit (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  profile_id UUID NOT NULL,
  changed_by UUID,
  field TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_audit_profile ON public.profiles_audit (profile_id);

ALTER TABLE public.profiles_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auditoria_lectura_admin" ON public.profiles_audit;
CREATE POLICY "auditoria_lectura_admin" ON public.profiles_audit
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Sin politicas de INSERT/UPDATE/DELETE: solo escribe el trigger, que es
-- SECURITY DEFINER. Un Administrador no puede reescribir la auditoria.

CREATE OR REPLACE FUNCTION public.audit_profile_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    INSERT INTO public.profiles_audit (profile_id, changed_by, field, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'role', OLD.role, NEW.role);
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.profiles_audit (profile_id, changed_by, field, old_value, new_value)
    VALUES (NEW.id, auth.uid(), 'status', OLD.status, NEW.status);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_audit_privileged_fields ON public.profiles;
CREATE TRIGGER profiles_audit_privileged_fields
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_privileged_fields();
