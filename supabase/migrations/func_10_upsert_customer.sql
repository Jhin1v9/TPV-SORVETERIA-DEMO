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

GRANT EXECUTE ON FUNCTION public.upsert_customer(text, text, text, jsonb) TO anon, authenticated;