# Learning Outcome — Negativo

## Ação
Reintroduzir .principal-brain-sync.lock dentro do repo principal.

## Ganho Esperado
Simplificar coordenação do watcher e sync manual.

## Regressão Observada
- Poluição do repo canônico
- Drift operacional

## Evidência
- Regressão detectada na auditoria do runtime antes do hardening

## Prevenção
Lock operacional do brain principal permanece FORA do repo canônico.

## Autor
CODEX
