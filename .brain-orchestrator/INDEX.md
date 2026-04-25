# 📚 ÍNDICE DO SISTEMA DE PERSONALIDADES

> **Guia rápido de navegação pelo cérebro ramificado**

---

## 🚀 Como Usar

### 1. ANTES de qualquer tarefa, ler:
1. `.brain/README.md` - Entender o sistema
2. `.brain/ORQUESTRADOR.md` - Decisão de personalidades
3. Personalidades relevantes (na pasta `personalities/`)

### 2. DURANTE a execução:
- Seguir rigorosamente as regras da(s) personalidade(s) ativa(s)
- Consultar o `ORQUESTRADOR` se surgir dúvida

### 3. DEPOIS de finalizar:
- `.brain/REVISOR.md` - Checklist de qualidade

---

## 📁 Estrutura de Arquivos

```
.brain/
├── README.md              📖 Comece aqui
├── ORQUESTRADOR.md        🎯 Quem ativar?
├── REVISOR.md             ✅ Checklist final
├── INDEX.md               📚 Este arquivo
├── personalidades/         🧠 Especialistas
│   ├── 01-ARQUITETO.md    🏛️ Arquitetura
│   ├── 02-UIUX-ENGINEER.md 🎨 Design & A11y
│   ├── 03-PERFORMANCE.md  ⚡ Otimização
│   ├── 04-TYPESCRIPT-MASTER.md 📐 Types
│   ├── 05-REACT-ESPECIALISTA.md ⚛️ React
│   ├── 06-CSS-TAILWIND-EXPERT.md 🎨 CSS
│   ├── 07-TESTING-ENGINEER.md 🧪 Testes
│   └── 08-DX-ENGINEER.md  🛠️ Tooling
└── contextos/             🎯 Contextos específicos
    └── (arquivos de domínio)
```

---

## 🎯 Guia de Decisão Rápida

### Se a tarefa envolve...

| Contexto | Personalidade Principal | Secundária |
|----------|------------------------|------------|
| **Nova pasta/módulo** | ARQUITETO | TYPESCRIPT |
| **Componente visual** | UI/UX | REACT + CSS |
| **Performance lenta** | PERFORMANCE | REACT |
| **Tipos complexos** | TYPESCRIPT | - |
| **Custom hook** | REACT | TYPESCRIPT |
| **Estilos/Animações** | CSS/TAILWIND | UI/UX |
| **Testes** | TESTING | TYPESCRIPT |
| **Scripts/CI** | DX | - |

---

## 📖 Documentos por Nível

### Nível 1: Obrigatórios (Sempre ler)
1. `README.md` - Visão geral do sistema
2. `ORQUESTRADOR.md` - Como decidir

### Nível 2: Contextuais (Ler conforme necessidade)
- `01-ARQUITETO.md` - Para arquitetura
- `02-UIUX-ENGINEER.md` - Para UI
- `03-PERFORMANCE.md` - Para performance
- `04-TYPESCRIPT-MASTER.md` - Para tipos
- etc.

### Nível 3: Finalização (Sempre usar)
- `REVISOR.md` - Antes de entregar

---

## 🔄 Fluxo de Trabalho Típico

### Exemplo: "Criar componente de calendário"

```
1. LER: ORQUESTRADOR.md
   → Decisão: UI/UX (primária) + REACT (secundária) + TYPESCRIPT (terciária)

2. LER: 
   - 02-UIUX-ENGINEER.md (design system, a11y)
   - 05-REACT-ESPECIALISTA.md (patterns)
   - 04-TYPESCRIPT-MASTER.md (props types)

3. EXECUTAR:
   - Seguir padrões de cada personalidade

4. REVISAR: REVISOR.md
   - Checklist UI/UX
   - Checklist REACT
   - Checklist TYPESCRIPT

5. ENTREGAR
```

---

## 🔗 Integrações com AGENT_MEMORY.md

