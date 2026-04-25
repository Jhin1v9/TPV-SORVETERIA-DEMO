# OPERACAO_AGENTES

> Sistema operacional de subagentes para o agente principal.

## Objetivo

Padronizar quando o agente principal deve criar subagentes, como dividir o trabalho, como nomea-los, como eles devem se comunicar e como os resultados devem voltar para a sintese final.

Este documento foi desenhado para interacao entre IAs, sem depender de linguagem voltada a humanos.

## Fontes de referencia

Baseado nas melhores praticas descritas em:

- OpenAI - "A practical guide to building agents"
  - https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/
- OpenAI - "New tools for building agents"
  - https://openai.com/index/new-tools-for-building-agents/
- OpenAI Cookbook - "Multi-Agent Portfolio Collaboration"
  - https://developers.openai.com/cookbook/examples/agents_sdk/multi-agent-portfolio-collaboration/multi_agent_portfolio_collaboration
- Anthropic - "How we built our multi-agent research system"
  - https://www.anthropic.com/engineering/multi-agent-research-system
- Microsoft Agent Framework Overview
  - https://learn.microsoft.com/en-us/agent-framework/overview/
- AutoGen multi-agent docs
  - https://microsoft.github.io/autogen/0.2/docs/Use-Cases/agent_chat/
- LangGraph overview
  - https://docs.langchain.com/oss/python/langgraph/overview

## Principios vigentes

1. Default = single-agent
- Nao criar subagentes por vaidade.
- Se uma funcao deterministicamente resolve, use funcao.
- Se um unico agente com ferramentas claras resolve, fique em single-agent.

2. Default multi-agent = manager-worker
- Um agente principal mantem o contexto do usuario.
- Subagentes atuam como especialistas ou ferramentas cognitivas.
- O principal sintetiza, valida e decide.

3. Handoff so quando a conversa precisa mudar de dono
- Para fluxos abertos e troca real de especialidade.
- Se o usuario deve continuar vendo uma "mente central", nao use handoff.

4. Paralelize apenas trabalho realmente independente
- Pesquisa web paralela.
- Exploracao de partes distintas do codigo.
- Verificacao e review em trilhas separadas.
- Nao paralelizar mudancas fortemente acopladas sem ownership claro.

5. Cada subagente precisa de contrato fechado
- objetivo
- escopo
- entradas
- saida esperada
- criterio de pronto
- risco

6. Observabilidade minima sempre
- quem foi criado
- para que
- quais entradas recebeu
- quais evidencias devolveu
- o que ficou pendente

7. Sintese central obrigatoria
- O principal nunca terceiriza a conclusao final sem revisar.
- O principal converte resultados heterogeneos em estado unico e coerente.

## Quando criar subagentes

Criar subagentes quando pelo menos um destes gatilhos existir:

1. Breadth-first research
- muitas frentes independentes de web/search

2. Tool overload
- um unico agente esta escolhendo mal entre ferramentas/dominios

3. Context partitioning
- cada trilha precisa de contexto proprio para nao poluir a thread principal

4. Sidecar verification
- uma trilha implementa, outra valida em paralelo

5. Different evidence modes
- um agente busca internet
- outro le codigo
- outro consolida riscos

## Quando NAO criar subagentes

1. Bug pequeno, localizado e linear
2. Refactor em um unico arquivo sem paralelismo real
3. Tarefa fortemente acoplada e dependente de contexto fino
4. Quando o custo de coordenacao sera maior que o ganho

## Arquitetura padrao

### Padrao A - Manager as Tool

Use como default.

- MAIN: recebe pedido, planeja, cria subtarefas
- WEB_SCOUT: pesquisa internet e devolve evidencias
- CODE_SCOUT: investiga repo e devolve mapa tecnico
- SURGEON: implementa mudanca delimitada
- VERIFIER: testa e revisa
- SYNTHESIZER: opcional para consolidar material grande

### Padrao B - Peer Handoff

Use apenas se o fluxo pede transferencia real de controle.

Exemplo:
- TRIAGE -> DEPLOY_AGENT
- TRIAGE -> INCIDENT_AGENT

## Catalogo minimo de subagentes

### 1. WEB_SCOUT
- Categoria: external-intelligence
- Missao: pesquisar web, docs, changelogs, referencias, benchmarks
- Saida: evidencias, links, resumo util, riscos de atualidade

