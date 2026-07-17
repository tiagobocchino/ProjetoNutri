-- 0002_clinical.sql — F3: módulos clínicos
-- anamnese, prescription(+item), habit(+log), food_recall(+entry),
-- exam_record, hospital_history + RLS + bucket de exames.

-- Helper que faltava na 0001: id do paciente do usuário logado.
-- SECURITY DEFINER para não recursar na RLS de patient.
create or replace function public.current_patient_id()
returns uuid language sql stable security definer set search_path = public as
$$ select id from public.patient where user_id = auth.uid() $$;

-- ─────────────────────────── Enums ───────────────────────────
do $$ begin
  create type doc_status as enum ('rascunho', 'ativa', 'arquivada');
exception when duplicate_object then null; end $$;

do $$ begin
  create type hospital_tipo as enum ('internacao', 'cirurgia', 'diagnostico', 'alergia', 'medicacao', 'outro');
exception when duplicate_object then null; end $$;

-- ───────────────────────── anamnese ──────────────────────────
create table if not exists public.anamnese (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenant(id) on delete cascade,
  patient_id uuid not null references public.patient(id) on delete cascade,
  dados      jsonb not null default '{}'::jsonb,
  versao     int not null default 1,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_anamnese_patient on public.anamnese(patient_id);

-- ─────────────────── prescription + item ─────────────────────
create table if not exists public.prescription (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenant(id) on delete cascade,
  patient_id uuid not null references public.patient(id) on delete cascade,
  titulo     text not null,
  status     doc_status not null default 'rascunho',
  valido_ate date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_prescription_patient on public.prescription(patient_id);

create table if not exists public.prescription_item (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenant(id) on delete cascade,
  prescription_id uuid not null references public.prescription(id) on delete cascade,
  suplemento      text not null,
  dose            text,
  horario         text,
  duracao         text,
  observacao      text,
  ordem           int not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists idx_presc_item_presc on public.prescription_item(prescription_id);

-- ──────────────────── habit + habit_log ──────────────────────
create table if not exists public.habit (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references public.tenant(id) on delete cascade,
  patient_id   uuid not null references public.patient(id) on delete cascade,
  nome         text not null,
  meta_semanal int,
  ativo        boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_habit_patient on public.habit(patient_id);

create table if not exists public.habit_log (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenant(id) on delete cascade,
  patient_id uuid not null references public.patient(id) on delete cascade,
  habit_id   uuid not null references public.habit(id) on delete cascade,
  data       date not null,
  concluido  boolean not null default false,
  nota       text,
  created_at timestamptz not null default now(),
  unique (habit_id, data)
);
create index if not exists idx_habit_log_patient on public.habit_log(patient_id);

-- ───────────────── food_recall + entry ───────────────────────
create table if not exists public.food_recall (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenant(id) on delete cascade,
  patient_id  uuid not null references public.patient(id) on delete cascade,
  data        date not null,
  observacoes text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists idx_recall_patient on public.food_recall(patient_id);

create table if not exists public.food_recall_entry (
  id             uuid primary key default gen_random_uuid(),
  tenant_id      uuid not null references public.tenant(id) on delete cascade,
  food_recall_id uuid not null references public.food_recall(id) on delete cascade,
  horario        text,
  alimento       text not null,
  quantidade     text,
  local          text,
  ordem          int not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists idx_recall_entry_recall on public.food_recall_entry(food_recall_id);

-- ───────────────────── exam_record ───────────────────────────
create table if not exists public.exam_record (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenant(id) on delete cascade,
  patient_id  uuid not null references public.patient(id) on delete cascade,
  tipo        text not null,
  data_exame  date,
  file_path   text,
  resultados  jsonb,
  observacoes text,
  created_at  timestamptz not null default now()
);
create index if not exists idx_exam_patient on public.exam_record(patient_id);

-- ─────────────────── hospital_history ────────────────────────
create table if not exists public.hospital_history (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenant(id) on delete cascade,
  patient_id  uuid not null references public.patient(id) on delete cascade,
  tipo        hospital_tipo not null default 'outro',
  descricao   text not null,
  data_evento date,
  created_at  timestamptz not null default now()
);
create index if not exists idx_hospital_patient on public.hospital_history(patient_id);

-- ─────────────── triggers updated_at ─────────────────────────
do $$
declare t text;
begin
  foreach t in array array['anamnese','prescription','habit','food_recall'] loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ─────────────────────────── RLS ─────────────────────────────
-- Habilita RLS em todas as tabelas clínicas.
do $$
declare t text;
begin
  foreach t in array array['anamnese','prescription','prescription_item','habit','habit_log',
                           'food_recall','food_recall_entry','exam_record','hospital_history'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Nutricionista: acesso total no tenant (tabelas com patient_id direto)
do $$
declare t text;
begin
  foreach t in array array['anamnese','prescription','habit','habit_log',
                           'food_recall','exam_record','hospital_history'] loop
    execute format('drop policy if exists %1$s_nutri_all on public.%1$s', t);
    execute format($f$create policy %1$s_nutri_all on public.%1$s for all
      using (tenant_id = public.current_tenant_id() and public.current_role_claim() = 'nutricionista')
      with check (tenant_id = public.current_tenant_id() and public.current_role_claim() = 'nutricionista')$f$, t);
  end loop;
end $$;

-- Nutricionista: tabelas-filhas (sem patient_id) — escopo por tenant
do $$
declare t text;
begin
  foreach t in array array['prescription_item','food_recall_entry'] loop
    execute format('drop policy if exists %1$s_nutri_all on public.%1$s', t);
    execute format($f$create policy %1$s_nutri_all on public.%1$s for all
      using (tenant_id = public.current_tenant_id() and public.current_role_claim() = 'nutricionista')
      with check (tenant_id = public.current_tenant_id() and public.current_role_claim() = 'nutricionista')$f$, t);
  end loop;
end $$;

-- Paciente: leitura do próprio registro (tabelas com patient_id)
do $$
declare t text;
begin
  foreach t in array array['anamnese','prescription','habit',
                           'food_recall','exam_record','hospital_history'] loop
    execute format('drop policy if exists %1$s_paciente_read on public.%1$s', t);
    execute format($f$create policy %1$s_paciente_read on public.%1$s for select
      using (patient_id = public.current_patient_id())$f$, t);
  end loop;
end $$;

-- Paciente: escreve/lê seus próprios habit_log (marca hábitos)
drop policy if exists habit_log_paciente_read on public.habit_log;
create policy habit_log_paciente_read on public.habit_log for select
  using (patient_id = public.current_patient_id());
drop policy if exists habit_log_paciente_write on public.habit_log;
create policy habit_log_paciente_write on public.habit_log for insert
  with check (patient_id = public.current_patient_id());
drop policy if exists habit_log_paciente_update on public.habit_log;
create policy habit_log_paciente_update on public.habit_log for update
  using (patient_id = public.current_patient_id())
  with check (patient_id = public.current_patient_id());

-- Paciente: itens de prescrição (leitura via prescrição do próprio)
drop policy if exists presc_item_paciente_read on public.prescription_item;
create policy presc_item_paciente_read on public.prescription_item for select
  using (exists (select 1 from public.prescription p
                 where p.id = prescription_id and p.patient_id = public.current_patient_id()));

-- ─────────────── Storage: bucket exames (privado) ────────────
insert into storage.buckets (id, name, public)
  values ('exames', 'exames', false)
  on conflict (id) do nothing;

-- Nutricionista: acesso total às pastas do seu tenant (path: {tenant_id}/{patient_id}/arquivo)
drop policy if exists exames_nutri_all on storage.objects;
create policy exames_nutri_all on storage.objects for all
  using (bucket_id = 'exames'
    and (storage.foldername(name))[1] = public.current_tenant_id()::text
    and public.current_role_claim() = 'nutricionista')
  with check (bucket_id = 'exames'
    and (storage.foldername(name))[1] = public.current_tenant_id()::text
    and public.current_role_claim() = 'nutricionista');

-- Paciente: leitura só dos próprios exames
drop policy if exists exames_paciente_read on storage.objects;
create policy exames_paciente_read on storage.objects for select
  using (bucket_id = 'exames'
    and (storage.foldername(name))[1] = public.current_tenant_id()::text
    and (storage.foldername(name))[2] = public.current_patient_id()::text);
