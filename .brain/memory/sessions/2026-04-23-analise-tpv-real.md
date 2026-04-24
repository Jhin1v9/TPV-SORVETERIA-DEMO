# 2026-04-23 — Análise: Integração com Máquina de Cartão (TPV) Real

**Tags:** #tpv #pagamento #integracao #hardware #analise #arquitetura

---

## 🎯 Resumo Executivo

O código **JÁ TEM** estrutura preparada para receber uma máquina de cartão (TPV/Terminal POS), mas a integração **NÃO ESTÁ IMPLEMENTADA**. O pagamento atual é 100% simulado (mock). Abaixo está o diagnóstico completo + roadmap de integração.

---

## 🔍 Estado Atual do Sistema de Pagamento

### 1. Fluxo de Pagamento (Cliente PWA)

```
[CarrinhoPage]
  → Usuário clica "Pagar agora"
  → Abre PagamentoModal
    → Coleta: número, titular, caducidad, CVV (cartão)
    → Coleta: telefone (Bizum)
    → Coleta: nada (efectivo)
  → Clica "Pagar"
  → handlePagamentoSubmit(data)
    → setShowProcessando(true)          ← animação TPV mock
    → await sleep(2500ms)               ← simula processamento
    → createRemoteOrder({
        cart: carrinho,
        metodoPago: data.metodo,         ← 'tarjeta' | 'bizum' | 'efectivo'
        checkout: {...}
      })
    → Pedido criado no Supabase
  → Confirmação com número do pedido
```

**Status:** O `data.tarjeta` (número, CVV, etc.) é coletado mas **NUNCA** é enviado ao backend. É apenas capturado e descartado.

### 2. Dados Coletados vs Enviados

| Dado | Coletado no Modal | Enviado ao Backend | Armazenado no DB |
|------|------------------|-------------------|-----------------|
| Número do cartão | ✅ Sim | ❌ Não | ❌ Não |
| Titular | ✅ Sim | ❌ Não | ❌ Não |
| Caducidad | ✅ Sim | ❌ Não | ❌ Não |
| CVV | ✅ Sim | ❌ Não | ❌ Não |
| Telefone Bizum | ✅ Sim | ✅ Sim (notificationPhone) | ✅ Sim (orders.customer_phone) |
| Método | ✅ Sim | ✅ Sim | ✅ Sim (orders.payment_method) |
| Total | ✅ Sim | ✅ Sim | ✅ Sim (orders.total) |

### 3. Estrutura TypeScript para Gateway Real

```typescript
// packages/shared/src/types/index.ts
interface ComprovantePagamento {
  estado: 'aprovado' | 'rejeitado' | 'pendente' | 'reembolsado';
  idTransacao?: string;           // ID da transação (Stripe, Redsys, etc.)
  dataProcessamento?: string;     // Data/hora
  mensagemErro?: string;          // Erro se rejeitado
  urlComprovante?: string;        // URL do comprovante PDF
  ultimos4Digitos?: string;       // **** 4242
  bandeiraCartao?: string;        // visa, mastercard
  gateway?: string;               // stripe, redsys, bizum, etc.
}
```

**Status:** O type existe mas **NÃO ESTÁ PERSISTIDO** no banco de dados. A coluna não existe na tabela `orders`.

---

## 🔌 Pontos de Integração para TPV Real

### Opção A: TPV Físico (datáfono com Android/SmartPOS)

**Exemplos:** Ingenico, Verifone, PAX, Sunmi, BBPOS

**Como funciona:**
```
[App Cliente PWA]
  → Seleciona "tarjeta"
  → Clica "Pagar"
  → Chama SDK/API do TPV via:
     - WebView Bridge (JavaScript ↔ Native)
     - Bluetooth LE
     - USB/Serial
     - Intent (Android)
     - TCP/IP local
  → TPV processa o cartão fisicamente
  → TPV retorna: { approved, transactionId, authCode }
  → App envia resultado ao Supabase
```

**Pontos de plug no código:**

1. **`CarrinhoPage.tsx` — linha 37-78**
   ```typescript
   const handlePagamentoSubmit = async (data: PagamentoData) => {
     // PLUG AQUI: detectar se TPV está conectado
     if (isTpvConnected()) {
       const result = await processTpvPayment({
         amount: total * 1.10,
         currency: 'EUR',
         description: `Pedido TPV - Heladeria`,
       });
       if (!result.approved) {
         toast.error('Pago rechazado por el TPV');
         return;
       }
       data.tpvTransactionId = result.transactionId;
     }
     // ... resto do fluxo
   };
   ```

