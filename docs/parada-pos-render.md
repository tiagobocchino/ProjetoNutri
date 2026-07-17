# Ponto de parada após deploy no Render

Data de registro: 2026-07-17

## Status do deploy
- O projeto foi preparado para deploy no Render com configuração em render.yaml.
- O build local foi validado com sucesso com npm run build.
- O push para o GitHub remoto foi bloqueado pelo GitHub Push Protection por causa de um segredo antigo presente no histórico do repositório.

## Bloqueio encontrado
O comando de push para o remoto retornou:
- GH013: Repository rule violations found for refs/heads/main
- Push cannot contain secrets

Esse bloqueio está associado a um segredo antigo no histórico do repositório e precisa ser resolvido na conta/remoção do histórico antes de prosseguir com o deploy no Render.

## Itens essenciais para o Render
- Definir as variáveis de ambiente do Supabase:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - NEXT_PUBLIC_APP_URL
- Validar a URL pública do app e a configuração do domínio.
- Confirmar que o banco Supabase e as migrations foram aplicadas no projeto correspondente.

## Próximo passo recomendado
1. Liberar o push no GitHub removendo o segredo do histórico ou aprovando o bloqueio na interface do repositório.
2. Repetir o push para o remoto.
3. Conectar o repositório no Render.
4. Criar/atualizar o Web Service com o arquivo render.yaml.
5. Definir as variáveis de ambiente e iniciar o deploy.
