import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type AppUser = Database["public"]["Tables"]["app_user"]["Row"];

/** Retorna o usuário autenticado do Supabase (ou null). */
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Retorna o registro app_user (com role e tenant_id) do usuário logado.
 * null = não autenticado OU ainda sem tenant provisionado (onboarding pendente).
 */
export async function getAppUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("app_user")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return data ?? null;
}
