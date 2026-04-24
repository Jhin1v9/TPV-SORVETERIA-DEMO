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

GRANT EXECUTE ON FUNCTION public.set_product_availability(text, boolean) TO anon, authenticated;