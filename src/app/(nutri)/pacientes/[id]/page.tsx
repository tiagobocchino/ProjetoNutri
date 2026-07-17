import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InviteButton } from "@/components/patients/invite-button";
import type { PatientStatus } from "@/types/database";

const statusLabel: Record<PatientStatus, string> = {
  convidado: "Convidado",
  ativo: "Ativo",
  inativo: "Inativo",
  arquivado: "Arquivado",
};

type Endereco = { cep?: string; logradouro?: string; cidade?: string; uf?: string };

export default async function PacienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase.from("patient").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();

  const endereco = (p.endereco ?? {}) as Endereco;
  const enderecoStr = [endereco.logradouro, endereco.cidade, endereco.uf].filter(Boolean).join(", ");
  const vinculado = !!p.user_id;

  return (
    <div className="max-w-3xl">
      <Link href="/pacientes" className="text-sm text-[color:var(--color-muted-foreground)] hover:underline">
        ← Pacientes
      </Link>

      <div className="mb-6 mt-2 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{p.nome}</h1>
          <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">
            Status: {statusLabel[p.status]}
            {vinculado && " · conta ativa"}
          </p>
        </div>
        <Link
          href={`/pacientes/${p.id}/editar`}
          className="rounded-xl border border-[color:var(--color-border)] px-4 py-2 text-sm font-medium transition hover:bg-[color:var(--color-secondary)]"
        >
          Editar
        </Link>
      </div>

      <div className="card-surface space-y-3 p-8">
        <Linha rotulo="E-mail" valor={p.email} />
        <Linha rotulo="Telefone" valor={p.telefone} />
        <Linha rotulo="Nascimento" valor={p.data_nascimento} />
        <Linha rotulo="Sexo" valor={p.sexo} />
        <Linha rotulo="Objetivo" valor={p.objetivo} />
        <Linha rotulo="Esporte" valor={p.esporte} />
        <Linha rotulo="Endereço" valor={enderecoStr || null} />
        <Linha rotulo="Observações" valor={p.observacoes} />
      </div>

      {!vinculado && (
        <div className="card-surface mt-6 p-6">
          <h2 className="text-lg font-semibold">Acesso do paciente</h2>
          <p className="mb-4 mt-1 text-sm text-[color:var(--color-muted-foreground)]">
            Envie um convite para o paciente criar a senha e acessar o próprio portal.
          </p>
          <InviteButton patientId={p.id} temEmail={!!p.email} />
        </div>
      )}
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[color:var(--color-border)] pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-[color:var(--color-muted-foreground)]">{rotulo}</span>
      <span className="text-right text-sm font-medium">{valor || "—"}</span>
    </div>
  );
}
