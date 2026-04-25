# 🧠 TPV Sorveteria — Cérebro de Projeto

> **"Text > Brain. If you want the agent to remember something, write it to a file."**
> — Graham Mann, OpenClaw

## O que é este sistema?

Este é um **Second Brain** para o projeto TPV Sorveteria. Inspirado em:
- **Tiago Forte** (PARA + CODE frameworks)
- **Niklas Luhmann** (Zettelkasten — notas atômicas e linked)
- **Anthropic** (context engineering, compaction, structured note-taking)
- **JetBrains Research** (observation masking vs LLM summarization)
- **BMAD Method** (Agent Orchestration com personas especializadas)
- **Clawdbot** (modular file-based prompts: SOUL.md + AGENTS.md + IDENTITY.md)

## 📁 Estrutura PARA Adaptada

```
.brain/
├── index.md              ← Você está aqui (guia de uso)
├── context.md            ← Estado atual do projeto (Projects — curto prazo)
├── personas/             ← Personalidades especializadas (Areas — on-going)
│   ├── architect.md      ← 🏗️ Arquiteto: patterns, escalabilidade, decisões macro
│   ├── surgeon.md        ← 🔪 Cirurgião: debugging, refactoring, testes
│   ├── product.md        ← 🎯 Produto: UX, fluxos, negócio, priorização
│   └── devops.md         ← 🚀 DevOps: infra, deploy, CORS, monitoramento
├── memory/               ← Memória persistente (Resources + Archives)
│   ├── decisions.md      ← ADRs — Architectural Decision Records
│   ├── bugs.md           ← Bugs conhecidos, lições aprendidas
│   ├── patterns.md       ← Padrões de código do projeto
│   └── sessions/         ← Notas de sessões individuais (auto-archive)
└── knowledge/            ← Conhecimento de domínio (Resources)
    ├── domain.md         ← Regras de negócio da sorveteria
    ├── stack.md          ← Stack técnico, dependências, versões
    └── api.md            ← Contratos de API, Supabase, RPCs
```

## 🎭 Como usar as Personas

Quando uma tarefa chega, identifique qual persona deve liderar:

| Tipo de Tarefa | Persona Principal | Secundária |
|---------------|------------------|------------|
| Nova feature, arquitetura, refactor macro | **Architect** | Product |
| Bug, crash, performance, testes | **Surgeon** | Architect |
| Fluxo de usuário, onboarding, UX | **Product** | Architect |
| Deploy, CORS, build, CI/CD | **DevOps** | Surgeon |
| Documentação, organização, contexto | **Librarian** (você!) | Todas |

> **💡 Dica:** Diga explicitamente "Act as The Surgeon" no início da tarefa para ativar a persona.

## 🔄 Workflow CODE (Capture → Organize → Distill → Express)

### 1. CAPTURE (Capturar)
Quando algo importante acontece:
- Bug descoberto → adicione em `memory/bugs.md`
- Decisão tomada → adicione em `memory/decisions.md`
- Padrão novo → adicione em `memory/patterns.md`
- Sessão de trabalho → crie nota em `memory/sessions/YYYY-MM-DD.md`

### 2. ORGANIZE (Organizar)
Use tags para conectar ideias:
```markdown
#decision #bug #pattern #refactor #deploy #ux #supabase
```

### 3. DISTILL (Destilar)
A cada semana, revise e comprima:
- Sessões antigas (>30 dias) → arquive em `memory/sessions/archive/`
- Bugs resolvidos → mova para seção "Resolvidos" com data
- Decisões obsoletas → marque como `[DEPRECATED]`

### 4. EXPRESS (Expressar)
Use o conhecimento do brain para:
- Resolver novos bugs (cheque `bugs.md` primeiro)
- Evitar decisões contraditórias (cheque `decisions.md`)
- Seguir padrões consistentes (cheque `patterns.md`)

## 📝 Formato de Notas Atômicas (Zettelkasten)

Cada nota deve ser:
- **Atômica**: uma ideia por nota
- **Linkada**: referencie outras notas com `[[nome-da-nota]]`
- **Numerada**: use IDs como `#202604231345` (YYYYMMDD HHMM)
- **Etiquetada**: tags no topo `#tag #outra-tag`

Exemplo:
```markdown
# 202604231345 — Erro CORS bloqueando pedidos no Vercel
#bug #supabase #cors #deploy #devops

**Contexto:** Pedidos do Cliente PWA não chegam ao KDS.
**Causa raiz:** Supabase não tem CORS configurado para os domínios Vercel.
**Solução:** Adicionar origens no Dashboard → API Settings → CORS.
**Links:** [[202604231200 — Configuração Inicial do Supabase]]
```

## 🧹 Manutenção Semanal (15 min)

- [ ] Revisar `memory/sessions/` — arquivar notas antigas
- [ ] Verificar `memory/bugs.md` — marcar resolvidos
- [ ] Atualizar `context.md` — refletir estado atual
- [ ] Verificar `memory/decisions.md` — deprecar obsoletos
- [ ] Garantir que todas as sessões têm IDs e tags

## 🚨 Regras de Ouro

1. **Text > Brain** — Se é importante, escreva em um arquivo
2. **Uma ideia por nota** — Notas longas devem ser quebradas
3. **Link tudo** — Conexões são mais importantes que hierarquias
4. **Atualize o context.md** — Ele é o "dashboard" do projeto
5. **Use personas** — Especialistas batem generalistas

---

*Última atualização: 2026-04-23*
*Versão do brain: 2.0 (modular + personas)*

## Regra adicional - Delegacao cientifica
- Se a tarefa pedir subagentes, o fluxo oficial agora passa por `.brain-orchestrator/OPERACAO_AGENTES.md` e pelo protocolo `MAMIS/1`.
- Para gerar uma equipe automaticamente, use `npm run agent:fabric -- --goal "<objetivo>"`.
- O artefato de time gerado vira insumo para CODEX ou KIMI operarem como agente principal.
