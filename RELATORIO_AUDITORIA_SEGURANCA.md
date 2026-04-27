# 🔴 RELATÓRIO DE AUDITORIA DE SEGURANÇA — TPV SORVETERIA

**Projeto:** `sorveteria_tpv` (Tropicale POS)  
**Data da auditoria:** 2026-04-26  
**Metodologia:** Análise estática de código-fonte + inspeção de bundles de produção + revisão de schema de banco de dados + análise de edge functions  
**Ferramentas:** 4 subagentes paralelos (CLIENTE, KIOSK, KDS+ADMIN, Supabase/Shared) + verificação manual do auditor principal  
**Total de vulnerabilidades encontradas:** 35  

---

## 📊 RESUMO EXECUTIVO

O projeto TPV Sorveteria apresenta **múltiplas vulnerabilidades críticas** que colocam em risco a integridade dos dados dos clientes, a operação da loja e a segurança financeira. Os principais problemas são:

1. **Chaves de API expostas em 4 locais diferentes** (vercel.json, .env.local, bundles JS de produção) — incluindo a chave anônima do Supabase e uma secret key da Moonshot AI.
2. **Banco de dados completamente aberto** — Row Level Security habilitado, mas policies permitem qualquer usuário anônimo na internet ler, inserir e atualizar todos os dados.
3. **Autenticação inexistente ou burlável** — Admin loga com senha hardcoded `123456` validada puramente no client-side; KDS não tem login; sistema não usa Supabase Auth.
4. **Dados pessoais e de saúde (alergias) persistidos sem criptografia** no localStorage do navegador.
5. **Edge functions críticas sem autenticação** — qualquer um pode criar PaymentIntents na Stripe, enviar comprovantes de pedidos alheios, e resetar todos os dados da demo.

> **Atenção:** As chaves expostas neste relatório são **reais e atualmente válidas**. Elas foram extraídas diretamente do repositório e dos bundles de produção. **A rotação imediata é obrigatória.**

---

## 📋 ÍNDICE DE VULNERABILIDADES

| ID | Severidade | Título | Localização |
|----|-----------|--------|-------------|
| V01 | 🔴 CRÍTICO | Supabase anon key hardcoded em 4 vercel.json | `apps/*/vercel.json` |
| V02 | 🔴 CRÍTICO | Supabase anon key embutida nos 4 bundles de produção | `dist/*/assets/index-*.js` |
| V03 | 🔴 CRÍTICO | Moonshot AI secret key no .env.local (prefixo VITE_) | `.env.local` (raiz) |
| V04 | 🔴 CRÍTICO | Tabelas payment_transactions e receipts SEM RLS | `migration-payment-v2.sql` |
| V05 | 🔴 CRÍTICO | RLS policies permitem acesso total a anon em todas as tabelas | `schema-clean.sql`, `schema-expanded.sql` |
| V06 | 🔴 CRÍTICO | RPCs administrativas grantadas a anon (reset, update, stock) | `schema-clean.sql`, `migration-payment-v2.sql` |
| V07 | 🔴 CRÍTICO | Edge function create-payment-intent sem autenticação | `supabase/functions/create-payment-intent/index.ts` |
| V08 | 🔴 CRÍTICO | Senha de admin hardcoded no código-fonte | `apps/admin/src/pages/LoginScreen.tsx` |
| V09 | 🔴 CRÍTICO | Autenticação admin puramente client-side (burlável via DevTools) | `apps/admin/src/AdminApp.tsx`, `packages/shared/src/stores/useStore.ts` |
| V10 | 🔴 CRÍTICO | KDS (Kitchen Display) completamente aberto sem autenticação | `apps/kds/src/KDSApp.tsx` |
| V11 | 🔴 CRÍTICO | VAPID public key hardcoded no vercel.json do cliente | `apps/cliente/vercel.json` |
| V12 | 🟠 ALTO | PII (nome, email, telefone, alergias) persistido em localStorage | `packages/shared/src/stores/useStore.ts` |
| V13 | 🟠 ALTO | Auth mock armazena todos os usuários em localStorage | `packages/shared/src/lib/authMock.ts` |
| V14 | 🟠 ALTO | Snapshot completo do estado salvo em localStorage | `packages/shared/src/realtime/client.ts` |
| V15 | 🟠 ALTO | Dados de cartão de crédito em estado React sem tokenização PCI | `apps/cliente/src/components/pagamento/PagamentoModal.tsx` |
| V16 | 🟠 ALTO | Console.error expondo erros internos do Supabase em produção | `packages/shared/src/realtime/client.ts` |
| V17 | 🟠 ALTO | Funcionalidades admin expostas sem autorização server-side | `apps/admin/src/pages/*.tsx` |
| V18 | 🟠 ALTO | CORS `*` em todas as edge functions (CSRF cross-origin) | `supabase/functions/*/index.ts` |
| V19 | 🟠 ALTO | Edge function send-receipt sem verificação de propriedade | `supabase/functions/send-receipt/index.ts` |
| V20 | 🟠 ALTO | Kiosk sem autenticação — acesso público ilimitado | `apps/kiosk/src/KioskApp.tsx` |
| V21 | 🟡 MÉDIO | Console.log/warn com dados sensíveis em CarrinhoPage | `apps/cliente/src/pages/CarrinhoPage.tsx` |
| V22 | 🟡 MÉDIO | Service Worker sem validação de origem do push payload | `public/sw-cliente.js` |
| V23 | 🟡 MÉDIO | Auth do Supabase desativado (persistSession: false) | `packages/shared/src/supabase/client.ts` |
| V24 | 🟡 MÉDIO | Mock de cartão de crédito exposto na interface | `apps/kiosk/src/screens/PagamentoScreen.tsx` |
| V25 | 🟡 MÉDIO | Código de desconto hardcoded no código | `packages/shared/src/utils/pricing.ts` |
| V26 | 🟡 MÉDIO | QR Code de pagamento estático | `apps/kiosk/src/screens/PagamentoScreen.tsx` |
| V27 | 🟡 MÉDIO | Build artifacts com prompts internos expostos | `dist/cliente/assets/img/*.html` |
| V28 | 🟡 MÉDIO | Deploy scripts sem sanitização de dist/ | `scripts/deploy-*.mjs` |
| V29 | 🟢 BAIXO | Dependência @auris/bug-detector via tarball sem hash | `package.json` |
| V30 | 🟢 BAIXO | Ausência de Content Security Policy (CSP) | `apps/*/index.html` |
| V31 | 🟢 BAIXO | loginByPhone usa require() dinâmico | `packages/shared/src/stores/useStore.ts` |
| V32 | 🟢 BAIXO | Registro sem verificação de email/telefone | `apps/cliente/src/components/onboarding/QuickRegister.tsx` |
| V33 | 🟢 BAIXO | vite-plugin-pwa presente mas não configurado | `package.json` |
| V34 | ℹ️ INFO | Web Push VAPID public key no bundle (público por design) | `apps/cliente/src/lib/pushNotifications.ts` |
| V35 | ℹ️ INFO | .env.local está no .gitignore (BOM, mas arquivo existe no repo) | `.gitignore` |

