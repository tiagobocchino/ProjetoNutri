"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAppUser } from "@/lib/auth";
import type { HospitalTipo } from "@/types/database";

type Result = { ok: true } | { ok: false; error: string };

async function requireNutri() {
  const appUser = await getAppUser();
  if (!appUser || appUser.role !== "nutricionista") return null;
  return appUser;
}

function rev(patientId: string, aba: string) {
  revalidatePath(`/pacientes/${patientId}/${aba}`);
}

// ───────────────────────── Anamnese ─────────────────────────
export async function salvarAnamnese(
  patientId: string,
  dados: Record<string, string>,
): Promise<Result> {
  const nutri = await requireNutri();
  if (!nutri) return { ok: false, error: "Não autorizado." };
  const supabase = await createClient();

  const { data: existente } = await supabase
    .from("anamnese")
    .select("id, versao")
    .eq("patient_id", patientId)
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = existente
    ? await supabase.from("anamnese").update({ dados }).eq("id", existente.id)
    : await supabase.from("anamnese").insert({
        tenant_id: nutri.tenant_id,
        patient_id: patientId,
        dados,
        created_by: nutri.id,
      });

  if (error) return { ok: false, error: "Não foi possível salvar a anamnese." };
  rev(patientId, "anamnese");
  return { ok: true };
}

// ──────────────────────── Prescrição ────────────────────────
type ItemPresc = { suplemento: string; dose?: string; horario?: string; duracao?: string; observacao?: string };

export async function criarPrescricao(
  patientId: string,
  titulo: string,
  itens: ItemPresc[],
): Promise<Result> {
  const nutri = await requireNutri();
  if (!nutri) return { ok: false, error: "Não autorizado." };
  if (!titulo.trim()) return { ok: false, error: "Informe um título." };
  const supabase = await createClient();

  const { data: presc, error } = await supabase
    .from("prescription")
    .insert({ tenant_id: nutri.tenant_id, patient_id: patientId, titulo, status: "ativa" })
    .select("id")
    .single();
  if (error || !presc) return { ok: false, error: "Não foi possível criar a prescrição." };

  const linhas = itens
    .filter((i) => i.suplemento.trim())
    .map((i, idx) => ({
      tenant_id: nutri.tenant_id,
      prescription_id: presc.id,
      suplemento: i.suplemento,
      dose: i.dose || null,
      horario: i.horario || null,
      duracao: i.duracao || null,
      observacao: i.observacao || null,
      ordem: idx,
    }));
  if (linhas.length) await supabase.from("prescription_item").insert(linhas);

  rev(patientId, "prescricao");
  return { ok: true };
}

export async function excluirPrescricao(patientId: string, id: string): Promise<Result> {
  const nutri = await requireNutri();
  if (!nutri) return { ok: false, error: "Não autorizado." };
  const supabase = await createClient();
  const { error } = await supabase.from("prescription").delete().eq("id", id);
  if (error) return { ok: false, error: "Não foi possível excluir." };
  rev(patientId, "prescricao");
  return { ok: true };
}

// ─────────────────────── Recordatório ───────────────────────
type EntradaRecall = { horario?: string; alimento: string; quantidade?: string; local?: string };

export async function criarRecordatorio(
  patientId: string,
  data: string,
  observacoes: string,
  entradas: EntradaRecall[],
): Promise<Result> {
  const nutri = await requireNutri();
  if (!nutri) return { ok: false, error: "Não autorizado." };
  if (!data) return { ok: false, error: "Informe a data." };
  const supabase = await createClient();

  const { data: recall, error } = await supabase
    .from("food_recall")
    .insert({ tenant_id: nutri.tenant_id, patient_id: patientId, data, observacoes: observacoes || null })
    .select("id")
    .single();
  if (error || !recall) return { ok: false, error: "Não foi possível criar o recordatório." };

  const linhas = entradas
    .filter((e) => e.alimento.trim())
    .map((e, idx) => ({
      tenant_id: nutri.tenant_id,
      food_recall_id: recall.id,
      horario: e.horario || null,
      alimento: e.alimento,
      quantidade: e.quantidade || null,
      local: e.local || null,
      ordem: idx,
    }));
  if (linhas.length) await supabase.from("food_recall_entry").insert(linhas);

  rev(patientId, "recordatorio");
  return { ok: true };
}

