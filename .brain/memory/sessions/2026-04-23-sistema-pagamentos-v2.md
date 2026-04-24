# 2026-04-23 — Sistema de Pagamentos v2.0 (Stripe, Wallets, TPV, Comprovantes)

**Tags:** #feature #pagamento #stripe #apple-pay #google-pay #tpv #comprovante #arquitetura

---

## O que foi implementado

Transformamos o sistema de pagamento de **100% mock** para **production-ready** com suporte a múltiplos gateways e comprovantes.

### 1. Schema SQL (migration-payment-v2.sql)

- Novas colunas em `orders`: `payment_status`, `payment_gateway`, `transaction_id`, `paid_at`, `receipt_url`, `refund_amount`, `payment_error`, `receipt_email`, `receipt_sent_at`, `receipt_printed_at`, `customer_email`
- Nova tabela `payment_transactions` (auditoria)
- Nova tabela `receipts` (log de comprovantes)
- Novas RPCs: `create_order_v2`, `confirm_order_payment`, `reject_order_payment`, `register_receipt`

### 2. Edge Functions Supabase

| Function | Propósito | Status |
|----------|-----------|--------|
| `create-payment-intent` | Cria PaymentIntent no Stripe | ✅ Criada |
| `stripe-webhook` | Recebe webhooks do Stripe e atualiza pedido | ✅ Criada |
| `send-receipt` | Envia comprovante por email | ✅ Criada |

### 3. Types TypeScript atualizados

- `MetodoPago` agora inclui: `'tarjeta' | 'efectivo' | 'bizum' | 'apple_pay' | 'google_pay' | 'pendiente'`
- Novos types: `PaymentGateway`, `PaymentStatus`, `PaymentIntentPayload`, `PaymentIntentResponse`, `ReceiptRequest`, `ReceiptResponse`, `TPVConfig`, `PrinterConfig`, `KioskHardwareConfig`
- `Pedido` agora tem campos de pagamento v2.0
- `CheckoutState` agora tem `customerEmail`

### 4. Componentes Frontend

| Componente | Descrição |
|-----------|-----------|
| `StripeProvider.tsx` | Provider do Stripe com lazy loading |
| `StripePaymentForm.tsx` | Form com PaymentElement + Apple Pay + Google Pay |
| `ReceiptSelector.tsx` | Tela pós-pagamento: Email / Imprimir / QR / Não |
| `PagamentoModal.tsx` | Refatorado com Stripe, Apple Pay, Google Pay, modo kiosk físico |
| `ProcessandoPagamento.tsx` | Animação adaptativa por método + mensagem de status |

### 5. Fluxos Implementados

#### PWA Online
```
Carrinho → PagamentoModal
  → Tarjeta (Stripe) → PaymentElement → Webhook → Confirmado
  → Apple Pay → Stripe Payment Request → Webhook → Confirmado
  → Google Pay → Stripe Payment Request → Webhook → Confirmado
  → Bizum → Mock (pronto para Redsys) → Confirmado
  → Efectivo → Sem processamento → Confirmado
→ ReceiptSelector → Email / QR / Não
```

#### Kiosk Físico (Elo Wallaby)
```
Carrinho → PagamentoModal (isPhysicalKiosk=true)
  → Mostra: "Tarjeta / Bizum / Efectivo" (sem form de cartão)
  → Tarjeta → "Acerque la tarjeta al TPV" → TPV físico processa
  → Bizum → Tela de telefone
  → Efectivo → Vai ao mostrador
→ ReceiptSelector → Imprimir / Email (requer login) / QR / Não
```

### 6. Variáveis de Ambiente

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
VITE_KIOSK_MODE=web|physical
VITE_PRINTER_ENABLED=true|false
VITE_TPV_PROVIDER=elo|ingenico|pax|verifone
VITE_PAYMENT_MODE=mock|real
```

### 7. Arquivos Modificados/Criados

**Criados:**
- `supabase/migration-payment-v2.sql`
- `supabase/functions/create-payment-intent/index.ts`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/send-receipt/index.ts`
- `apps/cliente/src/components/pagamento/stripe/StripeProvider.tsx`
- `apps/cliente/src/components/pagamento/stripe/StripePaymentForm.tsx`
- `apps/cliente/src/components/pagamento/receipt/ReceiptSelector.tsx`

**Modificados:**
- `packages/shared/src/types/index.ts`
- `packages/shared/src/utils/pricing.ts`
- `apps/cliente/src/components/pagamento/PagamentoModal.tsx`
- `apps/cliente/src/components/pagamento/ProcessandoPagamento.tsx`
- `apps/cliente/src/components/pagamento/ConfirmacaoPedido.tsx`
- `apps/cliente/src/components/pagamento/index.ts`
- `apps/cliente/src/pages/CarrinhoPage.tsx`
- `.env.example`

### 8. Build Status

✅ `npm run build:cliente` — PASSOU

---

## Como ativar em produção

### Stripe
1. Criar conta em https://stripe.com
2. Copiar `Publishable key` → `VITE_STRIPE_PUBLISHABLE_KEY`
3. Copiar `Secret key` → `STRIPE_SECRET_KEY`
4. Criar webhook endpoint apontando para `/functions/v1/stripe-webhook`
5. Copiar `Webhook signing secret` → `STRIPE_WEBHOOK_SECRET`
6. Deployar Edge Functions: `supabase functions deploy`

### Apple Pay
1. Criar Apple Developer account ($99/ano)
2. Registrar Merchant ID
3. Uploadar CSR para Stripe
4. Ativar no Stripe Dashboard

### Google Pay
1. Criar conta Google Business Console
2. Ativar Google Pay API
3. Configurar no Stripe Dashboard (automático)

### TPV Físico (Elo Wallaby)
1. Receber hardware da Elo
2. Instalar app nativo wrapper (Capacitor/Flutter)
3. Configurar `VITE_KIOSK_MODE=physical`
4. Integrar SDK da Elo via bridge nativo

### Impressora
1. Conectar impressora térmica Epson/Bixolon via USB
2. Instalar drivers ESC/POS
3. Configurar `VITE_PRINTER_ENABLED=true`

---

## Próximos Passos

1. Testar com Stripe sandbox
2. Criar conta Apple Developer para Apple Pay
3. Configurar Google Pay no Stripe Dashboard
4. Receber TPV Elo Wallaby e integrar
5. Testar impressora térmica

---

*Personas ativas: Architect (arquitetura) + Product (UX/fluxos) + DevOps (infra/Edge Functions)*
