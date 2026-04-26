# LEARNING_OUTCOME_LOOP

Author: CODEX
Date: 2026-04-26
Status: Vigente

## Objetivo

Garantir que CODEX e KIMI aprendam com resultado real, nao apenas com implementacao.

## Regra central

Fez algo e regrediu? registrar para nao fazer mais.

Fez algo e ficou bom? registrar para fazer mais.

Fez algo e o usuario gostou? promover para padrao preferencial quando fizer sentido.

## Tipos de aprendizado

### 1. Aprendizado negativo

Registrar quando houver:

1. regressao tecnica
2. regressao de UX
3. incoerencia arquitetural
4. ruido operacional
5. contradicao entre promessa e execucao

Formato:

`	ext
LEARNING_NEGATIVE:
- action: ...
- expected_benefit: ...
- actual_regression: ...
- evidence: ...
- prevention_rule: ...
`

### 2. Aprendizado positivo

Registrar quando houver:

1. melhoria clara percebida
2. evidencia forte de robustez
3. aprovacao explicita do usuario
4. reducao de atrito
5. aumento de clareza, confianca ou performance

Formato:

`	ext
LEARNING_POSITIVE:
- action: ...
- actual_gain: ...
- evidence: ...
- user_signal: ...
- repeat_rule: ...
`

## Promocao de maturidade

- aprendizado negativo confirmado -> guardrail
- aprendizado positivo repetido -> pattern
- aprendizado positivo repetido e elogiado -> preferred pattern

## Status vigente

- memoria do projeto deve lembrar nao apenas o que foi feito
- memoria do projeto deve lembrar o que vale repetir e o que vale bloquear