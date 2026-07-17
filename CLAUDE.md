@AGENTS.md

# ProjetoNutri

Plataforma **multi-tenant** para nutricionistas: cada nutricionista contrata a plataforma e gerencia **seus próprios** pacientes; cada paciente acessa **apenas** os próprios dados e a agenda do seu nutricionista. Público-alvo com viés jovem/esportivo. Produto 100% em **pt-BR**.

## Stack
- **Next.js 16.2** (App Router, RSC) + React 19 + TypeScript strict
- **Tailwind v4** (`@theme` em `src/app/globals.css`) + shadcn/ui
- **Supabase**: Auth + Postgres (RLS) + Storage
- Deploy: **Vercel** (app único, frontend + API routes) + Supabase `sa-east-1`
- Forms: react-hook-form + zod · Animações: Framer Motion

## Comandos
- `npm run dev` — desenvolvimento
- `npm run build` — build de produção (deve passar antes de subir)
- `npm run lint` — ESLint
- `npx supabase db push` — aplica migrations
- `npx supabase gen types typescript > src/types/database.ts` — regenera tipos

## Estrutura
```
src/app/
  (marketing)/  landing pública        (auth)/       login, cadastro, convite/[token], callback
  (nutri)/      dashboard nutricionista (paciente)/   portal do paciente
  api/          route handlers (convites, google/*)
src/lib/supabase/  client.ts (browser) · server.ts (SSR) · admin.ts (service role, server-only)
src/lib/validations/  schemas zod        src/types/database.ts  tipos gerados do Supabase
supabase/migrations/  0001_*.sql ...      supabase/seed.sql
```

## Modelo de dados (multi-tenant)
Toda tabela de domínio tem `tenant_id uuid not null` (FK `tenant` on delete cascade) + `created_at/updated_at`.

- **Identidade**: `app_user` (auth_user_id, email, full_name, role `nutricionista|paciente`, tenant_id) · `tenant` (nome, slug, owner_user_id, crn) · `patient` (tenant_id, user_id nullable, dados pessoais, status) · `patient_invite` (token, expires_at, accepted_at)
- **Clínico**: `anamnese` (jsonb versionado) · `prescription`+`prescription_item` (suplementação) · `diet_plan`+`diet_meal`+`diet_meal_item` (dieta) · `habit`+`habit_log` · `food_recall`+`food_recall_entry` · `exam_record` (Storage) · `hospital_history`
- **Agenda**: `appointment` (google_event_id) · `availability_rule` · `google_credential` (refresh_token cifrado, por tenant)

## Segurança (regra nº 1)
- **RLS é a segurança real; o middleware é só UX.** Nunca confiar apenas no middleware.
- JWT carrega `tenant_id` e `user_role` via **Custom Access Token Hook** → policies leem `current_tenant_id()` / `current_role_claim()` / `current_patient_id()`.
- **Nutricionista**: acesso total ao próprio tenant. **Paciente**: lê só o próprio registro; escreve só em `habit_log`, `food_recall(_entry)`, `appointment`.
- **`SUPABASE_SERVICE_ROLE_KEY` e demais segredos nunca no client** — só em `src/lib/supabase/admin.ts` e route handlers server-only. Segredos jamais em `NEXT_PUBLIC_`.
- Detalhes em `.claude/skills/supabase-multitenant/SKILL.md` e `.claude/skills/rls-checklist/SKILL.md`.

## Roadmap (fases)
- **F0 Fundação** ✅ scaffold, design system, agentes/skills, CLAUDE.md
- **F1 Auth+Tenant** — migration 0001, hook JWT, cadastro/login nutri, middleware
- **F2 Pacientes+Convite** — CRUD pacientes, convite por email, aceite/1º login do paciente
- **F3 Módulos clínicos** — anamnese, prescrição, recordatório, histórico, exames, hábitos
- **F4 Dietas** — editor plano→refeições→itens, publicar/arquivar, versão print
- **F5 Portal paciente** — home, dieta ativa, hábitos, recordatório, documentos
- **F6 Agenda Google** — OAuth, availability_rule, solicitação/confirmação de consulta
- **F7 LP + polimento** — landing com efeitos, SEO pt-BR, onboarding, mobile

## Design system
Verde floresta `#2A6350` + creme `#FAF8F1` + dourado `#D5972F`. Playfair (títulos) / Inter (corpo) / IBM Plex Mono (dados). Tokens e utilitários em `globals.css`; kit de efeitos (Silk, SpotlightCard, Magnet, DecryptedText) portado do BocchinoTecConsult. Ver `.claude/skills/design-system/SKILL.md`. **Nunca cor crua — sempre `var(--color-*)`.**

## Agentes (.claude/agents/)
`nutri-orchestrator` (regente, delega) · `nutri-backend` (migrations/RLS) · `nutri-frontend` (UI/design system) · `nutri-integrations` (Google Calendar, convites) · `nutri-qa` (porteiro, revisa) · `nutri-test` (Vitest/Playwright/RLS) · `nutri-copywriter` (textos pt-BR). Fluxo: pedido → orchestrator → executor → **qa** → aprovação → test.

## Convenções
- TypeScript strict, **zero `any`**. RSC por padrão; `"use client"` só quando necessário.
- **Copy antes de código**. Mobile-first (375px). Acessibilidade AA.
- Referências (SOMENTE LEITURA, nunca alterar): Adele2.0 (multi-tenant/Calendar), PromoBot (skills), NutrimaxLP (design), BocchinoTecConsult (efeitos), Lixium (agentes).
