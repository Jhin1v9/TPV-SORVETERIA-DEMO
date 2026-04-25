# 🎓 Brain Learning System (BLS)

> Sistema de aprendizado contínuo que evolui com o código

---

## 🎯 Propósito

O BLS captura padrões, lições e melhorias descobertas durante o desenvolvimento e as incorpora automaticamente às personalidades.

```
Código Escrito → Análise → Aprendizado → Atualização → Evolução
```

---

## 📁 Estrutura

```
.brain/learning/
├── README.md              # Este arquivo
├── patterns.json          # Padrões de código positivos
├── anti-patterns.json     # Erros e como evitá-los
├── lessons.md            # Lições aprendidas
└── improvements.md       # Sugestões de melhoria
```

---

## 🔄 Ciclo de Aprendizado

### 1. DETECTAR
Quando o AI escreve código, ele identifica:
- Novo padrão elegante
- Solução criativa para problema
- Edge case tratado
- Otimização aplicada

### 2. CLASSIFICAR
```typescript
{
  "personalidade": "REACT_SPECIALIST",
  "categoria": "hook-pattern",
  "impacto": "high" | "medium" | "low",
  "contexto": ["data-fetching", "forms"]
}
```

### 3. REGISTRAR
Adicionar ao arquivo apropriado com:
- Código exemplo
- Contexto de uso
- Anti-patterns relacionados
- Referências

### 4. PROPAGAR
- Atualizar personalidade afetada
- Sincronizar com AGENT_MEMORY.md
- Versionar mudança

---

## 📝 Como Registrar

### Novo Padrão
```bash
# Após implementar algo novo:
"Registrar padrão: useAsyncData para data fetching"
→ AI adiciona a patterns.json
→ Atualiza REACT_SPECIALIST.md
```

### Anti-Pattern Descoberto
```bash
# Quando encontra problema:
"Registrar anti-pattern: mutação direta no Zustand"
→ AI adiciona a anti-patterns.json
→ Atualiza todas as personalidades relevantes
```

### Lição Aprendida
```bash
# Após debugar algo difícil:
"Registrar lição: Date no Zustand precisa ser serializado"
→ AI adiciona a lessons.md
→ Atualiza ARQUITETO.md e AGENT_MEMORY.md
```

---

## 📊 Métricas

| Métrica | Atual | Meta |
|---------|-------|------|
| Padrões registrados | 0 | 50+ |
| Anti-patterns documentados | 0 | 20+ |
| Lições aprendidas | 0 | 30+ |
| Atualizações/mês | 0 | 10+ |

---

**Sempre aprendendo, sempre evoluindo** 🧠✨
