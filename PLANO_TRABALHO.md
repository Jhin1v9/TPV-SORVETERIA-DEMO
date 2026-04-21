# Plano de Trabalho — Testes Ponta a Ponta + Integrações

> Status: **Aguardando aprovação do usuário para aplicar**
> Data: 2026-04-21

---

## Resumo das Descobertas dos Testes

Durante o fluxo completo Cliente → Pedido → KDS, foram identificados **5 bugs/issues**:

| # | Bug | Severidade | Status |
|---|-----|-----------|--------|
| 1 | **Manifest.json syntax error** | Baixa | ✅ Corrigido |
| 2 | **Pedido do Cliente não aparece no KDS** | Alta | 🔍 Raiz encontrada |
| 3 | **Demo-server não integrado no modo standalone** | Alta | 🔍 Raiz encontrada |
| 4 | **Onboarding aparece em cada reload** | Média | Pendente |
| 5 | **Bug Detector usando Gemini (não Kimi)** | Baixa | Pendente |

---

## 1. ✅ Corrigido: Manifest.json syntax error

**Problema:** `apps/cliente/index.html` referenciava `/manifest.json` mas o arquivo não existia.
**Correção:** Criado `apps/cliente/public/manifest.json` com manifest PWA válido.

---

## 2. 🔍 Pedido não aparece no KDS — RAIZ ENCONTRADA

**Problema:** Cliente faz pedido #14, confirmação aparece, mas KDS não mostra o pedido.

**Análise do Bug Detector:**
- `CarrinhoPage.tsx` chama `createRemoteOrder()` → `client.ts`
- `client.ts` verifica `getRuntimeMode() === 'standalone'`
- Como não há Supabase configurado (`VITE_SUPABASE_URL` não definido), entra em modo `standalone`
- Em modo standalone, `createRemoteOrder` salva no `localStorage` (`tpv-demo-standalone-state`) **APENAS da aba do Cliente**
- O KDS é outra aba/app com seu próprio `localStorage` isolado
- **Resultado:** Não há sincronização entre Cliente e KDS

**Solução proposta:**
Modificar `packages/shared/src/realtime/client.ts` para:
1. Quando em modo `standalone`, enviar pedidos via POST para `http://localhost:8787/api/orders`
2. O KDS se conecta ao SSE `http://localhost:8787/api/events` para receber snapshots em tempo real
3. Alternativamente: usar `BroadcastChannel API` para sincronizar entre abas do mesmo domínio

**Arquivos a modificar:**
- `packages/shared/src/realtime/client.ts` — `createRemoteOrder`, `updateRemoteOrderStatus`, `RealtimeManager`
- KDS precisa integrar com SSE do demo-server

---

## 3. 🔍 Demo-server não integrado no modo standalone

**Problema:** O `demo-server.mjs` (porta 8787) existe com endpoints REST + SSE, mas o `client.ts` não o utiliza.

**O demo-server oferece:**
- `POST /api/orders` — criar pedido
- `POST /api/orders/:id/status` — atualizar status
- `GET /api/events` — SSE para broadcast em tempo real
- `POST /api/bootstrap` — inicializar estado

**Solução proposta:**
Adicionar uma nova camada no `client.ts`:
```typescript
// Quando standalone, usar demo-server ao invés de localStorage
const DEMO_SERVER_URL = 'http://localhost:8787';

async function createStandaloneOrderViaServer(payload) {
  const res = await fetch(`${DEMO_SERVER_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
```

E no KDS, substituir o `subscribeRealtimeSession` para ouvir o SSE do demo-server em vez de publicar snapshots do localStorage.

---

## 4. Onboarding aparece em cada reload

**Problema:** `InteractiveTutorial.tsx` mostra o tutorial toda vez que a página é carregada.

**Solução proposta:**
- Adicionar flag no `localStorage`: `sorveteria:onboarding-completed`
- Verificar a flag no mount do componente
- Setar a flag quando o usuário clicar em "Ya sé usar"

**Arquivo:** `apps/cliente/src/components/onboarding/InteractiveTutorial.tsx`

---

## 5. Bug Detector usando Gemini (não Kimi)

**Problema:** O `BugDetectorProvider.tsx` usa configuração padrão (Gemini).

**Chave API Kimi fornecida:**
```
sk-kimi-Vh62QRcBgaqyKhagrz3k7S7qzLbor1E46nI0k8ze4RDFQTKFQ0VdVki1qeo9K9cb
```

**Análise:** O README do Bug Detector mostra:
```typescript
ai: {
  provider: 'gemini',
  apiKey: 'YOUR_API_KEY',
}
```

Preciso verificar se o Bug Detector suporta provider `'kimi'` nativamente, ou se precisa de um adaptador customizado. O pacote `@auris/bug-detector` pode usar apenas Gemini.

**Solução proposta:**
- Verificar os tipos `AIConfig` no pacote para ver providers suportados
- Se não suportar Kimi, criar um wrapper ou usar a API Kimi diretamente no `IntelligenceEngine`

---

## Checklist de Ações

- [ ] **A** — Integrar demo-server no `client.ts` para sincronização Cliente ↔ KDS
- [ ] **B** — Bootstrap do demo-server com dados mock iniciais
- [ ] **C** — Corrigir onboarding (persistir no localStorage)
- [ ] **D** — Configurar Bug Detector com API Kimi (se suportado)
- [ ] **E** — Re-subir dev server do admin (5175) que foi parado
- [ ] **F** — Executar testes E2E completos após correções
- [ ] **G** — Executar `npm run build:all` para verificar builds

---

## Como Reproduzir o Bug Principal (Cliente → KDS)

1. Abrir Cliente PWA (localhost:5173)
2. Adicionar produto ao carrinho
3. Clicar "Pedir ahora" → "Pagar ahora"
4. Obter confirmação com número do pedido
5. Abrir KDS (localhost:5176)
6. **Esperado:** Pedido aparece no KDS
7. **Atual:** Pedido NÃO aparece (localStorage isolado)
