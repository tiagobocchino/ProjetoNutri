---
name: nextjs-conventions
description: Convenções de Next.js 16 (App Router) para o ProjetoNutri — route groups (marketing/auth/nutri/paciente), RSC vs client, middleware de auth por papel, clients Supabase (browser/server/admin), SEO. Use ao criar páginas, rotas ou o middleware.
---

# Next.js 16 — Convenções ProjetoNutri

Next.js **16.2** + React 19 + App Router + Tailwind v4. Atenção: esta versão tem mudanças; conferir `node_modules/next/dist/docs/` em caso de dúvida (ver `AGENTS.md`).

## Route groups
```
src/app/
  (marketing)/      # landing, /precos, /sobre — público
  (auth)/           # /login, /cadastro, /convite/[token], /auth/callback
  (nutri)/          # dashboard do nutricionista — guard role=nutricionista
  (paciente)/       # portal do paciente — guard role=paciente
  api/              # route handlers (convites, google/*)
```
Cada grupo `(nutri)` e `(paciente)` tem seu `layout.tsx` (sidebar/nav própria). Grupos não afetam a URL.

## RSC vs Client
- **Server Component por padrão.** Buscar dados no server com o client Supabase server-side (respeita RLS via cookies de sessão).
- `"use client"` só para interação/estado/efeitos. Nunca passar segredos a componentes client.
- Mutations: **Server Actions** ou route handlers.

## Clients Supabase
- `src/lib/supabase/client.ts` — browser (`createBrowserClient` de `@supabase/ssr`), usa anon key.
- `src/lib/supabase/server.ts` — server (`createServerClient` com cookies), usa anon key + sessão.
- `src/lib/supabase/admin.ts` — **service role, server-only**; só para convites/operações administrativas. Nunca importar em client.

## Middleware (`src/middleware.ts`)
- Usa `@supabase/ssr` para refresh de sessão.
- Sem sessão em `(nutri)`/`(paciente)` → redirect `/login`.
- Role incorreta (paciente tentando `(nutri)` ou vice-versa) → redirect ao ambiente correto.
- Middleware é UX; **os dados continuam protegidos pela RLS** independentemente dele.

## SEO (fase F7)
- `metadata` no layout root (título template pt-BR já configurado).
- `app/sitemap.ts` e `app/robots.ts` para as rotas de marketing.
- OG tags nas páginas públicas.

## Regras
- TypeScript strict, zero `any`; tipos do banco em `src/types/database.ts`.
- Formulários: react-hook-form + zod (`src/lib/validations/`).
- Mobile-first; design system via tokens do `globals.css`.
