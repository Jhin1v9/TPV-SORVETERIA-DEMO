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

GRANT EXECUTE ON FUNCTION public.update_order_status(uuid, text) TO anon, authenticated;
