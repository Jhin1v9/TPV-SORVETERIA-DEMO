CREATE OR REPLACE FUNCTION public.upsert_store_settings(setting_payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.store_settings (store_key, name, nif, address, summer_hours, winter_hours)
  VALUES (
    'main',
    COALESCE(setting_payload->>'name', 'Heladeria Sabadell Nord'),
    COALESCE(setting_payload->>'nif', 'B-12345678'),
    COALESCE(setting_payload->>'address', 'Carrer de la Concepcio, 23, 08201 Sabadell, Barcelona'),
    COALESCE(setting_payload->>'summerHours', '16:00 - 23:00'),
    COALESCE(setting_payload->>'winterHours', '17:00 - 22:00')
  )
  ON CONFLICT (store_key) DO UPDATE
  SET name = excluded.name,
      nif = excluded.nif,
      address = excluded.address,
      summer_hours = excluded.summer_hours,
      winter_hours = excluded.winter_hours,
      updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_store_settings(jsonb) TO anon, authenticated;