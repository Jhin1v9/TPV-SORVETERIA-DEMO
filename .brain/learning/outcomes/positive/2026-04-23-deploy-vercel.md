# Learning Outcome — Positivo

## Ação
Descobrir e documentar o fluxo correto de deploy Vercel para monorepo.

## Ganho Observado
- Deploy via GitHub Actions CI quebra por workspace:* resolution
- Build local + script funciona 100%
- URLs de produção estabilizadas

## Evidência
- `scripts/deploy-app.mjs` copia `.vercel/project.json` para dist/
- `npm run deploy:all` builda local e deploya todos os apps

## Regra para Repetir
Sempre buildar localmente primeiro. Nunca usar `npx vercel` direto em dist/. Sempre usar o script oficial.

## Autor
CODEX
