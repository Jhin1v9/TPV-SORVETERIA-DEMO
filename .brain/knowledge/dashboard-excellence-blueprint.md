# Dashboard Excellence Blueprint

Author: CODEX
Date: 2026-04-26
Status: Vigente

## Veredito atual

O dashboard do brain principal esta forte, confiavel e disciplinado, mas ainda nao e extraordinario.

Ele funciona mais como `accurate summary` do que como `decision cockpit`.

## Forcas atuais

1. consistencia entre markdown, json e schema
2. score auditavel com formula e pesos visiveis
3. integridade operacional exposta
4. historico e tendencia basicos funcionando sem inflacao por refresh

## Lacunas principais

1. baixa acionabilidade
2. pouca explicacao visivel dos drivers de score
3. tendencia ainda rasa
4. linguagem de health parcialmente inconsistente
5. pouca inteligencia de portfolio para risco de concentracao e stale state

## Principios de melhoria

1. cada widget deve responder uma pergunta decisional
2. score deve ser explicavel em 10 segundos
3. tendencia deve distinguir ruido de mudanca relevante
4. estado atual deve virar proximo passo claro
5. portfolio deve mostrar risco, confianca e concentracao

## Camada 1 - Decision cockpit minimo

### Adicionar em `DASHBOARD.md`

1. `What needs attention now`
   - 1 a 3 acoes rankeadas por impacto
2. `Why this score`
   - delivery, quality, operations, knowledge, integrity
3. `Confidence`
   - baseada em profundidade de historico, recencia e integridade
4. `Risk posture`
   - concentration risk
   - stale sync risk
   - rollback readiness confidence

## Camada 2 - Trend real

1. mostrar janela curta e longa
   - ultimo delta
   - 3 pontos
   - 7 pontos
2. classificar movimento como:
   - noise
   - improving
   - deteriorating
   - recovering
3. registrar drivers de mudanca entre snapshots

## Camada 3 - Portfolio intelligence

1. concentration risk quando poucos projetos dominam o portfolio
2. stale-sync thresholds por projeto
3. confidence score do dashboard
4. top risks sempre preenchido, mesmo quando baixos, com severidade e proxima acao

## Camada 4 - Agent observability

1. thread-level memory of major missions
2. link entre learning, regressions e dashboard state
3. metricas de swarm compliance
4. traces de decisao resumidos sem chain-of-thought bruto

## Melhorias mais valiosas agora

1. adicionar `What needs attention now`
2. expor drivers de score no markdown
3. unificar linguagem de health
4. adicionar confidence level
5. enriquecer trend com janela e significado

## Learning positivo confirmado

### LEARNING_POSITIVE
- action: tornar score auditavel e deduplicar historico por estado
- actual_gain: dashboard ficou confiavel e mais explicavel
- evidence: markdown/json/schema coerentes e historico estavel
- user_signal: direcao aprovada de pensar alem e melhorar com criterio
- repeat_rule: sempre promover observabilidade apenas quando vier junto com auditabilidade

## Learning negativo confirmado

### LEARNING_NEGATIVE
- action: tratar dashboard como status export suficiente
- expected_benefit: simplicidade
- actual_regression: pouca orientacao de decisao e baixo poder executivo
- evidence: dashboard forte mas ainda sem `next actions`, `confidence`, `driver visibility`
- prevention_rule: painel supremo deve orientar acao, nao so descrever estado