---

## 🔴 CRÍTICO — VULNERABILIDADES

---

### V01 — Supabase Anon Key Hardcoded em 4 vercel.json

**Onde:** `apps/cliente/vercel.json` (linhas 10-12), `apps/admin/vercel.json` (linhas 10-11), `apps/kds/vercel.json` (linhas 10-11), `apps/kiosk/vercel.json` (linhas 10-11)

**O que vazou (VALORES REAIS):**
```json
{
  "env": {
    "VITE_SUPABASE_URL": "https://dproxlygtabihfhtxdvm.supabase.co",
    "VITE_SUPABASE_ANON_KEY": "sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ"
  }
}
```

**Explicação humana:**  
O arquivo `vercel.json` é versionado no Git. Qualquer pessoa com acesso ao repositório (ou que consiga ver o código no GitHub) obtém a chave anônima do Supabase. Essa chave permite fazer requisições autenticadas à API PostgREST do projeto. Como as RLS policies estão abertas (veja V05), essa chave dá poder quase total sobre o banco de dados.

**Como explorar:**
```bash
curl -H "apikey: sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ" \
     -H "Authorization: Bearer sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ" \
     https://dproxlygtabihfhtxdvm.supabase.co/rest/v1/customers
```

**Como corrigir:**
1. Remover TODAS as chaves dos 4 arquivos `vercel.json`.
2. Configurar as variáveis de ambiente diretamente no **Vercel Dashboard** (Settings → Environment Variables).
3. Rotacionar a chave no Supabase Dashboard (Settings → API → Project API keys → Rotate).

---

### V02 — Supabase Anon Key Embutida nos 4 Bundles de Produção

**Onde:** `dist/cliente/assets/index-C8_8RknB.js`, `dist/admin/assets/index-iTCdirdw.js`, `dist/kds/assets/index-BQIB6ZKV.js`, `dist/kiosk/assets/index-DEj86ei7.js`

**O que vazou (VALORES REAIS, extraídos dos bundles minificados):**

| App | Variável no bundle | Valor |
|-----|-------------------|-------|
| Cliente | `m5="..."` | `https://dproxlygtabihfhtxdvm.supabase.co` |
| Cliente | `lw="..."` | `sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ` |
| Admin | `Jw="..."` | `https://dproxlygtabihfhtxdvm.supabase.co` |
| Admin | `y$="..."` | `sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ` |
| KDS | `jk="..."` | `https://dproxlygtabihfhtxdvm.supabase.co` |
| KDS | `vS="..."` | `sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ` |
| Kiosk | `FO="..."` | `https://dproxlygtabihfhtxdvm.supabase.co` |
| Kiosk | `Qw="..."` | `sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ` |

**Explicação humana:**  
O Vite, em build time, substitui `import.meta.env.VITE_SUPABASE_ANON_KEY` por uma string literal no JavaScript minificado. Mesmo que o `.env` seja removido do repositório, os bundles de produção já contêm a chave embutida. Qualquer visitante do site pode abrir o DevTools → Network → clicar no bundle JS → Search → encontrar a chave.

**Como explorar:**  
Abrir o site em produção, ir em DevTools → Sources → abrir o arquivo `index-*.js` → pressionar Ctrl+F → procurar por `supabase.co` ou `sb_publishable`. A chave está lá como texto puro.

**Como corrigir:**
1. Rotacionar a chave no Supabase Dashboard.
2. NUNCA mais usar `VITE_` para secrets. A chave anônima do Supabase, embora chamada "publishable", não deve ser tratada como pública quando as RLS estão abertas.
3. Considerar usar uma edge function como proxy para todas as chamadas ao Supabase, ou implementar autenticação real com JWT.

---

### V03 — Moonshot AI Secret Key no .env.local (Prefixo VITE_)

**Onde:** `.env.local` (raiz do projeto), linha 3

**O que vazou (VALOR REAL):**
```
VITE_KIMI_API_KEY=sk-TYf4SbYZRos2ZEQQehmtP0HgLZrnYypLFcc0YfvdWmFOoPXf
```

**Explicação humana:**  
Esta é uma **secret key** (prefixo `sk-`) da API Moonshot AI (Kimi). O fato de ter prefixo `VITE_` significa que o Vite a injetará automaticamente em qualquer bundle que use `import.meta.env.VITE_KIMI_API_KEY`. Embora o componente `BugDetectorProvider.tsx` não seja atualmente importado no kiosk/admin, se algum desenvolvedor futuro importá-lo, a secret key será automaticamente embutida no bundle público. Além disso, o `.env.local` pode ser commitado acidentalmente.

**Como explorar:**  
Se a chave for extraída do bundle (ou do repo), qualquer pessoa pode fazer chamadas à API Moonshot em nome do projeto:
```bash
curl https://api.moonshot.ai/v1/chat/completions \
  -H "Authorization: Bearer sk-TYf4SbYZRos2ZEQQehmtP0HgLZrnYypLFcc0YfvdWmFOoPXf" \
  -H "Content-Type: application/json" \
  -d '{"model":"kimi-k2.5","messages":[{"role":"user","content":"hello"}]}'
```

