"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const abas = [
  { slug: "", label: "Dados" },
  { slug: "anamnese", label: "Anamnese" },
  { slug: "prescricao", label: "Prescrição" },
  { slug: "recordatorio", label: "Recordatório" },
  { slug: "habitos", label: "Hábitos" },
  { slug: "historico", label: "Histórico" },
  { slug: "exames", label: "Exames" },
];

export function PatientTabs({ patientId }: { patientId: string }) {
  const pathname = usePathname();
  const base = `/pacientes/${patientId}`;

  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b border-[color:var(--color-border)]">
      {abas.map((a) => {
        const href = a.slug ? `${base}/${a.slug}` : base;
        const ativo = a.slug ? pathname.startsWith(href) : pathname === base;
        return (
          <Link
            key={a.slug || "dados"}
            href={href}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              ativo
                ? "border-[color:var(--color-primary)] text-[color:var(--color-primary)]"
                : "border-transparent text-[color:var(--color-muted-foreground)] hover:text-[color:var(--color-foreground)]"
            }`}
          >
            {a.label}
          </Link>
        );
      })}
    </nav>
  );
}
