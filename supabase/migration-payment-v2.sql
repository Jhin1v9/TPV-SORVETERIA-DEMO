-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: Sistema de Pagamentos v2.0
-- Stripe, Apple Pay, Google Pay, TPV Físico, Comprovantes
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. NOVAS COLUNAS NA TABELA ORDERS ───

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pendente'
    CHECK (payment_status IN ('pendente', 'processando', 'aprovado', 'rejeitado', 'reembolsado', 'cancelado')),
  ADD COLUMN IF NOT EXISTS payment_gateway text,
  ADD COLUMN IF NOT EXISTS transaction_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS receipt_url text,
  ADD COLUMN IF NOT EXISTS refund_amount numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_error text,
  ADD COLUMN IF NOT EXISTS receipt_email text,
  ADD COLUMN IF NOT EXISTS receipt_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS receipt_printed_at timestamptz,
  ADD COLUMN IF NOT EXISTS customer_email text;

-- ─── 2. TABELA DE AUDITORIA DE TRANSAÇÕES ───

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  gateway text NOT NULL,
  transaction_id text,
  amount numeric(10,2) NOT NULL,
  status text NOT NULL,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.payment_transactions IS 'Log de todas as transações de pagamento para auditoria';

-- ─── 3. TABELA DE COMPROVANTES ───

CREATE TABLE IF NOT EXISTS public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('email', 'print', 'qr')),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'falhou', 'impresso')),
  email text,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ─── 4. RPC: CRIAR ORDER COM PAYMENT STATUS ───

CREATE OR REPLACE FUNCTION public.create_order_v2(
  cart_payload jsonb,
  payment_method_input text,
  checkout_payload jsonb DEFAULT '{}'::jsonb,
  payment_status_input text DEFAULT 'pendente',
  payment_gateway_input text DEFAULT NULL,
  transaction_id_input text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  order_id_output uuid;
BEGIN
  -- Delega para create_order original para manter compatibilidade
  order_id_output := public.create_order(cart_payload, payment_method_input, checkout_payload);
  
  -- Atualiza com dados de pagamento
  UPDATE public.orders
  SET 
    payment_status = payment_status_input,
    payment_gateway = payment_gateway_input,
    transaction_id = transaction_id_input,
    customer_email = checkout_payload->>'customerEmail'
  WHERE id = order_id_output;
  
  RETURN order_id_output;
END;
$$;

-- ─── 5. RPC: CONFIRMAR PAGAMENTO (usado por webhooks) ───

CREATE OR REPLACE FUNCTION public.confirm_order_payment(
  order_id_input uuid,
  transaction_id_input text,
  gateway_input text,
  receipt_url_input text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET 
    payment_status = 'aprovado',
    transaction_id = transaction_id_input,
    payment_gateway = gateway_input,
    paid_at = now(),
    receipt_url = receipt_url_input
  WHERE id = order_id_input;
  
  -- Log da transação
  INSERT INTO public.payment_transactions (order_id, gateway, transaction_id, amount, status, payload)
  SELECT 
    order_id_input,
    gateway_input,
    transaction_id_input,
    total,
    'aprovado',
    jsonb_build_object('confirmed_at', now())
  FROM public.orders
  WHERE id = order_id_input;
END;
$$;

-- ─── 6. RPC: REJEITAR PAGAMENTO ───

CREATE OR REPLACE FUNCTION public.reject_order_payment(
  order_id_input uuid,
  error_message_input text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET 
    payment_status = 'rejeitado',
    payment_error = error_message_input
  WHERE id = order_id_input;
  
  INSERT INTO public.payment_transactions (order_id, gateway, transaction_id, amount, status, payload)
  SELECT 
    order_id_input,
    payment_gateway,
    transaction_id,
    total,
    'rejeitado',
    jsonb_build_object('error', error_message_input, 'rejected_at', now())
  FROM public.orders
  WHERE id = order_id_input;
END;
$$;

-- ─── 7. RPC: REGISTRAR COMPROVANTE ───

CREATE OR REPLACE FUNCTION public.register_receipt(
  order_id_input uuid,
  type_input text,
  email_input text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  receipt_id uuid;
BEGIN
  INSERT INTO public.receipts (order_id, type, email)
  VALUES (order_id_input, type_input, email_input)
  RETURNING id INTO receipt_id;
  
  -- Atualiza timestamp correspondente no pedido
  IF type_input = 'email' THEN
    UPDATE public.orders SET receipt_sent_at = now() WHERE id = order_id_input;
  ELSIF type_input = 'print' THEN
    UPDATE public.orders SET receipt_printed_at = now() WHERE id = order_id_input;
  END IF;
  
  RETURN receipt_id;
END;
$$;

-- ─── 8. GRANTS ───

GRANT SELECT, INSERT ON public.payment_transactions TO anon, authenticated;
GRANT SELECT, INSERT ON public.receipts TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_v2 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_order_payment TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reject_order_payment TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_receipt TO anon, authenticated;

-- ─── 9. ÍNDICES ───

CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_transaction_id ON public.orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_receipts_order_id ON public.receipts(order_id);

-- ═══════════════════════════════════════════════════════════════════
-- FIM DA MIGRATION
-- ═══════════════════════════════════════════════════════════════════
