# CODEX_KIMI_CONSENSUS_PROTOCOL

> Protocolo permanente de coordenacao entre CODEX e KIMI.

Author: CODEX
Date: 2026-04-26
Status: Vigente

## Objetivo

Permitir que CODEX e KIMI alternem execucao, credito e continuidade sem perda de contexto, sem drift de verdade operacional e sem depender de acompanhamento humano da conversa entre IAs.

Este protocolo nao existe para registrar chain-of-thought bruto.

Ele existe para registrar:

1. decisao operacional
2. evidencia
3. divergencia
4. consenso
5. autoria
6. status vigente
7. proximo passo

## Regra central

A ultima evidencia confiavel e mais recente prevalece.

Mas a trilha anterior nao e apagada sem consolidacao.

Sempre preservar:

1. `RELATO ANTERIOR`
2. `ATUALIZACAO`
3. `STATUS VIGENTE`

## Escopo

Este protocolo vale para:

1. CODEX
2. KIMI
3. subagentes criados por qualquer um dos dois
4. consolidacao no `.brain`
5. consolidacao no brain principal

## Linguagem

Linguagem preferida: IA -> IA, compacta e operacional.

Formato base:

```text
MAMIS/1
ACTOR: CODEX | KIMI | <subagent>
MISSION: <id or short name>
STATUS: OK | PARTIAL | BLOCKED
FACTS:
- ...
EVIDENCE:
- ...
INFERENCE:
- ...
DECISION:
- ...
CONSENSUS_STATE:
- aligned | diverged | pending-merge
NEXT:
- ...
```

## O que NAO registrar

Nao registrar no brain:

1. chain-of-thought bruto
2. especulacao longa sem evidencia
3. reflexoes privadas irrelevantes
4. dumps verbosos de debate entre IAs

Registrar apenas deltas operacionais uteis.

## Artefatos obrigatorios

Toda colaboracao relevante entre CODEX e KIMI deve produzir, no minimo:

1. `STATUS VIGENTE`
2. `Autor`
3. `Evidencia`
4. `Risco residual`
5. `Proximo passo`

Quando houver divergencia, adicionar:

1. `RELATO DA KIMI`
2. `RELATO DO CODEX`
3. `PONTO DE DIVERGENCIA`
4. `CRITERIO DE DESEMPATE`
5. `DECISAO CONSOLIDADA`

## Modelo de consenso

### Estado 1 - Alinhado

Usar quando ambos chegaram na mesma conclusao ou em conclusoes equivalentes.

Formato:

```text
CONSENSUS_STATE: aligned
AGREED_TRUTH:
- ...
```

### Estado 2 - Divergente

Usar quando ha choque real entre analises.

Formato:

```text
CONSENSUS_STATE: diverged
KIMI_POSITION:
- ...
CODEX_POSITION:
- ...
TIEBREAKER:
- stronger evidence
- newer evidence
- live validation
```

### Estado 3 - Pending merge

Usar quando um agente trouxe pistas boas, mas ainda nao ha prova final suficiente.

Formato:

```text
CONSENSUS_STATE: pending-merge
OPEN_QUESTIONS:
- ...
NEEDED_EVIDENCE:
- ...
```

## Regra de desempate

Se CODEX e KIMI divergirem:

1. vence a evidencia live sobre a evidencia estatico-inferida
2. vence a evidencia primaria sobre secundaria
3. vence a evidencia mais recente se a realidade mudou
4. vence a validacao reproduzivel sobre a intuicao
5. se ainda empatar, manter `pending-merge`

## Regra de autoria

Toda anotacao relevante deve marcar:

1. `Autor: CODEX`
2. `Autor: KIMI`
3. `Consolidado por: CODEX`
4. `Consolidado por: KIMI`

Quando um agente apenas confirma o que o outro ja registrou:

```text
OBSERVACAO DE CONSOLIDACAO:
- KIMI ja havia registrado este ponto.
```

ou

```text
OBSERVACAO DE CONSOLIDACAO:
- CODEX ja havia registrado este ponto.
```

Quando o estado mudou:

```text
ATUALIZACAO DE ESTADO - CODEX
```

ou

```text
ATUALIZACAO DE ESTADO - KIMI
```

## Regra de alternancia de creditos

Quando o humano alternar entre CODEX e KIMI:

1. o novo agente deve ler o `STATUS VIGENTE`
2. deve respeitar a consolidacao mais recente
3. deve atualizar a verdade, nao reiniciar a historia
4. deve citar quando apenas herdou e continuou um trabalho anterior

Formato recomendado:

```text
HANDOFF_ACCEPTED:
- previous_actor: CODEX
- current_actor: KIMI
- inherited_status: <short>
- carried_forward: yes
```

## Regra de subagentes

Subagentes nao escrevem verdade final.

Subagentes:

1. reduzem incerteza
2. devolvem evidencias
3. alimentam CODEX ou KIMI

Somente CODEX ou KIMI podem:

1. consolidar
2. atualizar status vigente
3. promover aprendizados para padrao
4. sincronizar para o brain principal

## Regra de atualizacao do brain

Depois de qualquer rodada significativa:

1. atualizar `.brain/context.md` se o contexto operacional mudou
2. atualizar `.brain/memory/sessions/YYYY-MM-DD.md`
3. atualizar knowledge/patterns se houve nova regra duravel
4. sincronizar brain principal

## Regra de formatacao para consolidacao

Secoes preferidas:

1. `ANALISE DA KIMI 2.6` ou variante vigente
2. `ATUALIZACAO DE ESTADO - CODEX`
3. `STATUS VIGENTE`
4. `Evidencia`
5. `Observacao de consolidacao`

## Regra de excelencia

Para este projeto, excelencia entre IAs significa:

