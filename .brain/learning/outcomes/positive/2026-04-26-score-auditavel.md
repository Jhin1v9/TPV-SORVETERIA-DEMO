# Learning Outcome — Positivo

## Ação
Mover scoreAudit para principal-brain-snapshot.mjs e deduplicar histórico por assinatura de estado.

## Ganho Observado
- Histórico deixou de inflar
- Dashboard voltou a ser consumidor de verdade operacional
- Trend ficou mais auditável

## Evidência
- Duas execuções seguidas mantiveram dashboardHistory=8 e scoreHistory=3
- Usuário aprovou direção

## Regra para Repetir
Quando houver painel derivado, calcular verdade na origem e deduplicar eventos por estado real.

## Autor
CODEX
