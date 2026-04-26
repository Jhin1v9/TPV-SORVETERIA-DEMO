# Learning Outcome — Negativo

## Ação
Deixar o dashboard escrever SNAPSHOT.json e appendar histórico a cada refresh.

## Ganho Esperado
Enriquecer score, tendência e observabilidade.

## Regressão Observada
- Histórico inflado (79 pontos com mesmo estado)
- Mistura entre leitura e fonte primária
- Auditoria menos confiável

## Evidência
- history_points havia inflado para 79

## Prevenção
Dashboard deve consumir e sintetizar; fonte primária nasce em snapshot/sync.

## Autor
CODEX
