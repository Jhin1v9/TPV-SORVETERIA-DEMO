# PRINCIPAL_AGENT_RUNTIME

> Runtime unico para o agente principal operar subagentes com consistencia.

## Quem usa

- CODEX
- KIMI
- qualquer agente principal que precise delegar trabalho mantendo uma verdade central

## Ciclo operacional

### Fase 1 - Intake

1. ler objetivo do usuario
2. classificar tipo de tarefa
3. decidir se continua single-agent ou se pede delegacao

### Fase 2 - Orquestracao

1. consultar `ORQUESTRADOR.md` para descobrir especialidades
2. consultar `OPERACAO_AGENTES.md` para decidir formato de delegacao
3. se houver ganho real, gerar equipe com:

```bash
npm run agent:fabric -- --goal "<objetivo>"
```

### Fase 3 - Contratacao

1. cada subagente recebe contrato `MAMIS/1`
2. ownership e write-scope devem estar claros
3. subagentes nao recebem objetivo aberto demais

### Fase 4 - Coleta

1. reunir resultados dos subagentes
2. separar fato, inferencia e risco
3. recusar saidas sem evidencia suficiente

### Fase 5 - Sintese

1. consolidar divergencias
2. definir `STATUS VIGENTE`
3. escrever a verdade operacional no `.brain`

## Regras invariantes

1. o agente principal nunca terceiriza a conclusao final
2. subagentes nao substituem pensamento; eles reduzem incerteza
3. a ultima evidencia confiavel prevalece
4. quando KIMI e CODEX divergirem, vale a evidência mais forte e mais recente
5. atualizacao de contexto precisa registrar autoria

## Linguagem obrigatoria entre agentes

- protocolo: `MAMIS/1`
- estilo:
  - frases curtas
  - fatos primeiro
  - evidencia explicita
  - minimo de adornos

## Saida minima do agente principal

Toda rodada de delegacao deveria terminar com:

1. estado atual
2. evidencias principais
3. riscos residuais
4. proximo passo
5. atualizacao no `.brain`

## Autor

Author: CODEX
Date: 2026-04-25

---

## Atualizacao 2026-04-26 - Swarm adaptativo

### Extensao da Fase 2 - Orquestracao

4. por default, usar a estrategia `aggressive-safe`
5. permitir swarm amplo quando o ownership suportar
6. permitir subdelegacao apenas dentro da politica de recursao

### Extensao das Regras invariantes

6. quando houver ganho real, preferir o maior swarm seguro em vez do menor time possivel

### Extensao da Saida minima

6. aprendizado agregado do swarm em missoes grandes

---

## Atualizacao 2026-04-26 - Consenso CODEX KIMI

### Extensao da Fase 1 - Intake

4. se houver alternancia entre CODEX e KIMI, ler `CODEX_KIMI_CONSENSUS_PROTOCOL.md` antes de consolidar nova verdade

### Extensao da Fase 2 - Orquestracao

7. consultar `CODEX_KIMI_CONSENSUS_PROTOCOL.md` para regras de autoria, consenso, divergencia e handoff

### Extensao das Regras invariantes

7. nao registrar chain-of-thought bruto no brain; registrar apenas deltas operacionais uteis
8. quando houver alternancia entre CODEX e KIMI, preservar a ultima verdade consolidada e atualizar estado, nao reiniciar contexto
9. quando houver divergencia, registrar criterio de desempate e decisao consolidada

---

## Atualizacao 2026-04-26 - Guardrails de runtime critico

### Extensao da Fase 1 - Intake

5. se a mudanca tocar `sync`, `dashboard`, `snapshot`, `rollback` ou `watcher`, ler o protocolo de consenso antes de editar

### Extensao das Regras invariantes

10. lock operacional do brain principal deve permanecer fora do repo canonico
11. dashboard nao deve virar escritor de fonte primaria
12. historico nao pode inflar por refresh sem delta real
13. narrativa de runtime deve bater com a execucao real
14. autoria em metadados compartilhados deve ser fiel ao executor ou neutra

### Preflight obrigatorio para runtime critico

Antes de alterar:

1. `scripts/sync-principal-brain.mjs`
2. `scripts/principal-brain-dashboard.mjs`
3. `scripts/principal-brain-snapshot.mjs`
4. `scripts/principal-brain-rollback.mjs`
5. `scripts/watch-principal-brain-sync.mjs`

o agente principal deve responder internamente:

```text
PRE_EDIT_CHECK:
- source_of_truth_preserved: yes|no
- lock_rule_preserved: yes|no
- history_rule_preserved: yes|no
- authorship_rule_preserved: yes|no
- narrative_matches_execution: yes|no
```

Se qualquer resposta for `no`, a mudanca nao deve ser promovida como melhoria pronta.

## Atualizacao 2026-04-26 - Aprendizado por resultado

### Extensao das Regras invariantes

15. toda melhora aprovada pelo usuario deve ser registrada como padrao repetivel
16. toda regressao confirmada deve ser registrada como guardrail para nao repetir
17. memoria operacional deve capturar resultado observado, nao apenas intencao de implementacao
