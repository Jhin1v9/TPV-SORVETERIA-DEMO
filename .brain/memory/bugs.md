# 🐛 Bug Registry & Lessons Learned

> "Um bug é apenas um teste que deveria existir e não existe."

## Formato
```
### [BUG-ID] — Título do Bug
**Data:** YYYY-MM-DD
**Status:** [OPEN | INVESTIGATING | FIXED | WONTFIX]
**Severidade:** [🔴 Crítica | 🟠 Alta | 🟡 Média | 🟢 Baixa]
**Persona:** [Surgeon | DevOps | Product | Architect]
**Sintoma:** O que o usuário vê?
**Causa Raiz:** Por que acontece?
**Fix:** Como foi resolvido?
**Lição:** O que aprendemos?
**Links:** [[outro-bug]] [[decisao-relacionada]]
```

---

### BUG-001 — CORS bloqueando pedidos na Vercel
**Data:** 2026-04-23
**Status:** 🔴 OPEN
**Severidade:** 🔴 Crítica
**Persona:** DevOps
**Sintoma:** Usuário faz pedido no Cliente PWA (Vercel), aparece toast "Erro de conexão". Pedido não chega ao KDS.
**Causa Raiz:** Supabase não tem CORS configurado para os domínios Vercel (`cliente-pearl.vercel.app`, etc.). O navegador bloqueia o fetch com:
```
Access to fetch at 'https://jmvikjujftidgcezmlfc.supabase.co/rest/v1/orders...'
from origin 'https://cliente-pearl.vercel.app' has been blocked by CORS policy
```
**Fix:** PENDENTE — Configurar CORS no Supabase Dashboard (API Settings → CORS) ou implementar Edge Function proxy.
**Lição:**
- 🧠 CORS é uma restrição do NAVEGADOR, não do servidor. Testar com Node.js/curl NÃO detecta CORS.
- 🧠 Sempre teste deploys em produção com DevTools aberto (Network + Console)
- 🧠 Logs do Playwright/console são evidência forense valiosa
**Links:** [[ADR-008 — CORS Configuração no Supabase]], [[BUG-002 — Modo Standalone isolando localStorage]]

---

### BUG-002 — Modo Standalone isolando localStorage entre abas
**Data:** 2026-04-21
**Status:** 🟡 Média (documentado, comportamento esperado mas confuso)
**Severidade:** 🟡 Média
**Persona:** Architect
**Sintoma:** Cliente faz pedido #14, confirmação aparece, mas KDS não mostra o pedido.
**Causa Raiz:** Quando `VITE_SUPABASE_URL` não está configurado (ou CORS falha), o app entra em modo `standalone` e salva no `localStorage`. Cada aba/browser tem seu próprio `localStorage` isolado.
**Fix:** Comportamento por design. A solução é garantir conexão Supabase funcionando (resolver BUG-001).
**Lição:**
- 🧠 `localStorage` NÃO é compartilhado entre abas de diferentes domínios
- 🧠 O modo standalone é fallback, não solução de sincronização
- 🧠 Sempre verifique `getRuntimeMode()` no console para debugar sync
**Links:** [[ADR-003 — Modo Standalone como Fallback]]

---

### BUG-003 — Cliente PWA: Tela branca ao abrir modal (WSOD)
**Data:** 2026-04-21
**Status:** 🔴 OPEN (investigando)
**Severidade:** 🔴 Crítica
**Persona:** Surgeon
**Sintoma:** Ao clicar em qualquer produto no cardápio, a tela fica completamente branca (white screen of death).
**Causa Raiz:** MÚLTIPLAS causas prováveis (ver `DIAGNOSTICO_BUGS.md`):
1. `scrollRef.current` acessado antes do DOM montar
2. `AnimatePresence` aninhado sem `mode="wait"` ou `key`
3. Cast forçado `produto.opcoes as Record<string, OpcaoPersonalizacao[]>` pode falhar em runtime
4. Possível loop infinito de renderização se `produto` é recriado
5. Import `todosProdutos` pode estar undefined por circular dependency
**Fix:** PENDENTE — Adicionar Error Boundary no `ProductDetailModal`, simplificar useEffect, adicionar `key` ao AnimatePresence.
**Lição:**
- 🧠 Build passando ≠ runtime seguro. TypeScript não protege de tudo.
- 🧠 Modais complexos precisam de Error Boundaries
- 🧠 `useEffect` com refs precisa de guards null-check
**Links:** [[DIAGNOSTICO_BUGS.md — Seção 1]]

---

### BUG-004 — Kiosk: Produtos fixos não adicionam ao carrinho
**Data:** 2026-04-21
**Status:** 🔴 OPEN
**Severidade:** 🔴 Crítica
**Persona:** Product + Surgeon
**Sintoma:** No Kiosk, produtos fixos (café, água, copa-bahia) não são adicionados ao carrinho ao clicar "Añadir".
**Causa Raiz:** Botão "Añadir" está `disabled={quantidade === 0}`. Como a quantidade inicial é 0, o botão está DESABILITADO e o clique não dispara o handler. O fallback `onAddToCart(produto, 1)` no handler NUNCA é alcançado porque o botão não clica.
**Fix:** PENDENTE — Remover `disabled` do botão ou ajustar handler para `quantidadeFinal = qtd > 0 ? qtd : 1`.
**Lição:**
- 🧠 UX: botão desabilitado sem indicação visual clara = confusão do usuário
- 🧠 Código morto: fallback que nunca executa = deuda técnica
**Links:** `apps/kiosk/src/screens/CardapioScreen.tsx` linhas 151, 162-168

---

### BUG-005 — Manifest.json syntax error (Cliente PWA)
**Data:** 2026-04-20
**Status:** ✅ FIXED
**Severidade:** 🟢 Baixa
**Persona:** DevOps
**Sintoma:** Console mostra erro ao carregar manifest.json
**Causa Raiz:** `index.html` referenciava `/manifest.json` mas o arquivo não existia.
**Fix:** Criado `apps/cliente/public/manifest.json` com manifest PWA válido.
**Lição:**
- 🧠 Arquivos em `public/` são servidos na raiz; sempre verifique se existem

---

## Padrões de Bugs Recorrentes

### Padrão: "Funciona local, quebra na Vercel"
- **Causa típica:** Env vars diferentes, CORS, paths de assets
- **Prevenção:** Sempre rode `npm run build` antes de commitar; verifique `vercel.json`

### Padrão: "Realtime não sincroniza"
- **Causa típica:** CORS, modo standalone, tabela não na publication
- **Prevenção:** Cheque `getRuntimeMode()` e Supabase Realtime settings

### Padrão: "Pedido criado mas não aparece no KDS"
- **Causa típica:** Standalone, erro no mapper, snapshot desatualizado
- **Prevenção:** Teste RPC direto via `curl`/Node.js; verifique `buildSnapshotFromSupabase`

---

*Atualizado em: 2026-04-23*
*Próxima revisão: após resolver BUG-001, BUG-003, BUG-004*
