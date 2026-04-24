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
**Status:** ✅ FIXED (2026-04-24)
**Severidade:** 🔴 Crítica
**Persona:** Surgeon
**Sintoma:** Ao clicar em qualquer produto no cardápio, a tela ficava completamente branca (white screen of death).
**Causa Raiz:** Múltiplas causas potenciais:
1. `scrollRef.current?.scrollTo` com `behavior: 'instant'` não suportado em todos os browsers
2. Cast forçado `produto.opcoes as Record<string, OpcaoPersonalizacao[]>` falhava se `opcoes` fosse null/undefined
3. Falta de Error Boundary permitia que qualquer erro de runtime quebrasse toda a tela
**Fix:**
- Adicionado `ErrorBoundary` em `apps/cliente/src/components/ErrorBoundary.tsx`
- `ProductDetailModal` envolvido com `<ErrorBoundary>` no `CardapioPage.tsx`
- Guard null-check adicionado em `scrollRef.current` antes de chamar `scrollTo`
- Guard null-check adicionado em `produto.opcoes` antes de cast (`Array.isArray` check)
- Build passa ✅
**Lição:**
- 🧠 Build passando ≠ runtime seguro. TypeScript não protege de tudo.
- 🧠 Modais complexos precisam de Error Boundaries
- 🧠 `useEffect` com refs precisa de guards null-check
- 🧠 Casts forçados (`as`) são mentiras para o compilador — sempre validar em runtime
**Links:** `apps/cliente/src/components/ProductDetailModal.tsx`, `apps/cliente/src/components/ErrorBoundary.tsx`

---

### BUG-004 — Kiosk: Produtos fixos não adicionam ao carrinho
**Data:** 2026-04-21
**Status:** ✅ FIXED (2026-04-24)
**Severidade:** 🔴 Crítica
**Persona:** Product + Surgeon
**Sintoma:** No Kiosk, produtos fixos (café, água, copa-bahia) não são adicionados ao carrinho ao clicar "Añadir".
**Causa Raiz:** Botão "Añadir" estava `disabled={quantidade === 0}`. Como a quantidade inicial era 0, o botão ficava DESABILITADO.
**Fix:** Código já corrigido em sessão anterior. Botão "Añadir" não tem mais `disabled`, e handler `handleAdd` usa fallback `quantidadeFinal = qtd > 0 ? qtd : 1`. Testado E2E — pedido #003 confirmado com produto fixo "Copa Bahia".
**Lição:**
- 🧠 UX: botão desabilitado sem indicação visual clara = confusão do usuário
- 🧠 Sempre re-testar bugs após mudanças de código, mesmo que não documentadas
**Links:** `apps/kiosk/src/screens/CardapioScreen.tsx` linhas 44-54, 251-257

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
