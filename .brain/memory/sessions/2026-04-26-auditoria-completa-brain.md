# Auditoria Completa do Sistema Brain — KIMI

**Data:** 2026-04-26  
**Autor:** KIMI  
**Missão:** Revisão exaustiva do que o .brain promete vs o que entrega  
**Protocolo:** MAMIS/1  
**Referências:** Pesquisa WEB_SCOUT-cinder-fox, Auditoria CODE_SCOUT-amber-node, Revisão REVIEWER-ivory-grid

---

## STATUS VIGENTE

O sistema brain está **operacional mas não extraordinário**.  
Score atual: 83/100 (Strong).  
Hardening status: Phase 0 completo, Phase 1-6 pendentes.  
Swarm status: strong direction, partial implementation.

---

## 1. O QUE O .BRAIN PROMETE vs O QUE ENTREGA

### 1.1 Promessa: Sistema de Personalidades Especializadas

| Personalidade | Status brain/ | Status orchestrator/ | Gap |
|---------------|---------------|----------------------|-----|
| 01-ARQUITETO | 🔴 NÃO EXISTE | ✅ Existe | **CRÍTICO**: Personalidades só existem no orchestrator, não no brain |
| 02-UIUX-ENGINEER | 🔴 NÃO EXISTE | ✅ Existe | **CRÍTICO** |
| 03-PERFORMANCE-ENGINEER | 🔴 NÃO EXISTE | ✅ Existe | **CRÍTICO** |
| 04-TYPESCRIPT-MASTER | 🔴 NÃO EXISTE | ✅ Existe | **CRÍTICO** |
| 05-REACT-SPECIALIST | 🔴 NÃO EXISTE | ✅ Existe | **CRÍTICO** |
| 06-CSS-TAILWIND-EXPERT | 🔴 NÃO EXISTE | ✅ Existe | **CRÍTICO** |
| 07-TESTING-ENGINEER | 🔴 NÃO EXISTE | ✅ Existe | **CRÍTICO** |
| 08-DX-ENGINEER | 🔴 NÃO EXISTE | ✅ Existe | **CRÍTICO** |

**Diagnóstico:** O README.md do brain principal descreve 8 personalidades em `.brain/personalities/`, mas NENHUMA existe lá. Todas estão em `.brain-orchestrator/personalities/`. Isso viola a regra de governança: "o brain principal é o canônico, o projeto é o espelho operacional".

### 1.2 Promessa: Brain Learning System (BLS)

| Componente | Status | Gap |
|------------|--------|-----|
| `.brain/learning/patterns.json` | 🔴 NÃO EXISTE | **CRÍTICO**: Sistema de learning não existe no brain |
| `.brain/learning/anti-patterns.json` | 🔴 NÃO EXISTE | **CRÍTICO** |
| `.brain/learning/README.md` | 🔴 NÃO EXISTE | **CRÍTICO** |
| `scripts/subagent-learn.mjs` | 🟡 Existe mas quebra | Requer `--artifact` que não é documentado |

**Diagnóstico:** O PLANO_ESTRATEGICO.md descreve um BLS completo com detecção, classificação, registro e propagação. Na prática, não há estrutura de learning no brain. O `subagent-learn.mjs` existe mas falha sem `--artifact`.

### 1.3 Promessa: Sistema de Subagentes Operacional

| Componente | Status | Linhas | Gap |
|------------|--------|--------|-----|
| `scripts/subagent-fabric.mjs` | ✅ Funciona | 385 | Gera times mas não executa nada |
| `scripts/subagent-mission.mjs` | ✅ Funciona | 156 | Gera planos estáticos |
| `scripts/subagent-swarm.mjs` | ✅ Funciona | 109 | Gera swarm estático |
| `scripts/subagent-learn.mjs` | 🟡 Parcial | 130 | Requer artifact dir, não auto-registra |
| `scripts/lib/subagent-policy.mjs` | ✅ Existe | 112 | Não é importado por nenhum script |

**Diagnóstico:** Os scripts geram artefatos (markdown + json) mas NÃO EXECUTAM nada. Eles são "geradores de contratos", não "orquestradores de execução". O `subagent-policy.mjs` existe mas nenhum script o usa para validar ceilings.

### 1.4 Promessa: Principal Brain como Canônico

