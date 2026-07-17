import { z } from "zod";

export const patientSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do paciente."),
  email: z.string().trim().email("E-mail inválido.").or(z.literal("")).optional(),
  telefone: z.string().trim().max(30).optional().or(z.literal("")),
  data_nascimento: z.string().optional().or(z.literal("")),
  sexo: z.enum(["feminino", "masculino", "outro", ""]).optional(),
  objetivo: z.string().trim().max(500).optional().or(z.literal("")),
  esporte: z.string().trim().max(120).optional().or(z.literal("")),
  observacoes: z.string().trim().max(2000).optional().or(z.literal("")),
  // endereço (achatado no form, agrupado em jsonb ao salvar)
  cep: z.string().trim().max(15).optional().or(z.literal("")),
  logradouro: z.string().trim().max(200).optional().or(z.literal("")),
  cidade: z.string().trim().max(120).optional().or(z.literal("")),
  uf: z.string().trim().max(2).optional().or(z.literal("")),
});

export type PatientFormValues = z.infer<typeof patientSchema>;

/** Monta o objeto endereco (jsonb) a partir dos campos achatados. */
export function montarEndereco(v: PatientFormValues) {
  const e = {
    cep: v.cep || undefined,
    logradouro: v.logradouro || undefined,
    cidade: v.cidade || undefined,
    uf: v.uf || undefined,
  };
  return Object.values(e).some(Boolean) ? e : null;
}
