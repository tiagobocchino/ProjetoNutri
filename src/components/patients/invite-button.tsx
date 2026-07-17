"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function InviteButton({ patientId, temEmail }: { patientId: string; temEmail: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function enviar() {
    setStatus("loading");
    setMsg(null);
    const res = await fetch("/api/convites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId }),
    });
    const data = await res.json().catch(() => ({}));
    setStatus("idle");
    if (res.ok) {
      setMsg({ tipo: "ok", texto: "Convite enviado por e-mail." });
      router.refresh();
    } else {
      setMsg({ tipo: "erro", texto: data.error ?? "Falha ao enviar convite." });
    }
  }

  return (
    <div>
      <button
        onClick={enviar}
        disabled={status === "loading" || !temEmail}
        title={temEmail ? undefined : "Cadastre um e-mail para convidar"}
        className="rounded-xl border border-[color:var(--color-primary)] px-4 py-2 text-sm font-medium text-[color:var(--color-primary)] transition hover:bg-[color:var(--color-secondary)] disabled:opacity-50"
      >
        {status === "loading" ? "Enviando…" : "Enviar convite"}
      </button>
      {msg && (
        <p className={`mt-2 text-sm ${msg.tipo === "ok" ? "text-[color:var(--color-primary)]" : "text-[color:var(--color-destructive)]"}`}>
          {msg.texto}
        </p>
      )}
    </div>
  );
}
