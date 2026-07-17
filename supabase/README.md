# Supabase — ProjetoNutri

Migrations e seed do banco multi-tenant. Ver o playbook em `.claude/skills/supabase-multitenant/SKILL.md`.

## Fluxo
```bash
npx supabase link --project-ref <ref>   # uma vez
npx supabase db push                      # aplica migrations/
npx supabase gen types typescript > ../src/types/database.ts
```

## Migrations (numeração sequencial)
- `0001_base.sql` — (F1) app_user, tenant, patient, patient_invite + helpers + hook + RLS
- `0002_clinical.sql` — (F3) anamnese, prescription, diet, habit, food_recall, exam, hospital
- `0003_agenda.sql` — (F6) appointment, availability_rule, google_credential

Cada migration que cria tabela de domínio deve trazer, na mesma entrega, `tenant_id`, RLS habilitado e as policies (nutricionista + paciente). Ver `.claude/skills/rls-checklist/SKILL.md`.

## Pós-migration obrigatório
1. Ativar o **Custom Access Token Hook** em Auth → Hooks.
2. Criar bucket privado `exames`.
3. Rodar o checklist de RLS com 2 tenants de seed.
