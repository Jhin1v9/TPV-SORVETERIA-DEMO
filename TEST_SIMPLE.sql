CREATE OR REPLACE FUNCTION public.hello_test()
RETURNS text
LANGUAGE sql
AS $$ SELECT 'hello'::text; $$;

GRANT EXECUTE ON FUNCTION public.hello_test() TO anon, authenticated;
