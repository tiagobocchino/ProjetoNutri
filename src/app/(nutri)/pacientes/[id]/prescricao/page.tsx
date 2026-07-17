import { createClient } from "@/lib/supabase/server";
import { PrescricaoManager } from "@/components/modules/prescricao-manager";

type Item = {
  id: string;
  prescription_id: string;
  suplemento: string;
  dose: string | null;
  horario: string | null;
  duracao: string | null;
  observacao: string | null;
};

type Prescricao = {
  id: string;
  titulo: string;
  created_at: string;
  prescription_item: Item[];
};

export default async function PrescricaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: prescricoesData } = await supabase
    .from("prescription")
    .select("id, titulo, created_at")
    .eq("patient_id", id)
    .order("created_at", { ascending: false });

  const prescriptionIds = (prescricoesData ?? []).map((prescricao) => prescricao.id);

  let items: Item[] = [];
  if (prescriptionIds.length > 0) {
    const { data: itemsData } = await supabase
      .from("prescription_item")
      .select("id, prescription_id, suplemento, dose, horario, duracao, observacao")
      .in("prescription_id", prescriptionIds);

    items = (itemsData ?? []) as Item[];
  }

  const prescricoes: Prescricao[] = (prescricoesData ?? []).map((prescricao) => ({
    ...prescricao,
    prescription_item: items.filter((item) => item.prescription_id === prescricao.id),
  }));

  return <PrescricaoManager patientId={id} prescricoes={prescricoes} />;
}
