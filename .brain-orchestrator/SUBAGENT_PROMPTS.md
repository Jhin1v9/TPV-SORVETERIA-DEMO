# SUBAGENT_PROMPTS

## Prompt do agente principal

Use quando o agente principal for acionar subagentes:

```text
Use OPERACAO_AGENTES.md como regra principal.
Use SUBAGENT_REGISTRY.json como catalogo e formato de naming.

Trabalhe em padrao manager-worker por default.
Crie subagentes apenas se houver ganho real.
Cada subagente deve receber contrato fechado em MAMIS/1.
Cada subagente deve ter ownership claro.
Sempre sintetize os resultados no agente principal.
```

## Template de spawn

```text
MAMIS/1
ROLE: <ROLE>
GOAL: <one-line objective>
SCOPE: <in / out>
INPUTS:
- <input 1>
- <input 2>
OUTPUT:
- <artifact shape>
DONE:
- <condition 1>
- <condition 2>
RISK:
- <risk 1>
```

## Template de retorno

```text
MAMIS/1
STATUS: OK | PARTIAL | BLOCKED
SUMMARY:
- <line 1>
- <line 2>
EVIDENCE:
- <fact 1>
- <fact 2>
FILES:
- <path 1>
- <path 2>
RISKS:
- <risk 1>
NEXT:
- <next step 1>
```

## Team recipes

### Receita 1 - Pesquisa suprema

- MAIN
- WEB_SCOUT
- CODE_SCOUT
- SYNTHESIZER

### Receita 2 - Implementacao segura

- MAIN
- CODE_SCOUT
- SURGEON
- VERIFIER

### Receita 3 - Auditoria pesada

- MAIN
- CODE_SCOUT
- REVIEWER
- VERIFIER

## Linguagem unica entre IAs

Sempre prefira:

- frases curtas
- fatos antes de inferencias
- bullets em vez de prosa longa
- arquivos e evidencias explicitas
- status binario ou ternario: OK / PARTIAL / BLOCKED
