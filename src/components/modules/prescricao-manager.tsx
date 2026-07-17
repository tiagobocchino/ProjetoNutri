"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/field";
import { criarPrescricao, excluirPrescricao } from "@/lib/actions/clinical";

type Item = { id: string; suplemento: string; dose: string | null; horario: string | null; duracao: string | null; observacao: string | null };
type Prescricao = { id: string; titulo: string; created_at: string; prescription_item: Item[] };

type LinhaNova = { suplemento: string; dose: string; horario: string; duracao: string };
const linhaVazia = (): LinhaNova => ({ suplemento: "", dose: "", horario: "", duracao: "" });

export function PrescricaoManager({ patientId, prescricoes }: { patientId: string; prescricoes: Prescricao[] }) {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [linhas, setLinhas] = useState<LinhaNova[]>([linhaVazia()]);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function atualizar(i: number, campo: keyof LinhaNova, valor: string) {
    setLinhas((ls) => ls.map((l, idx) => (idx === i ? { ...l, [campo]: valor } : l)));
  }

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const res = await criarPrescricao(patientId, titulo, linhas);
      if (!res.ok) return setErro(res.error);
      setTitulo("");
      setLinhas([linhaVazia()]);
      router.refresh();
    });
  }

  function remover(id: string) {
    startTransition(async () => {
      await excluirPrescricao(patientId, id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="card-surface p-8">
        <h2 className="mb-4 text-xl font-semibold">Nova prescrição de suplementação</h2>
        <div className="space-y-4">
          <Field label="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Protocolo inicial" />
          <div className="space-y-2">
            {linhas.map((l, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-4">
                <Field placeholder="Suplemento" value={l.suplemento} onChange={(e) => atualizar(i, "suplemento", e.target.value)} />
                <Field placeholder="Dose" value={l.dose} onChange={(e) => atualizar(i, "dose", e.target.value)} />
                <Field placeholder="Horário" value={l.horario} onChange={(e) => atualizar(i, "horario", e.target.value)} />
                <Field placeholder="Duração" value={l.duracao} onChange={(e) => atualizar(i, "duracao", e.target.value)} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setLinhas((ls) => [...ls, linhaVazia()])}
              className="text-sm font-medium text-[color:var(--color-primary)] hover:underline"
            >
              + Adicionar item
            </button>
          </div>
          {erro && <p className="text-sm text-[color:var(--color-destructive)]">{erro}</p>}
          <button
            onClick={salvar}
            disabled={pending}
            className="btn-relay rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-dark)] disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Salvar prescrição"}
          </button>
        </div>
      </div>

      {prescricoes.length === 0 ? (
        <p className="text-sm text-[color:var(--color-muted-foreground)]">Nenhuma prescrição ainda.</p>
      ) : (
        prescricoes.map((p) => (
          <div key={p.id} className="card-surface p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">{p.titulo}</h3>
              <button onClick={() => remover(p.id)} className="text-sm text-[color:var(--color-destructive)] hover:underline">
                Excluir
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[color:var(--color-muted-foreground)]">
                  <th className="py-1 font-medium">Suplemento</th>
                  <th className="py-1 font-medium">Dose</th>
                  <th className="py-1 font-medium">Horário</th>
                  <th className="py-1 font-medium">Duração</th>
                </tr>
              </thead>
              <tbody>
                {p.prescription_item
                  .sort((a, b) => a.suplemento.localeCompare(b.suplemento))
                  .map((it) => (
                    <tr key={it.id} className="border-t border-[color:var(--color-border)]">
                      <td className="py-1.5">{it.suplemento}</td>
                      <td className="py-1.5">{it.dose ?? "—"}</td>
                      <td className="py-1.5">{it.horario ?? "—"}</td>
                      <td className="py-1.5">{it.duracao ?? "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
