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

GRANT EXECUTE ON FUNCTION public.set_flavor_availability(text, boolean) TO anon, authenticated;