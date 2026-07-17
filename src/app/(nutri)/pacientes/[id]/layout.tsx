import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PatientTabs } from "@/components/patients/patient-tabs";

export default async function PacienteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase.from("patient").select("id, nome").eq("id", id).maybeSingle();
  if (!p) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/pacientes" className="text-sm text-[color:var(--color-muted-foreground)] hover:underline">
        ← Pacientes
      </Link>
      <div className="mb-4 mt-2 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">{p.nome}</h1>
        <Link
          href={`/pacientes/${id}/editar`}
          className="rounded-xl border border-[color:var(--color-border)] px-4 py-2 text-sm font-medium transition hover:bg-[color:var(--color-secondary)]"
        >
          Editar dados
        </Link>
      </div>
      <PatientTabs patientId={id} />
      {children}
    </div>
  );
}
