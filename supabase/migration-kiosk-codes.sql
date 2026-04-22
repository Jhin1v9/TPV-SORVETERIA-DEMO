-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: Login PWA ↔ Kiosk via Código de 5 Dígitos
-- Aplicar no SQL Editor do Supabase (sem apagar dados existentes)
-- ═══════════════════════════════════════════════════════════════════

-- 1. Tabela de códigos kiosk
CREATE TABLE IF NOT EXISTS public.kiosk_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE UNIQUE INDEX IF NOT EXISTS idx_kiosk_codes_code ON public.kiosk_codes(code);
CREATE INDEX IF NOT EXISTS idx_kiosk_codes_customer ON public.kiosk_codes(customer_id);
CREATE INDEX IF NOT EXISTS idx_kiosk_codes_expires ON public.kiosk_codes(expires_at);

-- RLS
ALTER TABLE public.kiosk_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kiosk_codes_read ON public.kiosk_codes;
CREATE POLICY kiosk_codes_read ON public.kiosk_codes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS kiosk_codes_insert ON public.kiosk_codes;
CREATE POLICY kiosk_codes_insert ON public.kiosk_codes FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS kiosk_codes_update ON public.kiosk_codes;
CREATE POLICY kiosk_codes_update ON public.kiosk_codes FOR UPDATE TO anon, authenticated USING (true);

