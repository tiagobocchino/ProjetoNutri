import { createClient } from "@/lib/supabase/server";
import { RecordatorioManager } from "@/components/modules/recordatorio-manager";

type Entrada = {
  id: string;
  food_recall_id: string;
  horario: string | null;
  alimento: string;
  quantidade: string | null;
  local: string | null;
};

type Recall = {
  id: string;
  data: string;
  observacoes: string | null;
  food_recall_entry: Entrada[];
};

export default async function RecordatorioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recallsData } = await supabase
    .from("food_recall")
    .select("id, data, observacoes")
    .eq("patient_id", id)
    .order("data", { ascending: false });

  const recallIds = (recallsData ?? []).map((recall) => recall.id);

  let entries: Entrada[] = [];
  if (recallIds.length > 0) {
    const { data: entriesData } = await supabase
      .from("food_recall_entry")
      .select("id, food_recall_id, horario, alimento, quantidade, local")
      .in("food_recall_id", recallIds);

    entries = (entriesData ?? []) as Entrada[];
  }

  const recalls: Recall[] = (recallsData ?? []).map((recall) => ({
    ...recall,
    food_recall_entry: entries.filter((entry) => entry.food_recall_id === recall.id),
  }));

  return <RecordatorioManager patientId={id} recalls={recalls} />;
}
