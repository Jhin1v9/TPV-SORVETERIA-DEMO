# TPV Sorveteria Demo - Contexto Persistente

## Última Atualização
2026-04-21

## Estado do Projeto

### Build Status
- ✅ Cliente: compila e builda
- ✅ Kiosk: compila e builda (redesign glassmorphism completo)
- ✅ Admin: compila e builda
- ✅ KDS: compila e builda
- ✅ Tests: 73 unitários passando (4 suites)
- ⚠️ E2E: 4 suites do Playwright (não rodadas pelo vitest — requerem servidor)

### Supabase
- URL: https://jmvikjujftidgcezmlfc.supabase.co
- Schema definitivo: `supabase/schema-expanded.sql` (auto-contido)
- Tabelas: `categories` (legado), `product_categories`, `products`, `flavors`, `toppings`, `orders`, `order_items`, `customers`, `store_settings`, `inventory_log`
- RPCs funcionais:
  - `create_order` ✅ (suporta formato novo `product` + legado `categoria`, agora com `customer_id`)
  - `create_demo_order` ✅ (delega para `create_order`)
  - `update_order_status` ✅
  - `adjust_flavor_stock` ✅
  - `set_flavor_availability` ✅
  - `reset_demo_data` ✅
  - `upsert_store_settings` ✅
  - `get_products_by_category` ✅
  - `update_product_stock` ✅
  - `upsert_customer` ✅
  - `generate_kiosk_code` ✅ (novo — gera código de 5 dígitos para login kiosk)
  - `validate_kiosk_code` ✅ (novo — valida código e retorna customer_id)
- Realtime publication configurada para todas as tabelas (incluindo `kiosk_codes`)

### Modelo de Dados (Novo)
- **Produtos fixos**: `copa-bahia`, `copa-oreo`, `cafe`, etc. — preço fixo, sem personalização
- **Produtos personalizáveis**: `acai`, `helado-terra`, `cono`, `gofre`, `granizado`, `batido`, `orxata`, `tarrina-nata` — com `opcoes` (tamanhos, sabores, toppings, frutas, extras) e `limites`
- **Pedidos**: armazenam `product_snapshot` JSONB imutável + `selections` JSONB, agora com `customer_id` FK
- **Estoque**: sabores artesanais com `stock_buckets` + `inventory_log` para auditoria
- **Kiosk Codes**: nova tabela `kiosk_codes` para login rápido PWA ↔ Kiosk (código 5 dígitos, TTL 5 min)
- **Compatibilidade**: campos legados (`category_sku`, `category_name`, `flavors`, `toppings`) populados automaticamente pela RPC para KDS/Admin legado

### Fluxo do Kiosk
Hola → Cardapio → [Personalizacao opcional] → Carrinho → Pagamento → Confirmação → Reset

### Fluxo do Cliente PWA
Cardápio → [PersonalizacaoDrawer opcional] → (fly-to-cart animation) → Tab Carrinho → Pagamento → Confirmação

### Cliente PWA — UX Mobile
- ✅ **Fly-to-cart animation**: quando adiciona produto, uma miniatura voa do botão até o ícone do carrinho na tab bar
- ✅ **Badge bounce**: o contador do carrinho dá um bounce spring quando incrementa
- ✅ **Não abre drawer automaticamente**: o carrinho só abre quando clica na tab "carrinho"
- ✅ **PersonalizacaoDrawer**: produtos personalizáveis abrem drawer de seleção de opções

### KDS / Admin — Renderização de Pedidos
- ✅ KDS renderiza `productName` + `selections` quando `itemType === 'product'`
- ✅ Admin renderiza `productName` + `selections` no modal de detalhes e no CSV export
- ✅ Legado (`itemType === 'legacy'`) continua funcionando como antes

### Auris Bug Detector
- ✅ Integrado nos 4 apps via `TPVBugDetectorProvider`
- ✅ Botão flutuante 🐛 no canto inferior direito
- ✅ Atalho: `Ctrl+Shift+D`
- ✅ Guest mode ativado

### Apps Atualizados
- **Kiosk**: usa `CartItem` nativo, envia pedidos no formato novo para Supabase
- **Cliente PWA**: usa `CartItem` nativo, fly-to-cart, PersonalizacaoDrawer, sem drawer automático
- **KDS**: renderiza produtos do novo modelo (productName + selections)
- **Admin**: renderiza produtos do novo modelo no modal e CSV

### Assets
- Imagens dos produtos em `public/assets/demo/` (categorias) e `public/assets/sabores/` (sabores reais)
- Todas as imagens dos produtos no catálogo apontam para assets locais (não mais Unsplash)

### Pendente / Próximos Passos
- [x] Aplicar migration SQL no Supabase remoto (tabela `kiosk_codes` + RPCs) — ✅ Aplicado em 2026-04-21
- [x] Testar RPCs no Supabase remoto — ✅ generate_kiosk_code, validate_kiosk_code, create_order com customer_id — todas funcionando
- [ ] Deploy para Vercel (4 apps)
- [ ] Testar fluxo end-to-end no kiosk deployado
- [ ] Adicionar imagens reais individuais de cada produto (atualmente usando imagens de categoria como placeholder)
