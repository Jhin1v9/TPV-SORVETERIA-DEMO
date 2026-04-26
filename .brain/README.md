# 🧠 SISTEMA DE CONSCIÊNCIA COMPARTILHADA ENTRE IAs

> **Brain principal universal para projetos de software**

---

## 🎯 O que é

Este diretório é o **cérebro canônico** — um sistema de memória persistente, governança e orquestração entre agentes de IA (CODEX, KIMI, etc.) para desenvolvimento de software.

Funciona para **qualquer projeto**: web apps, mobile, backend, infraestrutura, data science, etc.

---

## 🧬 Arquitetura

```
.brain/                          # Brain principal (canônico)
├── README.md                    # Este arquivo
├── index.md                     # Índice de navegação
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
│   ├── 01-ARQUITETO.md          # Arquitetura & Patterns
│   ├── 02-UIUX-ENGINEER.md      # Design Systems & A11y
│   ├── 03-PERFORMANCE-ENGINEER.md  # Otimização & Bundle
│   ├── 04-TYPESCRIPT-MASTER.md  # Tipos Avançados
│   ├── 05-REACT-SPECIALIST.md   # Patterns React
│   ├── 06-CSS-TAILWIND-EXPERT.md   # Estilos Avançados
│   ├── 07-TESTING-ENGINEER.md   # Testes & QA
│   └── 08-DX-ENGINEER.md        # Developer Experience
├── learning/                    # Brain Learning System (BLS)
│   ├── patterns.json            # Padrões descobertos
│   ├── anti-patterns.json       # Anti-patterns
│   ├── outcomes/                # Resultados de ações
│   └── subagents/               # Templates de subagentes
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
└── personas/                    # Personas legado (architect, surgeon, etc.)
```

---

## 🎭 Personalidades

Cada personalidade é um "especialista" que define:

1. **Quando ser ativada** (contexto/trigger)
2. **Como pensar** (mentalidade/abordagem)
3. **O que priorizar** (regras absolutas)
4. **Como executar** (padrões/code style)

### Catálogo

| # | Personalidade | Ativa quando |
|---|---------------|-------------|
| 01 | ARQUITETO | Estrutura, módulos, decisões arquiteturais |
| 02 | UI/UX ENGINEER | Componentes visuais, design system, a11y |
| 03 | PERFORMANCE ENGINEER | Lentidão, bundle, memoização |
| 04 | TYPESCRIPT MASTER | Tipos complexos, generics, strict mode |
| 05 | REACT SPECIALIST | Hooks, state management, patterns |
| 06 | CSS/TAILWIND EXPERT | Estilos, responsividade, design tokens |
| 07 | TESTING ENGINEER | Testes, mocks, cobertura, TDD |
| 08 | DX ENGINEER | Tooling, scripts, CI/CD, automação |

---

## 🤖 Agentes Principais

- **KIMI** — Discovery, proposta, expansão estratégica, execução ampla
- **CODEX** — Hardening, runtime crítico, consolidação de verdade operacional

---

## 🔄 Fluxo de Trabalho

```
1. Usuário faz pedido
   ↓
2. ORQUESTRADOR analisa e seleciona personalidades
   ↓
3. Personalidades ativas fornecem diretrizes
   ↓
4. Código é escrito seguindo as diretrizes
   ↓
5. REVISOR verifica qualidade
   ↓
6. Entrega final
   ↓
7. Aprendizado registrado no BLS
   ↓
8. Sync para brain principal
```

---

## 📋 Regras de Ouro

1. **SEMPRE** consultar o ORQUESTRADOR antes de começar
2. **SEMPRE** seguir as regras da personalidade ativa
3. **SEMPRE** passar pelo REVISOR antes de entregar
4. **NUNCA** misturar abordagens conflitantes sem orquestração
5. **SEMPRE** justificar decisões arquiteturais
6. **SEMPRE** registrar aprendizado no BLS após missões significativas
7. **SEMPRE** fazer sync para o brain principal após mudanças relevantes

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

## 🚀 Operações

```bash
# Sync manual
npm run brain:sync:principal

# Dashboard ao vivo (interface web tipo "cérebro vivo")
npm run brain:live
# Abre http://localhost:3333 no navegador
# Atualiza em tempo real via WebSocket quando o brain muda

# Snapshot
npm run brain:snapshot

# Rollback
npm run brain:rollback -- --snapshot <id>

# Watcher (sync contínuo)
npm run brain:sync:watch

# Fabricação de equipe de subagentes
npm run agent:fabric -- --goal "<objetivo>"
```

---

## 🧠 Dashboard ao Vivo ("Cérebro Vivo")

Interface web que mostra a atividade do brain em tempo real:

- **Neurônios pulsantes** — Partículas que simulam atividade neural
- **Sinapses ativas** — Conexões entre neurônios com pulsos viajando
- **Projetos orbitando** — Cada projeto é um nó com cor baseada na saúde
- **Métricas em tempo real** — Score, riscos, learning, personalidades
- **WebSocket push** — Atualiza automaticamente quando o brain muda
- **File watcher** — Detecta mudanças no brain principal instantaneamente

```bash
npm run brain:live
# http://localhost:3333
```

---

## 🎯 Status

- **Sistema:** Operacional
- **Score:** 83/100 (Strong)
- **Swarm:** Strong direction, partial implementation
- **Extraordinário:** 5 gates pendentes

---

**Status:** ✅ Sistema Ativo  
**Versão:** 2.1 (unificado)  
**Última atualização:** 2026-04-26  
**Autores:** CODEX + KIMI
