import { createClient } from "@/lib/supabase/client";

export async function canManageContent(
  supabase: ReturnType<typeof createClient>,
  authorId: string,
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  if (user.id === authorId) return true;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "Administrador";
}
