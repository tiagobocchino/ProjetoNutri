"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Textarea, Select } from "@/components/ui/field";
import { criarHistorico, excluirHistorico } from "@/lib/actions/clinical";
import type { HospitalTipo } from "@/types/database";

type Registro = { id: string; tipo: HospitalTipo; descricao: string; data_evento: string | null };

const tipoLabel: Record<HospitalTipo, string> = {
  internacao: "Internação",
  cirurgia: "Cirurgia",
  diagnostico: "Diagnóstico",
  alergia: "Alergia",
  medicacao: "Medicação",
  outro: "Outro",
};

export function HistoricoManager({ patientId, registros }: { patientId: string; registros: Registro[] }) {
  const router = useRouter();
  const [tipo, setTipo] = useState<HospitalTipo>("diagnostico");
  const [descricao, setDescricao] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const res = await criarHistorico(patientId, tipo, descricao, dataEvento);
      if (!res.ok) return setErro(res.error);
      setDescricao("");
      setDataEvento("");
      router.refresh();
    });
  }

  function remover(id: string) {
    startTransition(async () => {
      await excluirHistorico(patientId, id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="card-surface p-8">
        <h2 className="mb-4 text-xl font-semibold">Novo registro hospitalar</h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value as HospitalTipo)}>
              {Object.entries(tipoLabel).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </Select>
            <Field label="Data do evento" type="date" value={dataEvento} onChange={(e) => setDataEvento(e.target.value)} />
          </div>
          <Textarea label="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
          {erro && <p className="text-sm text-[color:var(--color-destructive)]">{erro}</p>}
          <button
            onClick={salvar}
            disabled={pending}
            className="btn-relay rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-dark)] disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Adicionar"}
          </button>
        </div>
      </div>

      {registros.length === 0 ? (
        <p className="text-sm text-[color:var(--color-muted-foreground)]">Nenhum registro no histórico.</p>
      ) : (
        <div className="card-surface divide-y divide-[color:var(--color-border)]">
          {registros.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 px-6 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[color:var(--color-secondary)] px-2.5 py-0.5 text-xs font-medium">{tipoLabel[r.tipo]}</span>
                  {r.data_evento && (
                    <span className="data-number text-xs text-[color:var(--color-muted-foreground)]">
                      {new Date(r.data_evento + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm">{r.descricao}</p>
              </div>
              <button onClick={() => remover(r.id)} className="shrink-0 text-sm text-[color:var(--color-destructive)] hover:underline">
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
