import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// Valores cerrados en la DB (CHECK en supabase/migrations) y en la UI.
export const ROLES = { admin: "Administrador", user: "Usuario" } as const;
export const STATUS = { active: "activo", inactive: "inactivo" } as const;
export const POST_STATUS = { published: "publicado", draft: "borrador" } as const;

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar_url: string | null;
  about_me: string | null;
  created_at: string;
}

// Para etiquetas y filtros de la UI. Las capacidades van por isAdmin().
export const isAdminRole = (role?: string | null) => role === ROLES.admin;

// mi_perfil() es el unico camino para leer el correo propio: la columna esta
// revocada para anon/authenticated (ver migracion de RLS).
export async function getCurrentProfile(
  supabase: SupabaseClient = createClient(),
): Promise<Profile | null> {
  const { data, error } = await supabase.rpc("mi_perfil").maybeSingle();
  if (!error) return data as Profile | null;

  // shortcut: mientras la migracion de RLS no este aplicada en un entorno,
  // mi_perfil() no existe; sin correo, el admin sigue funcionando. Quitar
  // cuando todos los entornos esten migrados.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, role, status, avatar_url, about_me, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return profile ? ({ ...profile, email: "" } as Profile) : null;
}

export async function isAdmin(
  supabase: SupabaseClient = createClient(),
): Promise<boolean> {
  return isAdminRole((await getCurrentProfile(supabase))?.role);
}

// Listado de usuarios con correo para el panel.
export async function adminListProfiles(
  supabase: SupabaseClient = createClient(),
): Promise<Profile[]> {
  const { data, error } = await supabase.rpc("admin_list_profiles");
  if (!error) return (data as Profile[]) ?? [];

  // shortcut: sin la migración de RLS aplicada no existe el RPC; mientras
  // tanto el correo sigue siendo legible por columna. Quitar al migrar todo.
  const conCorreo = await supabase
    .from("profiles")
    .select("id, name, email, role, status, avatar_url, about_me, created_at")
    .order("created_at", { ascending: false });
  if (!conCorreo.error) return (conCorreo.data as Profile[]) ?? [];

  const sinCorreo = await supabase
    .from("profiles")
    .select("id, name, role, status, avatar_url, about_me, created_at")
    .order("created_at", { ascending: false });

  return ((sinCorreo.data ?? []) as Omit<Profile, "email">[]).map((p) => ({
    ...p,
    email: "",
  }));
}

export async function canManageContent(
  supabase: SupabaseClient,
  authorId: string,
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  if (user.id === authorId) return true;
  return isAdmin(supabase);
}
