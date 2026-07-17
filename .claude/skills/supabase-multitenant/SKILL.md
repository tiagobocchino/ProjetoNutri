---
name: supabase-multitenant
description: Playbook de multi-tenancy no Supabase para o ProjetoNutri — Custom Access Token Hook (injeta tenant_id + role no JWT), helpers SQL, políticas RLS por papel (nutricionista/paciente), storage policies por pasta de tenant, e setup do projeto. Use ao criar migrations, policies ou configurar Auth/Storage.
---

# Supabase Multi-tenant — ProjetoNutri

Adaptado do `SupabaseSetup.md` (PromoBot) e `rls-checklist.md` (Adele2.0) para o modelo **1 nutricionista = 1 tenant**.

## Modelo de identidade
- `tenant` = um consultório/nutricionista. `app_user` liga `auth.users` a um tenant e a um `role`.
- `role`: `'nutricionista'` (dono do tenant) ou `'paciente'` (vê só o próprio registro).
- `patient.user_id` liga o paciente ao seu `auth.users` (preenchido ao aceitar o convite).

## Custom Access Token Hook (injeta claims no JWT)
```sql
create or replace function public.custom_access_token(event jsonb)
returns jsonb language plpgsql stable as $$
declare
  claims jsonb;
  v_tenant uuid;
  v_role text;
begin
  select tenant_id, role into v_tenant, v_role
  from public.app_user where auth_user_id = (event->>'user_id')::uuid;

  claims := event->'claims';
  if v_tenant is not null then
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(v_tenant::text));
  end if;
  if v_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(v_role));
  end if;
  return jsonb_build_object('claims', claims);
end;
$$;
```
Ativar em **Auth → Hooks → Custom Access Token**. Conceder: `grant execute on function public.custom_access_token to supabase_auth_admin;`

## Helpers SQL (usar em todas as policies)
```sql
create or replace function public.current_tenant_id() returns uuid
  language sql stable as $$ select nullif(auth.jwt()->>'tenant_id','')::uuid $$;

create or replace function public.current_role_claim() returns text
  language sql stable as $$ select auth.jwt()->>'user_role' $$;

create or replace function public.current_patient_id() returns uuid
  language sql stable as $$ select id from public.patient where user_id = auth.uid() $$;
```

## Padrão de policy — tabela de domínio
```sql
alter table public.<tabela> enable row level security;

-- Nutricionista: acesso total dentro do próprio tenant
create policy "<tabela>_nutri_all" on public.<tabela>
  for all using (tenant_id = current_tenant_id() and current_role_claim() = 'nutricionista')
  with check (tenant_id = current_tenant_id() and current_role_claim() = 'nutricionista');

-- Paciente: leitura do próprio registro (tabelas ligadas a patient_id)
create policy "<tabela>_paciente_read" on public.<tabela>
  for select using (patient_id = current_patient_id());
```
Escrita do paciente só em `habit_log`, `food_recall(_entry)`, `appointment` (com `check (patient_id = current_patient_id())` e status inicial controlado).

## Habilitar RLS em massa (garantia)
```sql
do $$ declare t record; begin
  for t in select tablename from pg_tables where schemaname='public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;
```

## Storage (bucket privado `exames`)
```sql
insert into storage.buckets (id, name, public) values ('exames','exames', false)
  on conflict (id) do nothing;

create policy "exames_nutri" on storage.objects for all
  using (bucket_id='exames' and (storage.foldername(name))[1] = current_tenant_id()::text);

create policy "exames_paciente_read" on storage.objects for select
  using (bucket_id='exames'
    and (storage.foldername(name))[1] = current_tenant_id()::text
    and (storage.foldername(name))[2] = current_patient_id()::text);
```
Path: `{tenant_id}/{patient_id}/{arquivo}`.

## Setup do projeto
1. Supabase → New Project, região `sa-east-1`, senha forte salva.
2. `npx supabase link --project-ref <ref>` → `npx supabase db push`.
3. Ativar o Auth Hook. Criar bucket `exames`.
4. `npx supabase gen types typescript > src/types/database.ts`.
5. Free tier pausa após 7 dias sem query → cron mínimo se necessário.

## Regras de ouro
- **Service role key nunca no client.** Só em `src/lib/supabase/admin.ts` (server-only).
- Toda migration nova → policy correspondente na mesma entrega.
- Testar isolamento com 2 tenants antes de aprovar.
