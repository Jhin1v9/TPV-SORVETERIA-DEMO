# Supabase Setup

## Arquitetura final

- Frontend: Vercel
- Fonte unica de verdade: Supabase Postgres
- Realtime: Supabase Realtime com `postgres_changes`
- Escritas sensiveis: RPCs SQL com `security definer`

## O que executar no Supabase

1. Crie um projeto no Supabase.
2. Abra o `SQL Editor`.
3. Cole e execute tudo de [supabase/schema.sql](/c:/Users/Administrator/Documents/sorveteria_tpv/tpv_sorveteria_demo_remote/supabase/schema.sql:1).

Esse arquivo cria:

- tabelas `categories`, `flavors`, `toppings`, `store_settings`, `orders`, `order_items`
- RLS de leitura publica para a demo
- funcoes RPC:
  - `create_demo_order`
  - `update_order_status`
  - `adjust_flavor_stock`
  - `set_flavor_availability`
  - `upsert_store_settings`
  - `reset_demo_data`
- publicacao de realtime
- seed inicial da demo

## Variaveis de ambiente

Use o arquivo [.env.example](/c:/Users/Administrator/Documents/sorveteria_tpv/tpv_sorveteria_demo_remote/.env.example:1) como base.

No local:

```powershell
copy .env.example .env
```

Preencha:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Na Vercel, cadastre exatamente as mesmas variaveis em:

- `Project Settings`
- `Environment Variables`

## Como rodar

```powershell
npm install
npm run dev
```

## Como validar

1. Abra o kiosk.
2. Faça um pedido.
3. Abra KDS e Admin em outra aba ou dispositivo.
4. Confirme que o pedido apareceu nos dois.
5. Altere status no KDS.
6. Confirme o reflexo no Admin.
7. Teste `Reset Demo` no Admin.

## Observacoes

- O projeto usa o nome novo oficial `VITE_SUPABASE_PUBLISHABLE_KEY`.
- Por compatibilidade, o app ainda aceita `VITE_SUPABASE_ANON_KEY` se voce ja tiver configurado assim.
- Se `VITE_SUPABASE_URL` e nenhuma dessas chaves existirem, a aplicacao entra em modo local standalone.
- Com Supabase configurado, o app nao cai silenciosamente para modo local em caso de erro; ele fica offline para evitar divergencia entre dispositivos.