| Componente | Status | Gap |
|------------|--------|-----|
| Sync automático | ✅ Funciona | Push OK, git healthy |
| Watcher residente | ✅ Funciona | PID 14400, status idle |
| Dashboard global | ✅ Funciona | Score 83, 63 history points |
| Snapshots | ✅ Funciona | 6 restore points |
| Rollback | ✅ Funciona | Testado e validado |
| Score auditável | ✅ Funciona | SCORE_HISTORY.json com 20 entries |

**Diagnóstico:** A infraestrutura de sync/dash/snapshot/rollback está **sólida**. Este é o componente mais maduro do sistema.

### 1.5 Promessa: Protocolo CODEX/KIMI

| Componente | Status | Gap |
|------------|--------|-----|
| `CODEX_KIMI_CONSENSUS_PROTOCOL.md` | ✅ Existe e é excelente | 285 linhas, bem estruturado |
| Handoff real entre CODEX e KIMI | 🟡 Funciona informalmente | Não há mecanismo automático de handoff |
| Registro de autoria | ✅ Funciona | Context.md marca autor em cada seção |

**Diagnóstico:** O protocolo é teoricamente excelente. Na prática, o handoff depende do humano alternar entre CODEX e KIMI. Não há mecanismo técnico de transferência de estado.

### 1.6 Promessa: Agent Swarm Hardening

| Phase | Status | Gap |
|-------|--------|-----|
| Phase 0 - Truth Reset | ✅ Completo | Status registrado como "strong direction, partial implementation" |
| Phase 1 - Policy Hardening | 🔴 Não iniciado | `subagent-policy.mjs` não é usado |
| Phase 2 - Mission Composition | 🔴 Não iniciado | Não há validação de lanes mínimas |
| Phase 3 - Ownership/Recursion | 🔴 Não iniciado | Não há enforce de disjoint write ownership |
| Phase 4 - Learning System | 🔴 Não iniciado | Learning não existe |
| Phase 5 - Evaluation/Observability | 🔴 Não iniciado | Não há MISSION_TRACE.json |
| Phase 6 - Promotion Gate | 🔴 Não iniciado | Nenhum gate verde |

---

## 2. BRECHAS E BUGS ENCONTRADOS

### 2.1 Bug Crítico: Personalidades Órfãs
**Severidade:** 🔴 Alta  
**Descrição:** As 8 personalidades existem apenas em `.brain-orchestrator/personalities/`, não em `.brain/personalities/`. O README.md do brain principal aponta para `.brain/personalities/` que está vazio.  
**Impacto:** O orquestrador do brain principal não consegue ativar personalidades.  
**Fix:** Copiar/mergear personalidades do orchestrator para o brain, ou atualizar README.md para apontar para o local correto.

### 2.2 Bug Crítico: Learning System Inexistente
**Severidade:** 🔴 Alta  
**Descrição:** O PLANO_ESTRATEGICO.md promete BLS mas não há estrutura. O `subagent-learn.mjs` requer `--artifact <dir>` que não é documentado.  
**Impacto:** Aprendizados das sessões não são capturados automaticamente.  
**Fix:** Criar estrutura `.brain/learning/` e integrar com `subagent-learn.mjs`.

### 2.3 Bug Médio: Scripts Geram mas Não Executam
**Severidade:** 🟡 Média  
**Descrição:** `subagent-fabric.mjs`, `subagent-mission.mjs`, `subagent-swarm.mjs` geram markdown/json mas não criam processos reais de subagentes.  
**Impacto:** O "swarm" é teórico. Na prática, KIMI/CODEX ainda fazem tudo manualmente.  
**Fix:** Integrar com o sistema de Agent tool do Kimi Code CLI, ou documentar que os scripts são "geradores de contratos" e não "executores".

### 2.4 Bug Médio: subagent-policy.mjs Não é Usado
**Severidade:** 🟡 Média  
**Descrição:** O arquivo `scripts/lib/subagent-policy.mjs` existe (112 linhas) mas nenhum script o importa.  
**Impacto:** Ceilings de paralelismo, budgets, e regras de recursão não são enforceadas.  
**Fix:** Importar e usar em `subagent-fabric.mjs` e `subagent-mission.mjs`.

### 2.5 Bug Baixo: PLANO_ESTRATEGICO Desatualizado
**Severidade:** 🟢 Baixa  
**Descrição:** O PLANO_ESTRATEGICO.md menciona "Auris OS" e "terapeutas" — é de outro projeto.  
**Impacto:** Confusão para novos agentes.  
**Fix:** Atualizar para refletir o projeto TPV Sorveteria Demo.

