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

GRANT EXECUTE ON FUNCTION public.upsert_customer(text, text, text, jsonb) TO anon, authenticated;
