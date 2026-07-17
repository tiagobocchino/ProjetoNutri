"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field, Textarea } from "@/components/ui/field";
import { registrarExame, excluirExame } from "@/lib/actions/clinical";

type Exame = {
  id: string;
  tipo: string;
  data_exame: string | null;
  file_path: string | null;
  observacoes: string | null;
  url: string | null;
};

function sanitizar(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_");
}

export function ExamesManager({
  patientId,
  tenantId,
  exames,
}: {
  patientId: string;
  tenantId: string;
  exames: Exame[];
}) {
  const router = useRouter();
  const [tipo, setTipo] = useState("");
  const [dataExame, setDataExame] = useState("");
  const [obs, setObs] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [pending, startTransition] = useTransition();

  async function salvar() {
    setErro(null);
    if (!tipo.trim()) return setErro("Informe o tipo de exame.");
    setEnviando(true);

    let filePath: string | null = null;
    if (arquivo) {
      const supabase = createClient();
      filePath = `${tenantId}/${patientId}/${Date.now()}_${sanitizar(arquivo.name)}`;
      const { error } = await supabase.storage.from("exames").upload(filePath, arquivo);
      if (error) {
        setEnviando(false);
        return setErro("Falha ao enviar o arquivo.");
      }
    }

    const res = await registrarExame(patientId, tipo, dataExame, filePath, obs);
    setEnviando(false);
    if (!res.ok) return setErro(res.error);
    setTipo("");
    setDataExame("");
    setObs("");
    setArquivo(null);
    router.refresh();
  }

  function remover(id: string, filePath: string | null) {
    startTransition(async () => {
      await excluirExame(patientId, id, filePath);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="card-surface p-8">
        <h2 className="mb-4 text-xl font-semibold">Novo exame</h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tipo de exame" value={tipo} onChange={(e) => setTipo(e.target.value)} placeholder="Ex.: Hemograma" />
            <Field label="Data do exame" type="date" value={dataExame} onChange={(e) => setDataExame(e.target.value)} />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Arquivo (PDF/imagem, opcional)</span>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-[color:var(--color-muted-foreground)] file:mr-4 file:rounded-lg file:border-0 file:bg-[color:var(--color-secondary)] file:px-4 file:py-2 file:text-sm file:font-medium"
            />
          </label>
          <Textarea label="Observações" value={obs} onChange={(e) => setObs(e.target.value)} />
          {erro && <p className="text-sm text-[color:var(--color-destructive)]">{erro}</p>}
          <button
            onClick={salvar}
            disabled={enviando}
            className="btn-relay rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-dark)] disabled:opacity-60"
          >
            {enviando ? "Enviando…" : "Registrar exame"}
          </button>
        </div>
      </div>

      {exames.length === 0 ? (
        <p className="text-sm text-[color:var(--color-muted-foreground)]">Nenhum exame registrado.</p>
      ) : (
        <div className="card-surface divide-y divide-[color:var(--color-border)]">
          {exames.map((ex) => (
            <div key={ex.id} className="flex items-start justify-between gap-4 px-6 py-4">
              <div>
                <p className="font-medium">{ex.tipo}</p>
                {ex.data_exame && (
                  <p className="data-number text-xs text-[color:var(--color-muted-foreground)]">
                    {new Date(ex.data_exame + "T00:00:00").toLocaleDateString("pt-BR")}
                  </p>
                )}
                {ex.observacoes && <p className="mt-1 text-sm text-[color:var(--color-muted-foreground)]">{ex.observacoes}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-4 text-sm">
                {ex.url && (
                  <a href={ex.url} target="_blank" rel="noopener noreferrer" className="text-[color:var(--color-primary)] hover:underline">
                    Abrir
                  </a>
                )}
                <button onClick={() => remover(ex.id, ex.file_path)} disabled={pending} className="text-[color:var(--color-destructive)] hover:underline">
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