**Como corrigir:**
1. **Revogar imediatamente** esta chave no dashboard da Moonshot AI.
2. NUNCA usar prefixo `VITE_` para secrets. Mover chamadas à API Kimi para uma **edge function** do Supabase.
3. Se precisar no frontend (não recomendado), usar uma chave de **limitação de escopo** com rate limiting.

---

### V04 — Tabelas payment_transactions e receipts SEM RLS

**Onde:** `supabase/migration-payment-v2.sql` (linhas 26-48, 184-185)

**O que foi encontrado:**
```sql
-- TABELAS CRIADAS SEM RLS
CREATE TABLE IF NOT EXISTS public.payment_transactions (...);
CREATE TABLE IF NOT EXISTS public.receipts (...);

-- GRANTS (mas sem RLS, os GRANTS são irrelevantes para SELECT)
GRANT SELECT, INSERT ON public.payment_transactions TO anon, authenticated;
GRANT SELECT, INSERT ON public.receipts TO anon, authenticated;
```

**O que FALTA:**
```sql
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY ... ON public.payment_transactions ...;
CREATE POLICY ... ON public.receipts ...;
```

**Explicação humana:**  
Quando RLS está DESABILITADO em uma tabela, qualquer usuário com acesso ao banco (incluindo anônimos via anon key) pode fazer **SELECT, INSERT, UPDATE, DELETE** livremente, independentemente dos GRANTs. As tabelas `payment_transactions` (contém IDs de transação Stripe, valores, status) e `receipts` (contém emails de clientes, status de envio) estão completamente desprotegidas.

**Como explorar:**
```bash
curl -H "apikey: sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ" \
     -H "Authorization: Bearer sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ" \
     https://dproxlygtabihfhtxdvm.supabase.co/rest/v1/payment_transactions
```

**Como corrigir:**
1. Adicionar `ENABLE ROW LEVEL SECURITY` em ambas as tabelas.
2. Criar policies restritivas (ex: `using (auth.uid() = user_id)` ou similar).

---

### V05 — RLS Policies Permitem Acesso Total a Anon em TODAS as Tabelas

**Onde:** `supabase/schema-clean.sql` (linhas 188-228), `supabase/schema-expanded.sql` (linhas 190-252)

**O que foi encontrado (policies para `anon, authenticated` com `using (true)`):**
```sql
create policy customers_read    on public.customers    for select to anon, authenticated using (true);
create policy customers_insert  on public.customers    for insert to anon, authenticated with check (true);
create policy customers_update  on public.customers    for update to anon, authenticated using (true);
create policy orders_read       on public.orders       for select to anon, authenticated using (true);
create policy orders_insert     on public.orders       for insert to anon, authenticated with check (true);
create policy order_items_read  on public.order_items  for select to anon, authenticated using (true);
create policy order_items_insert on public.order_items for insert to anon, authenticated with check (true);
create policy kiosk_codes_read  on public.kiosk_codes  for select to anon, authenticated using (true);
create policy kiosk_codes_insert on public.kiosk_codes for insert to anon, authenticated with check (true);
create policy kiosk_codes_update on public.kiosk_codes for update to anon, authenticated using (true);
-- (e mais: products, flavors, toppings, store_settings, inventory_log...)
```

**Explicação humana:**  
A expressão `using (true)` significa "SEMPRE permitir". Qualquer pessoa na internet, sem login, pode:
- Ler **todos** os clientes (nomes, emails, telefones, alergias)
- Ler **todos** os pedidos (histórico completo de vendas)
- Inserir pedidos falsos
- Inserir clientes falsos
- **Atualizar qualquer registro de cliente** (`customers_update` sem restrição)
- Ler e atualizar códigos de kiosk

**Como explorar:**
```bash
# Ler TODOS os clientes e seus dados pessoais
curl -H "apikey: sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ" \
     -H "Authorization: Bearer sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ" \
     https://dproxlygtabihfhtxdvm.supabase.co/rest/v1/customers

# Atualizar um cliente aleatório
curl -X PATCH \
     -H "apikey: sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ" \
     -H "Authorization: Bearer sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ" \
     -H "Content-Type: application/json" \
     -H "Prefer: return=representation" \
     -d '{"nome":"HACKED"}' \
     "https://dproxlygtabihfhtxdvm.supabase.co/rest/v1/customers?id=eq.<uuid>"
```

**Como corrigir:**
1. Implementar autenticação real (Supabase Auth com OTP por telefone).
2. Substituir TODAS as policies `using (true)` por restrições baseadas em `auth.uid()`.
3. No mínimo, **remover `anon` de todas as policies** deixando apenas `authenticated`.

---

### V06 — RPCs Administrativas Grantadas a Anon

**Onde:** `supabase/schema-clean.sql` (linhas 934-945), `supabase/migration-payment-v2.sql` (linhas 186-189)

**O que foi encontrado:**
```sql
grant execute on function public.create_order(jsonb, text, jsonb) to anon, authenticated;
grant execute on function public.create_demo_order(jsonb, text, jsonb) to anon, authenticated;
grant execute on function public.update_order_status(uuid, text) to anon, authenticated;
grant execute on function public.adjust_flavor_stock(text, numeric) to anon, authenticated;
grant execute on function public.set_flavor_availability(text, boolean) to anon, authenticated;
grant execute on function public.upsert_store_settings(jsonb) to anon, authenticated;
grant execute on function public.reset_demo_data() to anon, authenticated;
grant execute on function public.update_product_stock(text, boolean) to anon, authenticated;
grant execute on function public.upsert_customer(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.debit_flavor_stock(text, numeric, uuid, text) to anon, authenticated;
grant execute on function public.calculate_flavor_consumption(text, integer) to anon, authenticated;
grant execute on function public.create_order_v2(...) to anon, authenticated;
grant execute on function public.confirm_order_payment(uuid, text, text, text) to anon, authenticated;
grant execute on function public.reject_order_payment(uuid, text) to anon, authenticated;
grant execute on function public.register_receipt(uuid, text, text) to anon, authenticated;
```

