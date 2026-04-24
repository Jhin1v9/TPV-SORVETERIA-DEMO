const { Client } = require('pg');
const c = new Client({
  host: 'aws-0-eu-west-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.dproxlygtabihfhtxdvm',
  password: '@AbnerI6p4p0a6',
  ssl: { rejectUnauthorized: false }
});

c.connect().then(async () => {
  // Create test function with same signature but different name
  await c.query(`
CREATE OR REPLACE FUNCTION public.test_upsert_customer(nome_input text, telefone_input text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE customer_id uuid;
BEGIN
  INSERT INTO public.customers (nome, telefone) VALUES (nome_input, telefone_input)
  ON CONFLICT (telefone) DO UPDATE SET nome = excluded.nome RETURNING id INTO customer_id;
  RETURN customer_id;
END;
$$;
GRANT EXECUTE ON FUNCTION public.test_upsert_customer(text, text) TO anon, authenticated;
  `);
  console.log('test_upsert_customer created');

  await c.query("NOTIFY pgrst, 'reload schema'");
  await new Promise(r => setTimeout(r, 3000));
  console.log('Schema reloaded');
  c.end();
}).catch(e => console.error(e.message));