O sistema de personalidades se integra com `AGENT_MEMORY.md`:

```markdown
AGENT_MEMORY.md
├── Preferências do usuário
├── Regras aprendidas
├── Estado atual do projeto
└── Sistema de Personalidades (novo)
    ├── Quais foram usadas
    ├── Feedback sobre elas
    └── Ajustes necessários
```

---

## 💡 Dicas de Otimização

### Para Tarefas Pequenas
```
Tarefa: "Corrigir typo em botão"
→ Não precisa do sistema completo
→ Apenas REVISOR.md (checklist básico)
```

### Para Tarefas Médias
```
Tarefa: "Adicionar validação em formulário"
→ ORQUESTRADOR → TYPESCRIPT + REACT
→ Executar com diretrizes
→ REVISOR
```

### Para Tarefas Grandes
```
Tarefa: "Refatorar módulo de agenda"
→ ORQUESTRADOR → Todas as personalidades
→ Executar em fases:
   1. ARQUITETO (estrutura)
   2. TYPESCRIPT (tipos)
   3. REACT (lógica)
   4. UI/UX (visual)
   5. PERFORMANCE (otimização)
→ REVISOR (checklist completo)
```

---

## 📊 Status do Sistema

| Personalidade | Status | Última Atualização |
|---------------|--------|-------------------|
| ARQUITETO | ✅ Ativo | 08/04/2026 |
| UI/UX ENGINEER | ✅ Ativo | 08/04/2026 |
| PERFORMANCE | 📝 Pendente | - |
| TYPESCRIPT MASTER | ✅ Ativo | 08/04/2026 |
| REACT ESPECIALISTA | 📝 Pendente | - |
| CSS/TAILWIND | 📝 Pendente | - |
| TESTING | 📝 Pendente | - |
| DX ENGINEER | 📝 Pendente | - |

---

## 🎓 Próximos Passos Sugeridos

1. **Completar personalidades pendentes:**
   - PERFORMANCE ENGINEER
   - REACT ESPECIALISTA
   - CSS/TAILWIND EXPERT
   - TESTING ENGINEER
   - DX ENGINEER

2. **Criar contextos específicos:**
   - `contextos/mapa-auricular.md`
   - `contextos/aura-ai.md`
   - `contextos/financas.md`

3. **Criar templates de código:**
   - `templates/component.tsx`
   - `templates/hook.ts`
   - `templates/test.tsx`

4. **Integrar com AGENT_MEMORY.md:**
   - Registrar feedback de cada personalidade
   - Ajustar baseado em resultados

---

**Versão:** 1.0.0  
**Status:** Sistema Ativo  
**Última atualização:** 08/04/2026

---

## Atualizacao 2026-04-25 - Sistema de Subagentes

Novos documentos operacionais adicionados para uso permanente do agente principal:

1. `OPERACAO_AGENTES.md`
- regra mestra para decidir quando criar subagentes
- padrao default `manager-worker`
- catalogo de papeis
- protocolo de comunicacao `MAMIS/1`

2. `SUBAGENT_REGISTRY.json`
- registry machine-friendly com roles, naming e spawn policy

3. `SUBAGENT_PROMPTS.md`
- prompts base para spawn, retorno e receitas de equipe

### Nova ordem de leitura quando houver delegacao

1. `README.md`
2. `ORQUESTRADOR.md`
3. `OPERACAO_AGENTES.md`
4. personalidades relevantes
5. `SUBAGENT_PROMPTS.md` quando o agente principal precisar compor contratos
6. `REVISOR.md`

### Regra vigente

Se a tarefa pedir paralelismo, pesquisa ampla, verificacao paralela ou particionamento de contexto, o agente principal deve consultar `OPERACAO_AGENTES.md` antes de delegar.

- Runtime unificado do agente principal: `PRINCIPAL_AGENT_RUNTIME.md`
  - define o ciclo operacional que CODEX e KIMI devem seguir ao delegar