**Explicação humana:**  
Qualquer pessoa na internet pode chamar estas funções RPC diretamente via PostgREST. Isso inclui:
- **`reset_demo_data()`** — apaga TODOS os dados da demo (inventory_log, order_items, orders, customers, products, categories, flavors, toppings, store_settings)
- **`update_order_status(uuid, text)`** — altera o status de qualquer pedido (ex: marcar como "listo" sem o pedido ter sido preparado)
- **`upsert_store_settings(jsonb)`** — altera configurações da loja incluindo NIF, endereço, nome
- **`confirm_order_payment(uuid, text, text, text)`** — confirma pagamentos falsos

**Como explorar:**
```bash
# Resetar TODOS os dados da demo
curl -X POST \
     -H "apikey: sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ" \
     -H "Authorization: Bearer sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ" \
     -H "Content-Type: application/json" \
     -d '{}' \
     https://dproxlygtabihfhtxdvm.supabase.co/rest/v1/rpc/reset_demo_data
```

**Como corrigir:**
1. **Revogar TODOS os grants para `anon`**.
2. Deixar apenas `authenticated` ou criar uma role `admin`.
3. Dentro das funções, verificar `auth.uid()` e roles antes de executar operações sensíveis.

---

### V07 — Edge Function create-payment-intent Sem Autenticação

**Onde:** `supabase/functions/create-payment-intent/index.ts`

**O que foi encontrado:**
```typescript
const { amount, currency = 'eur', description, customerEmail, metadata } = await req.json();

if (!amount || amount <= 0) {
  return new Response(JSON.stringify({ error: 'Amount required' }), { status: 400, ... });
}

const paymentIntent = await stripe.paymentIntents.create({
  amount, currency, description, receipt_email: customerEmail, metadata, ...
});
```

**Explicação humana:**  
Qualquer pessoa na internet pode fazer POST para esta edge function e criar PaymentIntents na conta Stripe do projeto. Não há:
- Verificação de autenticação (nenhum header Authorization é checado)
- Rate limiting
- Validação de `amount` máximo (aceita qualquer valor > 0)
- Validação de `currency`

Isso pode ser usado para:
- Testar cartões de crédito (carding)
- Gerar custos na conta Stripe
- Abusar da cota da API Stripe

**Como explorar:**
```bash
curl -X POST \
     -H "Content-Type: application/json" \
     -d '{"amount":999999,"currency":"eur","description":"HACK"}' \
     https://dproxlygtabihfhtxdvm.supabase.co/functions/v1/create-payment-intent
```

**Como corrigir:**
1. Adicionar verificação de `Authorization` header com JWT do Supabase Auth.
2. Adicionar rate limiting (ex: max 5 requisições/minuto por IP).
3. Validar `amount` contra um valor máximo razoável.
4. Verificar se o pedido existe e pertence ao usuário autenticado.

---

### V08 — Senha de Admin Hardcoded no Código-Fonte

**Onde:** `apps/admin/src/pages/LoginScreen.tsx`, linhas 13 e 76

**O que foi encontrado:**
```typescript
const handleLogin = () => {
  if (password === '123456') {
    setAdminLogged(true);
  }
};

// Na própria UI:
<p className="text-center text-gray-400 text-xs mt-6">Demo: {t('password', locale)} 123456</p>
```

**Explicação humana:**  
A senha do painel administrativo é literalmente `123456`. Ela aparece não só no código, mas também **na própria interface de login** como texto de ajuda. Qualquer pessoa que acesse a URL do admin vê a senha na tela.

**Como explorar:**  
1. Acessar a URL do app admin.  
2. Ler a senha na tela de login.  
3. Digitar `123456`.  
4. Acesso total ao painel.

**Como corrigir:**
1. Implementar autenticação real (Supabase Auth com email/senha ou OTP).
2. NUNCA hardcodear senhas.
3. Remover o texto de ajuda da UI.

---

### V09 — Autenticação Admin Puramente Client-Side

**Onde:** `apps/admin/src/AdminApp.tsx` (linhas 69, 74), `packages/shared/src/stores/useStore.ts` (linhas 198-199)

**O que foi encontrado:**
```typescript
// AdminApp.tsx
const { isAdminLogged } = useStore();
if (!isAdminLogged) return <LoginScreen />;

// useStore.ts
isAdminLogged: false,
setAdminLogged: (isAdminLogged) => set({ isAdminLogged }),
```

**Explicação humana:**  
Mesmo que a senha fosse removida, a autenticação continua vulnerável porque `isAdminLogged` é apenas um **boolean no estado do Zustand**. Um atacante pode abrir o DevTools do navegador e executar:
```javascript
useStore.setState({ isAdminLogged: true })
```
Isso burla completamente o login. Não há token JWT, sessão server-side, cookie HttpOnly, ou qualquer validação server-side.

**Como explorar:**
1. Abrir o app admin.
2. Abrir DevTools (F12).
3. Ir em Console.
4. Digitar: `useStore.setState({ isAdminLogged: true })`
5. O painel admin aparece instantaneamente.

**Como corrigir:**
1. Migrar para Supabase Auth com JWT.
2. Verificar a sessão no server-side (edge function) antes de retornar dados sensíveis.
3. Usar cookies `HttpOnly` para armazenar tokens.

---

### V10 — KDS (Kitchen Display) Completamente Aberto

**Onde:** `apps/kds/src/KDSApp.tsx`

**O que foi encontrado:**  
O app de cozinha (KDS) não possui **NENHUM** mecanismo de login, PIN, token, ou qualquer forma de autenticação. É um SPA React que se conecta diretamente ao Supabase via realtime e lê todos os pedidos.

**Explicação humana:**  
Qualquer pessoa com a URL do KDS (ex: `https://kds-tpv.vercel.app`) pode visualizar em tempo real:
- Todos os pedidos ativos
- Nomes e telefones dos clientes
- Itens de cada pedido
- Status de preparação
- Totais de vendas

Isso expõe completamente a operação da loja para qualquer pessoa que descubra ou adivinhe a URL.

**Como explorar:**  
Acessar a URL pública do KDS. Nenhum login é necessário.

