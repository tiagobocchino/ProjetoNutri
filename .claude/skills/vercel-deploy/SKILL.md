---
name: vercel-deploy
description: Guia de deploy do ProjetoNutri na Vercel — variáveis de ambiente, região, integração com GitHub (auto-deploy + preview por PR) e conexão com o Supabase. Use ao configurar deploy, envs ou domínio.
---

# Vercel Deploy — ProjetoNutri

Adaptado do `VercelDeploy.md` (PromoBot). App Next.js único (frontend + API routes) na Vercel + Supabase.

## Deploy
- Conectar o repo `tiagobocchino/ProjetoNutri` na Vercel → framework detectado (Next.js).
- Auto-deploy no push da branch principal; **preview por PR** = ambiente de verificação de cada fase.
- Região recomendada: `gru1` (São Paulo) para proximidade do Supabase `sa-east-1`.

## Variáveis de ambiente
| Var | Escopo | Uso |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | público | client browser/server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | público | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **server-only** | convites/admin — nunca `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_APP_URL` | público | base para redirects/convites |
| `GOOGLE_CLIENT_ID` | server | OAuth Calendar |
| `GOOGLE_CLIENT_SECRET` | **server-only** | OAuth Calendar |
| `GOOGLE_REDIRECT_URI` | server | callback OAuth |
| `CALENDAR_ENCRYPTION_KEY` | **server-only** | cifra do refresh token |

- Definir para os 3 ambientes (Production/Preview/Development).
- Qualquer var sem `NEXT_PUBLIC_` fica só no server — usar isso para todos os segredos.

## Supabase Auth — URLs de redirect
- Adicionar em Auth → URL Configuration: `https://<dominio>/auth/callback` e o preview `https://*.vercel.app/auth/callback`.

## Checklist antes do deploy
- [ ] `npm run build` local passa.
- [ ] Envs configuradas na Vercel (sem segredo em `NEXT_PUBLIC_`).
- [ ] Redirect URLs no Supabase batem com o domínio.
- [ ] Migrations aplicadas (`supabase db push`) e Auth Hook ativo.
