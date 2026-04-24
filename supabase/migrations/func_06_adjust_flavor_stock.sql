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

GRANT EXECUTE ON FUNCTION public.adjust_flavor_stock(text, numeric) TO anon, authenticated;