**Como corrigir:**
1. Adicionar autenticação mínima (ex: PIN compartilhado validado contra edge function).
2. Ou implementar Supabase Auth com role `staff`/`kitchen`.

---

### V11 — VAPID Public Key Hardcoded no vercel.json do Cliente

**Onde:** `apps/cliente/vercel.json`, linha 12

**O que vazou (VALOR REAL):**
```json
"VITE_WEB_PUSH_PUBLIC_KEY": "BGlt6kHZ9ReemyWQqwYpjhtsdm_O0D_jdKzXyhBB7uctpuDoJxqtH1waCIwKNEqBC5uiFF_6x_3HM-DE7O_izmA"
```

**Explicação humana:**  
A chave pública VAPID para Web Push está hardcoded no `vercel.json`. Embora VAPID public keys sejam tecnicamente públicas (por design), a prática de hardcodear em arquivo versionado dificulta a rotação e expõe a configuração de push do projeto. O par `public/private` está configurado nas edge functions via variáveis de ambiente, mas a public key no frontend vincula o projeto a um par específico.

**Como corrigir:**
1. Mover para variáveis de ambiente do Vercel Dashboard.
2. Considerar rotacionar o par VAPID se houver preocupação com abuso de push.

---

## 🟠 ALTO — VULNERABILIDADES

---

### V12 — PII Persistido em localStorage via Zustand

**Onde:** `packages/shared/src/stores/useStore.ts`, linhas 229-237

**O que foi encontrado:**
```typescript
{
  name: 'tpv-sorveteria-storage',
  partialize: (state) => ({
    locale: state.locale,
    perfilUsuario: state.perfilUsuario,
  }),
}
```

**O que contém `perfilUsuario`:**
```typescript
interface PerfilUsuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  temAlergias: boolean;
  alergias: Alergeno[];  // dados de SAÚDE
}
```

**Explicação humana:**  
O perfil do usuário (incluindo **dados de saúde — alergias alimentares**) é salvo no `localStorage` do navegador como JSON plano, sem criptografia. Em um kiosk público, o próximo cliente pode inspecionar o localStorage e ver os dados do cliente anterior. Em caso de XSS, qualquer script malicioso pode ler esses dados.

**Como explorar:**
1. Abrir DevTools → Application → Local Storage.
2. Procurar pela chave `tpv-sorveteria-storage`.
3. O valor JSON contém nome, email, telefone e alergias.

**Como corrigir:**
1. **Não persistir** `perfilUsuario` em kiosk/cliente público. Usar `sessionStorage` ou memória volátil.
2. Se persistência for necessária, criptografar com `secure-ls` ou AES antes de salvar.

---

### V13 — Auth Mock Armazena Usuários em localStorage

**Onde:** `packages/shared/src/lib/authMock.ts`, linhas 16-31

**O que foi encontrado:**
```typescript
const USERS_KEY = 'tpv-auth-users';

function getUsers(): PerfilUsuario[] {
  const raw = localStorage.getItem(USERS_KEY);
  return JSON.parse(raw) as PerfilUsuario[];
}

function saveUsers(users: PerfilUsuario[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
```

**Explicação humana:**  
O "banco de dados" de usuários é simplesmente um array JSON no `localStorage`. Todos os perfis (nomes, emails, telefones, alergias) ficam armazenados sem criptografia. Um atacante com acesso físico ao dispositivo ou via XSS pode ler, modificar ou excluir todos os usuários.

**Como corrigir:**
1. Migrar para Supabase Auth (tabela `profiles` com RLS restritivo).
2. Remover completamente o `authMock`.

---

### V14 — Snapshot Completo do Estado em localStorage

**Onde:** `packages/shared/src/realtime/client.ts`, linhas 18, 40-58

**O que foi encontrado:**
```typescript
const STANDALONE_KEY = 'tpv-demo-standalone-state';

function saveStandaloneState(snapshot: DemoStateSnapshot) {
  localStorage.setItem(STANDALONE_KEY, JSON.stringify(snapshot));
}
```

**O que contém o snapshot:**
- Todas as categorias, produtos, sabores, toppings
- Todos os pedidos
- Histórico de vendas
- Configurações do estabelecimento

**Explicação humana:**  
Em modo standalone (quando não há conexão com Supabase), TODO o estado da aplicação é serializado e salvo no `localStorage`. Isso inclui dados comerciais sensíveis como histórico de vendas, faturamento e estoque.

**Como corrigir:**
1. Não persistir o snapshot completo em localStorage.
2. Se necessário, usar IndexedDB com criptografia.

---

### V15 — Dados de Cartão em Estado React sem Tokenização PCI

**Onde:** `apps/cliente/src/components/pagamento/PagamentoModal.tsx`, linhas 45-48, 354-404

**O que foi encontrado:**
```typescript
const [numero, setNumero] = useState('');
const [titular, setTitular] = useState('');
const [caducidad, setCaducidad] = useState('');
const [cvv, setCvv] = useState('');
```

**Explicação humana:**  
O formulário de cartão de crédito armazena número, titular, data de validade e CVV em estado React (`useState`). Isso significa que os dados ficam em memória do JavaScript e no DOM. **Não há tokenização via Stripe Elements** (`CardElement` ou `PaymentElement`). Para conformidade PCI-DSS, dados de cartão NUNCA devem tocar o estado da aplicação.

**Como corrigir:**
1. Substituir o formulário manual por **Stripe Elements** (`PaymentElement`).
2. Os dados de cartão nunca tocam o estado/DOM da aplicação — são gerenciados diretamente pelo iframe da Stripe.

---

### V16 — Console.error Expondo Erros Internos do Supabase

**Onde:** `packages/shared/src/realtime/client.ts`, linhas 192, 331, 539, 622, 637

**O que foi encontrado:**
```typescript
console.error('[fetchSupabaseSnapshot] Supabase query error:', err);
console.error('[RealtimeManager] refreshSnapshot failed:', err);
console.error('[createRemoteOrder] RPC error:', result.error);
console.error('[push] notify-order-ready fallback failed', error);
console.error('[push] notify-order-ready failed', error);
```

