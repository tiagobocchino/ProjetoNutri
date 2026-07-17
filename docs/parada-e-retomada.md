# Ponto de parada — ProjetoNutri

Data de registro: 2026-07-17

## Contexto
Este checkpoint registra o estado em que o projeto foi deixado para retomar depois, com foco em continuar o desenvolvimento e preparar a validação em ambiente de teste/Render.

## O que já estava implementado
- Estrutura base do projeto Next.js 16 com App Router, TypeScript e Tailwind.
- Design system inicial com tokens de marca e estrutura visual do projeto.
- Estrutura de páginas para marketing, autenticação, nutricionista e paciente.
- Páginas iniciais de pacientes e módulos clínicos (anamnese, prescrição, hábitos, exames, histórico e recordatório).
- Arquivos de suporte para Supabase e migrations iniciais.
- Documentação de agentes e skills em .claude/agents e .claude/skills.

## Ponto exato em que paramos
O trabalho estava avançado na fase de base do produto, com foco em consolidar a estrutura funcional para o fluxo nutricionista/paciente e preparar a aplicação para validação externa.

### Próximo passo recomendado
Retomar a partir da integração de autenticação/tenant no Supabase, finalizar os fluxos de paciente e clínicas, e validar o build para teste em Render.

## Itens para retomar na próxima sessão
1. Revisar e concluir a integração com Supabase Auth + RLS.
2. Finalizar os fluxos de convite/aceite de pacientes.
3. Validar as páginas e módulos clínicos com os dados reais.
4. Rodar o build local e ajustar pontos que impeçam a publicação.
5. Preparar variáveis de ambiente para Render.

## Comandos úteis para retomar
```bash
npm run dev
npm run build
npx supabase db push
```

## Observações para Render
- Usar as variáveis de ambiente definidas em .env.example.
- Garantir que os valores de Supabase e app URL estejam configurados corretamente.
- Manter segredos do lado do servidor; nunca expor chaves sensíveis no cliente.

## Status do repositório
Este checkpoint foi registrado para permitir continuidade segura do desenvolvimento, com a base já preservada em commit separado.
