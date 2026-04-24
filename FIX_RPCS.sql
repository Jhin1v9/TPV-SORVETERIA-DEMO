-- =============================================
-- FIX: Recriar todas as RPCs faltantes no banco
-- Execute no SQL Editor do Supabase
-- =============================================

-- 1. Funções auxiliares
CREATE OR REPLACE FUNCTION public.serialize_flavors(flavor_ids text[])
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', f.id, 'nome', f.nome, 'categoria', f.categoria,
        'corHex', f.cor_hex, 'imagemUrl', f.image_url,
        'precoExtra', f.extra_price, 'stockBaldes', f.stock_buckets,
        'alertaStock', f.low_stock_threshold, 'disponivel', f.available, 'badge', f.badge
      ) ORDER BY ARRAY_POSITION(flavor_ids, f.id)
    ),
    '[]'::jsonb
  )
  FROM public.flavors f
  WHERE f.id = ANY(flavor_ids);
$$;

CREATE OR REPLACE FUNCTION public.serialize_toppings(topping_ids text[])
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'id', t.id, 'nome', t.nome, 'preco', t.price,
        'categoria', t.categoria, 'emoji', t.emoji
      ) ORDER BY ARRAY_POSITION(topping_ids, t.id)
    ),
    '[]'::jsonb
  )
  FROM public.toppings t
  WHERE t.id = ANY(topping_ids);
$$;

