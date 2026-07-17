import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { PatientStatus } from "@/types/database";

const statusLabel: Record<PatientStatus, string> = {
  convidado: "Convidado",
  ativo: "Ativo",
  inativo: "Inativo",
  arquivado: "Arquivado",
};

const statusCor: Record<PatientStatus, string> = {
  convidado: "bg-amber-100 text-amber-800",
  ativo: "bg-emerald-100 text-emerald-800",
  inativo: "bg-zinc-100 text-zinc-600",
  arquivado: "bg-zinc-100 text-zinc-500",
};

export default async function PacientesPage() {
  const supabase = await createClient();
  const { data: pacientes } = await supabase
    .from("patient")
    .select("id, nome, email, telefone, status")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="section-label">Pacientes</span>
          <h1 className="text-3xl font-semibold">Pacientes</h1>
        </div>
        <Link
          href="/pacientes/novo"
          className="btn-relay rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-dark)]"
        >
          Novo paciente
        </Link>
      </div>

      {!pacientes || pacientes.length === 0 ? (
        <div className="card-surface p-10 text-center">
          <p className="text-[color:var(--color-muted-foreground)]">
            Nenhum paciente ainda. Cadastre o primeiro.
          </p>
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--color-border)] text-left text-[color:var(--color-muted-foreground)]">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">Contato</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p) => (
                <tr key={p.id} className="border-b border-[color:var(--color-border)] last:border-0 hover:bg-[color:var(--color-muted)]">
                  <td className="px-5 py-3">
                    <Link href={`/pacientes/${p.id}`} className="font-medium text-[color:var(--color-primary)] hover:underline">
                      {p.nome}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-[color:var(--color-muted-foreground)]">
                    {p.email ?? p.telefone ?? "—"}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`data-number rounded-full px-2.5 py-1 text-xs font-medium ${statusCor[p.status]}`}>
                      {statusLabel[p.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
