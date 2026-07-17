"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/field";
import { salvarAnamnese } from "@/lib/actions/clinical";

export const SECOES_ANAMNESE: { key: string; label: string }[] = [
  { key: "historico_clinico", label: "Histórico clínico / doenças" },
  { key: "medicacoes", label: "Medicações em uso" },
  { key: "alergias", label: "Alergias / intolerâncias" },
  { key: "habitos_vida", label: "Hábitos de vida (sono, álcool, tabaco)" },
  { key: "rotina", label: "Rotina diária" },
  { key: "atividade", label: "Atividade física / treino" },
  { key: "objetivos", label: "Objetivos e expectativas" },
  { key: "observacoes", label: "Observações gerais" },
];

export function AnamneseForm({
  patientId,
  dados,
}: {
  patientId: string;
  dados: Record<string, string>;
}) {
  const [valores, setValores] = useState<Record<string, string>>(dados);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function salvar() {
    setMsg(null);
    startTransition(async () => {
      const res = await salvarAnamnese(patientId, valores);
      setMsg(res.ok ? "Anamnese salva." : res.error);
    });
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4">
        {SECOES_ANAMNESE.map((s) => (
          <Textarea
            key={s.key}
            label={s.label}
            value={valores[s.key] ?? ""}
            onChange={(e) => setValores((v) => ({ ...v, [s.key]: e.target.value }))}
          />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={salvar}
          disabled={pending}
          className="btn-relay rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-dark)] disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar anamnese"}
        </button>
        {msg && <span className="text-sm text-[color:var(--color-primary)]">{msg}</span>}
      </div>
    </div>
  );
}
