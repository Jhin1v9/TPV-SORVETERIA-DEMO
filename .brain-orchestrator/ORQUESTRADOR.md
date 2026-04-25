# 🤖 ORQUESTRADOR - Cérebro Mestre de Decisão

> **Analisa o contexto e seleciona as personalidades perfeitas para cada tarefa**

---

## 🎯 Sistema de Decisão

O ORQUESTRADOR analisa cada tarefa e decide qual(is) personalidade(s) deve(m) ser ativada(s).

### Lógica de Seleção

```typescript
type Contexto = 
  | 'arquitetura' | 'componente-ui' | 'performance' | 'tipos'
  | 'react' | 'estilos' | 'testes' | 'tooling' | 'mix';

interface Tarefa {
  descricao: string;
  arquivoAfetado?: string;
  tipoMudanca: 'create' | 'update' | 'refactor' | 'fix';
  contextoDetectado: Contexto[];
}

interface Decisao {
  personalidadesAtivas: string[];
  prioridade: 'single' | 'dual' | 'trio';
  razao: string;
}
```

---

## 🧠 Matriz de Decisão

### 1. Tarefas de Arquitetura
**Triggers:**
- Criar novo módulo/pasta
- Refatorar estrutura
- Decisões de arquitetura
- Novos patterns

**Personalidades:**
- 🥇 **ARQUITETO** (primária)
- 🥈 **TYPESCRIPT MASTER** (secundária - tipos de domínio)

**Exemplo:**
```
"Criar sistema de notificações"
→ ARQUITETO: estrutura, patterns, separation of concerns
→ TYPESCRIPT MASTER: domain types, contracts
```

---

### 2. Tarefas de Componentes UI
**Triggers:**
- Novo componente visual
- Modificar estilos
- Animações
- Design tokens
- Acessibilidade

**Personalidades:**
- 🥇 **UI/UX ENGINEER** (primária)
- 🥈 **REACT ESPECIALISTA** (secundária)
- 🥉 **CSS/TAILWIND EXPERT** (terciária)

**Exemplo:**
```
"Criar card de paciente"
→ UI/UX: design system, a11y, motion
→ REACT: composition patterns, state
→ CSS/TAILWIND: responsive, estilos
```

---

### 3. Tarefas de Performance
**Triggers:**
- Lentidão relatada
- Bundle size
- Memoização
- Lazy loading
- Otimização de render

**Personalidades:**
- 🥇 **PERFORMANCE ENGINEER** (primária)
- 🥈 **REACT ESPECIALISTA** (secundária - React.memo, useMemo)

**Exemplo:**
```
"Lista de pacientes está lenta"
→ PERFORMANCE: identificar gargalo, estratégia
→ REACT: virtualização, memoização, suspense
```

---

### 4. Tarefas de TypeScript/Tipos
**Triggers:**
- Tipos complexos
- Generics
- Type guards
- Utility types
- Refatoração de tipos

**Personalidades:**
- 🥇 **TYPESCRIPT MASTER** (primária)
- 🥈 **ARQUITETO** (secundária - se envolver domain types)

**Exemplo:**
```
"Criar tipo genérico para respostas da API"
→ TYPESCRIPT MASTER: generics, conditional types, mapped types
```

---

### 5. Tarefas de React/Hooks
**Triggers:**
- Custom hooks
- State management
- Component patterns
- React 18 features
- Server components

**Personalidades:**
- 🥇 **REACT ESPECIALISTA** (primária)
- 🥈 **TYPESCRIPT MASTER** (secundária - tipagem de hooks)
- 🥉 **PERFORMANCE ENGINEER** (terciária - se necessário)

**Exemplo:**
```
"Criar hook useDebounce"
→ REACT: hook patterns, cleanup, refs
→ TYPESCRIPT: generic hook types, constraints
```

---

### 6. Tarefas de CSS/Estilos
**Triggers:**
- Estilos complexos
- Tailwind config
- Design tokens
- Responsividade
- Animações CSS

**Personalidades:**
- 🥇 **CSS/TAILWIND EXPERT** (primária)
- 🥈 **UI/UX ENGINEER** (secundária - design system)

**Exemplo:**
```
"Criar animação de entrada para cards"
→ CSS/TAILWIND: keyframes, transitions, performance
→ UI/UX: motion principles, timing, easing
```

---

### 7. Tarefas de Testes
**Triggers:**
- Unit tests
- Integration tests
- Mocks
- TDD
- Cobertura

**Personalidades:**
- 🥇 **TESTING ENGINEER** (primária)
- 🥈 **TYPESCRIPT MASTER** (secundária - tipos nos testes)