**Explicação humana:**  
Em produção, esses `console.error` expõem detalhes de falhas do backend, incluindo possíveis mensagens de erro do Postgres, nomes de funções RPC e estrutura interna da aplicação. Um atacante pode usar essas informações para mapear a superfície de ataque.

**Como corrigir:**
1. Configurar o build do Vite para remover `console.log/error/warn` em produção:
   ```typescript
   // vite.config.ts
   build: {
     minify: 'terser',
     terserOptions: {
       compress: {
         drop_console: true,
       },
     },
   }
   ```

---

### V17 — Funcionalidades Admin Expostas Sem Autorização Server-Side

**Onde:** `apps/admin/src/pages/ConfigPage.tsx`, `apps/admin/src/pages/ProdutosPage.tsx`, `apps/admin/src/pages/PedidosPage.tsx`

**O que foi encontrado:**
- Botão "Reiniciar Demo" chama `resetRemoteDemo()` — apaga TODOS os dados
- `updateRemoteSettings`, `updateRemoteFlavorAvailability`, `updateRemoteFlavorStock` — chamadas diretas ao Supabase
- `updateRemoteProductAvailability` — toggle de estoque sem autorização
- `handleExportCSV` — exporta CSV completo de pedidos client-side

**Explicação humana:**  
Todas as operações administrativas são chamadas diretamente do frontend para o Supabase. Como a anon key é pública (V01/V02) e as RPCs estão abertas (V06), um atacante pode chamar as mesmas funções diretamente via curl, mesmo sem acessar o painel admin.

**Como corrigir:**
1. Mover operações administrativas para **edge functions** que verificam autenticação e role.
2. Usar Supabase Auth com roles (`admin`, `staff`).
3. Revisar RLS para bloquear operações administrativas para anon.

---

### V18 — CORS `*` em Todas as Edge Functions

**Onde:** Todos os arquivos em `supabase/functions/*/index.ts`

**O que foi encontrado:**
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

**Arquivos afetados:**
- `supabase/functions/create-payment-intent/index.ts`
- `supabase/functions/send-receipt/index.ts`
- `supabase/functions/notify-order-ready/index.ts`
- `supabase/functions/register-push-subscription/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

**Explicação humana:**  
O cabeçalho `Access-Control-Allow-Origin: *` permite que qualquer site na internet faça requisições para estas edge functions. Isso facilita ataques CSRF cross-origin. Embora algumas funções exijam POST/JSON, o `create-payment-intent` e `send-receipt` são especialmente vulneráveis a abuso.

**Como corrigir:**
1. Restringir `Access-Control-Allow-Origin` para os domínios específicos dos apps:
   ```typescript
   const ALLOWED_ORIGINS = ['https://cliente-tpv.vercel.app', 'https://kiosk-tpv.vercel.app'];
   ```

---

### V19 — Edge Function send-receipt Sem Verificação de Propriedade

**Onde:** `supabase/functions/send-receipt/index.ts`, linhas 21-34

**O que foi encontrado:**
```typescript
const { orderId, email, orderNumber, total } = await req.json();

const { data: order, error: orderError } = await supabase
  .from('orders')
  .select('*, order_items(*)')
  .eq('id', orderId)
  .single();
