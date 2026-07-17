import { getAppUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ConfiguracoesPage() {
  const appUser = await getAppUser();
  const supabase = await createClient();
  const { data: tenant } = await supabase
    .from("tenant")
    .select("nome, slug, crn, telefone")
    .eq("id", appUser!.tenant_id)
    .maybeSingle();

  return (
    <div>
      <span className="section-label">Configurações</span>
      <h1 className="text-3xl font-semibold">Configurações</h1>
      <div className="card-surface mt-8 space-y-3 p-8">
        <Linha rotulo="Nutricionista" valor={appUser?.full_name} />
        <Linha rotulo="E-mail" valor={appUser?.email} />
        <Linha rotulo="Consultório" valor={tenant?.nome} />
        <Linha rotulo="CRN" valor={tenant?.crn ?? "—"} />
        <Linha rotulo="Telefone" valor={tenant?.telefone ?? "—"} />
      </div>
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return (
    <div className="flex justify-between border-b border-[color:var(--color-border)] pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-[color:var(--color-muted-foreground)]">{rotulo}</span>
      <span className="text-sm font-medium">{valor ?? "—"}</span>
    </div>
  );
}
