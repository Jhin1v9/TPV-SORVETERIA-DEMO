-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  🔒 CAMADA 1 — RLS PERMISSIVO (não quebra funcionamento atual)               ║
-- ║  Data: 2026-04-26  |  Objetivo: Habilitar RLS sem restringir anon ainda      ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝
-- 
-- Esta migration é um passo INTERMEDIÁRIO seguro:
-- - Habilita RLS em tabelas que estavam SEM proteção (V04)
-- - Cria policies PERMISSIVAS (equivale ao comportamento atual sem RLS)
-- - NÃO quebra o funcionamento porque anon ainda tem acesso
-- 
-- Na Fase 2 (autenticação real), estas policies serão substituídas por
-- policies restritivas com auth.uid().

-- =============================================================================
-- TABELAS SEM RLS — Habilitar agora com policies permissivas
-- =============================================================================

-- payment_transactions: estava completamente aberta
ALTER TABLE IF EXISTS public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS payment_transactions_select_all ON public.payment_transactions;
DROP POLICY IF EXISTS payment_transactions_insert_all ON public.payment_transactions;

CREATE POLICY payment_transactions_select_all
  ON public.payment_transactions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY payment_transactions_insert_all
  ON public.payment_transactions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- receipts: estava completamente aberta
ALTER TABLE IF EXISTS public.receipts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS receipts_select_all ON public.receipts;
DROP POLICY IF EXISTS receipts_insert_all ON public.receipts;

CREATE POLICY receipts_select_all
  ON public.receipts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY receipts_insert_all
  ON public.receipts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- =============================================================================
-- VERIFICAÇÃO
-- =============================================================================

SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('payment_transactions', 'receipts')
ORDER BY tablename;
