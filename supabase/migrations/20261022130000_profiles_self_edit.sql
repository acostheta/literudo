-- Cada usuario puede editar su propio perfil.
-- Solo el Administrador puede cambiar rol, estatus, correo o id.

DROP POLICY IF EXISTS "Profiles self update" ON profiles;
CREATE POLICY "Profiles self update" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles admin all" ON profiles;
CREATE POLICY "Profiles admin all" ON profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'Administrador'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'Administrador'
    )
  );

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

  IF EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Administrador'
  ) THEN
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

DROP TRIGGER IF EXISTS profiles_protect_privileged_fields ON profiles;
CREATE TRIGGER profiles_protect_privileged_fields
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_profile_privileged_fields();
