import { getAppUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const appUser = await getAppUser();
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from("tenant")
    .select("nome")
    .eq("id", appUser!.tenant_id)
    .maybeSingle();

  const { count } = await supabase
    .from("patient")
    .select("*", { count: "exact", head: true });

  return (
    <div>
      <span className="section-label">Painel</span>
      <h1 className="text-3xl font-semibold">
        Olá, {appUser?.full_name?.split(" ")[0] ?? "nutricionista"} 👋
      </h1>
      <p className="mt-2 text-[color:var(--color-muted-foreground)]">
        Consultório: <strong>{tenant?.nome ?? "—"}</strong>
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card-surface p-6">
          <p className="text-sm text-[color:var(--color-muted-foreground)]">Pacientes</p>
          <p className="data-number mt-1 text-3xl font-semibold text-[color:var(--color-primary)]">
            {count ?? 0}
          </p>
        </div>
        <div className="card-surface p-6">
          <p className="text-sm text-[color:var(--color-muted-foreground)]">Consultas hoje</p>
          <p className="data-number mt-1 text-3xl font-semibold text-[color:var(--color-primary)]">0</p>
        </div>
        <div className="card-surface p-6">
          <p className="text-sm text-[color:var(--color-muted-foreground)]">Dietas ativas</p>
          <p className="data-number mt-1 text-3xl font-semibold text-[color:var(--color-primary)]">0</p>
        </div>
      </div>

      <p className="mt-10 text-sm text-[color:var(--color-muted-foreground)]">
        Próxima fase (F2): cadastro e convite de pacientes.
      </p>
    </div>
  );
}
