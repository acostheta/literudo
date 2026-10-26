"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ROLES, STATUS, isAdmin } from "@/lib/permissions";
import type { ActionResult } from "@/app/admin/posts/actions";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esRolValido = (role: string) => role === ROLES.admin || role === ROLES.user;
const esEstatusValido = (status: string) => status === STATUS.active || status === STATUS.inactive;

// Cliente con service role: solo para Auth (crear/borrar usuarios) y para
// operaciones que necesitan saltarse RLS. Nunca se expone al navegador.
function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function requireAdmin(): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Vuelve a iniciar sesión." };
  if (!(await isAdmin(supabase))) return { ok: false, error: "No autorizado." };
  return { ok: true };
}

export async function updateUser(
  id: string,
  datos: { name: string; about_me: string; avatar_url: string; role: string; status: string },
): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Usuario no válido." };
  if (!datos.name.trim()) return { ok: false, error: "El nombre no puede estar vacío." };
  if (!esRolValido(datos.role) || !esEstatusValido(datos.status)) {
    return { ok: false, error: "Rol o estatus no válidos." };
  }

  const autorizado = await requireAdmin();
  if (!autorizado.ok) return autorizado;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      name: datos.name.trim(),
      about_me: datos.about_me.trim(),
      avatar_url: datos.avatar_url || null,
      role: datos.role,
      status: datos.status,
    })
    .eq("id", id)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "No se pudo actualizar el usuario." };
  return { ok: true };
}

export async function setUserStatus(id: string, status: string): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Usuario no válido." };
  if (!esEstatusValido(status)) return { ok: false, error: "Estatus no válido." };

  const autorizado = await requireAdmin();
  if (!autorizado.ok) return autorizado;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ status })
    .eq("id", id)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "No se pudo actualizar el estatus." };
  return { ok: true };
}

export async function createUser(datos: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<ActionResult> {
  if (!datos.name.trim()) return { ok: false, error: "El nombre no puede estar vacío." };
  if (!/^\S+@\S+\.\S+$/.test(datos.email)) return { ok: false, error: "Correo no válido." };
  if (datos.password.length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
  if (!esRolValido(datos.role)) return { ok: false, error: "Rol no válido." };

  const autorizado = await requireAdmin();
  if (!autorizado.ok) return autorizado;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: datos.email.trim(),
    password: datos.password,
    email_confirm: true,
    user_metadata: { name: datos.name.trim() },
  });

  if (error) return { ok: false, error: error.message };
  if (!data.user) return { ok: false, error: "No se pudo crear el usuario." };

  const { error: profileError } = await admin
    .from("profiles")
    .update({ role: datos.role })
    .eq("id", data.user.id);

  if (profileError) {
    // Sin perfil el usuario queda a medias: se deshace la creación.
    await admin.auth.admin.deleteUser(data.user.id);
    return { ok: false, error: profileError.message };
  }

  return { ok: true };
}

export async function deleteUser(id: string): Promise<ActionResult> {
  if (!UUID.test(id)) return { ok: false, error: "Usuario no válido." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Vuelve a iniciar sesión." };
  if (user.id === id) return { ok: false, error: "No puedes eliminar tu propia cuenta." };
  if (!(await isAdmin(supabase))) return { ok: false, error: "No autorizado." };
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor." };
  }

  const admin = createAdminClient();
  const { error: authError } = await admin.auth.admin.deleteUser(id);
  if (authError) return { ok: false, error: authError.message };

  const { error } = await admin.from("profiles").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
