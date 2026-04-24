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

-- 6. Realtime (ignora se jÃ¡ existir)
DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.kiosk_codes; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;