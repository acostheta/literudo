"use server";

import { createClient } from "@/lib/supabase/server";
import { POST_STATUS } from "@/lib/permissions";

export type ActionResult = { ok: true } | { ok: false; error: string };

// El RLS decide quién puede: autor o Administrador. Aquí solo se valida la
// entrada y se comprueba que el UPDATE haya afectado una fila (si no, 0 filas).
export async function setPostStatus(id: string, status: string): Promise<ActionResult> {
  if (status !== POST_STATUS.published && status !== POST_STATUS.draft) {
    return { ok: false, error: "Estatus no válido." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const { data, error } = await supabase
    .from("posts")
    .update({ status })
    .eq("id", id)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "No puedes modificar este artículo." };
  return { ok: true };
}
