CREATE OR REPLACE FUNCTION public.normalize_es_phone(phone_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  digits_only text;
BEGIN
  IF phone_input IS NULL THEN
    RETURN NULL;
  END IF;

  digits_only := regexp_replace(phone_input, '\D', '', 'g');

  IF digits_only = '' THEN
    RETURN NULL;
  END IF;

  IF digits_only LIKE '0034%' THEN
    digits_only := substring(digits_only FROM 5);
  ELSIF digits_only LIKE '34%' AND char_length(digits_only) = 11 THEN
    digits_only := substring(digits_only FROM 3);
  END IF;

  RETURN digits_only;
END;
$$;

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
  order_customer_phone text := public.normalize_es_phone(NULLIF(checkout_payload->>'notificationPhone', ''));
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
  normalized_phone text := public.normalize_es_phone(telefone_input);
BEGIN
  IF normalized_phone IS NULL OR char_length(normalized_phone) <> 9 THEN
    RAISE EXCEPTION 'telefone_input must be a valid Spanish phone';
  END IF;

  INSERT INTO public.customers (nome, telefone, email, alergias)
  VALUES (nome_input, normalized_phone, email_input, alergias_input)
  ON CONFLICT (telefone) DO UPDATE
  SET nome = excluded.nome,
      email = COALESCE(excluded.email, customers.email),
      alergias = excluded.alergias
  RETURNING id INTO customer_id;

  RETURN customer_id;
END;
$$;

UPDATE public.customers
SET telefone = public.normalize_es_phone(telefone)
WHERE telefone IS NOT NULL;

UPDATE public.orders
SET customer_phone = public.normalize_es_phone(customer_phone)
WHERE customer_phone IS NOT NULL;

UPDATE public.push_subscriptions
SET telefone = public.normalize_es_phone(telefone)
WHERE telefone IS NOT NULL;
