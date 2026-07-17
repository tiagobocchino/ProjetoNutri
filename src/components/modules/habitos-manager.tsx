"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/field";
import { criarHabito, alternarHabito, excluirHabito } from "@/lib/actions/clinical";

type Habito = { id: string; nome: string; meta_semanal: number | null; ativo: boolean };

export function HabitosManager({ patientId, habitos }: { patientId: string; habitos: Habito[] }) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [meta, setMeta] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function acao(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setErro(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) return setErro(res.error ?? "Erro.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="card-surface p-8">
        <h2 className="mb-4 text-xl font-semibold">Novo hábito</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-56 flex-1">
            <Field label="Hábito" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Beber 2L de água" />
          </div>
          <div className="w-40">
            <Field label="Meta semanal" type="number" min={0} max={7} value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="dias" />
          </div>
          <button
            onClick={() =>
              acao(async () => {
                const r = await criarHabito(patientId, nome, meta ? Number(meta) : null);
                if (r.ok) { setNome(""); setMeta(""); }
                return r;
              })
            }
            disabled={pending}
            className="btn-relay rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-dark)] disabled:opacity-60"
          >
            Adicionar
          </button>
        </div>
        {erro && <p className="mt-3 text-sm text-[color:var(--color-destructive)]">{erro}</p>}
      </div>

      {habitos.length === 0 ? (
        <p className="text-sm text-[color:var(--color-muted-foreground)]">Nenhum hábito definido.</p>
      ) : (
        <div className="card-surface divide-y divide-[color:var(--color-border)]">
          {habitos.map((h) => (
            <div key={h.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className={`font-medium ${h.ativo ? "" : "text-[color:var(--color-muted-foreground)] line-through"}`}>{h.nome}</p>
                {h.meta_semanal != null && (
                  <p className="text-xs text-[color:var(--color-muted-foreground)]">Meta: {h.meta_semanal}x/semana</p>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <button onClick={() => acao(() => alternarHabito(patientId, h.id, !h.ativo))} className="text-[color:var(--color-primary)] hover:underline">
                  {h.ativo ? "Desativar" : "Ativar"}
                </button>
                <button onClick={() => acao(() => excluirHabito(patientId, h.id))} className="text-[color:var(--color-destructive)] hover:underline">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
