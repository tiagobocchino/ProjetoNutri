"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/ui/field";
import { traduzErroAuth } from "@/lib/auth-errors";

export default function CadastroPage() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    if (senha.length < 8) {
      setErro("A senha deve ter ao menos 8 caracteres.");
      return;
    }
    setCarregando(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { full_name: nome },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
    setCarregando(false);

    if (error) {
      setErro(traduzErroAuth(error.message).message);
      return;
    }
    // Supabase (anti-enumeração) retorna um "user" com identities vazio quando o
    // e-mail JÁ existe. Tratamos como "já cadastrado".
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      setErro("Este e-mail já possui conta. Faça login.");
      return;
    }
    // Se a confirmação de e-mail estiver desativada, já há sessão → segue para onboarding.
    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }
    setAviso("Enviamos um e-mail de confirmação. Confirme para continuar o cadastro.");
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Criar conta</h1>
      <p className="mb-6 text-sm text-[color:var(--color-muted-foreground)]">
        Comece a gerenciar seus pacientes.
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field
          label="Seu nome"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome e sobrenome"
        />
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
          placeholder="Mínimo 8 caracteres"
        />
        {erro && <p className="text-sm text-[color:var(--color-destructive)]">{erro}</p>}
        {aviso && <p className="text-sm text-[color:var(--color-primary)]">{aviso}</p>}
        <button
          type="submit"
          disabled={carregando}
          className="btn-relay w-full rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-dark)] disabled:opacity-60"
        >
          {carregando ? "Criando…" : "Criar conta"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[color:var(--color-muted-foreground)]">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-[color:var(--color-primary)] hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