1. continuidade sem re-trabalho
2. consenso sem apagar historia
3. verdade mais recente sempre visivel
4. autoria sempre clara
5. evidencias acima de ego de agente
6. aumento real de eficiencia para o humano

## Guardrails anti-regressao

Ao ler este protocolo, CODEX e KIMI devem assumir que os itens abaixo sao obrigatorios e prevalecem sobre comentarios antigos, intuicao local ou conveniencia de implementacao.

### 1. Lock operacional do brain principal

- Nunca reintroduzir `.principal-brain-sync.lock` dentro de `C:\Users\Administrator\Documents\.brain`.
- Lock operacional do sync deve permanecer fora do repo canonico.
- Se existir conflito entre implementacao atual e esta regra, esta regra vence.

### 2. Separacao de camadas

- `snapshot` e `sync` produzem fonte primaria.
- `dashboard` consome, sintetiza e expoe.
- `dashboard` nao deve regravar `SNAPSHOT.json` nem outra fonte primaria, salvo migracao deliberada e documentada como excecao.

### 3. Historico so com mudanca real

- Historico de score ou portfolio nao pode crescer apenas porque o painel foi regenerado.
- Nova entrada exige pelo menos um destes sinais:
  1. novo `snapshotId`
  2. mudanca material em score
  3. mudanca material em risco/integridade
- Refresh sem delta real nao conta como evolucao.

### 4. Narrativa deve bater com execucao

- Se o runtime disser `single commit`, a execucao deve ser single commit de verdade.
- Se houver duas fases de commit, documentar como `multi-phase sync`.
- Protocolo nao aceita narrativa otimista divergente da implementacao.

### 5. Autoria fiel

- Nunca hardcode `KIMI` ou `CODEX` em metadados compartilhados quando o executor real pode variar.
- Metadado deve refletir:
  1. `Autor`
  2. `Consolidado por`
  3. `STATUS VIGENTE`
- Quando a autoria exata nao estiver disponivel, usar linguagem neutra em vez de atribuir falsamente.

### 6. Documento stale nao governa

- Se um espelho do brain principal estiver stale, generico ou em conflito com o `.brain` operacional atual, ele nao governa a decisao.
- Nesse caso, registrar:
  - `RELATO ANTERIOR`
  - `ATUALIZACAO DE ESTADO`
  - `STATUS VIGENTE`
- Depois sincronizar a verdade mais recente.

### 7. Antes de editar runtime critico

Antes de editar qualquer um destes arquivos:

1. `scripts/sync-principal-brain.mjs`
2. `scripts/principal-brain-dashboard.mjs`
3. `scripts/principal-brain-snapshot.mjs`
4. `scripts/principal-brain-rollback.mjs`
5. `scripts/watch-principal-brain-sync.mjs`

CODEX ou KIMI devem responder internamente:

```text
PRE_EDIT_CHECK:
- source_of_truth_preserved: yes|no
- lock_rule_preserved: yes|no
- history_rule_preserved: yes|no
- authorship_rule_preserved: yes|no
- narrative_matches_execution: yes|no
```

Se qualquer item for `no`, a mudanca nao deve ser promovida sem correcao.

## Aviso direto para KIMI e CODEX

Regresso estrutural elegante continua sendo regresso.

Mais automacao, mais texto e mais ambicao nao compensam:

1. mistura de camadas
2. inflacao artificial de historico
3. autoria falsa
4. lock poluindo repo canonico
5. plano stale guiando execucao nova

Ao detectar um desses sinais, parar expansao e endurecer a fundacao primeiro.

## Heuristica operacional

CODEX e KIMI devem operar como:

1. uma mente distribuida
2. duas fontes de reducao de incerteza
3. um unico sistema de verdade consolidada

Nunca como:

1. narrativas paralelas desconectadas
2. competidores por versao da realidade
3. geradores de ruido documental

## Regra final

Se houver duvida entre:

1. parecer brilhante
2. parecer coerente
3. ser verdadeiro

Escolher sempre:

1. ser verdadeiro
2. depois ser coerente
3. e so entao ser brilhante

## Regra de aprendizado por resultado

Toda mudanca significativa deve gerar memoria operacional de resultado.

### Quando algo regredir

Se CODEX ou KIMI fizerem algo e a evidencia mostrar regressao, deve registrar imediatamente:

1. o que foi feito
2. por que pareceu boa ideia
3. o que degradou na pratica
4. como reconhecer esse tipo de regressao no futuro
5. regra curta de 
ao repetir

Formato recomendado:

`	ext
LEARNING_NEGATIVE:
- action: ...
- intended_gain: ...
- observed_regression: ...
- evidence: ...
- do_not_repeat: ...
`

### Quando algo ficar bom e o usuario aprovar

Se a mudanca melhorar o sistema e o usuario aprovar explicitamente ou implicitamente com satisfacao clara, registrar:

1. o que foi feito
2. por que funcionou bem
3. em que contexto repetir
4. padrao curto de azer mais

Formato recomendado:

`	ext
LEARNING_POSITIVE:
- action: ...
- observed_gain: ...
- user_signal: ...
- repeat_when: ...
- do_more_of: ...
`

### Regra de promocao para padrao

- um acerto repetido com boa evidencia pode virar padrao duravel
- uma regressao confirmada vira guardrail
- o objetivo nao e so lembrar fatos; e ajustar comportamento futuro
## Regra de budget e throughput

Quando houver assimetria relevante de credito, CODEX e KIMI devem considerar custo de oportunidade como fator operacional legitimo.

Ordem de decisao:
1. preservar verdade operacional
2. preservar guardrails
3. maximizar throughput total do sistema
4. alocar volume pesado ao agente com maior folga de credito
5. manter consolidacao final com o agente mais adequado ao risco da tarefa