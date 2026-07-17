import { createClient } from "@/lib/supabase/server";
import { AnamneseForm } from "@/components/modules/anamnese-form";

export default async function AnamnesePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("anamnese")
    .select("dados")
    .eq("patient_id", id)
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle();

  const dados = (data?.dados ?? {}) as Record<string, string>;

  return (
    <div className="card-surface p-8">
      <h2 className="mb-1 text-xl font-semibold">Ficha de anamnese</h2>
      <p className="mb-6 text-sm text-[color:var(--color-muted-foreground)]">
        Registro clínico inicial do paciente.
      </p>
      <AnamneseForm patientId={id} dados={dados} />
    </div>
  );
}
