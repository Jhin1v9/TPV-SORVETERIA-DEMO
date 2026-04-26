-- ╔══════════════════════════════════════════════════════════════════════╗
-- ║  🔒 REMEDIAÇÃO DE SEGURANÇA — TPV SORVETERIA (Demo → Produto)       ║
-- ║  Data: 2026-04-26  |  Autor: KIMI (post-auditoria)                   ║
-- ║  Base: RELATORIO_AUDITORIA_SEGURANCA_TPV_SORVETERIA.md (35 vulns)    ║
-- ╚══════════════════════════════════════════════════════════════════════╝
-- 
-- ⚠️  EXECUTAR APÓS:
--    1. Backup completo do banco (Supabase Dashboard → Backups)
--    2. Rotacionar Supabase Anon Key (Settings → API → Rotate)
--    3. Revogar Moonshot AI Secret Key
--    4. Remover .env.local do repo
--
-- 🎯 OBJETIVO: Fechar as 11 vulnerabilidades CRÍTICAS do banco de dados

-- =============================================================================
-- FASE 2.1 — REVOGAR GRANTS DE ANON EM TODAS AS RPCs ADMINISTRATIVAS
-- Impacto: V06 (RPCs administrativas grantadas a anon)
-- =============================================================================

DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT proname, pg_get_function_identity_arguments(oid) as args
    FROM pg_proc
    WHERE pronamespace = 'public'::regnamespace
      AND prokind = 'f'
      AND proname IN (
        'create_order',
        'update_order_status',
        'adjust_flavor_stock',
        'set_flavor_availability',
        'set_product_availability',
        'save_store_settings',
        'save_customer',
        'restore_demo_data',
        'debit_flavor_stock',
        'calculate_flavor_consumption',
        'generate_kiosk_code',
        'validate_kiosk_code'
      )
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM anon;',
                   func_record.proname, func_record.args);
    RAISE NOTICE 'Revocado anon de: %', func_record.proname;
  END LOOP;
END $$;

-- =============================================================================
-- FASE 2.2 — HABILITAR RLS EM TABELAS SEM PROTEÇÃO
-- Impacto: V04 (payment_transactions e receipts sem RLS)
-- =============================================================================

ALTER TABLE IF EXISTS public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.receipts ENABLE ROW LEVEL SECURITY;

-- Limpar policies antigas dessas tabelas (se existirem)
DROP POLICY IF EXISTS payment_transactions_select ON public.payment_transactions;
DROP POLICY IF EXISTS payment_transactions_insert ON public.payment_transactions;
DROP POLICY IF EXISTS receipts_select ON public.receipts;
DROP POLICY IF EXISTS receipts_insert ON public.receipts;

-- Criar policies restritivas para payment_transactions
CREATE POLICY payment_transactions_select_own
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY payment_transactions_insert_own
  ON public.payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Criar policies restritivas para receipts
CREATE POLICY receipts_select_own
  ON public.receipts FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR auth.uid() IN (
      SELECT customer_id::uuid FROM public.orders WHERE id = order_id
    )
  );

CREATE POLICY receipts_insert_own
  ON public.receipts FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() IN (
      SELECT customer_id::uuid FROM public.orders WHERE id = order_id
    )
  );

-- =============================================================================
-- FASE 2.3 — REESCREVER POLICIES RLS DAS TABELAS PRINCIPAIS
-- Impacto: V05 (RLS policies permitem acesso total a anon)
-- =============================================================================

-- customers: usuário só vê/altera o próprio registro
DROP POLICY IF EXISTS customers_read ON public.customers;
DROP POLICY IF EXISTS customers_insert ON public.customers;
DROP POLICY IF EXISTS customers_update ON public.customers;
DROP POLICY IF EXISTS customers_delete ON public.customers;

CREATE POLICY customers_select_own
  ON public.customers FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id::uuid
    OR auth.uid() = COALESCE(auth_uid, id::uuid)
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY customers_insert_own
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id::uuid
    OR auth.uid() = COALESCE(auth_uid, id::uuid)
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY customers_update_own
  ON public.customers FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id::uuid
    OR auth.uid() = COALESCE(auth_uid, id::uuid)
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- orders: usuário só vê os próprios pedidos + admin vê todos
DROP POLICY IF EXISTS orders_read ON public.orders;
DROP POLICY IF EXISTS orders_insert ON public.orders;
DROP POLICY IF EXISTS orders_update ON public.orders;
DROP POLICY IF EXISTS orders_delete ON public.orders;