-- 2. RPC: Gerar código de 5 dígitos
CREATE OR REPLACE FUNCTION public.generate_kiosk_code(customer_id_input uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  -- Invalida códigos antigos do mesmo customer
  UPDATE public.kiosk_codes
  SET used_at = now()
  WHERE customer_id = customer_id_input AND used_at IS NULL;

  -- Gera código único de 5 dígitos
  LOOP
    new_code := lpad(floor(random() * 100000)::text, 5, '0');
    SELECT EXISTS(
      SELECT 1 FROM public.kiosk_codes
      WHERE code = new_code AND used_at IS NULL AND expires_at > now()
    ) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;

  INSERT INTO public.kiosk_codes (code, customer_id, expires_at)
  VALUES (new_code, customer_id_input, now() + interval '5 minutes');

  RETURN new_code;
END;
$$;

-- 3. RPC: Validar código e retornar customer_id
CREATE OR REPLACE FUNCTION public.validate_kiosk_code(code_input text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matched_id uuid;
BEGIN
  SELECT id INTO matched_id
  FROM public.kiosk_codes
  WHERE code = code_input
    AND used_at IS NULL
    AND expires_at > now()
  FOR UPDATE SKIP LOCKED;

  IF matched_id IS NULL THEN
    RAISE EXCEPTION 'Código inválido o expirado';
  END IF;

  UPDATE public.kiosk_codes
  SET used_at = now()
  WHERE id = matched_id;

  RETURN (SELECT customer_id FROM public.kiosk_codes WHERE id = matched_id);
END;
$$;

-- 4. Grants
GRANT EXECUTE ON FUNCTION public.generate_kiosk_code(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_kiosk_code(text) TO anon, authenticated;

-- 5. Realtime
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.kiosk_codes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 6. Atualizar create_order para aceitar customer_id no checkout
-- (só se ainda não tiver sido aplicada)
CREATE OR REPLACE FUNCTION public.create_order(
  cart_payload jsonb,
  payment_method_input text,
  checkout_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item_record jsonb;
  product_id text;
  product_name text;
  product_snapshot jsonb;
  selections jsonb;
  category_sku text;
  category_name text;
  flavor_ids text[];
  topping_ids text[];
  item_price numeric(10,2);
  items_subtotal numeric(10,2) := 0;
  extras_total numeric(10,2) := CASE WHEN coalesce((checkout_payload->>'coffeeAdded')::boolean, false) THEN coalesce((checkout_payload->>'coffeePrice')::numeric, 1.50) ELSE 0 END;
  discount_rate numeric(10,4) := greatest(coalesce((checkout_payload->>'promoDiscountRate')::numeric, 0), 0);
  discount_total numeric(10,2);
  subtotal_total numeric(10,2);
  iva_total numeric(10,2);
  grand_total numeric(10,2);
  order_id_output uuid;
  order_number_output bigint;
  item_index integer := 0;
  order_origem text := coalesce(checkout_payload->>'origem', 'tpv');
  order_nome_usuario text := nullif(checkout_payload->>'nomeUsuario', '');
  order_customer_phone text := nullif(checkout_payload->>'notificationPhone', '');
  order_customer_id uuid := nullif(checkout_payload->>'customerId', '')::uuid;
  flavor_count integer;
  consumption numeric(10,3);
  selection_sabor jsonb;
  selection_array jsonb;
  is_legacy boolean;
BEGIN
  IF cart_payload IS NULL OR jsonb_typeof(cart_payload) <> 'array' OR jsonb_array_length(cart_payload) = 0 THEN
    RAISE EXCEPTION 'cart_payload must contain at least one item';
  END IF;

  -- Primeira passada: validação e cálculo de subtotal
  FOR item_record IN SELECT value FROM jsonb_array_elements(cart_payload)
  LOOP
    is_legacy := item_record ? 'categoria';

    IF is_legacy THEN
      category_sku := item_record->'categoria'->>'id';
      SELECT nome->>'es' INTO category_name FROM public.categories WHERE id = category_sku AND active = true;
      IF category_name IS NULL THEN
        RAISE EXCEPTION 'Category % not found or inactive', category_sku;
      END IF;

      SELECT coalesce(array_agg(value->>'id'), array[]::text[]) INTO flavor_ids
      FROM jsonb_array_elements(coalesce(item_record->'sabores', '[]'::jsonb));

      SELECT coalesce(array_agg(value->>'id'), array[]::text[]) INTO topping_ids
      FROM jsonb_array_elements(coalesce(item_record->'toppings', '[]'::jsonb));

      IF coalesce(array_length(flavor_ids, 1), 0) = 0 THEN
        RAISE EXCEPTION 'Each legacy cart item must contain at least one flavor';
      END IF;

      SELECT count(*) INTO flavor_count FROM public.flavors WHERE id = any(flavor_ids) AND available = true;
      IF flavor_count <> array_length(flavor_ids, 1) THEN
        RAISE EXCEPTION 'One or more selected flavors are unavailable';
      END IF;

      item_price := round(
        (SELECT c.base_price FROM public.categories c WHERE c.id = category_sku)
        + coalesce((SELECT sum(f.extra_price) FROM public.flavors f WHERE f.id = any(flavor_ids)), 0)
        + coalesce((SELECT sum(t.price) FROM public.toppings t WHERE t.id = any(topping_ids)), 0),
        2
      );
    ELSE
      product_id := item_record->'product'->>'id';
      IF product_id IS NULL THEN
        product_id := item_record->>'product_id';
      END IF;

      IF product_id IS NOT NULL THEN
        SELECT p.nome->>'es' INTO product_name FROM public.products p WHERE p.id = product_id AND p.active = true;
        IF product_name IS NULL THEN
          RAISE EXCEPTION 'Product % not found or inactive', product_id;
        END IF;
      END IF;

      item_price := coalesce((item_record->>'unit_price')::numeric, (item_record->>'precoUnitario')::numeric, 0);
    END IF;

    items_subtotal := items_subtotal + item_price;
  END LOOP;

  -- Cálculos finais
  discount_total := round(items_subtotal * discount_rate, 2);
  subtotal_total := round(items_subtotal + extras_total - discount_total, 2);
  iva_total := round(subtotal_total * 0.10, 2);
  grand_total := round(subtotal_total + iva_total, 2);

  -- Inserir pedido (agora com customer_id)
  INSERT INTO public.orders (
    status, payment_method, subtotal, discount, extras, total, iva,
    customer_phone, customer_id, origem, nome_usuario
  ) VALUES (
    'pendiente', payment_method_input, subtotal_total, discount_total, extras_total,
    grand_total, iva_total, order_customer_phone, order_customer_id, order_origem, order_nome_usuario
  )
  RETURNING id, numero_sequencial INTO order_id_output, order_number_output;

  -- Gerar Verifactu QR
  UPDATE public.orders
  SET verifactu_qr = jsonb_build_object(
    'id', concat('pedido-', order_number_output),
    'fecha', current_date,
    'importe', to_char(grand_total, 'FM999999990.00'),
    'establecimiento', (SELECT name FROM public.store_settings WHERE store_key = 'main')
  )::text
  WHERE id = order_id_output;

  -- Segunda passada: inserir itens e gerenciar estoque
  FOR item_record IN SELECT value FROM jsonb_array_elements(cart_payload)
  LOOP
    item_index := item_index + 1;
    is_legacy := item_record ? 'categoria';

    IF is_legacy THEN
      category_sku := item_record->'categoria'->>'id';
      SELECT nome->>'es' INTO category_name FROM public.categories WHERE id = category_sku;

      SELECT coalesce(array_agg(value->>'id'), array[]::text[]) INTO flavor_ids
      FROM jsonb_array_elements(coalesce(item_record->'sabores', '[]'::jsonb));

      SELECT coalesce(array_agg(value->>'id'), array[]::text[]) INTO topping_ids
      FROM jsonb_array_elements(coalesce(item_record->'toppings', '[]'::jsonb));

      item_price := round(
        (SELECT c.base_price FROM public.categories c WHERE c.id = category_sku)
        + coalesce((SELECT sum(f.extra_price) FROM public.flavors f WHERE f.id = any(flavor_ids)), 0)
        + coalesce((SELECT sum(t.price) FROM public.toppings t WHERE t.id = any(topping_ids)), 0),
        2
      );

      INSERT INTO public.order_items (
        order_id, sort_order, item_type,
        category_sku, category_name, flavors, toppings,
        unit_price, quantity, notes
      ) VALUES (
        order_id_output, item_index, 'legacy',
        category_sku, category_name,
        public.serialize_flavors(flavor_ids),
        public.serialize_toppings(topping_ids),
        item_price, 1,
        nullif(item_record->>'notas', '')
      );

      consumption := public.calculate_flavor_consumption(category_sku, array_length(flavor_ids, 1));
      FOR i IN 1..coalesce(array_length(flavor_ids, 1), 0)
      LOOP
        PERFORM public.debit_flavor_stock(flavor_ids[i], consumption, order_id_output, 'legacy order');
      END LOOP;

    ELSE
      product_id := coalesce(item_record->'product'->>'id', item_record->>'product_id');
      product_snapshot := coalesce(item_record->'product', item_record->'product_snapshot', '{}'::jsonb);
      selections := coalesce(item_record->'selections', item_record->'selecoes', '[]'::jsonb);
      item_price := coalesce((item_record->>'unit_price')::numeric, (item_record->>'precoUnitario')::numeric, 0);

      IF product_id IS NOT NULL THEN
        SELECT p.nome->>'es' INTO product_name FROM public.products p WHERE p.id = product_id;
      ELSE
        product_name := product_snapshot->>'nome';
        IF product_name IS NULL THEN
          product_name := product_snapshot->'nome'->>'es';
        END IF;
      END IF;

      flavor_ids := array[]::text[];
      topping_ids := array[]::text[];

      IF selections ? 'sabores' THEN
        FOR selection_sabor IN SELECT value FROM jsonb_array_elements(selections->'sabores')
        LOOP
          IF selection_sabor ? 'flavor_ref' THEN
            flavor_ids := array_append(flavor_ids, selection_sabor->>'flavor_ref');
          ELSIF selection_sabor ? 'id' AND EXISTS (SELECT 1 FROM public.flavors f WHERE f.id = selection_sabor->>'id') THEN
            flavor_ids := array_append(flavor_ids, selection_sabor->>'id');
          END IF;
        END LOOP;
      END IF;

      IF selections ? 'toppings' THEN
        FOR selection_array IN SELECT value FROM jsonb_array_elements(selections->'toppings')
        LOOP
          IF selection_array ? 'id' AND EXISTS (SELECT 1 FROM public.toppings t WHERE t.id = selection_array->>'id') THEN
            topping_ids := array_append(topping_ids, selection_array->>'id');
          END IF;
        END LOOP;
      END IF;

      INSERT INTO public.order_items (
        order_id, sort_order, item_type,
        product_id, product_name, product_snapshot, selections,
        category_sku, category_name, flavors, toppings,
        unit_price, quantity, notes
      ) VALUES (
        order_id_output, item_index, 'product',
        product_id, product_name, product_snapshot, selections,
        product_snapshot->>'categoria', product_name,
        public.serialize_flavors(flavor_ids),
        public.serialize_toppings(topping_ids),
        item_price,
        coalesce((item_record->>'quantity')::integer, (item_record->>'quantidade')::integer, 1),
        nullif(coalesce(item_record->>'notes', item_record->>'notas'), '')
      );

      IF array_length(flavor_ids, 1) > 0 THEN
        category_sku := product_snapshot->>'categoria';
        consumption := public.calculate_flavor_consumption(category_sku, array_length(flavor_ids, 1));
        FOR i IN 1..array_length(flavor_ids, 1)
        LOOP
          PERFORM public.debit_flavor_stock(flavor_ids[i], consumption, order_id_output, 'product order: ' || coalesce(product_name, 'unknown'));
        END LOOP;
      END IF;

    END IF;
  END LOOP;

  RETURN order_id_output;
END;
$$;

-- 7. Recriar RPC compatível
CREATE OR REPLACE FUNCTION public.create_demo_order(
  cart_payload jsonb,
  payment_method_input text,
  checkout_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.create_order(cart_payload, payment_method_input, checkout_payload);
$$;
