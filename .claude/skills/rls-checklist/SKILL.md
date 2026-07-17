---
name: rls-checklist
description: Checklist de verificação de RLS multi-tenant do ProjetoNutri — matriz papel × tabela × operação para validar isolamento entre tenants e escopo do paciente ao fechar cada fase. Use no nutri-qa e no nutri-test.
---

# RLS Checklist — ProjetoNutri

Adaptado do `rls-checklist.md` (Adele2.0). Rodar com 2 tenants de seed (A, B), cada um com 1 paciente.

## Princípios
- Toda tabela de domínio tem `tenant_id` e RLS habilitado.
- Middleware do Next é **UX**; a segurança real é a **RLS**. Testar sempre no banco, não só na UI.
- Nunca usar service role para queries de leitura de dados de usuário no fluxo normal.

## Matriz esperada (✅ permitido / ❌ bloqueado)
| Ator | Ler dados do próprio tenant | Ler dados de OUTRO tenant | Escrever no próprio tenant |
|---|---|---|---|
| Nutricionista A | ✅ | ❌ | ✅ |
| Paciente de A (próprio registro) | ✅ | ❌ | só habit_log/food_recall/appointment |
| Paciente de A (outro paciente de A) | ❌ | ❌ | ❌ |
| Anônimo (sem sessão) | ❌ | ❌ | ❌ |

## Testes por tabela (paciente)
- `patient, anamnese, prescription(_item), diet_plan/meal/item, exam_record, hospital_history`: paciente lê SÓ onde `patient_id = current_patient_id()`. `diet_plan` só `status='ativa'`.
- `habit_log, food_recall(_entry), appointment`: paciente pode inserir/atualizar apenas os próprios; `appointment` novo entra como `solicitada`.
- `patient_invite, google_credential`: paciente não acessa (só nutricionista do tenant).

## Como testar (SQL)
```sql
-- Simular JWT de um usuário (via set request.jwt.claims em ambiente local/test)
-- Verificar contagem: nutri A não deve ver nenhuma linha do tenant B.
select count(*) from patient;              -- deve refletir só o tenant do JWT
select count(*) from patient where tenant_id = '<tenant_B>'; -- esperado: 0
```

## Bloqueadores (reprovar entrega)
- Qualquer tabela de domínio sem RLS.
- Policy que permite leitura cross-tenant.
- Service role key ou segredo no bundle client.
- Paciente conseguindo ler/escrever registro de outro paciente.
