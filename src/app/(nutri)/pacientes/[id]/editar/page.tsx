import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PatientForm } from "@/components/forms/patient-form";
import type { PatientFormValues } from "@/lib/validations/patient";

type Endereco = { cep?: string; logradouro?: string; cidade?: string; uf?: string };

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: p } = await supabase.from("patient").select("*").eq("id", id).maybeSingle();
  if (!p) notFound();

  const e = (p.endereco ?? {}) as Endereco;
  const defaults: Partial<PatientFormValues> = {
    nome: p.nome,
    email: p.email ?? "",
    telefone: p.telefone ?? "",
    data_nascimento: p.data_nascimento ?? "",
    sexo: (p.sexo as PatientFormValues["sexo"]) ?? "",
    objetivo: p.objetivo ?? "",
    esporte: p.esporte ?? "",
    observacoes: p.observacoes ?? "",
    cep: e.cep ?? "",
    logradouro: e.logradouro ?? "",
    cidade: e.cidade ?? "",
    uf: e.uf ?? "",
  };

  return (
    <div className="max-w-3xl">
      <Link href={`/pacientes/${id}`} className="text-sm text-[color:var(--color-muted-foreground)] hover:underline">
        ← {p.nome}
      </Link>
      <h1 className="mb-8 mt-2 text-3xl font-semibold">Editar paciente</h1>
      <div className="card-surface p-8">
        <PatientForm patientId={id} defaultValues={defaults} />
      </div>
    </div>
  );
}
