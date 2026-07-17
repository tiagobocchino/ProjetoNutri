-- 0001_base.sql — F1: identidade e multi-tenancy
-- Tabelas: tenant, app_user, patient, patient_invite
-- + helpers RLS, Custom Access Token Hook, RPC de provisionamento e policies.

create extension if not exists pgcrypto;

-- ─────────────────────────── Enums ───────────────────────────
do $$ begin
  create type user_role as enum ('nutricionista', 'paciente');
exception when duplicate_object then null; end $$;

do $$ begin
  create type patient_status as enum ('convidado', 'ativo', 'inativo', 'arquivado');
exception when duplicate_object then null; end $$;

-- ─────────────── Função utilitária updated_at ────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ─────────────────────────── tenant ──────────────────────────
create table if not exists public.tenant (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  slug          text not null unique,
  owner_user_id uuid,                       -- auth.users do nutricionista dono
  crn           text,
  telefone      text,
  logo_url      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ────────────────────────── app_user ─────────────────────────
create table if not exists public.app_user (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  tenant_id    uuid not null references public.tenant(id) on delete cascade,
  email        text not null,
  full_name    text,
  role         user_role not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_app_user_tenant on public.app_user(tenant_id);

-- ────────────────────────── patient ──────────────────────────
create table if not exists public.patient (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenant(id) on delete cascade,
  user_id         uuid unique references auth.users(id) on delete set null,  -- preenchido no aceite do convite
  nome            text not null,
  email           text,
  telefone        text,
  data_nascimento date,
  sexo            text,
  endereco        jsonb,
  objetivo        text,
  esporte         text,
  status          patient_status not null default 'convidado',
  observacoes     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_patient_tenant on public.patient(tenant_id);
create index if not exists idx_patient_user   on public.patient(user_id);

-- ─────────────────────── patient_invite ──────────────────────
create table if not exists public.patient_invite (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenant(id) on delete cascade,
  patient_id uuid not null references public.patient(id) on delete cascade,
  email      text not null,
  token      text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_invite_token on public.patient_invite(token);

-- ─────────────────── triggers updated_at ─────────────────────
drop trigger if exists trg_tenant_updated  on public.tenant;
create trigger trg_tenant_updated  before update on public.tenant  for each row execute function public.set_updated_at();
drop trigger if exists trg_app_user_updated on public.app_user;
create trigger trg_app_user_updated before update on public.app_user for each row execute function public.set_updated_at();
drop trigger if exists trg_patient_updated on public.patient;
create trigger trg_patient_updated before update on public.patient for each row execute function public.set_updated_at();

-- ─────────────── Helpers de contexto (SECURITY DEFINER) ──────
-- Lêem o app_user do usuário logado, contornando RLS (sem recursão).
-- Funcionam MESMO sem o Auth Hook habilitado.
create or replace function public.current_tenant_id()
returns uuid language sql stable security definer set search_path = public as
$$ select tenant_id from public.app_user where auth_user_id = auth.uid() $$;

create or replace function public.current_role_claim()
returns text language sql stable security definer set search_path = public as
$$ select role::text from public.app_user where auth_user_id = auth.uid() $$;

-- ─────────────── Custom Access Token Hook ────────────────────
-- Injeta tenant_id + user_role no JWT (usado pelo middleware/client p/ evitar
-- roundtrip). Habilitar em Auth → Hooks → Custom Access Token.
create or replace function public.custom_access_token(event jsonb)
returns jsonb language plpgsql stable as $$
declare
  claims   jsonb;
  v_tenant uuid;
  v_role   text;
begin
  select tenant_id, role::text into v_tenant, v_role
  from public.app_user where auth_user_id = (event->>'user_id')::uuid;

  claims := event->'claims';
  if v_tenant is not null then
    claims := jsonb_set(claims, '{tenant_id}', to_jsonb(v_tenant::text));
  end if;
  if v_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(v_role));
  end if;
  return jsonb_build_object('claims', claims);
end; $$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token to supabase_auth_admin;
revoke execute on function public.custom_access_token from authenticated, anon, public;
grant select on public.app_user to supabase_auth_admin;

-- ──────── RPC: provisiona tenant do nutricionista (onboarding) ─
create or replace function public.create_nutricionista_tenant(
  p_nome text, p_slug text, p_full_name text
) returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_uid    uuid := auth.uid();
  v_tenant uuid;
begin
  if v_uid is null then raise exception 'nao autenticado'; end if;
  if exists (select 1 from app_user where auth_user_id = v_uid) then
    raise exception 'usuario ja possui tenant';
  end if;

  insert into tenant (nome, slug, owner_user_id)
    values (p_nome, p_slug, v_uid)
    returning id into v_tenant;

  insert into app_user (auth_user_id, tenant_id, email, full_name, role)
    values (v_uid, v_tenant,
            (select email from auth.users where id = v_uid),
            p_full_name, 'nutricionista');

  return v_tenant;
end; $$;

grant execute on function public.create_nutricionista_tenant(text, text, text) to authenticated;

-- ─────────────────────────── RLS ─────────────────────────────
alter table public.tenant          enable row level security;
alter table public.app_user        enable row level security;
alter table public.patient         enable row level security;
alter table public.patient_invite  enable row level security;

-- app_user: cada um lê o próprio registro; auth admin lê tudo (para o hook)
drop policy if exists app_user_self_read on public.app_user;
create policy app_user_self_read on public.app_user
  for select using (auth_user_id = auth.uid());

drop policy if exists app_user_auth_admin_read on public.app_user;
create policy app_user_auth_admin_read on public.app_user
  for select to supabase_auth_admin using (true);

-- tenant: membro lê o próprio; nutricionista dono atualiza
drop policy if exists tenant_member_read on public.tenant;
create policy tenant_member_read on public.tenant
  for select using (id = public.current_tenant_id());

drop policy if exists tenant_owner_update on public.tenant;
create policy tenant_owner_update on public.tenant
  for update using (id = public.current_tenant_id() and public.current_role_claim() = 'nutricionista')
  with check   (id = public.current_tenant_id() and public.current_role_claim() = 'nutricionista');

-- patient: nutricionista acesso total no tenant; paciente lê só o próprio
drop policy if exists patient_nutri_all on public.patient;
create policy patient_nutri_all on public.patient
  for all using (tenant_id = public.current_tenant_id() and public.current_role_claim() = 'nutricionista')
  with check   (tenant_id = public.current_tenant_id() and public.current_role_claim() = 'nutricionista');

drop policy if exists patient_self_read on public.patient;
create policy patient_self_read on public.patient
  for select using (user_id = auth.uid());

-- patient_invite: só nutricionista do tenant
drop policy if exists invite_nutri_all on public.patient_invite;
create policy invite_nutri_all on public.patient_invite
  for all using (tenant_id = public.current_tenant_id() and public.current_role_claim() = 'nutricionista')
  with check   (tenant_id = public.current_tenant_id() and public.current_role_claim() = 'nutricionista');
