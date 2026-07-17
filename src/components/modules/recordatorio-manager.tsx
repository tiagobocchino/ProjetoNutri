"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Textarea } from "@/components/ui/field";
import { criarRecordatorio, excluirRecordatorio } from "@/lib/actions/clinical";

type Entrada = { id: string; horario: string | null; alimento: string; quantidade: string | null; local: string | null };
type Recall = { id: string; data: string; observacoes: string | null; food_recall_entry: Entrada[] };

type LinhaNova = { horario: string; alimento: string; quantidade: string; local: string };
const linhaVazia = (): LinhaNova => ({ horario: "", alimento: "", quantidade: "", local: "" });

export function RecordatorioManager({ patientId, recalls }: { patientId: string; recalls: Recall[] }) {
  const router = useRouter();
  const [data, setData] = useState("");
  const [obs, setObs] = useState("");
  const [linhas, setLinhas] = useState<LinhaNova[]>([linhaVazia()]);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function atualizar(i: number, campo: keyof LinhaNova, valor: string) {
    setLinhas((ls) => ls.map((l, idx) => (idx === i ? { ...l, [campo]: valor } : l)));
  }

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const res = await criarRecordatorio(patientId, data, obs, linhas);
      if (!res.ok) return setErro(res.error);
      setData("");
      setObs("");
      setLinhas([linhaVazia()]);
      router.refresh();
    });
  }

  function remover(id: string) {
    startTransition(async () => {
      await excluirRecordatorio(patientId, id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="card-surface p-8">
        <h2 className="mb-4 text-xl font-semibold">Novo recordatório alimentar</h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="space-y-2">
            {linhas.map((l, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-4">
                <Field placeholder="Horário" value={l.horario} onChange={(e) => atualizar(i, "horario", e.target.value)} />
                <Field placeholder="Alimento" value={l.alimento} onChange={(e) => atualizar(i, "alimento", e.target.value)} />
                <Field placeholder="Quantidade" value={l.quantidade} onChange={(e) => atualizar(i, "quantidade", e.target.value)} />
                <Field placeholder="Local" value={l.local} onChange={(e) => atualizar(i, "local", e.target.value)} />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setLinhas((ls) => [...ls, linhaVazia()])}
              className="text-sm font-medium text-[color:var(--color-primary)] hover:underline"
            >
              + Adicionar refeição
            </button>
          </div>
          <Textarea label="Observações" value={obs} onChange={(e) => setObs(e.target.value)} />
          {erro && <p className="text-sm text-[color:var(--color-destructive)]">{erro}</p>}
          <button
            onClick={salvar}
            disabled={pending}
            className="btn-relay rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-dark)] disabled:opacity-60"
          >
            {pending ? "Salvando…" : "Salvar recordatório"}
          </button>
        </div>
      </div>

      {recalls.length === 0 ? (
        <p className="text-sm text-[color:var(--color-muted-foreground)]">Nenhum recordatório ainda.</p>
      ) : (
        recalls.map((r) => (
          <div key={r.id} className="card-surface p-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="data-number font-semibold">{new Date(r.data + "T00:00:00").toLocaleDateString("pt-BR")}</h3>
              <button onClick={() => remover(r.id)} className="text-sm text-[color:var(--color-destructive)] hover:underline">
                Excluir
              </button>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[color:var(--color-muted-foreground)]">
                  <th className="py-1 font-medium">Horário</th>
                  <th className="py-1 font-medium">Alimento</th>
                  <th className="py-1 font-medium">Qtd.</th>
                  <th className="py-1 font-medium">Local</th>
                </tr>
              </thead>
              <tbody>
                {r.food_recall_entry.map((e) => (
                  <tr key={e.id} className="border-t border-[color:var(--color-border)]">
                    <td className="py-1.5">{e.horario ?? "—"}</td>
                    <td className="py-1.5">{e.alimento}</td>
                    <td className="py-1.5">{e.quantidade ?? "—"}</td>
                    <td className="py-1.5">{e.local ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {r.observacoes && <p className="mt-3 text-sm text-[color:var(--color-muted-foreground)]">{r.observacoes}</p>}
          </div>
        ))
      )}
    </div>
  );
}
