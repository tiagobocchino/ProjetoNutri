# Ponto de parada após deploy no Render

Data de registro: 2026-07-17

## Status do deploy
- O projeto foi preparado para deploy no Render com configuração em render.yaml.
- O build local foi validado com sucesso com npm run build.
- O próximo passo é criar ou atualizar o serviço no Render apontando para este repositório e as variáveis de ambiente necessárias.

## Itens essenciais para o Render
- Definir as variáveis de ambiente do Supabase:
  - NEXT_PUBLIC_SUPABASE_URL
  - NEXT_PUBLIC_SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
  - NEXT_PUBLIC_APP_URL
- Validar a URL pública do app e a configuração do domínio.
- Confirmar que o banco Supabase e as migrations foram aplicadas no projeto correspondente.

## Próximo passo recomendado
1. Conectar o repositório no Render.
2. Criar/atualizar o Web Service com o arquivo render.yaml.
3. Definir as variáveis de ambiente e iniciar o deploy.
4. Validar a URL pública do app.
