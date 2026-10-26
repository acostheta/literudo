"use server";

import { createClient } from "@/lib/supabase/server";
import { POST_STATUS } from "@/lib/permissions";
import type { ActionResult } from "@/app/admin/posts/actions";

export async function setGalleryPostStatus(id: string, status: string): Promise<ActionResult> {
  if (status !== POST_STATUS.published && status !== POST_STATUS.draft) {
    return { ok: false, error: "Estatus no válido." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Tu sesión expiró. Vuelve a iniciar sesión." };

  const { data, error } = await supabase
    .from("gallery_posts")
    .update({ status })
    .eq("id", id)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "No puedes modificar esta galería." };
  return { ok: true };
}