CREATE OR REPLACE FUNCTION public.debit_flavor_stock(
  flavor_id_input text,
  amount numeric,
  order_id_input uuid,
  motivo_input text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stock_atual numeric(10,3);
  stock_novo numeric(10,3);
BEGIN
  SELECT stock_buckets INTO stock_atual FROM public.flavors WHERE id = flavor_id_input;
  IF stock_atual IS NULL THEN RETURN; END IF;
  stock_novo := GREATEST(0, ROUND(stock_atual - amount, 3));
  UPDATE public.flavors SET stock_buckets = stock_novo WHERE id = flavor_id_input;
  INSERT INTO public.inventory_log (flavor_id, tipo, delta, stock_antes, stock_depois, order_id, motivo)
  VALUES (flavor_id_input, 'venda', -amount, stock_atual, stock_novo, order_id_input, motivo_input);
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_flavor_consumption(category_id text, flavor_count integer)
RETURNS numeric
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT ROUND(
    CASE
      WHEN category_id IN ('copas', 'gofres', 'acai', 'batidos') THEN 0.100
      WHEN category_id IN ('helados', 'granizados', 'orxata', 'cafes') THEN 0.052
      WHEN category_id = 'conos' THEN 0.031
      WHEN category_id IN ('souffle', 'banana-split', 'para-llevar', 'tarrinas-nata') THEN 0.200
      ELSE 0.100
    END / GREATEST(flavor_count, 1),
    3
  );
$$;

-- 2. create_order (principal)
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
  extras_total numeric(10,2) := CASE WHEN COALESCE((checkout_payload->>'coffeeAdded')::boolean, false) THEN COALESCE((checkout_payload->>'coffeePrice')::numeric, 1.50) ELSE 0 END;
  discount_rate numeric(10,4) := GREATEST(COALESCE((checkout_payload->>'promoDiscountRate')::numeric, 0), 0);
  discount_total numeric(10,2);
  subtotal_total numeric(10,2);
  iva_total numeric(10,2);
  grand_total numeric(10,2);
  order_id_output uuid;
  order_number_output bigint;
  item_index integer := 0;
  order_origem text := COALESCE(checkout_payload->>'origem', 'tpv');
  order_nome_usuario text := NULLIF(checkout_payload->>'nomeUsuario', '');
  order_customer_phone text := NULLIF(checkout_payload->>'notificationPhone', '');
  order_customer_id uuid := NULLIF(checkout_payload->>'customerId', '')::uuid;
  flavor_count_int integer;
  consumption numeric(10,3);
  selection_sabor jsonb;
  selection_array jsonb;
  is_legacy boolean;
BEGIN
  IF cart_payload IS NULL OR jsonb_typeof(cart_payload) <> 'array' OR jsonb_array_length(cart_payload) = 0 THEN
    RAISE EXCEPTION 'cart_payload must contain at least one item';
  END IF;

  FOR item_record IN SELECT value FROM jsonb_array_elements(cart_payload)
  LOOP
    is_legacy := item_record ? 'categoria';

    IF is_legacy THEN
      category_sku := item_record->'categoria'->>'id';
      SELECT nome->>'es' INTO category_name FROM public.categories WHERE id = category_sku AND active = true;
      IF category_name IS NULL THEN
        RAISE EXCEPTION 'Category % not found or inactive', category_sku;
      END IF;

      SELECT COALESCE(array_agg(value->>'id'), array[]::text[]) INTO flavor_ids
      FROM jsonb_array_elements(COALESCE(item_record->'sabores', '[]'::jsonb));

      SELECT COALESCE(array_agg(value->>'id'), array[]::text[]) INTO topping_ids
      FROM jsonb_array_elements(COALESCE(item_record->'toppings', '[]'::jsonb));

      IF COALESCE(array_length(flavor_ids, 1), 0) = 0 THEN
        RAISE EXCEPTION 'Each legacy cart item must contain at least one flavor';
      END IF;

      SELECT count(*) INTO flavor_count_int FROM public.flavors WHERE id = ANY(flavor_ids) AND available = true;
      IF flavor_count_int <> array_length(flavor_ids, 1) THEN
        RAISE EXCEPTION 'One or more selected flavors are unavailable';
      END IF;

      item_price := ROUND(
        (SELECT c.base_price FROM public.categories c WHERE c.id = category_sku)
        + COALESCE((SELECT SUM(f.extra_price) FROM public.flavors f WHERE f.id = ANY(flavor_ids)), 0)
        + COALESCE((SELECT SUM(t.price) FROM public.toppings t WHERE t.id = ANY(topping_ids)), 0),
        2
      );
    ELSE
      product_id := item_record->'product'->>'id';
      IF product_id IS NULL THEN product_id := item_record->>'product_id'; END IF;
      IF product_id IS NOT NULL THEN
        SELECT p.nome->>'es' INTO product_name FROM public.products p WHERE p.id = product_id AND p.active = true;
        IF product_name IS NULL THEN
          RAISE EXCEPTION 'Product % not found or inactive', product_id;
        END IF;
      END IF;
      item_price := COALESCE((item_record->>'unit_price')::numeric, (item_record->>'precoUnitario')::numeric, 0);
    END IF;

    items_subtotal := items_subtotal + item_price;
  END LOOP;

  discount_total := ROUND(items_subtotal * discount_rate, 2);
  subtotal_total := ROUND(items_subtotal + extras_total - discount_total, 2);
  iva_total := ROUND(subtotal_total * 0.10, 2);
  grand_total := ROUND(subtotal_total + iva_total, 2);

  INSERT INTO public.orders (
    status, payment_method, subtotal, discount, extras, total, iva,
    customer_phone, customer_id, origem, nome_usuario
  ) VALUES (
    'pendiente', payment_method_input, subtotal_total, discount_total, extras_total,
    grand_total, iva_total, order_customer_phone, order_customer_id, order_origem, order_nome_usuario
  )
  RETURNING id, numero_sequencial INTO order_id_output, order_number_output;

  UPDATE public.orders
  SET verifactu_qr = JSONB_BUILD_OBJECT(
    'id', concat('pedido-', order_number_output),
    'fecha', current_date,
    'importe', TO_CHAR(grand_total, 'FM999999990.00'),
    'establecimiento', (SELECT name FROM public.store_settings WHERE store_key = 'main')
  )::text
  WHERE id = order_id_output;

  FOR item_record IN SELECT value FROM jsonb_array_elements(cart_payload)
  LOOP
    item_index := item_index + 1;
    is_legacy := item_record ? 'categoria';

    IF is_legacy THEN
      category_sku := item_record->'categoria'->>'id';
      SELECT nome->>'es' INTO category_name FROM public.categories WHERE id = category_sku;
      SELECT COALESCE(array_agg(value->>'id'), array[]::text[]) INTO flavor_ids
      FROM jsonb_array_elements(COALESCE(item_record->'sabores', '[]'::jsonb));
      SELECT COALESCE(array_agg(value->>'id'), array[]::text[]) INTO topping_ids
      FROM jsonb_array_elements(COALESCE(item_record->'toppings', '[]'::jsonb));

      item_price := ROUND(
        (SELECT c.base_price FROM public.categories c WHERE c.id = category_sku)
        + COALESCE((SELECT SUM(f.extra_price) FROM public.flavors f WHERE f.id = ANY(flavor_ids)), 0)
        + COALESCE((SELECT SUM(t.price) FROM public.toppings t WHERE t.id = ANY(topping_ids)), 0),
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
        NULLIF(item_record->>'notas', '')
      );

      consumption := public.calculate_flavor_consumption(category_sku, array_length(flavor_ids, 1));
      FOR i IN 1..COALESCE(array_length(flavor_ids, 1), 0)
      LOOP
        PERFORM public.debit_flavor_stock(flavor_ids[i], consumption, order_id_output, 'legacy order');
      END LOOP;
    ELSE
      product_id := COALESCE(item_record->'product'->>'id', item_record->>'product_id');
      product_snapshot := COALESCE(item_record->'product', item_record->'product_snapshot', '{}'::jsonb);
      selections := COALESCE(item_record->'selections', item_record->'selecoes', '[]'::jsonb);
      item_price := COALESCE((item_record->>'unit_price')::numeric, (item_record->>'precoUnitario')::numeric, 0);

      IF product_id IS NOT NULL THEN
        SELECT p.nome->>'es' INTO product_name FROM public.products p WHERE p.id = product_id;
      ELSE
        product_name := product_snapshot->>'nome';
        IF product_name IS NULL THEN product_name := product_snapshot->'nome'->>'es'; END IF;
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
        COALESCE((item_record->>'quantity')::integer, (item_record->>'quantidade')::integer, 1),
        NULLIF(COALESCE(item_record->>'notes', item_record->>'notas'), '')
      );

      IF array_length(flavor_ids, 1) > 0 THEN
        category_sku := product_snapshot->>'categoria';
        consumption := public.calculate_flavor_consumption(category_sku, array_length(flavor_ids, 1));
        FOR i IN 1..array_length(flavor_ids, 1)
        LOOP
          PERFORM public.debit_flavor_stock(flavor_ids[i], consumption, order_id_output, 'product order: ' || COALESCE(product_name, 'unknown'));
        END LOOP;
      END IF;
    END IF;
  END LOOP;

  RETURN order_id_output;