### 2.6 Bug Baixo: Score History Desatualizado
**Severidade:** 🟢 Baixa  
**Descrição:** SCORE_HISTORY.json mostra `syncHealthy: False` mas o sync atual é healthy.  
**Impacto:** Métrica desatualizada no dashboard.  
**Fix:** Verificar fórmula de score em `scripts/lib/principal-brain-score.mjs`.

---

## 3. PESQUISA WEB — Estado da Arte 2026

**Fonte:** WEB_SCOUT-cinder-fox  
**Key Insights:**

1. **OpenAI Agents SDK (Mar/2025):** Handoff como tool call tipada é o modelo mais limpo. Guardrails em 3 camadas. ANTI-PATTERN: handoffs lineares não suportam >8-10 agentes.

2. **Anthropic Claude:** MCP tornou-se padrão de fato (97M+ downloads/mês). "Subagent output to filesystem" evita "game of telephone".

3. **Google ADK (Abr/2025):** Hierarchical agent tree com A2A nativo. Agent Card JSON para capability discovery.

4. **Microsoft AutoGen v0.4:** Redesign assíncrono event-driven (actor model). Cross-language.

5. **LangGraph 2026:** Líder em produção. Checkpointing com time-travel. LangGraph Supervisor v1.0.8.

6. **Lições duras:** AutoGPT queimou $50/h em loops infinitos. "80% das empresas em 2026 usam single-agent com múltiplas tools".

7. **Protocolos emergentes:** MCP (agent→tool) + A2A (agent→agent) sob Linux Foundation. A2A v1.0 lançado Abr/2026.

8. **Governance gap:** "A camada de governança é universalmente a mais fraca e menos padronizada em todas as plataformas enterprise."

---

## 4. IDEIAS FUTURAS (NÃO IMPLEMENTAR AGORA)

### 4.1 Dashboard HTML Tailwind
Transformar o dashboard markdown em um app HTML com Tailwind CSS, servido localmente via servidor Node.js simples. Benefícios: visual rico, gráficos de tendência, alertas em tempo real, acessível via browser.

### 4.2 CLI Dashboard com Blessed/INK
Dashboard no terminal usando Ink (React para terminal) ou Blessed. Mais rápido que HTML, mas menos bonito.

### 4.3 MCP Server para o Brain
Expor o brain como um MCP server. Outros agentes (Claude, GPT) poderiam consultar o brain via protocolo padronizado.

### 4.4 A2A Agent Cards
Cada subagente ter um "Agent Card" JSON descrevendo capabilities, como no Google ADK.

### 4.5 Critic Agents
Adicionar roles de CRITIC que revisam o output de outros subagentes antes da consolidação.

### 4.6 Model Tiering
Usar modelos rápidos/baratos para triage (GPT-4o-mini) e modelos potentes para reasoning (GPT-4o/Claude Sonnet).

---

## 5. PRÓXIMOS PASSOS RECOMENDADOS

### Imediato (esta semana)
1. **Fix Bug 2.1:** Copiar personalidades do orchestrator para o brain
2. **Fix Bug 2.2:** Criar estrutura `.brain/learning/` mínima
3. **Fix Bug 2.5:** Atualizar PLANO_ESTRATEGICO.md para TPV Sorveteria

### Curto prazo (próximas 2 semanas)
4. **Phase 1 Hardening:** Integrar `subagent-policy.mjs` nos scripts
5. **Phase 2 Hardening:** Validar lanes mínimas por tipo de missão
6. **Documentar:** Que os scripts de subagente são "geradores de contratos", não executores

### Médio prazo (próximo mês)
7. **Phase 4 Hardening:** Implementar learning system real
8. **Phase 5 Hardening:** Criar MISSION_TRACE.json e POLICY_COMPLIANCE.json
9. **Avaliar:** MCP server para o brain

---

## 6. EVIDÊNCIAS

- Sync health: healthy (último sync 2026-04-26T05:54:13.082Z)
- Push state: ok
- Watcher PID: 14400, status idle, 0 consecutive failures
- Score: 83/100 (Strong)
- Snapshots: 6 restore points
- Personalities in brain/: 0/8
- Personalities in orchestrator/: 8/8
- Learning files in brain/: 0/3
- Scripts functional: 4/5 (learn quebra sem artifact)

---

**CONSENSUS_STATE:** aligned  
**KIMI_POSITION:** O sistema brain é operacional e bem desenhado, mas precisa de hardening para chegar em "extraordinário".  
**DECISAO_CONSOLIDADA:** Priorizar fixes dos gaps críticos (personalidades, learning) e continuar o hardening plan do CODEX.
