"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isAdmin, POST_STATUS } from "@/lib/permissions";

export type ActionResult = { ok: true } | { ok: false; error: string };

const TABLES: Record<string, "posts" | "gallery_posts"> = {
  post: "posts",
  gallery: "gallery_posts",
};

const SESION = { ok: false as const, error: "Tu sesión expiró. Vuelve a iniciar sesión." };
const SOLO_ADMIN = { ok: false as const, error: "Solo un Administrador puede hacer esto." };

async function apply(
  supabase: SupabaseClient,
  table: string,
  id: string,
  from: string[],
  patch: Record<string, unknown>
): Promise<ActionResult> {
  const { data, error } = await supabase
    .from(table)
    .update(patch)
    .eq("id", id)
    .in("status", from)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "No puedes realizar esta acción." };
  return { ok: true };
}

async function context() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = user ? await isAdmin(supabase) : false;
  return { supabase, user, admin };
}

function tableFor(target: string) {
  return TABLES[target] ?? null;
}

// Autor o admin: borrador/rechazado -> en revisión.
export async function submitForReview(target: string, id: string): Promise<ActionResult> {
  const { supabase, user } = await context();
  if (!user) return SESION;
  const table = tableFor(target);
  if (!table || !id) return { ok: false, error: "Solicitud no válida." };

  return apply(supabase, table, id, [POST_STATUS.draft, POST_STATUS.rejected], {
    status: POST_STATUS.inReview,
  });
}

// Solo admin: en revisión -> aprobado.
export async function approveContent(target: string, id: string): Promise<ActionResult> {
  const { supabase, user, admin } = await context();
  if (!user) return SESION;
  if (!admin) return SOLO_ADMIN;
  const table = tableFor(target);
  if (!table || !id) return { ok: false, error: "Solicitud no válida." };

  return apply(supabase, table, id, [POST_STATUS.inReview], {
    status: POST_STATUS.approved,
    needs_review: false,
    review_note: null,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  });
}

// Solo admin: en revisión -> rechazado, con motivo obligatorio.
export async function rejectContent(
  target: string,
  id: string,
  note: string
): Promise<ActionResult> {
  const { supabase, user, admin } = await context();
  if (!user) return SESION;
  if (!admin) return SOLO_ADMIN;
  const table = tableFor(target);
  if (!table || !id) return { ok: false, error: "Solicitud no válida." };

  const motivo = (note ?? "").trim();
  if (!motivo) return { ok: false, error: "El motivo del rechazo es obligatorio." };

  return apply(supabase, table, id, [POST_STATUS.inReview], {
    status: POST_STATUS.rejected,
    review_note: motivo,
    needs_review: false,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
  });
}

// Autor o admin: aprobado -> publicado.
export async function publishContent(target: string, id: string): Promise<ActionResult> {
  const { supabase, user } = await context();
  if (!user) return SESION;
  const table = tableFor(target);
  if (!table || !id) return { ok: false, error: "Solicitud no válida." };

  return apply(supabase, table, id, [POST_STATUS.approved], {
    status: POST_STATUS.published,
  });
}

// Autor o admin: publicado -> aprobado (sin perder la aprobación).
export async function unpublishContent(target: string, id: string): Promise<ActionResult> {
  const { supabase, user } = await context();
  if (!user) return SESION;
  const table = tableFor(target);
  if (!table || !id) return { ok: false, error: "Solicitud no válida." };

  return apply(supabase, table, id, [POST_STATUS.published], {
    status: POST_STATUS.approved,
  });
}

// Solo admin: quita el aviso de "editado" sin cambiar la visibilidad.
export async function clearReviewFlag(target: string, id: string): Promise<ActionResult> {
  const { supabase, user, admin } = await context();
  if (!user) return SESION;
  if (!admin) return SOLO_ADMIN;
  const table = tableFor(target);
  if (!table || !id) return { ok: false, error: "Solicitud no válida." };

  const { data, error } = await supabase
    .from(table)
    .update({
      needs_review: false,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("needs_review", true)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "No hay cambios pendientes de revisar." };
  return { ok: true };
}
