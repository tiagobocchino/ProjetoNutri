import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Client Supabase com SERVICE ROLE — ignora RLS.
 * Uso EXCLUSIVO em código server-only (route handlers/Server Actions) para
 * operações administrativas: convites, tarefas de sistema. NUNCA importar em Client Components.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
