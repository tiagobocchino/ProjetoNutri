import Link from "next/link";
import { PatientForm } from "@/components/forms/patient-form";

export default function NovoPacientePage() {
  return (
    <div className="max-w-3xl">
      <Link href="/pacientes" className="text-sm text-[color:var(--color-muted-foreground)] hover:underline">
        ← Pacientes
      </Link>
      <h1 className="mb-8 mt-2 text-3xl font-semibold">Novo paciente</h1>
      <div className="card-surface p-8">
        <PatientForm />
      </div>
    </div>
  );
}
