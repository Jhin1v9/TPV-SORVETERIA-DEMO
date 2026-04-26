# 🚀 Quick Start - Sistema de Personalidades

> **3 passos para começar a usar o cérebro ramificado**

---

## 1️⃣ Decidir Qual Personalidade Ativar

**Use o ORQUESTRADOR:**

```bash
# Em qualquer prompt, pergunte:
"Qual personalidade devo ativar para [descrição da tarefa]?"
```

**Ou decida manualmente:**

| Se você vai... | Ative a personalidade |
|----------------|----------------------|
| Criar nova pasta/módulo | `ARQUITETO` |
| Fazer componente visual | `UI/UX ENGINEER` |
| Otimizar código lento | `PERFORMANCE` |
| Tipar algo complexo | `TYPESCRIPT MASTER` |
| Criar hook custom | `REACT ESPECIALISTA` |
| Estilizar com Tailwind | `CSS/TAILWIND` |
| Escrever testes | `TESTING ENGINEER` |
| Configurar tooling | `DX ENGINEER` |

---

## 2️⃣ Ler a(s) Personalidade(s)

**Formato do prompt:**
```markdown
Ler personalidade: [NOME]

Tarefa: [descrição breve]

Contexto adicional:
- [contexto 1]
- [contexto 2]
```

**Exemplo:**
```
Ler personalidade: UI/UX ENGINEER

Tarefa: Criar componente de calendário

Contexto adicional:
- Será usado no módulo de agenda
- Precisa ser acessível
- Deve ter animação suave
```

---

## 3️⃣ Executar com Diretrizes

**Siga RIGOROSAMENTE:**
1. ✅ Todos os "MANDAMENTOS" da personalidade
2. ✅ Todos os "ANTI-PATTERNS" (evitar)
3. ✅ Exemplos de código fornecidos

**Durante a execução:**
- Consulte a personalidade se surgir dúvida
- Siga a arquitetura e patterns definidos
- Mantenha consistência com o projeto

---

## ✅ Antes de Entregar

**Sempre passe pelo REVISOR:**

```bash
# No final de qualquer tarefa:
"Revisar com REVISOR.md antes de finalizar"
```

O REVISOR vai checar:
- ✅ Qualidade do código
- ✅ Consistência com o projeto
- ✅ Otimizações pendentes
- ✅ Documentação necessária

---

## 📋 Exemplo Completo

### Tarefa: "Criar componente de busca"

```
👤 Usuário: Preciso de um componente de busca com debounce

🤖 AI: Vou consultar o ORQUESTRADOR para decidir as personalidades...

[AI lê ORQUESTRADOR.md]
→ Decisão: REACT ESPECIALISTA (primária) + TYPESCRIPT MASTER (secundária)

[AI lê personalidades]
→ REACT: useDebounce hook, useCallback para handlers
→ TYPESCRIPT: tipar props, retorno do hook

[AI executa]
→ Cria componente seguindo diretrizes

[AI revisa]
→ Passa pelo REVISOR.md
→ Checklist: ✅ Types ✅ Hooks ✅ Performance ✅ A11y

✅ Entrega final
```

---

## 🎯 Dicas Pro

### Para Tarefas Pequenas
```
Tarefa: "Corrigir cor do botão"
→ Pular ORQUESTRADOR
→ Ir direto para CSS/TAILWIND
→ Revisar no REVISOR
```

### Para Tarefas Grandes
```
Tarefa: "Refatorar módulo completo"
→ ORQUESTRADOR decide múltiplas
→ Executar em fases:
  1. ARQUITETO (estrutura)
  2. TYPESCRIPT (tipos)
  3. REACT (lógica)
  4. UI/UX (visual)
  5. PERFORMANCE (otimização)
→ REVISOR completo
```

### Quando Não Usar
```
Tarefa: "Qual a capital da França?"
→ Não precisa de personalidade
→ Resposta direta
```

---

## 🔗 Links Rápidos

| Arquivo | Descrição | Quando usar |
|---------|-----------|-------------|
| `README.md` | Visão geral do sistema | Primeira vez |
| `ORQUESTRADOR.md` | Decisão de personalidades | Toda tarefa |
| `REVISOR.md` | Checklist de qualidade | Final de tarefa |
| `INDEX.md` | Guia completo | Navegação |

---

## 💬 Prompts Prontos

**Copie e cole:**

```markdown
# Decidir personalidade
Qual personalidade devo ativar para: [tarefa]?

# Ler personalidade
Ler personalidade: [NOME]
Tarefa: [descrição]

# Revisar
Revisar com REVISOR.md antes de finalizar

# Múltiplas personalidades
Ler personalidades: [NOME1] + [NOME2]
Tarefa: [descrição]
```

---

**Pronto para começar?** 🚀  
Sua primeira parada: `.brain/README.md`

---

## 1.5 Decidir se precisa de subagentes

Antes de executar, passe por esta checagem rapida:

- A tarefa tem pesquisa web e analise de codigo em paralelo?
- Ha verificacao independente que pode rodar enquanto outra trilha implementa?
- O contexto esta grande demais para uma thread so?

Se sim, leia `OPERACAO_AGENTES.md` e gere contratos usando `SUBAGENT_PROMPTS.md` ou `npm run agent:fabric -- --goal "<objetivo>"`.
