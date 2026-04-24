# 🔥 Plano Reforma Total — TPV Sorveteria Demo

> **Data:** 2026-04-23  
> **Status:** CRÍTICO — Schema cache do PostgREST corrompido  
> **Decisão:** Recriar projeto Supabase do zero (solução oficial da comunidade)

---

## 🏥 Diagnóstico Final

### O que aconteceu
O projeto Supabase `jmvikjujftidgcezmlfc` desenvolveu um **bug crítico no cache do PostgREST**:

- Funções SQL são executadas com "Success" no SQL Editor
- Mas o PostgREST retorna **404** para TODAS as RPCs (exceto `reset_demo_data` que já existia)
- `test_hello` (criada anteriormente) funciona → prova que o PostgREST está vivo
- `update_order_status` (executada agora) não aparece → prova que o cache não atualiza

### Por que aconteceu
Bug conhecido da Supabase (issues #42183, #39063, #35906, #36902):
> "PostgREST schema cache does not update when new columns/tables/functions are created. The cache persists stale information despite all documented refresh methods."

Tentativas que FALHARAM:
- ✅ `NOTIFY pgrst, 'reload schema'`
- ✅ `SELECT pg_notification_queue_usage()`
- ✅ Pausar/retomar projeto (feito anteriormente)
- ✅ Recriar funções individualmente
- ✅ Aguardar 15+ minutos

### Solução da comunidade
A única solução confiável reportada por dezenas de devs: **criar um novo projeto Supabase**.
> "Can someone from Supabase reset or rebuild the PostgREST metadata cache for this project? This is blocking my app's functionality."
> — Resposta: criar novo projeto é mais rápido que esperar suporte.

---

## 🎯 Objetivo

Recriar o backend Supabase do zero, aplicar o schema completo, e voltar a enviar pedidos em produção.

---

## 📋 Checklist de Execução

### FASE 1 — Preparação (5 min)

- [ ] **1.1** Verificar se há dados importantes no banco atual
  - Acessar: https://supabase.com/dashboard/project/jmvikjujftidgcezmlfc/editor
  - Verificar tabelas: `orders`, `customers`, `products`
  - Se houver pedidos reais → exportar (provavelmente não há, é demo)
  
- [ ] **1.2** Salvar credenciais atuais (para referência)
  - URL: `https://jmvikjujftidgcezmlfc.supabase.co`
  - Anon Key: `sb_publishable_oSg8rtPqfJnPCrl_Axw-_g_rRvugcnV`
  - (A nova URL e key serão diferentes)

### FASE 2 — Criar Novo Projeto (5 min)

- [ ] **2.1** Acessar https://supabase.com/dashboard
- [ ] **2.2** Clicar em "New Project"
- [ ] **2.3** Preencher:
  - **Organization:** Jhin1v9's Org (ou criar nova)
  - **Project name:** `sorveteria-tpv-prod` (ou nome que preferir)
  - **Database Password:** [CRIAR SENHA FORTE — SALVAR EM LUGAR SEGURO]
  - **Region:** West Europe (Ireland) — ou mais próximo dos usuários
- [ ] **2.4** Aguardar criação (1-2 minutos)

### FASE 3 — Aplicar Schema Completo (10 min)

- [ ] **3.1** No novo projeto, ir em **SQL Editor** → **New query**
- [ ] **3.2** Abrir o arquivo: `supabase/schema-expanded.sql`
- [ ] **3.3** **COPIAR TUDO** e colar no editor
- [ ] **3.4** Clicar **Run** (aguardar — pode demorar ~30s)
- [ ] **3.5** Verificar se aparece "Success" (verde)
- [ ] **3.6** Se aparecer aviso de RLS para `kiosk_codes` → clicar **"Run without RLS"**

> ⚠️ **IMPORTANTE:** `schema-expanded.sql` contém TUDO — tabelas, funções, triggers, dados demo, RLS policies, realtime config. É auto-contido.

### FASE 4 — Atualizar Credenciais (2 min)

- [ ] **4.1** No novo projeto, ir em **Project Settings** → **API**
- [ ] **4.2** Copiar:
  - `URL` (ex: `https://xxxxx.supabase.co`)
  - `anon public` API Key (ex: `eyJ...`)
- [ ] **4.3** Abrir o arquivo `.env.local` na raiz do projeto
- [ ] **4.4** Substituir:
  ```env
  VITE_SUPABASE_URL=https://[NOVO-PROJETO].supabase.co
  VITE_SUPABASE_ANON_KEY=[NOVA-ANON-KEY]
  ```
- [ ] **4.5** Salvar `.env.local`

### FASE 5 — Build e Deploy (5 min)

- [ ] **5.1** No terminal, executar:
  ```bash
  npm run build:all
  ```
  ou individualmente:
  ```bash
  npm run build:cliente
  npm run build:kiosk
  npm run build:admin
  npm run build:kds
  ```

- [ ] **5.2** Deploy para Vercel:
  ```bash
  node scripts/deploy-all.mjs
  ```
  ou verificar se há pipeline de deploy automático no GitHub Actions

### FASE 6 — Validação (5 min)

- [ ] **6.1** Acessar o app Cliente na URL da Vercel
- [ ] **6.2** Abrir DevTools (F12) → aba Console
- [ ] **6.3** Verificar se não há erros de CORS
- [ ] **6.4** Adicionar um produto ao carrinho
- [ ] **6.5** Finalizar pedido (pode usar "efectivo")
- [ ] **6.6** Verificar se o pedido aparece no KDS (Kitchen Display System)

---

## 🔧 Arquivos que Precisam de Atenção

| Arquivo | O que fazer |
|---------|-------------|
| `.env.local` | Atualizar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` |
| `.env.example` | Atualizar também (para documentação) |
| `supabase/config.toml` | Se houver `project_id`, atualizar |
| `apps/*/src/lib/supabase.ts` (se existir) | Verificar se usa env vars |

---

## 🛡️ Prevenção Futura

Para evitar que o cache do PostgREST corrompa novamente:

1. **Nunca execute scripts SQL gigantes** com múltiplas funções `$$` no SQL Editor
   - Dividir em arquivos menores (max 1 função por arquivo)
   - Ou usar `psql` CLI para scripts grandes

2. **Sempre testar RPCs imediatamente** após criar funções:
   ```bash
   curl -X POST https://[projeto].supabase.co/rest/v1/rpc/nome_funcao \
     -H "apikey: [anon-key]" \
     -H "Authorization: Bearer [anon-key]"
   ```

3. **Fazer backup do schema** regularmente:
   ```bash
   npx supabase db dump > backup.sql
   ```

4. **Se o cache travar novamente:**
   - Tentar: `SELECT pg_notification_queue_usage();`
   - Se falhar em 10 min: **criar novo projeto imediatamente** (não perder tempo)

---

## 📁 Arquivos de Referência no Projeto

- **Schema completo:** `supabase/schema-expanded.sql` ⭐ USE ESTE
- **Schema sem reset:** `supabase/schema-no-reset.sql` (alternativa)
- **Schema clean:** `supabase/schema-clean.sql` (alternativa)
- **Migrations:** `supabase/migration-kiosk-codes.sql`, `supabase/migration-payment-v2.sql`

---

## ❓ FAQ

**Q: Por que não abrir ticket no suporte da Supabase?**  
R: Leva 1-3 dias. Recriar o projeto leva 15 min. Como é um app demo, velocidade > esperar.

**Q: Vou perder os pedidos que já existem?**  
R: Verifique a tabela `orders` no banco atual. Se estiver vazia ou tiver apenas testes, não perde nada. Se tiver dados reais, exporte antes.

**Q: Preciso atualizar algo no código do app?**  
R: Apenas as variáveis de ambiente no `.env.local`. O código não muda.

**Q: E as Edge Functions (Stripe, etc.)?**  
R: Precisam ser deployadas no novo projeto também. Veja `supabase/functions/`.

---

## ✅ Quando Terminar

Me avise que eu:
1. Testo as RPCs via fetch
2. Valido o fluxo completo (cliente → pedido → KDS)
3. Atualizo o `.brain/context.md` com o novo projeto
4. Fechamos os bugs ativos

---

*Plano criado por: Kimi Code CLI (Personas: Architect + DevOps + Surgeon)*  
*Baseado em: issues #42183, #39063, #35906, #36902 do GitHub Supabase + docs oficiais*