```

**Explicação humana:**  
A função não valida se o chamador é o dono do pedido ou um admin autorizado. Qualquer pessoa pode enviar um `orderId` arbitrário e obter os detalhes completos do pedido (incluindo itens) via a resposta HTML do comprovante. Além disso, pode registrar comprovantes em pedidos de terceiros.

**Como corrigir:**
1. Verificar o `Authorization` header e validar que o `auth.uid()` corresponde ao `customer_id` do pedido.
2. Ou verificar se o chamador tem role `admin`.

---

### V20 — Kiosk Sem Autenticação — Acesso Público Ilimitado

**Onde:** Todo o app `apps/kiosk/src/`

**Explicação humana:**  
O kiosk é um app de acesso físico/público, mas não há nenhum mecanismo de bloqueio, PIN de funcionário, ou rate-limiting. Qualquer pessoa pode:
- Criar pedidos ilimitados
- Explorar o catálogo
- Navegar por todas as telas
- Potencialmente abusar do sistema (ex: criar milhares de pedidos falsos)

**Como corrigir:**
1. Implementar rate-limiting no Supabase (ex: via edge function ou RLS).
2. Adicionar PIN de funcionário para ativar o kiosk.
3. Implementar timeout de sessão após inatividade.

---

## 🟡 MÉDIO — VULNERABILIDADES

---

### V21 — Console.log/warn com Dados em CarrinhoPage

**Onde:** `apps/cliente/src/pages/CarrinhoPage.tsx`, linhas 119, 134, 177

**O que foi encontrado:**
```typescript
console.warn('[push] unable to sync after checkout', error);
console.error('[CarrinhoPage] Erro ao criar pedido:', err);
console.log('[Printer] Imprimindo comprovante #', ultimoPedido.numero);
```

**Explicação humana:**  
Logs de console em produção expõem informações operacionais e possíveis erros internos.

**Como corrigir:**  
Usar `drop_console: true` no build do Vite.

---

### V22 — Service Worker Sem Validação de Origem do Push

**Onde:** `public/sw-cliente.js` / `dist/*/sw-cliente.js`

**O que foi encontrado:**
```javascript
self.addEventListener('push', (event) => {
  let payload = event.data ? event.data.json() : {};
  const title = payload.title || 'Tropicale';
  const options = { body: payload.body || 'Seu pedido foi atualizado.', ... };
  event.waitUntil(self.registration.showNotification(title, options));
});
```

**Explicação humana:**  
O Service Worker exibe notificações push sem validar a origem ou assinatura do payload. Se a chave VAPID for comprometida, um atacante poderia enviar notificações push maliciosas.

**Como corrigir:**
1. Validar a assinatura do push no client antes de exibir.
2. Sanitizar o payload da notificação.

---

### V23 — Auth do Supabase Desativado

**Onde:** `packages/shared/src/supabase/client.ts`, linhas 11-14

**O que foi encontrado:**
```typescript
auth: {
  persistSession: false,
  autoRefreshToken: false,
},
```

**Explicação humana:**  
O sistema **não utiliza autenticação real do Supabase Auth**. A "autenticação" é mockada (`loginByPhone` usa `authMock`). Isso significa que não há `auth.uid()` para restringir policies, e todo o modelo de segurança baseado em RLS colapsa.

**Como corrigir:**
1. Habilitar `persistSession: true` e implementar Supabase Auth com OTP por telefone ou Magic Link.

---

### V24 — Mock de Cartão de Crédito Exposto

**Onde:** `apps/kiosk/src/screens/PagamentoScreen.tsx`, linha 89

**O que foi encontrado:**
```typescript
// Mock UI
<p>**** **** **** 4242</p>
<p>CLIENTE SABADELL</p>
```

**Explicação humana:**  
É apenas UI mock, mas a string `4242` (número de cartão de teste Stripe) e `CLIENTE SABADELL` aparecem no bundle de produção e podem ser identificados por scanners de dados sensíveis.

**Como corrigir:**  
Remover strings de dados mock de produção ou usar variáveis de ambiente.

---

### V25 — Código de Desconto Hardcoded

**Onde:** `packages/shared/src/utils/pricing.ts`, linha 3

**O que foi encontrado:**
```typescript
export const DEMO_PROMO_CODE = 'SABADELL20';
export const DEMO_PROMO_RATE = 0.2;
```

**Explicação humana:**  
O código de promoção e a taxa de desconto são públicos no código-fonte e no bundle. Qualquer pessoa pode aplicar o desconto sem autorização.

**Como corrigir:**  
Mover para variável de ambiente ou validar no backend.

---

### V26 — QR Code de Pagamento Estático

**Onde:** `apps/kiosk/src/screens/PagamentoScreen.tsx`, linha 136

**O que foi encontrado:**
```typescript
const qrValue = 'PAGO-EFECTIVO-KIOSK';
```

**Explicação humana:**  
QR estático não representa risco direto de segurança, mas revela a estrutura interna de identificação de pagamentos.

**Como corrigir:**  
Gerar QR dinâmico com ID único do pedido.

---

### V27 — Build Artifacts com Prompts Internos Expostos

**Onde:** `dist/cliente/assets/img/creador de prompt tarina y conos.html`, `dist/cliente/assets/img/dashboard-prompt-gemini.html`

**Explicação humana:**  
Arquivos HTML com prompts internos de geração de imagem foram incluídos acidentalmente no build público. Isso vaza informações sobre o processo interno de desenvolvimento.

**Como corrigir:**  
Remover da pasta `public/` ou excluir do build via `vite.config.ts`.

---

### V28 — Deploy Scripts Sem Sanitização de dist/

**Onde:** `scripts/deploy-all.mjs` (linhas 38-56), `scripts/deploy-app.mjs` (linhas 31-48)

**Explicação humana:**  
Os scripts de deploy não limpam arquivos sensíveis (`.env`, `*.map`, logs) antes de fazer o deploy. Se um `.env` for acidentalmente copiado para `dist/`, será deployado para a Vercel.

**Como corrigir:**  
Adicionar etapa de limpeza no script de deploy:
```javascript
// Antes do deploy
await $`rm -f dist/${app}/.env* dist/${app}/**/*.map`;
```

---

## 🟢 BAIXO — VULNERABILIDADES

---

### V29 — Dependência @auris/bug-detector via Tarball Sem Hash

**Onde:** `package.json`

**O que foi encontrado:**
```json
"@auris/bug-detector": "file:auris-bug-detector.tgz"
```

**Explicação humana:**  
Dependência instalada via tarball local sem hash/integridade verificável no lockfile. Não há garantia de que o conteúdo do tarball não foi modificado.

**Como corrigir:**  
Publicar o pacote em registry privado ou adicionar verificação de hash.

---

### V30 — Ausência de Content Security Policy (CSP)

**Onde:** `apps/*/index.html` (todos os 4 apps)

**Explicação humana:**  
Nenhum dos apps possui a meta tag CSP. Isso permite que scripts de qualquer origem sejam executados, facilitando ataques XSS.