2. **`PagamentoModal.tsx` — linha 56-73**
   ```typescript
   const handleSubmit = () => {
     if (!validate()) return;
     // PLUG AQUI: se TPV conectado, NÃO coletar dados manuais
     // o TPV vai ler o cartão fisicamente
     const data: PagamentoData = {
       metodo,
       // ... dados do TPV em vez de input manual
     };
     onSubmit(data);
   };
   ```

### Opção B: Gateway Online (Redsys, Stripe, Adyen)

**Como funciona:**
```
[App Cliente PWA]
  → Seleciona "tarjeta"
  → Clica "Pagar"
  → Chama Edge Function do Supabase
    → Edge Function chama Redsys/Stripe API
    → Retorna URL de 3DS/pagamento
  → App abre WebView ou redireciona
  → Usuário completa pagamento no banco
  → Webhook confirma pagamento
```

**Pontos de plug:**

1. **Criar Edge Function `process-payment`**
   ```typescript
   // supabase/functions/process-payment/index.ts
   serve(async (req) => {
     const { amount, cardToken } = await req.json();
     const result = await fetch('https://sis.redsys.es/sis/rest/trataPeticionREST', {
       method: 'POST',
       body: JSON.stringify({
         DS_MERCHANT_AMOUNT: amount,
         DS_MERCHANT_CURRENCY: '978', // EUR
         DS_MERCHANT_MERCHANTCODE: '...',
         DS_MERCHANT_TERMINAL: '...',
         DS_MERCHANT_ORDER: generateOrderId(),
         DS_MERCHANT_PAN: cardToken, // ou usar HMAC
       })
     });
     return new Response(JSON.stringify(await result.json()));
   });
   ```

2. **Modificar `create_order` RPC**
   ```sql
   -- Adicionar colunas à tabela orders
   ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS id_transacao text;
   ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS gateway text;
   ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estado_pagamento text DEFAULT 'pendente';
   ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS comprovante jsonb;
   ```

---

## 📋 O que precisa ser feito (Checklist)

### Fase 1: Preparação do Banco
- [ ] Adicionar colunas `id_transacao`, `gateway`, `estado_pagamento`, `comprovante` à tabela `orders`
- [ ] Atualizar RPC `create_order` para aceitar dados de pagamento
- [ ] Criar RPC `confirm_payment` para webhook de gateway

### Fase 2: Integração TPV
- [ ] Definir qual TPV será usado (Ingenico? Verifone? PAX? Sunmi?)
- [ ] Implementar adapter/bridge para comunicação com TPV
- [ ] Modificar `PagamentoModal` para modo TPV (ocultar inputs manuais)
- [ ] Modificar `handlePagamentoSubmit` para enviar comando ao TPV
- [ ] Criar tela de status "Acerque la tarjeta al TPV"

### Fase 3: Gateway Online (fallback)
- [ ] Criar Edge Function para Redsys/Stripe
- [ ] Configurar webhooks
- [ ] Implementar 3DSecure
- [ ] Testar pagamentos reais em ambiente sandbox

### Fase 4: Segurança
- [ ] NUNCA armazenar CVV (PCI-DSS compliance)
- [ ] Tokenizar cartões (não armazenar número completo)
- [ ] Usar HTTPS apenas
- [ ] Implementar idempotência nos pagamentos

---

## 🧠 Recomendação da Persona Architect

> **"Não reinvente a roda de pagamentos. Use um gateway estabelecido."**

Para uma sorveteria real, a solução mais prática é:

1. **TPV Físico integrado** (se tiver loja física)
   - Ingenico Desk/5000 ou PAX A920
   - Integrar via Android Intent ou Bluetooth
   - App PWA se comunica com TPV via bridge

2. **Redsys para online** (se for delivery/pedido online)
   - Gateway padrão espanhol (Santander, BBVA usam)
   - Suporta Bizum nativamente
   - Edge Function no Supabase faz a ponte

3. **Stripe** (se quiser algo mais moderno/internacional)
   - SDK JavaScript direto no frontend
   - Stripe Elements para coleta segura
   - Webhooks para confirmação

---

*Personas ativas: Architect (visão macro) + DevOps (infra/integração)*
*Próxima ação: Decidir qual TPV/gateway usar antes de implementar*