**Exemplo:**
```
"Escrever testes para useFinancasStore"
→ TESTING ENGINEER: arrange/act/assert, mocks, coverage
→ TYPESCRIPT: typed mocks, test utilities
```

---

### 8. Tarefas de Developer Experience
**Triggers:**
- Scripts
- CI/CD
- Linting
- Documentação
- Tooling

**Personalidades:**
- 🥇 **DX ENGINEER** (primária)

---

## 🔄 Tarefas Complexas (Múltiplas Personalidades)

### Exemplo: "Refatorar sistema de chat da Aura"

**Análise:**
1. Estrutura atual → ARQUITETO
2. Componentes visuais → UI/UX ENGINEER
3. Performance → PERFORMANCE ENGINEER
4. Tipos → TYPESCRIPT MASTER
5. Hooks React → REACT ESPECIALISTA

**Decisão:**
```
Personalidades Ativas (5):
1. ARQUITETO - reestruturar módulos
2. UI/UX ENGINEER - redesenhar cards
3. PERFORMANCE ENGINEER - otimizar render
4. TYPESCRIPT MASTER - refatorar tipos
5. REACT ESPECIALISTA - melhorar hooks

Ordem de execução:
1. ARQUITETO define nova estrutura
2. TYPESCRIPT define novos tipos
3. REACT refatora hooks
4. UI/UX redesenha componentes
5. PERFORMANCE otimiza
6. REVISOR valida tudo
```

---

## 🎯 Heurísticas de Decisão

### Por Extensão de Arquivo
```
*.config.ts → DX ENGINEER
*.test.ts → TESTING ENGINEER
tailwind.config.js → CSS/TAILWIND EXPERT
types.ts → TYPESCRIPT MASTER
store.ts → ARQUITETO + REACT
component.tsx → UI/UX + REACT + CSS/TAILWIND
hook.ts → REACT + TYPESCRIPT
```

### Por Palavras-Chave na Tarefa
```
"Arquitetura", "Estrutura", "Módulo" → ARQUITETO
"Componente", "UI", "Visual", "Animação" → UI/UX
"Lento", "Performance", "Bundle", "Memo" → PERFORMANCE
"Tipo", "Generic", "Interface" → TYPESCRIPT
"Hook", "State", "Effect", "Context" → REACT
"CSS", "Tailwind", "Estilo", "Responsivo" → CSS/TAILWIND
"Teste", "Mock", "Coverage" → TESTING
"Script", "CI", "Build", "Lint" → DX
```

---

## ✅ Checklist de Decisão

Antes de começar qualquer tarefa, responder:

1. **Qual o domínio principal?**
   - [ ] Arquitetura/Estrutura
   - [ ] Visual/UI
   - [ ] Performance
   - [ ] Tipos
   - [ ] React/Logic
   - [ ] Estilos
   - [ ] Testes
   - [ ] Tooling

2. **Quais personalidades são necessárias?**
   - Listar primária e secundárias

3. **Há conflitos potenciais?**
   - Ex: UI/UX quer animação, PERFORMANCE quer evitar
   - Resolver: priorizar UX se não impactar Core Web Vitals

4. **Qual a ordem de aplicação?**
   - Estrutura → Tipos → Lógica → Visual → Performance

---

## 🚀 Template de Resposta

```markdown
## 🧠 Análise do ORQUESTRADOR

**Tarefa:** [descrição]

**Contexto Detectado:**
- Domínio: [principal]
- Arquivos: [extensões]
- Keywords: [encontradas]

**Personalidades Ativadas:**
1. 🥇 **[PRIMÁRIA]** - [razão]
2. 🥈 **[SECUNDÁRIA]** - [razão]
3. 🥉 **[TERCIÁRIA]** - [razão] (se aplicável)

**Abordagem:**
[Descrição de como as personalidades vão trabalhar juntas]

**Ordem de Execução:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

---

[Código seguindo as diretrizes das personalidades ativas]

---

**Revisão pós-implementação:**
- [ ] ARQUITETO aprovou estrutura?
- [ ] UI/UX aprovou visual?
- [ ] PERFORMANCE aprovou otimização?
- [ ] TYPESCRIPT aprovou tipos?
```

---

**⚠️ IMPORTANTE:** SEMPRE consultar este arquivo antes de começar qualquer tarefa!

---

## Atualizacao 2026-04-25 - Orquestracao de subagentes

Nova camada operacional adicionada:
- Se a tarefa for grande demais para uma unica thread, o ORQUESTRADOR deve decidir as especialidades e o documento `OPERACAO_AGENTES.md` deve decidir a forma de delegacao.
- O agente principal pode ser CODEX ou KIMI.
- A comunicacao entre agentes deve seguir `MAMIS/1`.
- A geracao automatica de times passa por `npm run agent:fabric -- --goal "<objetivo>"`.
