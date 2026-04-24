# 🍦 Domínio: Sorveteria / Heladería

> "Conheça o negócio antes de codar o negócio."

## Glossário de Negócio

| Termo (PT) | Termo (ES) | Significado |
|-----------|-----------|-------------|
| Sorvete | Helado | Produto base de gelado |
| Copo / Taça | Copa | Recipiente de vidro/plástico com sorvete |
| Cone / Casquinha | Cono | Recipiente comestível (waffle) |
| Pote | Tarrina | Recipiente para viagem (500ml, 1L) |
| Açaí | Açaí | Fruto da palmeira, servido como bowl |
| Granizado | Granizado | Bebida gelada triturada |
| Batido | Batido | Milkshake / smoothie |
| Orxata | Horchata | Bebida tradicional de chufa/arraço |
| Gofre | Gofre | Waffle belga |
| Topping | Topping | Cobertura adicional (calda, granulado, frutas) |
| Sabor artesanal | Sabor artesanal | Sabores feitos na loja (com estoque controlado) |
| Baldes / Cubas | Buckets | Unidade de estoque de sabor (aprox. 5L) |
| Verifactu | Verifactu | Sistema de faturação espanhol (QR code fiscal) |

## Fluxos de Negócio

### Fluxo 1: Cliente PWA → Pedido → Cozinha
```
[Cliente PWA]
  → Navega cardápio
  → Seleciona produto (fixo ou personalizável)
  → Adiciona ao carrinho (fly-to-cart animation)
  → Vai para tab Carrinho
  → Seleciona método de pagamento (tarjeta/bizum/efectivo)
  → Confirma pedido
  → Recebe número de pedido + QR Verifactu
  
  ↓ (Supabase Realtime)
  
[KDS — Cozinha]
  → Recebe pedido em tempo real (beep sonoro)
  → Prepara pedido (status: pendiente → preparando → listo)
  → Cliente retira no balcão
  → Marca como entregado
```

### Fluxo 2: Kiosk (Self-service)
```
[Cliente no Kiosk]
  → Tela "Hola"
  → Navega categorias
  → Seleciona produto
  → [Se personalizável] Tela de personalização
  → Adiciona ao carrinho
  → Vai para carrinho
  → Pagamento
  → Confirmação com número
  → Kiosk reseta para próximo cliente
```

### Fluxo 3: Kiosk Code (Login Rápido)
```
[Cliente PWA]
  → Perfil → "Gerar código para Kiosk"
  → Recebe código de 5 dígitos (válido por 5 min)
  
  ↓ (vai até o kiosk físico)
  
[Kiosk]
  → Tela de login → "Já tenho conta"
  → Digita código de 5 dígitos
  → Valida via RPC validate_kiosk_code
  → Carrega perfil do cliente (nome, alergias, histórico)
```

## Regras de Negócio Críticas

### RN-001: Estoque de Sabores Artesanais
- Cada sabor tem `stock_buckets` (float, ex: 3.5 = 3 baldes e meio)
- Pedido consome estoque automaticamente via `debit_flavor_stock`
- Consumo varia por categoria:
  - Copas: 0.1 balde por unidade
  - Helados (copo médio): 0.052 balde
  - Conos: 0.031 balde
  - Default: 0.1 balde

### RN-002: Preços e Impostos
- IVA espanhol: 10% (reduzido para alimentação)
- Subtotal = soma dos itens
- Total = subtotal - desconto + extras + IVA
- Verifactu QR gerado automaticamente pela RPC

### RN-003: Personalização
- Produtos `is_personalizavel = true` têm `opcoes` JSONB
- Cada opção tem: id, nome (i18n), preço, tipo (sabor/topping/extra/fruta)
- `limites` JSONB define quantos de cada tipo podem ser selecionados
- Seleções são salvas como JSONB em `order_items.selections`

### RN-004: Status do Pedido (KDS)
| Status | Significado | Quem muda |
|--------|-------------|-----------|
| `pendiente` | Pedido recebido, aguardando preparo | Automático (create_order) |
| `preparando` | Em preparação | Cozinheiro (KDS) |
| `listo` | Pronto para retirada | Cozinheiro (KDS) |
| `entregado` | Entregue ao cliente | Cozinheiro (KDS) |
| `cancelado` | Cancelado | Admin |

### RN-005: Compatibilidade Legado
- Pedidos novos são `itemType = 'product'`
- Pedidos antigos são `itemType = 'legacy'`
- KDS e Admin renderizam ambos usando `productName` + `selections`
- Campos legados (`category_sku`, `category_name`, `flavors[]`) são populados pela RPC para compatibilidade

---

*Atualizado em: 2026-04-23*
*Próxima revisão: quando nova regra de negócio for adicionada*
