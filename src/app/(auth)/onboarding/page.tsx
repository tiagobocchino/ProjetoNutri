"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/field";

function slugify(texto: string) {
  const base = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const sufixo = Math.random().toString(36).slice(2, 7);
  return `${base || "consultorio"}-${sufixo}`;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [nomeConsultorio, setNomeConsultorio] = useState("");
  const [seuNome, setSeuNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    const supabase = createClient();

    const { error } = await supabase.rpc("create_nutricionista_tenant", {
      p_nome: nomeConsultorio,
      p_slug: slugify(nomeConsultorio),
      p_full_name: seuNome,
    });

    if (error) {
      setCarregando(false);
      setErro(
        error.message.includes("ja possui")
          ? "Sua conta já está configurada."
          : "Não foi possível concluir. Tente novamente.",
      );
      if (error.message.includes("ja possui")) {
        router.push("/dashboard");
        router.refresh();
      }
      return;
    }

    // Atualiza o token para carregar tenant_id/role nas claims, então vai ao painel.
    await supabase.auth.refreshSession();
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Configurar consultório</h1>
      <p className="mb-6 text-sm text-[color:var(--color-muted-foreground)]">
        Só falta um passo para começar.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Nome do consultório"
          required
          value={nomeConsultorio}
          onChange={(e) => setNomeConsultorio(e.target.value)}
          placeholder="Ex.: Nutrição Performance"
        />
        <Field
          label="Seu nome (nutricionista)"
          required
          value={seuNome}
          onChange={(e) => setSeuNome(e.target.value)}
          placeholder="Nome e sobrenome"
        />
        {erro && <p className="text-sm text-[color:var(--color-destructive)]">{erro}</p>}
        <button
          type="submit"
          disabled={carregando}
          className="btn-relay w-full rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-dark)] disabled:opacity-60"
        >
          {carregando ? "Concluindo…" : "Concluir e acessar"}
        </button>
      </form>
    </div>
  );
}
