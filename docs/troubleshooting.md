# Troubleshooting & Gotchas — ProjetoNutri

Mapa de erros conhecidos e como resolver, para não repetir diagnósticos.

## Auth (Supabase)

### Login retorna 400 (`/auth/v1/token?grant_type=password`)
O 400 é genérico; a causa está na mensagem do erro. O app agora traduz cada uma
(`src/lib/auth-errors.ts`):
| Mensagem Supabase | Causa | Ação |
|---|---|---|
| `Invalid login credentials` | senha errada **ou** conta inexistente | conferir senha; a conta é confirmada mas a senha não bate |
| `Email not confirmed` | "Confirm email" ON e link não clicado | usar "Reenviar confirmação" no login, ou desligar em Auth → Providers → Email |
| `User already registered` | e-mail já tem conta | ir para /login |

**Regra:** conta confirmada + 400 = **senha incorreta** (não é bug de código).

### Cadastro "não faz nada" / não loga
Supabase, por anti-enumeração, retorna `signUp` com sucesso e `data.user.identities = []`
quando o e-mail **já existe**. O app detecta isso e mostra "Este e-mail já possui conta".

### Fluxo de sessão
- Com **"Confirm email" OFF**: `signUp` já cria sessão → vai direto ao `/onboarding`.
- Com **"Confirm email" ON**: `signUp` não cria sessão → mostra "confirme seu e-mail";
  o link vai para `/auth/callback?next=/onboarding` (precisa que `http://localhost:3000/**`
  esteja em Auth → URL Configuration → Redirect URLs).

### Onboarding pela URL redireciona para /login
Esperado: `/onboarding` é rota protegida. Sem sessão, o `proxy.ts` manda para `/login`.
Não é bug.

### Custom Access Token Hook
A RLS funciona **sem** o hook (os helpers `current_tenant_id`/`current_role_claim` são
`SECURITY DEFINER` e leem `app_user`). O hook só injeta `tenant_id`/`role` no JWT.
Habilitar em **Auth → Hooks → Custom Access Token → `public.custom_access_token`**.

## Supabase / Banco

### Região
O projeto está em **us-west-2** (não sa-east-1). Pooler: `aws-1-us-west-2.pooler.supabase.com`.

### Aplicar migrations (sem Docker)
`supabase db push` e `gen types` exigem Docker (indisponível no ambiente atual).
Aplicamos migrations via `pg` diretamente no pooler:
`postgresql://postgres.<ref>:<senha>@aws-1-us-west-2.pooler.supabase.com:5432/postgres`.
Conexão **direta** (`db.<ref>.supabase.co`) é IPv6 — não usar; usar o pooler (IPv4).
`src/types/database.ts` é mantido à mão até termos Docker.

## Next.js 16

### `middleware` deprecado
Virou `proxy`: o arquivo é `src/proxy.ts` exportando `export function proxy(...)`.

### `useSearchParams` quebra o build
Precisa estar dentro de `<Suspense>` (ver `/login`). Erro:
"useSearchParams() should be wrapped in a suspense boundary".

### Aviso de hydration mismatch com `cz-shortcut-listen` / `contentscript.js`
São **extensões do navegador** (MetaMask, ColorZilla) alterando o HTML. Não é bug do app.
