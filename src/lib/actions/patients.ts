"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAppUser } from "@/lib/auth";
import { patientSchema, montarEndereco, type PatientFormValues } from "@/lib/validations/patient";

type ActionResult = { ok: true; id: string } | { ok: false; error: string };

/** Cria um paciente no tenant do nutricionista logado. */
export async function criarPaciente(values: PatientFormValues): Promise<ActionResult> {
  const appUser = await getAppUser();
  if (!appUser || appUser.role !== "nutricionista") {
    return { ok: false, error: "Não autorizado." };
  }
  const parsed = patientSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const v = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("patient")
    .insert({
      tenant_id: appUser.tenant_id,
      nome: v.nome,
      email: v.email || null,
      telefone: v.telefone || null,
      data_nascimento: v.data_nascimento || null,
      sexo: v.sexo || null,
      objetivo: v.objetivo || null,
      esporte: v.esporte || null,
      observacoes: v.observacoes || null,
      endereco: montarEndereco(v),
      status: "ativo",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: "Não foi possível salvar o paciente." };
  revalidatePath("/pacientes");
  return { ok: true, id: data.id };
}

/** Atualiza um paciente do tenant (a RLS garante o escopo). */
export async function atualizarPaciente(id: string, values: PatientFormValues): Promise<ActionResult> {
  const appUser = await getAppUser();
  if (!appUser || appUser.role !== "nutricionista") {
    return { ok: false, error: "Não autorizado." };
  }
  const parsed = patientSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("patient")
    .update({
      nome: v.nome,
      email: v.email || null,
      telefone: v.telefone || null,
      data_nascimento: v.data_nascimento || null,
      sexo: v.sexo || null,
      objetivo: v.objetivo || null,
      esporte: v.esporte || null,
      observacoes: v.observacoes || null,
      endereco: montarEndereco(v),
    })
    .eq("id", id);

  if (error) return { ok: false, error: "Não foi possível atualizar o paciente." };
  revalidatePath("/pacientes");
  revalidatePath(`/pacientes/${id}`);
  return { ok: true, id };
}
