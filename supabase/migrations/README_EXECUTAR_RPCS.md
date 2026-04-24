# Instruções para Restaurar as RPCs no Supabase

## Problema
O SQL Editor do Supabase falha silenciosamente em scripts grandes com múltiplos blocos `$$`. Por isso, dividimos as funções em arquivos pequenos.

## Ordem de Execução (IMPORTANTE!)

Execute **um por vez** no SQL Editor do Supabase, na ordem abaixo:

### 1. Helpers (primeiro — create_order depende deles)
- `func_00_helpers.sql`
  - `serialize_flavors()`
  - `serialize_toppings()`
  - `debit_flavor_stock()`
  - `calculate_flavor_consumption()`

### 2. Função principal de pedidos
- `func_04_create_order.sql`
  - `create_order()` — cria pedidos e dá baixa no estoque

### 3. Funções de gestão de pedidos e estoque
- `func_05_update_order_status.sql`
- `func_06_adjust_flavor_stock.sql`
- `func_07_set_product_availability.sql`
- `func_08_set_flavor_availability.sql`

### 4. Funções de configuração e cliente
- `func_09_upsert_store_settings.sql`
- `func_10_upsert_customer.sql`

### 5. Funções do kiosk
- `func_99_kiosk_codes.sql` (tabela + generate_kiosk_code + validate_kiosk_code)

---

## Como executar

1. Acesse: https://supabase.com/dashboard/project/dproxlygtabihfhtxdvm/editor
2. Abra um **New query**
3. Cole o conteúdo de **UM** arquivo
4. Clique em **Run** (Ctrl+Enter)
5. Verifique se aparece "Success" sem erros
6. Repita para o próximo arquivo

## Verificação rápida

Depois de executar todos, rode no SQL Editor:

```sql
SELECT proname FROM pg_proc 
WHERE pronamespace = 'public'::regnamespace 
AND proname IN (
  'create_order', 'update_order_status', 'adjust_flavor_stock',
  'set_product_availability', 'set_flavor_availability',
  'upsert_store_settings', 'upsert_customer',
  'generate_kiosk_code', 'validate_kiosk_code',
  'reset_demo_data'
)
ORDER BY proname;
```

Deve retornar **10 funções**.

---

## Notas

- `serialize_flavors` e `serialize_toppings` não precisam de GRANT — são helpers internos chamados por `create_order` (SECURITY DEFINER)
- Os arquivos `func_00_serialize_flavors.sql` a `func_03_calculate_flavor_consumption.sql` estão incluídos dentro de `func_00_helpers.sql` (consolidado)
- Cada arquivo contém também os GRANTs necessários para anon e authenticated
