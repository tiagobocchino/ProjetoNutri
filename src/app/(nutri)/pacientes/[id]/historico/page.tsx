import { createClient } from "@/lib/supabase/server";
import { HistoricoManager } from "@/components/modules/historico-manager";

export default async function HistoricoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("hospital_history")
    .select("id, tipo, descricao, data_evento")
    .eq("patient_id", id)
    .order("data_evento", { ascending: false, nullsFirst: false });

  return <HistoricoManager patientId={id} registros={data ?? []} />;
}