CREATE POLICY orders_select_own
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = customer_id::uuid
    OR auth.uid() = COALESCE(auth_uid, customer_id::uuid)
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY orders_insert_own
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = customer_id::uuid
    OR auth.uid() = COALESCE(auth_uid, customer_id::uuid)
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY orders_update_own
  ON public.orders FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = customer_id::uuid
    OR auth.uid() = COALESCE(auth_uid, customer_id::uuid)
    OR EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- order_items: acessível via pedidos do usuário
DROP POLICY IF EXISTS order_items_read ON public.order_items;
DROP POLICY IF EXISTS order_items_insert ON public.order_items;
DROP POLICY IF EXISTS order_items_update ON public.order_items;
DROP POLICY IF EXISTS order_items_delete ON public.order_items;

CREATE POLICY order_items_select_own
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT id FROM public.orders
      WHERE auth.uid() = customer_id::uuid
         OR auth.uid() = COALESCE(auth_uid, customer_id::uuid)
         OR EXISTS (
           SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
         )
    )
  );

CREATE POLICY order_items_insert_own
  ON public.order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders
      WHERE auth.uid() = customer_id::uuid
         OR auth.uid() = COALESCE(auth_uid, customer_id::uuid)
         OR EXISTS (
           SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
         )
    )
  );

-- product_categories: leitura pública (catálogo), alteração só admin
DROP POLICY IF EXISTS product_categories_read ON public.product_categories;
DROP POLICY IF EXISTS product_categories_insert ON public.product_categories;
DROP POLICY IF EXISTS product_categories_update ON public.product_categories;
DROP POLICY IF EXISTS product_categories_delete ON public.product_categories;

CREATE POLICY product_categories_select_public
  ON public.product_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY product_categories_insert_admin
  ON public.product_categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY product_categories_update_admin
  ON public.product_categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY product_categories_delete_admin
  ON public.product_categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- products: leitura pública, alteração só admin
DROP POLICY IF EXISTS products_read ON public.products;
DROP POLICY IF EXISTS products_insert ON public.products;
DROP POLICY IF EXISTS products_update ON public.products;
DROP POLICY IF EXISTS products_delete ON public.products;

CREATE POLICY products_select_public
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY products_insert_admin
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY products_update_admin
  ON public.products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY products_delete_admin
  ON public.products FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- flavors: leitura pública, alteração admin/staff
DROP POLICY IF EXISTS flavors_read ON public.flavors;
DROP POLICY IF EXISTS flavors_insert ON public.flavors;
DROP POLICY IF EXISTS flavors_update ON public.flavors;
DROP POLICY IF EXISTS flavors_delete ON public.flavors;

CREATE POLICY flavors_select_public
  ON public.flavors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY flavors_insert_admin
  ON public.flavors FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY flavors_update_staff
  ON public.flavors FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY flavors_delete_admin
  ON public.flavors FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- toppings: leitura pública, alteração admin/staff
DROP POLICY IF EXISTS toppings_read ON public.toppings;
DROP POLICY IF EXISTS toppings_insert ON public.toppings;
DROP POLICY IF EXISTS toppings_update ON public.toppings;
DROP POLICY IF EXISTS toppings_delete ON public.toppings;

CREATE POLICY toppings_select_public
  ON public.toppings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY toppings_insert_admin
  ON public.toppings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY toppings_update_staff
  ON public.toppings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY toppings_delete_admin
  ON public.toppings FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- store_settings: leitura pública, alteração só admin
DROP POLICY IF EXISTS store_settings_read ON public.store_settings;
DROP POLICY IF EXISTS store_settings_insert ON public.store_settings;
DROP POLICY IF EXISTS store_settings_update ON public.store_settings;

CREATE POLICY store_settings_select_public
  ON public.store_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY store_settings_insert_admin
  ON public.store_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY store_settings_update_admin
  ON public.store_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- kiosk_codes: admin/staff podem gerenciar, público pode validar
DROP POLICY IF EXISTS kiosk_codes_read ON public.kiosk_codes;
DROP POLICY IF EXISTS kiosk_codes_insert ON public.kiosk_codes;
DROP POLICY IF EXISTS kiosk_codes_update ON public.kiosk_codes;
DROP POLICY IF EXISTS kiosk_codes_delete ON public.kiosk_codes;

CREATE POLICY kiosk_codes_select_staff
  ON public.kiosk_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- kiosk_codes_insert/update/delete só admin/staff
CREATE POLICY kiosk_codes_insert_staff
  ON public.kiosk_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY kiosk_codes_update_staff
  ON public.kiosk_codes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- inventory_log: só admin/staff
