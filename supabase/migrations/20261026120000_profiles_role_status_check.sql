-- Rol y estatus son valores cerrados. La app usa las mismas constantes en
-- src/lib/permissions.ts; si cambian, cambian en los dos lados.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('Administrador', 'Usuario'));

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_status_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('activo', 'inactivo'));

-- El estatus es obligatorio: la app lo compara contra 'activo' y un NULL
-- pasaria el CHECK de arriba dejando perfiles en un tercer estado invisible.
UPDATE public.profiles SET status = 'activo' WHERE status IS NULL;
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'activo';
ALTER TABLE public.profiles ALTER COLUMN status SET NOT NULL;
