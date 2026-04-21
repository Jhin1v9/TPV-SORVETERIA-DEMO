# TPV Sorveteria Demo - Contexto Persistente

## Última Atualização
2026-04-21

## Estado do Projeto

### Build Status
- ✅ Cliente: compila e builda
- ✅ Kiosk: compila e builda (redesign glassmorphism completo)
- ✅ Admin: compila e builda
- ✅ KDS: compila e builda
- ✅ Tests: 27 E2E passando

### Supabase
- URL: https://jmvikjujftidgcezmlfc.supabase.co
- Anon Key: configurada em todos os 4 vercel.json
- **RPCs EXISTEM e FUNCIONAM** - testado via API:
  - `create_demo_order` ✅
  - `update_order_status` ✅
  - `adjust_flavor_stock` ✅
  - `reset_demo_data` ✅ (com warning UPDATE requires WHERE)
- Tabelas existem com seed data
- Realtime publication configurada
- Sem necessidade de `supabase db push` (schema já está no servidor)

### Kiosk Redesign (Concluído)
Todas as telas do kiosk foram redesenhadas com glassmorphism escuro (#0a0a0f):

1. **HolaScreen** - Tela de boas-vindas com gradient orbs, floating emojis, seletor de idioma (ca/es/pt/en), CTA grande
2. **CardapioScreen** - NOVA tela com cardápio real (13 categorias: copas, gofres, acai, helados, conos, etc.) usando dados de `produtosLocal.ts`
3. **PersonalizacaoScreen** - NOVA tela para produtos customizáveis (tamanhos, sabores, toppings, frutas, extras) com limites e cálculo de preço dinâmico
4. **CarrinhoScreen** - Redesign glassmorphism com resumo, IVA, total, botão pagar verde
5. **PagamentoScreen** - Redesign glassmorphism com tabs (tarjeta/efectivo/bizum), visual de cartão, QR code
6. **ConfirmacaoScreen** - Redesign glassmorphism com confetti, número do pedido grande, QR Verifactu, timer auto-reset

### Fluxo do Kiosk
Hola → Cardapio → [Personalizacao opcional] → Carrinho → Pagamento → Confirmação → Reset

### Mapeamento de Categorias (Novo → Legacy RPC)
O KioskApp.tsx mapeia produtos do cardápio real para categorias legadas do Supabase:
- copas/gofres/acai/batidos → copo500
- helados/granizados/orxata/cafes → copo300
- conos → cone
- souffle/banana-split/tarrinas-nata/para-llevar → pote1l

Isso permite que pedidos do novo cardápio cheguem ao KDS/Admin via Supabase.

### Admin Updates
- EstoquePage: remove cards antigos (copo300/500/cone/pote1l), adiciona stats gerais (sabores activos, baldes totais, porciones, stock bajo)

### Pendente
- [ ] Deploy para Vercel (4 apps)
- [ ] Testar fluxo end-to-end no kiosk deployado
- [ ] Adicionar imagens reais dos produtos (atualmente usando Unsplash)
- [ ] Verificar se `reset_demo_data` precisa de fix no WHERE clause
