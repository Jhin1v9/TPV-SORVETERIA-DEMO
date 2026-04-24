-- Helper functions for create_order

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

GRANT EXECUTE ON FUNCTION public.debit_flavor_stock(text, numeric, uuid, text) TO anon, authenticated;

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

GRANT EXECUTE ON FUNCTION public.calculate_flavor_consumption(text, integer) TO anon, authenticated;