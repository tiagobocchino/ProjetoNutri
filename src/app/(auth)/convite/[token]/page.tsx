"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/field";

export default function AceitarConvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [temSessao, setTemSessao] = useState<boolean | null>(null);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setTemSessao(!!data.user));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha.length < 8) {
      setErro("A senha deve ter ao menos 8 caracteres.");
      return;
    }
    setCarregando(true);
    const supabase = createClient();

    // 1) define a senha do paciente
    const { error: eSenha } = await supabase.auth.updateUser({ password: senha });
    if (eSenha) {
      setCarregando(false);
      setErro("Não foi possível definir a senha. Abra o link do convite novamente.");
      return;
    }

    // 2) finaliza o vínculo (cria app_user paciente)
    const res = await fetch("/api/convites/aceitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json().catch(() => ({}));
    setCarregando(false);

    if (!res.ok) {
      setErro(data.error ?? "Não foi possível concluir o aceite.");
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  if (temSessao === false) {
    return (
      <div>
        <h1 className="mb-2 text-2xl font-semibold">Convite</h1>
        <p className="text-sm text-[color:var(--color-muted-foreground)]">
          Este link precisa ser aberto a partir do e-mail de convite. Verifique sua caixa de entrada
          e clique no botão do convite.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Criar sua senha</h1>
      <p className="mb-6 text-sm text-[color:var(--color-muted-foreground)]">
        Defina uma senha para acessar seu acompanhamento.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Senha"
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Mínimo 8 caracteres"
        />
        {erro && <p className="text-sm text-[color:var(--color-destructive)]">{erro}</p>}
        <button
          type="submit"
          disabled={carregando || temSessao === null}
          className="btn-relay w-full rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-dark)] disabled:opacity-60"
        >
          {carregando ? "Concluindo…" : "Acessar meu portal"}
        </button>
      </form>
    </div>
  );
}
