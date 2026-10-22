-- Corrige "infinite recursion detected in policy for relation profiles".
-- La comprobacion de Administrador se mueve a una funcion SECURITY DEFINER,
-- que consulta profiles sin volver a evaluar sus politicas RLS.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador'
  );
$$;

DROP POLICY IF EXISTS "Profiles admin all" ON profiles;
CREATE POLICY "Profiles admin all" ON profiles
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- El trigger ya es SECURITY DEFINER, pero usa la misma comprobacion.
CREATE OR REPLACE FUNCTION protect_profile_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'authenticated' THEN
    RETURN NEW;
  END IF;

  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.role IS DISTINCT FROM OLD.role
     OR NEW.status IS DISTINCT FROM OLD.status
     OR NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'Solo un Administrador puede cambiar el rol, estatus o correo';
  END IF;

  RETURN NEW;
END;
$$;
