async (page) => {
  const sql = `-- Essential functions only (no reset_demo_data)
create or replace function public.serialize_flavors(flavor_ids text[])
returns jsonb
language sql
stable
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', f.id,
        'nome', f.nome,
        'categoria', f.categoria,
        'corHex', f.cor_hex,
        'imagemUrl', f.image_url,
        'precoExtra', f.extra_price,
        'stockBaldes', f.stock_buckets,
        'alertaStock', f.low_stock_threshold,
        'disponivel', f.available,
        'badge', f.badge
      )
      order by array_position(flavor_ids, f.id)
    ),
    '[]'::jsonb
  )
  from public.flavors f
  where f.id = any(flavor_ids);
$$;

create or replace function public.serialize_toppings(topping_ids text[])
returns jsonb
language sql
stable
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'nome', t.nome,
        'preco', t.price,
        'categoria', t.categoria,
        'emoji', t.emoji
      )
      order by array_position(topping_ids, t.id)
    ),
    '[]'::jsonb
  )
  from public.toppings t
  where t.id = any(topping_ids);
$$;

create or replace function public.debit_flavor_stock(
  flavor_id_input text,
  amount numeric,
  order_id_input uuid,
  motivo_input text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  stock_atual numeric(10,3);
  stock_novo numeric(10,3);
begin
  select stock_buckets into stock_atual from public.flavors where id = flavor_id_input;
  if stock_atual is null then
    return;
  end if;
  stock_novo := greatest(0, round(stock_atual - amount, 3));

  update public.flavors
  set stock_buckets = stock_novo
  where id = flavor_id_input;

  insert into public.inventory_log (flavor_id, tipo, delta, stock_antes, stock_depois, order_id, motivo)
  values (flavor_id_input, 'venda', -amount, stock_atual, stock_novo, order_id_input, motivo_input);
end;
$$;

create or replace function public.calculate_flavor_consumption(category_id text, flavor_count integer)
returns numeric
language sql
stable
set search_path = public
as $$
  select round(
    case
      when category_id in ('copas', 'gofres', 'acai', 'batidos') then 0.100
      when category_id in ('helados', 'granizados', 'orxata', 'cafes') then 0.052
      when category_id = 'conos' then 0.031
      when category_id in ('souffle', 'banana-split', 'para-llevar', 'tarrinas-nata') then 0.200
      else 0.100
    end / greatest(flavor_count, 1),
    3
  );
$$;

create or replace function public.create_order(
  cart_payload jsonb,
  payment_method_input text,
  checkout_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
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
  extras_total numeric(10,2) := case when coalesce((checkout_payload->>'coffeeAdded')::boolean, false) then coalesce((checkout_payload->>'coffeePrice')::numeric, 1.50) else 0 end;
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
begin
  if cart_payload is null or jsonb_typeof(cart_payload) <> 'array' or jsonb_array_length(cart_payload) = 0 then
    raise exception 'cart_payload must contain at least one item';
  end if;

  -- Primeira passada: validaÃ§Ã£o e cÃ¡lculo de subtotal
  for item_record in select value from jsonb_array_elements(cart_payload)
  loop
    is_legacy := item_record ? 'categoria';

    if is_legacy then
      -- Formato legado
      category_sku := item_record->'categoria'->>'id';
      select nome->>'es' into category_name from public.categories where id = category_sku and active = true;
      if category_name is null then
        raise exception 'Category % not found or inactive', category_sku;
      end if;

      select coalesce(array_agg(value->>'id'), array[]::text[])
        into flavor_ids
        from jsonb_array_elements(coalesce(item_record->'sabores', '[]'::jsonb));

      select coalesce(array_agg(value->>'id'), array[]::text[])
        into topping_ids
        from jsonb_array_elements(coalesce(item_record->'toppings', '[]'::jsonb));

      if coalesce(array_length(flavor_ids, 1), 0) = 0 then
        raise exception 'Each legacy cart item must contain at least one flavor';
      end if;

      select count(*) into flavor_count from public.flavors where id = any(flavor_ids) and available = true;
      if flavor_count <> array_length(flavor_ids, 1) then
        raise exception 'One or more selected flavors are unavailable';
      end if;

      item_price := round(
        (select c.base_price from public.categories c where c.id = category_sku)
        + coalesce((select sum(f.extra_price) from public.flavors f where f.id = any(flavor_ids)), 0)
        + coalesce((select sum(t.price) from public.toppings t where t.id = any(topping_ids)), 0),
        2
      );
    else
      -- Formato novo (produto)
      product_id := item_record->'product'->>'id';
      if product_id is null then
        product_id := item_record->>'product_id';
      end if;

      if product_id is not null then
        select p.nome->>'es' into product_name from public.products p where p.id = product_id and p.active = true;
        if product_name is null then
          raise exception 'Product % not found or inactive', product_id;
        end if;
      end if;

      item_price := coalesce((item_record->>'unit_price')::numeric, (item_record->>'precoUnitario')::numeric, 0);
    end if;

    items_subtotal := items_subtotal + item_price;
  end loop;

  -- CÃ¡lculos finais
  discount_total := round(items_subtotal * discount_rate, 2);
  subtotal_total := round(items_subtotal + extras_total - discount_total, 2);
  iva_total := round(subtotal_total * 0.10, 2);
  grand_total := round(subtotal_total + iva_total, 2);

  -- Inserir pedido
  insert into public.orders (
    status,
    payment_method,
    subtotal,
    discount,
    extras,
    total,
    iva,
    customer_phone,
    customer_id,
    origem,
    nome_usuario
  )
  values (
    'pendiente',
    payment_method_input,
    subtotal_total,
    discount_total,
    extras_total,
    grand_total,
    iva_total,
    order_customer_phone,
    order_customer_id,
    order_origem,
    order_nome_usuario
  )
  returning id, numero_sequencial into order_id_output, order_number_output;

  -- Gerar Verifactu QR
  update public.orders
  set verifactu_qr = jsonb_build_object(
    'id', concat('pedido-', order_number_output),
    'fecha', current_date,
    'importe', to_char(grand_total, 'FM999999990.00'),
    'establecimiento', (select name from public.store_settings where store_key = 'main')
  )::text
  where id = order_id_output;

  -- Segunda passada: inserir itens e gerenciar estoque
  for item_record in select value from jsonb_array_elements(cart_payload)
  loop
    item_index := item_index + 1;
    is_legacy := item_record ? 'categoria';

    if is_legacy then
      -- â”€â”€â”€ Formato legado â”€â”€â”€
      category_sku := item_record->'categoria'->>'id';
      select nome->>'es' into category_name from public.categories where id = category_sku;

      select coalesce(array_agg(value->>'id'), array[]::text[])
        into flavor_ids
        from jsonb_array_elements(coalesce(item_record->'sabores', '[]'::jsonb));

      select coalesce(array_agg(value->>'id'), array[]::text[])
        into topping_ids
        from jsonb_array_elements(coalesce(item_record->'toppings', '[]'::jsonb));

      item_price := round(
        (select c.base_price from public.categories c where c.id = category_sku)
        + coalesce((select sum(f.extra_price) from public.flavors f where f.id = any(flavor_ids)), 0)
        + coalesce((select sum(t.price) from public.toppings t where t.id = any(topping_ids)), 0),
        2
      );

      insert into public.order_items (
        order_id, sort_order, item_type,
        category_sku, category_name, flavors, toppings,
        unit_price, quantity, notes
      )
      values (
        order_id_output, item_index, 'legacy',
        category_sku, category_name,
        public.serialize_flavors(flavor_ids),
        public.serialize_toppings(topping_ids),
        item_price, 1,
        nullif(item_record->>'notas', '')
      );

      -- Debitar estoque de sabores
      consumption := public.calculate_flavor_consumption(category_sku, array_length(flavor_ids, 1));
      for i in 1..coalesce(array_length(flavor_ids, 1), 0)
      loop
        perform public.debit_flavor_stock(flavor_ids[i], consumption, order_id_output, 'legacy order');
      end loop;

    else
      -- â”€â”€â”€ Formato novo (produto) â”€â”€â”€
      product_id := coalesce(item_record->'product'->>'id', item_record->>'product_id');
      product_snapshot := coalesce(item_record->'product', item_record->'product_snapshot', '{}'::jsonb);
      selections := coalesce(item_record->'selections', item_record->'selecoes', '[]'::jsonb);
      item_price := coalesce((item_record->>'unit_price')::numeric, (item_record->>'precoUnitario')::numeric, 0);

      if product_id is not null then
        select p.nome->>'es' into product_name from public.products p where p.id = product_id;
      else
        product_name := product_snapshot->>'nome';
        if product_name is null then
          product_name := product_snapshot->'nome'->>'es';
        end if;
      end if;

      -- Popular flavors/toppings a partir das selections para compatibilidade
      flavor_ids := array[]::text[];
      topping_ids := array[]::text[];

      -- Extrair sabores das selections (se tiverem flavor_ref ou id matching)
      if selections ? 'sabores' then
        for selection_sabor in select value from jsonb_array_elements(selections->'sabores')
        loop
          if selection_sabor ? 'flavor_ref' then
            flavor_ids := array_append(flavor_ids, selection_sabor->>'flavor_ref');
          elsif selection_sabor ? 'id' and exists (select 1 from public.flavors f where f.id = selection_sabor->>'id') then
            flavor_ids := array_append(flavor_ids, selection_sabor->>'id');
          end if;
        end loop;
      end if;

      -- Extrair toppings das selections
      if selections ? 'toppings' then
        for selection_array in select value from jsonb_array_elements(selections->'toppings')
        loop
          if selection_array ? 'id' and exists (select 1 from public.toppings t where t.id = selection_array->>'id') then
            topping_ids := array_append(topping_ids, selection_array->>'id');
          end if;
        end loop;
      end if;

      insert into public.order_items (
        order_id, sort_order, item_type,
        product_id, product_name, product_snapshot, selections,
        category_sku, category_name, flavors, toppings,
        unit_price, quantity, notes
      )
      values (
        order_id_output, item_index, 'product',
        product_id, product_name, product_snapshot, selections,
        product_snapshot->>'categoria', product_name,
        public.serialize_flavors(flavor_ids),
        public.serialize_toppings(topping_ids),
        item_price,
        coalesce((item_record->>'quantity')::integer, (item_record->>'quantidade')::integer, 1),
        nullif(coalesce(item_record->>'notes', item_record->>'notas'), '')
      );

      -- Debitar estoque de sabores se houver match
      if array_length(flavor_ids, 1) > 0 then
        category_sku := product_snapshot->>'categoria';
        consumption := public.calculate_flavor_consumption(category_sku, array_length(flavor_ids, 1));
        for i in 1..array_length(flavor_ids, 1)
        loop
          perform public.debit_flavor_stock(flavor_ids[i], consumption, order_id_output, 'product order: ' || coalesce(product_name, 'unknown'));
        end loop;
      end if;

    end if;
  end loop;

  return order_id_output;
end;
$$;

create or replace function public.update_order_status(order_id_input uuid, status_input text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.orders
  set
    status = status_input,
    ready_at = case when status_input = 'listo' then now() else ready_at end
  where id = order_id_input;
end;
$$;

create or replace function public.adjust_flavor_stock(flavor_id_input text, delta_input numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  stock_atual numeric(10,3);
  stock_novo numeric(10,3);
begin
  select stock_buckets into stock_atual from public.flavors where id = flavor_id_input;
  if stock_atual is null then
    return;
  end if;
  stock_novo := greatest(0, round(stock_atual + delta_input, 3));

  update public.flavors
  set stock_buckets = stock_novo
  where id = flavor_id_input;

  insert into public.inventory_log (flavor_id, tipo, delta, stock_antes, stock_depois, motivo)
  values (flavor_id_input, case when delta_input >= 0 then 'ajuste' else 'venda' end, delta_input, stock_atual, stock_novo, 'manual adjustment');
end;
$$;

create or replace function public.set_flavor_availability(flavor_id_input text, available_input boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.flavors
  set available = available_input
  where id = flavor_id_input;
end;
$$;

create or replace function public.upsert_store_settings(setting_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.store_settings (
    store_key, name, nif, address, summer_hours, winter_hours
  )
  values (
    'main',
    coalesce(setting_payload->>'name', 'Heladeria Sabadell Nord'),
    coalesce(setting_payload->>'nif', 'B-12345678'),
    coalesce(setting_payload->>'address', 'Carrer de la Concepcio, 23, 08201 Sabadell, Barcelona'),
    coalesce(setting_payload->>'summerHours', '16:00 - 23:00'),
    coalesce(setting_payload->>'winterHours', '17:00 - 22:00')
  )
  on conflict (store_key) do update
  set
    name = excluded.name,
    nif = excluded.nif,
    address = excluded.address,
    summer_hours = excluded.summer_hours,
    winter_hours = excluded.winter_hours,
    updated_at = now();
end;
$$;

create or replace function public.upsert_customer(
  nome_input text,
  telefone_input text,
  email_input text default null,
  alergias_input jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  customer_id uuid;
begin
  insert into public.customers (nome, telefone, email, alergias)
  values (nome_input, telefone_input, email_input, alergias_input)
  on conflict (telefone) do update
  set nome = excluded.nome, email = coalesce(excluded.email, customers.email), alergias = excluded.alergias
  returning id into customer_id;

  return customer_id;
end;
$$;

grant execute on function public.create_order(jsonb, text, jsonb) to anon, authenticated;
grant execute on function public.create_demo_order(jsonb, text, jsonb) to anon, authenticated;
grant execute on function public.update_order_status(uuid, text) to anon, authenticated;
grant execute on function public.adjust_flavor_stock(text, numeric) to anon, authenticated;
grant execute on function public.set_flavor_availability(text, boolean) to anon, authenticated;
grant execute on function public.upsert_store_settings(jsonb) to anon, authenticated;
grant execute on function public.reset_demo_data() to anon, authenticated;
grant execute on function public.get_products_by_category(text) to anon, authenticated;
grant execute on function public.update_product_stock(text, boolean) to anon, authenticated;
grant execute on function public.upsert_customer(text, text, text, jsonb) to anon, authenticated;
grant execute on function public.debit_flavor_stock(text, numeric, uuid, text) to anon, authenticated;
grant execute on function public.calculate_flavor_consumption(text, integer) to anon, authenticated;

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- RPCs KIOSK CODES
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

-- Gera um cÃ³digo de 5 dÃ­gitos para vincular pedido kiosk ao perfil PWA
create or replace function public.generate_kiosk_code(customer_id_input uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
  code_exists boolean;
begin
  -- Invalida cÃ³digos antigos do mesmo customer
  update public.kiosk_codes
  set used_at = now()
  where customer_id = customer_id_input and used_at is null;

  -- Gera cÃ³digo Ãºnico de 5 dÃ­gitos
  loop
    new_code := lpad(floor(random() * 100000)::text, 5, '0');
    select exists(select 1 from public.kiosk_codes where code = new_code and used_at is null and expires_at > now())
    into code_exists;
    exit when not code_exists;
  end loop;

  insert into public.kiosk_codes (code, customer_id, expires_at)
  values (new_code, customer_id_input, now() + interval '5 minutes');

  return new_code;
end;
$$;

-- Valida um cÃ³digo de kiosk e retorna o customer_id
create or replace function public.validate_kiosk_code(code_input text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_id uuid;
begin
  select id into matched_id
  from public.kiosk_codes
  where code = code_input
    and used_at is null
    and expires_at > now()
  for update skip locked;

  if matched_id is null then
    raise exception 'CÃ³digo invÃ¡lido ou expirado';
  end if;

  update public.kiosk_codes
  set used_at = now()
  where id = matched_id;

  return (select customer_id from public.kiosk_codes where id = matched_id);
end;
$$;

grant execute on function public.generate_kiosk_code(uuid) to anon, authenticated;
grant execute on function public.validate_kiosk_code(text) to anon, authenticated;

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- REALTIME
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

do $$
begin
  begin alter publication supabase_realtime add table public.categories; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.product_categories; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.products; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.flavors; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.toppings; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.store_settings; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.customers; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.orders; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.order_items; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.inventory_log; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.kiosk_codes; exception when duplicate_object then null; end;
end $$;

-- Inicializa dados
select public.reset_demo_data();
`;
  await page.evaluate((sqlContent) => {
    const editors = window.monaco?.editor?.getEditors?.() || [];
    if (editors.length > 0) {
      editors[0].setValue(sqlContent);
    }
  }, sql);
  await page.waitForTimeout(1000);
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const runBtn = buttons.find(b => b.textContent?.trim()?.includes("Run"));
    if (runBtn) runBtn.click();
  });
  return { sqlLength: sql.length };
}
