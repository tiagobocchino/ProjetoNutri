import { createClient } from "@/lib/supabase/server";
import { HabitosManager } from "@/components/modules/habitos-manager";

export default async function HabitosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("habit")
    .select("id, nome, meta_semanal, ativo")
    .eq("patient_id", id)
    .order("created_at", { ascending: true });

  return <HabitosManager patientId={id} habitos={data ?? []} />;
}
