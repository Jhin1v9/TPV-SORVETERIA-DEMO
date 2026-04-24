# 🔌 APIs e Integrações

> "A API é um contrato. Quebre o contrato, quebre a confiança."

## Supabase API

### Base URL
```
https://jmvikjujftidgcezmlfc.supabase.co
```

### Headers Padrão
```
apikey: sb_publishable_oSg8rtPqfJnPCrl_Axw-_g_rRvugcnV
Authorization: Bearer sb_publishable_oSg8rtPqfJnPCrl_Axw-_g_rRvugcnV
Content-Type: application/json
```

### Endpoints REST Principais

#### Tabelas (Leitura Pública via RLS)
```
GET /rest/v1/categories?select=*&order=display_order.asc
GET /rest/v1/product_categories?select=*&order=display_order.asc
GET /rest/v1/products?select=*&order=display_order.asc
GET /rest/v1/flavors?select=*&order=id.asc
GET /rest/v1/toppings?select=*&order=id.asc
GET /rest/v1/store_settings?store_key=eq.main&select=*
GET /rest/v1/orders?select=*,order_items(*)&order=numero_sequencial.desc
```

#### RPCs (Escrita via Security Definer)
```
POST /rest/v1/rpc/create_order
Body: {
  cart_payload: CartItem[],
  payment_method_input: string,
  checkout_payload: { origem, customerId, notificationPhone, ... }
}
Returns: UUID (order_id)

POST /rest/v1/rpc/update_order_status
Body: { order_id_input: UUID, status_input: string }
Returns: void

POST /rest/v1/rpc/adjust_flavor_stock
Body: { flavor_id_input: string, delta_input: number }
Returns: void

POST /rest/v1/rpc/set_flavor_availability
Body: { flavor_id_input: string, available_input: boolean }
Returns: void

POST /rest/v1/rpc/upsert_store_settings
Body: { setting_payload: EstablishmentSettings }
Returns: void

POST /rest/v1/rpc/reset_demo_data
Body: {}
Returns: void

POST /rest/v1/rpc/generate_kiosk_code
Body: { customer_id_input: string }
Returns: string (5-digit code)

POST /rest/v1/rpc/validate_kiosk_code
Body: { code_input: string }
Returns: string (customer_id) or error
```

### Realtime (WebSocket)

#### Canal
```
wss://jmvikjujftidgcezmlfc.supabase.co/realtime/v1/websocket
?apikey=sb_publishable_oSg8rtPqfJnPCrl_Axw-_g_rRvugcnV
&vsn=1.0.0
```

#### Tabelas Monitoradas
Todas as tabelas na publicação `supabase_realtime`:
- `categories`
- `product_categories`
- `products`
- `flavors`
- `toppings`
- `store_settings`
- `orders`
- `order_items`
- `customers`
- `inventory_log`
- `kiosk_codes`

#### Evento Disparado
```javascript
{
  topic: 'realtime:public:orders',
  event: 'postgres_changes',
  payload: { data: { ... } }
}
```

## Demo Server (Legado — Porta 8787)

> ⚠️ **DEPRECATED**: Não integrado ao frontend. Mantido para referência.

```
POST   /api/orders              → Criar pedido
POST   /api/orders/:id/status   → Atualizar status
GET    /api/events              → SSE (Server-Sent Events)
POST   /api/bootstrap           → Inicializar estado
GET    /api/health              → Healthcheck
```

## Integrações Externas

### Vercel (Deploy)
- **Cliente:** https://cliente-pearl.vercel.app
- **Kiosk:** https://kiosk-swart-delta.vercel.app
- **Admin:** https://admin-ten-vert-54.vercel.app
- **KDS:** https://kds-one.vercel.app

### Supabase (Backend)
- **Project:** jmvikjujftidgcezmlfc
- **Region:** (ver dashboard)
- **Plan:** Free Tier

## CORS Configuração (PENDENTE)

### Origens que DEVEM ser permitidas:
```
https://cliente-pearl.vercel.app
https://kds-one.vercel.app
https://admin-ten-vert-54.vercel.app
https://kiosk-swart-delta.vercel.app
http://localhost:5173
http://localhost:5174
http://localhost:5175
http://localhost:5176
```

### Como configurar:
1. Supabase Dashboard → Project Settings → API
2. CORS Origins → adicione as URLs acima
3. Save

### Headers necessários:
```
Access-Control-Allow-Origin: [origem-da-requisicao]
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: apikey, Authorization, Content-Type
```

## Contratos de Dados

### CartItem (Frontend → RPC)
```typescript
interface CartItem {
  product: Product;           // snapshot do produto
  selections?: Record<string, OpcaoPersonalizacao[]>;
  quantity: number;
  unitPrice: number;
  notes?: string;
}
```

### CheckoutPayload (Frontend → RPC)
```typescript
interface CheckoutPayload {
  origem: 'pwa' | 'tpv' | 'kiosk';
  customerId?: string;
  notificationPhone?: string;
  promoCode?: string;
  promoApplied?: boolean;
  promoDiscountRate?: number;
  coffeeAdded?: boolean;
  coffeePrice?: number;
}
```

### DemoStateSnapshot (Backend → Frontend)
```typescript
interface DemoStateSnapshot {
  categorias: Categoria[];
  productCategories: ProductCategory[];
  products: Product[];
  sabores: Sabor[];
  toppings: Topping[];
  pedidos: Pedido[];
  vendasHistorico: DiaVenda[];
  establishment: EstablishmentSettings;
  lastOrderNumber: number;
  updatedAt: string;
}
```

---

*Atualizado em: 2026-04-23*
*Próxima revisão: quando nova API ou integração for adicionada*
