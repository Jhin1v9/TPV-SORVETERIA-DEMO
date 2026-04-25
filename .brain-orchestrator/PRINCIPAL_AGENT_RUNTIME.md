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
