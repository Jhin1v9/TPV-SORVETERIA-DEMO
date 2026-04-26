# Decisões Arquiteturais — Brain System

## ADR-010: Auditoria Completa do Brain — KIMI (2026-04-26)

**Contexto:** KIMI realizou revisão exaustiva do sistema brain após solicitação do usuário para "entender o projeto, as regras, a intenção extraordinária".

**Decisão:** O sistema está operacional (Score 83/100) mas não extraordinário. 5 gates de hardening pendentes.

**Consequências:**
- Priorizar fixes críticos antes de novas features
- Continuar hardening plan do CODEX
- Adotar insights da pesquisa web (MCP, A2A, critic agents)

---

## ADR-011: Estrutura de Learning System (Proposta)

**Contexto:** O BLS prometido no PLANO_ESTRATEGICO não existe.

**Decisão proposta:** Criar estrutura mínima:
```
.brain/learning/
├── README.md
├── patterns.json       # Padrões descobertos
├── anti-patterns.json  # Anti-padrões evitados
├── sessions/           # Aprendizados por sessão
└── index.json          # Índice pesquisável
```

**Integração:** `subagent-learn.mjs` deve auto-popular esta estrutura a partir dos artefatos de missão.

---

## ADR-012: Consolidar Personalidades (Proposta)

**Contexto:** Personalidades existem apenas em `.brain-orchestrator/personalities/`, não em `.brain/personalities/`.

**Decisão proposta:** O brain principal deve ser a fonte canônica. Copiar personalidades do orchestrator para o brain, ou criar symlink/merge.

**Alternativa:** Atualizar README.md para apontar para `.brain-orchestrator/personalities/`.

---

*Ver arquivo completo de decisões anteriores em sessões anteriores.*

## ADR-013: Distribuicao permanente CODEX ↔ KIMI (2026-04-26)

**Contexto:** O usuario determinou que planos propostos por KIMI e CODEX devem sempre virar distribuicao operacional explicita, com conversa IA->IA orientada a sucesso.

**Decisao:** Discovery e expansao estrategica ficam preferencialmente com KIMI. Hardening, integridade de runtime e consolidacao de verdade operacional ficam preferencialmente com CODEX. Mudancas de governanca, source-of-truth e metricas exigem consenso.

**Consequencias:**
- reduzir overlap de escrita
- acelerar exploracao sem perder disciplina
- tornar `decisions.md` acionavel, nao apenas descritivo
- registrar a divisao em `.brain-orchestrator/CODEX_KIMI_TASK_ALLOCATION.md`

---

## ADR-014: Plano da KIMI convertido em backlog distribuido (2026-04-26)

**Contexto:** O plano atual da KIMI em ADR-010, ADR-011 e ADR-012 e valioso, mas misturava auditoria, hardening, BLS e consolidacao de personalidades sem ownership claro.

**Decisao:**
- ADR-010 gates e hardening do brain principal -> CODEX lidera
- ADR-011 estrutura minima do learning system -> KIMI lidera
- ADR-012 consolidacao de personalidades -> KIMI propõe, CODEX audita fonte canonica

**Consequencias:**
- backlog vira executavel por dono
- consenso so onde realmente importa
- reduz risco de regressao por expansao antes da fundacao
## ADR-015: Alocacao budget-aware entre CODEX e KIMI (2026-04-26)

**Contexto:** O usuario explicitou que KIMI possui folga de credito muito maior que CODEX. A alocacao entre agentes nao deve ignorar custo operacional real.

**Decisao:** Ambos podem executar qualquer tipo de tarefa quando necessario. A divisao CODEX/KIMI continua como preferencia de reducao de conflito, mas passa a ser modulada por budget, throughput e chance de sucesso.

**Consequencias:**
- KIMI pode assumir mais volume, exploracao e execucao ampla quando isso destravar o sistema
- CODEX foca mais nos pontos de maior risco, validacao e consolidacao
- guardrails e source-of-truth continuam acima de qualquer otimizacao de custo

---
## ADR-016: Dashboard do brain deve evoluir de summary para decision cockpit (2026-04-26)

**Contexto:** Auditoria local + pesquisa web mostraram que o dashboard atual e confiavel, mas ainda mais descritivo do que decisional.

**Decisao:** Priorizar uma evolucao em camadas: `What needs attention now`, drivers de score, confidence level, trend com significado e inteligencia de portfolio.

**Consequencias:**
- o dashboard deixa de apenas mostrar numeros
- passa a orientar proximo passo e risco
- melhorias futuras devem ser guiadas por `dashboard-excellence-blueprint.md`

---
## ADR-017: Implementar camada 1 do decision cockpit no principal brain dashboard (2026-04-26)

**Contexto:** O blueprint do dashboard apontou que o maior gap nao era integridade, e sim acionabilidade.

**Decisao:** Implementar imediatamente a primeira camada: What needs attention now, drivers de score, confidence, linguagem de health unificada e portfolio intelligence.

**Consequencias:**
- o dashboard fica mais util para decidir proximo passo
- melhora o valor executivo sem sacrificar auditabilidade
- futuras camadas devem focar em tendencia profunda e drivers de mudanca

---
## ADR-018: Politica de subagentes deve ser verdade executavel unica (2026-04-26)

**Contexto:** A auditoria da KIMI mostrou que `scripts/lib/subagent-policy.mjs` existia, mas a maior parte do runtime ainda duplicava heuristicas locais. Isso permitia divergencia entre politica declarada e artefato gerado.

**Decisao:** `subagent-policy.mjs` passa a ser a fonte canonica de:
- inferencia de mission type
- inferencia de roles
- strategy selection
- scaling e caps de paralelismo
- lanes supervisoras e budgets de escrita

**Consequencias:**
- `subagent-fabric.mjs`, `subagent-mission.mjs` e `subagent-swarm.mjs` devem consumir a politica compartilhada
- `max_parallel_global`, `max_children_per_agent` e `max_write_agents_per_parent` deixam de ser apenas documentacao e passam a moldar o artefato
- futuras expansoes do swarm devem alterar a policy library antes de alterar geradores individuais

---
