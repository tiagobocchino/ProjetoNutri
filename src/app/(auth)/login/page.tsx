"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/field";
import { traduzErroAuth } from "@/lib/auth-errors";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [precisaConfirmar, setPrecisaConfirmar] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    setPrecisaConfirmar(false);
    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);
    if (error) {
      const info = traduzErroAuth(error.message);
      setErro(info.message);
      setPrecisaConfirmar(!!info.needsConfirmation);
      return;
    }
    router.push(params.get("next") ?? "/dashboard");
    router.refresh();
  }

  async function reenviarConfirmacao() {
    if (!email) return;
    setAviso(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setAviso(
      error
        ? traduzErroAuth(error.message).message
        : "Link de confirmação reenviado. Verifique seu e-mail.",
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Entrar</h1>
      <p className="mb-6 text-sm text-[color:var(--color-muted-foreground)]">
        Acesse sua conta de nutricionista.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="E-mail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
        />
        <Field
          label="Senha"
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
        />
        {erro && <p className="text-sm text-[color:var(--color-destructive)]">{erro}</p>}
        {precisaConfirmar && (
          <button
            type="button"
            onClick={reenviarConfirmacao}
            className="text-sm font-medium text-[color:var(--color-primary)] hover:underline"
          >
            Reenviar e-mail de confirmação
          </button>
        )}
        {aviso && <p className="text-sm text-[color:var(--color-primary)]">{aviso}</p>}
        <button
          type="submit"
          disabled={carregando}
          className="btn-relay w-full rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-dark)] disabled:opacity-60"
        >
          {carregando ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[color:var(--color-muted-foreground)]">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-[color:var(--color-primary)] hover:underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