**Como corrigir:**  
Adicionar ao `<head>` de cada `index.html`:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https://dproxlygtabihfhtxdvm.supabase.co https://api.stripe.com;">
```

---

### V31 — loginByPhone Usa require() Dinâmico

**Onde:** `packages/shared/src/stores/useStore.ts`, linhas 220-227

**O que foi encontrado:**
```typescript
loginByPhone: (telefone: string) => {
  const { findUserByPhone } = require('../lib/authMock');
  const user = findUserByPhone(telefone);
  ...
}
```

**Explicação humana:**  
O uso de `require()` dinâmico é um anti-padrão que pode ser interceptado ou bypassado em certos ambientes.

**Como corrigir:**  
Usar import estático ou migrar para Supabase Auth.

---

### V32 — Registro Sem Verificação de Email/Telefone

**Onde:** `apps/cliente/src/components/onboarding/QuickRegister.tsx`, linhas 124-206

**Explicação humana:**  
O registro de novos usuários cria um perfil local com `crypto.randomUUID()` e sincroniza com Supabase sem verificar se o email ou telefone pertencem ao usuário.

**Como corrigir:**  
Implementar verificação por OTP (SMS) ou Magic Link (email).

---

### V33 — vite-plugin-pwa Presente Mas Não Configurado

**Onde:** `package.json` (devDependencies)

**Explicação humana:**  
O plugin PWA está instalado mas não configurado nos `vite.config.ts`, resultando em um Service Worker básico sem estratégias de cache otimizadas.

**Como corrigir:**  
Configurar o plugin ou remover se não for usar.

---

## ℹ️ INFORMATIVO

---

### V34 — Web Push VAPID Public Key no Bundle (Público por Design)

**Onde:** `apps/cliente/src/lib/pushNotifications.ts`, linha 13

**Explicação humana:**  
A VAPID public key é tecnicamente pública por design do protocolo Web Push. No entanto, é exposta no bundle via `import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY`. Não é uma vulnerabilidade em si, mas deve ser monitorada.

---

### V35 — .env.local Está no .gitignore (BOM)

**Onde:** `.gitignore` (raiz)

**O que foi encontrado:**
```
.env
.env.local
.env.*.local
```

**Explicação humana:**  
O `.gitignore` corretamente exclui arquivos `.env`. No entanto, o arquivo `.env.local` **existe fisicamente no repositório** (foi encontrado durante a auditoria). Isso sugere que foi commitado antes do `.gitignore` ser configurado, ou foi adicionado com `git add -f`.

**Como corrigir:**
```bash
git rm --cached .env.local
git commit -m "Remove .env.local from repository"
```

---

## 🛠️ PLANO DE REMEDIAÇÃO

### Fase 1 — IMEDIATA (0-24 horas)

| # | Ação | Responsável |
|---|------|-------------|
| 1.1 | **Rotacionar a `VITE_SUPABASE_ANON_KEY`** no Supabase Dashboard | Admin Supabase |
| 1.2 | **Revogar a `VITE_KIMI_API_KEY`** no dashboard Moonshot AI | Admin Moonshot |
| 1.3 | **Remover `.env.local` do repositório** (`git rm --cached`) | Dev |
| 1.4 | **Remover chaves dos 4 arquivos `vercel.json`** | Dev |
| 1.5 | **Configurar variáveis de ambiente no Vercel Dashboard** (nunca no repo) | Dev |
| 1.6 | **Não fazer novo deploy** até que as correções de Fase 2 estejam prontas | Dev |

### Fase 2 — CURTO PRAZO (1-3 dias)

| # | Ação | Detalhes |
|---|------|----------|
| 2.1 | **Habilitar RLS** em `payment_transactions` e `receipts` | `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` |
| 2.2 | **Revogar grants de `anon`** em TODAS as RPCs administrativas | `REVOKE EXECUTE ON FUNCTION ... FROM anon;` |
| 2.3 | **Restringir policies** de `using (true)` para baseadas em `auth.uid()` | Ou no mínimo remover `anon` |
| 2.4 | **Adicionar autenticação** à edge function `create-payment-intent` | Verificar JWT + rate limiting |
| 2.5 | **Adicionar verificação de propriedade** à `send-receipt` | Validar `auth.uid()` vs `customer_id` |
| 2.6 | **Restringir CORS** nas edge functions para domínios específicos | Remover `*` |
| 2.7 | **Regerar todos os bundles** (`npm run build` para todos os apps) | Invalidar bundles com chaves antigas |
| 2.8 | **Re-deploy** após rebuild | Vercel |

### Fase 3 — MÉDIO PRAZO (1-2 semanas)

| # | Ação | Detalhes |
|---|------|----------|
| 3.1 | **Implementar Supabase Auth** com OTP por telefone | Substituir `authMock` |
| 3.2 | **Migrar autenticação admin** para server-side (JWT + roles) | `isAdminLogged` → `supabase.auth.getSession()` |
| 3.3 | **Adicionar PIN/Auth ao KDS** | Edge function ou role `staff` |
| 3.4 | **Tokenização PCI** com Stripe Elements | Substituir formulário manual |
| 3.5 | **Criptografar localStorage** | `secure-ls` ou AES para PII |
| 3.6 | **Remover console logs** de produção | `drop_console: true` no Vite |
| 3.7 | **Adicionar CSP** em todos os `index.html` | Meta tag com origens restritas |
| 3.8 | **Mover chamadas Kimi API** para edge function | Nunca expor `sk-` no frontend |
| 3.9 | **Sanitizar scripts de deploy** | Limpar `.env` e `.map` antes do deploy |
| 3.10 | **Auditoria de dependências** | Verificar `@auris/bug-detector` |

### Fase 4 — LONGO PRAZO (Contínuo)

| # | Ação | Detalhes |
|---|------|----------|
| 4.1 | **Implementar rate limiting** no Supabase/API | Prevenir abuso de endpoints públicos |
| 4.2 | **Monitoramento de segurança** | Logs de acesso anômalos |
| 4.3 | **Pentest periódico** | Re-auditar a cada grande release |
| 4.4 | **Treinamento de equipe** | Segurança de credenciais e OWASP Top 10 |

---

## 📎 ANEXOS

### A. Chaves e Secrets Comprometidas

| Secret | Valor | Onde foi encontrado | Ação necessária |
|--------|-------|--------------------|-----------------|
| Supabase Anon Key | `sb_publishable_k8YlmjNQ-f5NmnEjR5oLuQ_XWEbyJkJ` | 4 vercel.json + 4 bundles + .env.local | **ROTACIONAR** |
| Supabase URL | `https://dproxlygtabihfhtxdvm.supabase.co` | 4 vercel.json + 4 bundles + .env.local | Endereço público |
| Moonshot AI Secret | `sk-TYf4SbYZRos2ZEQQehmtP0HgLZrnYypLFcc0YfvdWmFOoPXf` | .env.local | **REVOCAR** |
| VAPID Public Key | `BGlt6kHZ9ReemyWQqwYpjhtsdm_O0D_jdKzXyhBB7uctpuDoJxqtH1waCIwKNEqBC5uiFF_6x_3HM-DE7O_izmA` | apps/cliente/vercel.json | Considerar rotacionar |
| Admin Password | `123456` | LoginScreen.tsx (código + UI) | **Remover** |
| Promo Code | `SABADELL20` | pricing.ts (hardcoded) | Mover para backend |

### B. Comando para Verificar RLS no Supabase

```sql
-- Listar tabelas sem RLS
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND NOT EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = tablename AND c.relrowsecurity = true
  );

-- Listar policies permissivas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND qual::text = 'true';
```

### C. Referências

- [OWASP Top 10 2021](https://owasp.org/Top10/)
- [Supabase RLS Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [PCI-DSS Requirements](https://www.pcisecuritystandards.org/pci_security/maintaining_payment_security)
- [CSP Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

*Relatório gerado automaticamente pela .brain system — Auditoria de Segurança TPV Sorveteria*  
*Versão: 1.0 — 2026-04-26*