export async function excluirRecordatorio(patientId: string, id: string): Promise<Result> {
  const nutri = await requireNutri();
  if (!nutri) return { ok: false, error: "Não autorizado." };
  const supabase = await createClient();
  const { error } = await supabase.from("food_recall").delete().eq("id", id);
  if (error) return { ok: false, error: "Não foi possível excluir." };
  rev(patientId, "recordatorio");
  return { ok: true };
}

// ───────────────────────── Hábitos ──────────────────────────
export async function criarHabito(
  patientId: string,
  nome: string,
  metaSemanal: number | null,
): Promise<Result> {
  const nutri = await requireNutri();
  if (!nutri) return { ok: false, error: "Não autorizado." };
  if (!nome.trim()) return { ok: false, error: "Informe o hábito." };
  const supabase = await createClient();
  const { error } = await supabase.from("habit").insert({
    tenant_id: nutri.tenant_id,
    patient_id: patientId,
    nome,
    meta_semanal: metaSemanal,
  });
  if (error) return { ok: false, error: "Não foi possível criar o hábito." };
  rev(patientId, "habitos");
  return { ok: true };
}

export async function alternarHabito(patientId: string, id: string, ativo: boolean): Promise<Result> {
  const nutri = await requireNutri();
  if (!nutri) return { ok: false, error: "Não autorizado." };
  const supabase = await createClient();
  const { error } = await supabase.from("habit").update({ ativo }).eq("id", id);
  if (error) return { ok: false, error: "Não foi possível atualizar." };
  rev(patientId, "habitos");
  return { ok: true };
}

export async function excluirHabito(patientId: string, id: string): Promise<Result> {
  const nutri = await requireNutri();
  if (!nutri) return { ok: false, error: "Não autorizado." };
  const supabase = await createClient();
  const { error } = await supabase.from("habit").delete().eq("id", id);
  if (error) return { ok: false, error: "Não foi possível excluir." };
  rev(patientId, "habitos");
  return { ok: true };
}

// ─────────────────── Histórico hospitalar ───────────────────
export async function criarHistorico(
  patientId: string,
  tipo: HospitalTipo,
  descricao: string,
  dataEvento: string,
): Promise<Result> {
  const nutri = await requireNutri();
  if (!nutri) return { ok: false, error: "Não autorizado." };
  if (!descricao.trim()) return { ok: false, error: "Descreva o evento." };
  const supabase = await createClient();
  const { error } = await supabase.from("hospital_history").insert({
    tenant_id: nutri.tenant_id,
    patient_id: patientId,
    tipo,
    descricao,
    data_evento: dataEvento || null,
  });
  if (error) return { ok: false, error: "Não foi possível salvar." };
  rev(patientId, "historico");
  return { ok: true };
}

export async function excluirHistorico(patientId: string, id: string): Promise<Result> {
  const nutri = await requireNutri();
  if (!nutri) return { ok: false, error: "Não autorizado." };
  const supabase = await createClient();
  const { error } = await supabase.from("hospital_history").delete().eq("id", id);
  if (error) return { ok: false, error: "Não foi possível excluir." };
  rev(patientId, "historico");
  return { ok: true };
}

// ────────────────────────── Exames ──────────────────────────
export async function registrarExame(
  patientId: string,
  tipo: string,
  dataExame: string,
  filePath: string | null,
  observacoes: string,
): Promise<Result> {
  const nutri = await requireNutri();
  if (!nutri) return { ok: false, error: "Não autorizado." };
  if (!tipo.trim()) return { ok: false, error: "Informe o tipo de exame." };
  const supabase = await createClient();
  const { error } = await supabase.from("exam_record").insert({
    tenant_id: nutri.tenant_id,
    patient_id: patientId,
    tipo,
    data_exame: dataExame || null,
    file_path: filePath,
    observacoes: observacoes || null,
  });
  if (error) return { ok: false, error: "Não foi possível registrar o exame." };
  rev(patientId, "exames");
  return { ok: true };
}

export async function excluirExame(patientId: string, id: string, filePath: string | null): Promise<Result> {
  const nutri = await requireNutri();
  if (!nutri) return { ok: false, error: "Não autorizado." };
  const supabase = await createClient();
  if (filePath) await supabase.storage.from("exames").remove([filePath]);
  const { error } = await supabase.from("exam_record").delete().eq("id", id);
  if (error) return { ok: false, error: "Não foi possível excluir." };
  rev(patientId, "exames");
  return { ok: true };
}