### 2. CODE_SCOUT
- Categoria: repo-intelligence
- Missao: localizar arquivos, fluxos, ownership, dependencias, hotspots
- Saida: mapa tecnico curto com caminhos exatos

### 3. SURGEON
- Categoria: implementation
- Missao: fazer patch delimitado
- Saida: arquivos alterados, rationale, riscos

### 4. VERIFIER
- Categoria: validation
- Missao: rodar build, testes, checks, smoke flows
- Saida: pass/fail, evidencias, residuos

### 5. REVIEWER
- Categoria: quality
- Missao: review orientado a regressao, risco e testes faltantes
- Saida: findings priorizados

### 6. SYNTHESIZER
- Categoria: consolidation
- Missao: condensar muitos resultados em uma verdade operacional unica
- Saida: estado vigente, decisoes, open questions

## Politica de nomes aleatorios

Todo subagente deve ganhar nome curto, unico e legivel.

### Formato

`<ROLE>-<CALLSIGN>-<ID>`

Exemplos:

- `WEB_SCOUT-cinder-fox-17`
- `CODE_SCOUT-amber-node-42`
- `SURGEON-slate-river-08`
- `VERIFIER-ivory-grid-61`

### Regra

- ROLE identifica a funcao
- CALLSIGN e aleatorio
- ID curto evita colisao

### Callsign

Montar com:

- adjetivo curto
- substantivo curto

Ver registry machine-friendly em `SUBAGENT_REGISTRY.json`.

## MAMIS/1 - protocolo de comunicacao entre agentes

MAMIS = Multi-Agent Minimal Interop Spec

Objetivo: linguagem curta, uniforme e eficiente para IA -> IA.

### Mensagem de entrada

Cada subagente deve receber:

```text
MAMIS/1
ROLE: <role>
GOAL: <one-line objective>
SCOPE: <what is in/out>
INPUTS: <files, urls, facts, constraints>
OUTPUT: <expected artifact shape>
DONE: <definition of done>
RISK: <known risks>
```

### Resposta padrao

Cada subagente deve responder:

```text
MAMIS/1
STATUS: OK | PARTIAL | BLOCKED
SUMMARY: <3-8 lines max>
EVIDENCE:
- <item>
- <item>
FILES:
- <path>
- <path>
RISKS:
- <item>
NEXT:
- <item>
```

### Regras do protocolo

1. Sem floreio
2. Sem repetir contexto recebido
3. Sempre separar fato de inferencia
4. Sempre listar evidencias primeiro
5. Se bloqueado, dizer o menor unblock possivel

## Contrato de spawn

Antes de criar um subagente, o principal deve definir:

1. ownership
- quais arquivos/modulos/dominios sao do subagente

2. write-scope
- leitura somente ou escrita permitida

3. success-output
- exatamente o que o principal espera receber

4. merge-plan
- como o resultado sera integrado

## Politica de paralelismo

### Pode paralelizar

- web research + code mapping
- implementacao em arquivos distintos
- implementacao + verificacao
- docs + patch review

### Nao pode paralelizar

- duas escritas no mesmo arquivo
- refactor estrutural com ownership confuso
- debugging altamente interdependente sem checkpoint

## Politica de ownership

Cada worker de escrita precisa de:

- arquivo ou pasta dono
- modulo dono
- responsabilidade explicita

Se dois workers tocam o mesmo arquivo, o principal falhou no desenho da tarefa.

## Politica de retorno para o principal

O agente principal deve sempre:

1. revisar a saida
2. comparar resultados entre subagentes
3. consolidar em estado vigente unico
4. atualizar o brain se a decisao ou padrao for relevante

## Heuristica recomendada

### Para pesquisa

- 1 principal
- 1 WEB_SCOUT
- 1 CODE_SCOUT
- opcional 1 SYNTHESIZER

### Para implementacao media

- 1 principal
- 1 CODE_SCOUT
- 1 SURGEON
- 1 VERIFIER

### Para investigacao grande

- 1 principal
- N scouts paralelos por dominio
- 1 reviewer
- 1 synthesizer

## Regra permanente

Se o agente principal pedir ajuda, o sistema deve preferir:

1. criar subagentes por funcao, nao por ego
2. usar manager-worker como default
3. manter linguagem MAMIS/1
4. registrar estado novo como verdade vigente no brain
