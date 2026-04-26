# 🧠 Brain Universal — Índice de Navegação

> **Sistema de Consciência Compartilhada entre IAs**

---

## 📁 Estrutura do Brain

```
.brain/
├── README.md                    # Visão geral do sistema
├── index.md                     # Este arquivo (navegação)
├── ORQUESTRADOR.md              # Decide qual personalidade usar
├── REVISOR.md                   # Revisa e garante qualidade
├── PLANO_ESTRATEGICO.md         # Evolução contínua do sistema
├── QUICK_START.md               # Guia rápido de uso
├── OPERACAO_AGENTES.md          # Regras de delegação e subagentes
├── PRINCIPAL_AGENT_RUNTIME.md   # Ciclo operacional do agente principal
├── BRAIN_SYNC_RUNTIME.md        # Protocolo de sincronização
├── CODEX_KIMI_CONSENSUS_PROTOCOL.md  # Protocolo de consenso entre agentes
├── CODEX_KIMI_TASK_ALLOCATION.md     # Alocação de tarefas entre agentes
├── SUBAGENT_PROMPTS.md          # Prompts base para subagentes
├── SUBAGENT_REGISTRY.json       # Registry de papéis de subagentes
├── personalidades/              # 8 especialistas por domínio
│   ├── 01-ARQUITETO.md
│   ├── 02-UIUX-ENGINEER.md
│   ├── 03-PERFORMANCE-ENGINEER.md
│   ├── 04-TYPESCRIPT-MASTER.md
│   ├── 05-REACT-SPECIALIST.md
│   ├── 06-CSS-TAILWIND-EXPERT.md
│   ├── 07-TESTING-ENGINEER.md
│   └── 08-DX-ENGINEER.md
├── learning/                    # Brain Learning System (BLS)
│   ├── patterns.json
│   ├── anti-patterns.json
│   ├── outcomes/
│   └── subagents/
├── runbooks/                    # Runbooks operacionais
│   ├── AUDIT_RUNBOOK.md
│   ├── IMPLEMENTATION_RUNBOOK.md
│   ├── INCIDENT_RUNBOOK.md
│   └── RESEARCH_RUNBOOK.md
├── knowledge/                   # Conhecimento de domínio
│   ├── domain.md
│   ├── stack.md
│   ├── api.md
│   └── adr/
├── memory/                      # Memória persistente
│   ├── decisions.md
│   ├── bugs.md
│   ├── patterns.md
│   └── sessions/
└── personas/                    # Personas especializadas (legado)
    ├── architect.md
    ├── surgeon.md
    ├── product.md
    └── devops.md
```

---

## 🎯 Ordem de Leitura por Tarefa

### Tarefa Simples (correção, typo)
1. `REVISOR.md` — checklist básico

### Tarefa Média (feature, componente)
1. `ORQUESTRADOR.md` — decidir personalidades
2. Personalidades relevantes
3. `REVISOR.md` — checklist

### Tarefa Grande (refactor, arquitetura)
1. `README.md` — visão geral
2. `ORQUESTRADOR.md` — decidir personalidades
3. `OPERACAO_AGENTES.md` — se precisar de subagentes
4. Personalidades relevantes
5. `SUBAGENT_PROMPTS.md` — se delegar
6. `REVISOR.md` — checklist completo

### Tarefa com Delegação (paralelismo)
1. `README.md`
2. `ORQUESTRADOR.md`
3. `OPERACAO_AGENTES.md`
4. `PRINCIPAL_AGENT_RUNTIME.md`
5. Personalidades relevantes
6. `SUBAGENT_PROMPTS.md`
7. `REVISOR.md`

---

## 🎭 Catálogo de Personalidades

| # | Personalidade | Ativa quando |
|---|---------------|-------------|
| 01 | **ARQUITETO** | Estrutura, módulos, decisões arquiteturais |
| 02 | **UI/UX ENGINEER** | Componentes visuais, design system, a11y |
| 03 | **PERFORMANCE ENGINEER** | Lentidão, bundle, memoização |
| 04 | **TYPESCRIPT MASTER** | Tipos complexos, generics, strict mode |
| 05 | **REACT SPECIALIST** | Hooks, state management, patterns |
| 06 | **CSS/TAILWIND EXPERT** | Estilos, responsividade, design tokens |
| 07 | **TESTING ENGINEER** | Testes, mocks, cobertura, TDD |
| 08 | **DX ENGINEER** | Tooling, scripts, CI/CD, automação |

---

## 🚀 Comandos Disponíveis

```bash
# Dashboard ao vivo (interface web "cérebro vivo")
npm run brain:live
# http://localhost:3333

# Sincronização
npm run brain:sync:principal
npm run brain:sync:watch

# Snapshot e rollback
npm run brain:snapshot
npm run brain:rollback -- --snapshot <id>

# Fabricação de equipe de subagentes
npm run agent:fabric -- --goal "<objetivo>"
```

---

## 🧠 Brain Learning System (BLS)

```
1. DETECÇÃO      → Novo padrão, bug, decisão ou edge case
2. CLASSIFICAÇÃO → Personalidade, categoria, impacto
3. REGISTRO      → patterns.json, anti-patterns.json, outcomes/
4. PROPAGAÇÃO    → Atualizar personalidades afetadas
5. SINCRONIZAÇÃO → brain:sync:principal
```

---

## 🤖 Agentes Principais

- **KIMI** — Discovery, proposta, expansão estratégica, execução ampla
- **CODEX** — Hardening, runtime crítico, consolidação de verdade operacional

---

**Status:** ✅ Sistema Ativo  
**Versão:** 2.1 (unificado)  
**Última atualização:** 2026-04-26  
**Autores:** CODEX + KIMI