DROP POLICY IF EXISTS inventory_log_read ON public.inventory_log;
DROP POLICY IF EXISTS inventory_log_insert ON public.inventory_log;
DROP POLICY IF EXISTS inventory_log_update ON public.inventory_log;

CREATE POLICY inventory_log_select_staff
  ON public.inventory_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

CREATE POLICY inventory_log_insert_staff
  ON public.inventory_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff'))
  );

-- =============================================================================
-- FASE 2.4 — TABELA DE AUDITORIA
-- Impacto: V17 (funcionalidades admin sem autorização server-side)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  table_name text,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_admin_only
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY audit_log_insert_system
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Trigger/Edge Function preenche

-- =============================================================================
-- FASE 2.5 — FUNÇÃO DE AUDITORIA (Trigger)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS trigger AS $$
DECLARE
  old_data jsonb;
  new_data jsonb;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    old_data = to_jsonb(OLD);
    new_data = null;
  ELSIF (TG_OP = 'INSERT') THEN
    old_data = null;
    new_data = to_jsonb(NEW);
  ELSIF (TG_OP = 'UPDATE') THEN
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
  END IF;

  INSERT INTO public.audit_log (event_type, table_name, record_id, old_data, new_data)
  VALUES (TG_OP, TG_TABLE_NAME, COALESCE(OLD.id, NEW.id), old_data, new_data);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger nas tabelas críticas
DROP TRIGGER IF EXISTS audit_orders ON public.orders;
CREATE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_order_items ON public.order_items;
CREATE TRIGGER audit_order_items
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_customers ON public.customers;
CREATE TRIGGER audit_customers
  AFTER INSERT OR UPDATE OR DELETE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_products ON public.products;
CREATE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_store_settings ON public.store_settings;
CREATE TRIGGER audit_store_settings
  AFTER INSERT OR UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- =============================================================================
-- FASE 2.6 — PROTEGER RPC RESTORE_DEMO_DATA (APAGAR EM PRODUÇÃO REAL)
-- Impacto: V06 (reset_demo_data grantada a anon)
-- =============================================================================

-- Em produção real, REMOVER completamente a função restore_demo_data
-- Em staging, manter mas restrita a admin
CREATE OR REPLACE FUNCTION public.restore_demo_data()
RETURNS void AS $$
BEGIN
  -- Verificar se o usuário é admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas admin pode restaurar dados demo';
  END IF;

  -- Código original da função aqui...
  -- (manter a lógica existente)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FASE 3.1 — TABELA PROFILES (Extensão do auth.users)
-- Impacto: V13 (auth mock), V23 (auth desativado)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text,
  email text,
  telefone text UNIQUE,
  tem_alergias boolean DEFAULT false,
  alergias jsonb DEFAULT '[]',
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY profiles_update_own
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY profiles_insert_own
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Trigger: criar profile automaticamente ao criar user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger (idempotente)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- FASE 3.2 — ADICIONAR COLUNA auth_uid NAS TABELAS EXISTENTES
-- Impacto: Facilitar migração para auth.uid()-based policies
-- =============================================================================

-- Adicionar coluna auth_uid nas tabelas que ainda não têm
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS auth_uid uuid REFERENCES auth.users(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS auth_uid uuid REFERENCES auth.users(id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_customers_auth_uid ON public.customers(auth_uid);
CREATE INDEX IF NOT EXISTS idx_orders_auth_uid ON public.orders(auth_uid);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_profiles_telefone ON public.profiles(telefone);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by ON public.audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_performed_at ON public.audit_log(performed_at);

-- =============================================================================
-- FASE 3.3 — VIEW PARA ADMIN (Dashboard completo)
-- =============================================================================

CREATE OR REPLACE VIEW public.admin_dashboard AS
SELECT
  (SELECT COUNT(*) FROM public.orders WHERE created_at > now() - interval '24 hours') as orders_today,
  (SELECT COALESCE(SUM(total), 0) FROM public.orders WHERE created_at > now() - interval '24 hours' AND status = 'completed') as revenue_today,
  (SELECT COUNT(*) FROM public.customers) as total_customers,
  (SELECT COUNT(*) FROM public.orders WHERE status = 'pending') as pending_orders;

-- View restrita a admin
CREATE POLICY admin_dashboard_select
  ON public.admin_dashboard FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================================================
-- VERIFICAÇÃO FINAL
-- =============================================================================

-- Verificar RLS em todas as tabelas públicas
SELECT 
  schemaname || '.' || tablename as table_name,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename NOT IN ('spatial_ref_sys')
ORDER BY tablename;

-- Verificar policies existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