END;
$$;

-- 3. Outras RPCs essenciais
CREATE OR REPLACE FUNCTION public.update_order_status(order_id_input uuid, status_input text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.orders
  SET status = status_input,
      ready_at = CASE WHEN status_input = 'listo' THEN now() ELSE ready_at END
  WHERE id = order_id_input;
END;
$$;

CREATE OR REPLACE FUNCTION public.adjust_flavor_stock(flavor_id_input text, delta_input numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stock_atual numeric(10,3);
  stock_novo numeric(10,3);
BEGIN
  SELECT stock_buckets INTO stock_atual FROM public.flavors WHERE id = flavor_id_input;
  IF stock_atual IS NULL THEN RETURN; END IF;
  stock_novo := GREATEST(0, ROUND(stock_atual + delta_input, 3));
  UPDATE public.flavors SET stock_buckets = stock_novo WHERE id = flavor_id_input;
  INSERT INTO public.inventory_log (flavor_id, tipo, delta, stock_antes, stock_depois, motivo)
  VALUES (flavor_id_input, CASE WHEN delta_input >= 0 THEN 'ajuste' ELSE 'venda' END, delta_input, stock_atual, stock_novo, 'manual adjustment');
END;
$$;

CREATE OR REPLACE FUNCTION public.set_product_availability(product_id_input text, available_input boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products SET em_estoque = available_input WHERE id = product_id_input;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_flavor_availability(flavor_id_input text, available_input boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.flavors SET available = available_input WHERE id = flavor_id_input;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_store_settings(setting_payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.store_settings (store_key, name, nif, address, summer_hours, winter_hours)
  VALUES (
    'main',
    COALESCE(setting_payload->>'name', 'Heladeria Sabadell Nord'),
    COALESCE(setting_payload->>'nif', 'B-12345678'),
    COALESCE(setting_payload->>'address', 'Carrer de la Concepcio, 23, 08201 Sabadell, Barcelona'),
    COALESCE(setting_payload->>'summerHours', '16:00 - 23:00'),
    COALESCE(setting_payload->>'winterHours', '17:00 - 22:00')
  )
  ON CONFLICT (store_key) DO UPDATE
  SET name = excluded.name,
      nif = excluded.nif,
      address = excluded.address,
      summer_hours = excluded.summer_hours,
      winter_hours = excluded.winter_hours,
      updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_customer(
  nome_input text,
  telefone_input text,
  email_input text DEFAULT NULL,
  alergias_input jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_id uuid;
BEGIN
  INSERT INTO public.customers (nome, telefone, email, alergias)
  VALUES (nome_input, telefone_input, email_input, alergias_input)
  ON CONFLICT (telefone) DO UPDATE
  SET nome = excluded.nome,
      email = COALESCE(excluded.email, customers.email),
      alergias = excluded.alergias
  RETURNING id INTO customer_id;
  RETURN customer_id;
END;
$$;

-- 4. Kiosk codes
CREATE TABLE IF NOT EXISTS public.kiosk_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_kiosk_codes_code ON public.kiosk_codes(code);

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
  UPDATE public.kiosk_codes SET used_at = now()
  WHERE customer_id = customer_id_input AND used_at IS NULL;

  LOOP
    new_code := LPAD(FLOOR(RANDOM() * 100000)::text, 5, '0');
    SELECT EXISTS(SELECT 1 FROM public.kiosk_codes WHERE code = new_code AND used_at IS NULL AND expires_at > now())
    INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;

  INSERT INTO public.kiosk_codes (code, customer_id, expires_at)
  VALUES (new_code, customer_id_input, now() + interval '5 minutes');

  RETURN new_code;
END;
$$;

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
  WHERE code = code_input AND used_at IS NULL AND expires_at > now()
  FOR UPDATE SKIP LOCKED;

  IF matched_id IS NULL THEN
    RAISE EXCEPTION 'Codigo invalido ou expirado';
  END IF;

  UPDATE public.kiosk_codes SET used_at = now() WHERE id = matched_id;
  RETURN (SELECT customer_id FROM public.kiosk_codes WHERE id = matched_id);
END;
$$;

-- 5. GRANTS
GRANT EXECUTE ON FUNCTION public.create_order(jsonb, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_order_status(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_flavor_stock(text, numeric) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_product_availability(text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_flavor_availability(text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_store_settings(jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_customer(text, text, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.generate_kiosk_code(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_kiosk_code(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.debit_flavor_stock(text, numeric, uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_flavor_consumption(text, integer) TO anon, authenticated;

-- 6. Realtime (ignora se já existir)
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.kiosk_codes; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
