"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { patientSchema, type PatientFormValues } from "@/lib/validations/patient";
import { criarPaciente, atualizarPaciente } from "@/lib/actions/patients";
import { Field, Textarea, Select } from "@/components/ui/field";

type Props = {
  patientId?: string;
  defaultValues?: Partial<PatientFormValues>;
};

export function PatientForm({ patientId, defaultValues }: Props) {
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues,
  });

  function onSubmit(values: PatientFormValues) {
    setErro(null);
    startTransition(async () => {
      const res = patientId
        ? await atualizarPaciente(patientId, values)
        : await criarPaciente(values);
      if (!res.ok) {
        setErro(res.error);
        return;
      }
      router.push(`/pacientes/${res.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome *" {...register("nome")} error={errors.nome?.message} />
        <Field label="E-mail" type="email" {...register("email")} error={errors.email?.message} />
        <Field label="Telefone" {...register("telefone")} error={errors.telefone?.message} />
        <Field label="Data de nascimento" type="date" {...register("data_nascimento")} />
        <Select label="Sexo" {...register("sexo")}>
          <option value="">—</option>
          <option value="feminino">Feminino</option>
          <option value="masculino">Masculino</option>
          <option value="outro">Outro</option>
        </Select>
        <Field label="Esporte / atividade" {...register("esporte")} placeholder="Ex.: corrida, musculação" />
      </div>

      <Textarea label="Objetivo" {...register("objetivo")} placeholder="Ex.: emagrecimento, ganho de massa" />

      <fieldset className="grid gap-4 sm:grid-cols-4">
        <legend className="mb-1 text-sm font-medium">Endereço</legend>
        <Field label="CEP" {...register("cep")} />
        <div className="sm:col-span-2">
          <Field label="Logradouro" {...register("logradouro")} />
        </div>
        <Field label="Cidade" {...register("cidade")} />
        <Field label="UF" maxLength={2} {...register("uf")} />
      </fieldset>

      <Textarea label="Observações" {...register("observacoes")} />

      {erro && <p className="text-sm text-[color:var(--color-destructive)]">{erro}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-relay rounded-xl bg-[color:var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--color-primary-dark)] disabled:opacity-60"
        >
          {pending ? "Salvando…" : patientId ? "Salvar alterações" : "Cadastrar paciente"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-[color:var(--color-border)] px-5 py-2.5 text-sm font-medium transition hover:bg-[color:var(--color-secondary)]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
