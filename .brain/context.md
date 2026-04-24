# 🧠 TPV Sorveteria Demo — Contexto Persistente

> **Este é o "dashboard" do projeto. Atualize-o após cada sessão significativa.**
> Para entender o sistema completo de memória, leia: [[index]]

## Última Atualização
**2026-04-23** — Fotos dos produtos substituídas por imagens profissionais em alta resolução (1920px). Build dos 4 apps ok.

### Fotos/Imagens
- **Antes:** Imagens genéricas de 400px (`/assets/demo/`) — pixeladas em tela grande
- **Depois:** Imagens profissionais em 1920px (`/assets/produtos/`) — copa sundae, cone, café, gelato, slushie, soufflé, etc.
- **AttractScreen:** Unsplash atualizado para `w=3840&q=90` (máxima qualidade)
- **Schemas SQL:** Todos os 4 arquivos SQL atualizados com novos paths
- **Produtos locais:** `produtosLocal.ts` atualizado com novos paths

---

## 🏥 Estado de Saúde do Projeto

### Build Status
| App | Status | Notas |
|-----|--------|-------|
| Cliente PWA | ✅ Compila | Scrollbars customizadas implementadas |
| Kiosk | ✅ Compila | AttractScreen + LanguageSwiper implementados |
| Admin | ✅ Compila | Funcional |
| KDS | ✅ Compila | Aguardando fix de CORS para sync em produção |
| Tests | ✅ 73/73 | Unitários passando |
| E2E | ⚠️ 4 suites | Requerem servidor rodando; não rodadas no CI |

### Conectividade (🔴 CRÍTICO)
- **Localhost:** ✅ Supabase conecta, RPCs funcionam, Realtime funciona
- **Vercel (Produção):** 🔴 **CORS bloqueando fetches para Edge Functions** (BUG-001)
  - Sintoma: App carrega mas fica "offline"; pedidos falham com toast de erro
  - Causa: Edge Functions não retornavam headers CORS (corrigido)
  - Nota: A documentação do Supabase confirma que NÃO existe configuração de CORS no dashboard para origens específicas. O PostgREST gerencia CORS automaticamente via headers.

---

## 🗄️ Supabase

- **URL:** https://jmvikjujftidgcezmlfc.supabase.co
- **Schema definitivo:** `supabase/schema-expanded.sql` (auto-contido, use este!)

### Tabelas
`categories` (legado), `product_categories`, `products`, `flavors`, `toppings`, `orders`, `order_items`, `customers`, `store_settings`, `inventory_log`, `kiosk_codes`

### RPCs Funcionais
| RPC | Status | Notas |
|-----|--------|-------|
| `create_order` | ✅ | Suporta formato `product` + legado `categoria`; com `customer_id` |
| `create_demo_order` | ✅ | Delega para `create_order` |
| `update_order_status` | ✅ | |
| `adjust_flavor_stock` | ✅ | |
| `set_flavor_availability` | ✅ | |
| `reset_demo_data` | ✅ | |
| `upsert_store_settings` | ✅ | |
| `get_products_by_category` | ✅ | |
| `update_product_stock` | ✅ | |
| `upsert_customer` | ✅ | |
| `generate_kiosk_code` | ✅ | Novo — código 5 dígitos, TTL 5 min |
| `validate_kiosk_code` | ✅ | Novo — valida e retorna `customer_id` |

### Realtime
- Publicação `supabase_realtime` configurada para todas as tabelas (incluindo `kiosk_codes`)
- WebSocket funciona (testado via Node.js)
- **Bloqueado em produção por CORS nas Edge Functions** (os fetches REST funcionam, mas Edge Functions falhavam por falta de headers CORS — corrigido)

---

## 📦 Modelo de Dados (Atual)

### Produtos
- **Fixos:** `copa-bahia`, `copa-oreo`, `cafe`, `agua`, etc. — preço fixo, sem personalização
- **Personalizáveis:** `acai`, `helado-terra`, `cono`, `gofre`, `granizado`, `batido`, `orxata`, `tarrina-nata` — com `opcoes` (tamanhos, sabores, toppings, frutas, extras) e `limites`

### Pedidos
- Armazenam `product_snapshot` JSONB imutável + `selections` JSONB
- Agora com `customer_id` FK para vincular ao perfil
- Campos legados (`category_sku`, `category_name`, `flavors`, `toppings`) populados automaticamente pela RPC

### Estoque
- Sabores artesanais com `stock_buckets` (float)
- `inventory_log` para auditoria de movimentação
- Consumo automático por categoria (copas: 0.1, helados: 0.052, conos: 0.031)

---

## 🎨 Fluxos de UX

### Cliente PWA
```
Cardápio → [ProductDetailModal opcional] → Fly-to-cart → Tab Carrinho
→ PagamentoModal → ProcessandoPagamento (2.5s) → ConfirmacaoPedido
```

### Kiosk
```
AttractScreen (produtos em loop) → HolaScreen (swipe idiomas) → CardapioScreen
→ [PersonalizacaoScreen opcional] → CarrinhoScreen → Pagamento → Confirmacao
→ Reset para AttractScreen
```

### KDS
```
Realtime sync → Filtra pedidos ativos → Cards com timer
→ Clique avança status: pendiente → preparando → listo → entregado
```

---

## 🚨 Problemas Ativos (Priorizados)

| # | Bug | Severidade | Status | Persona |
|---|-----|-----------|--------|---------|
| 1 | **CORS bloqueando pedidos na Vercel** | 🔴 Crítica | **OPEN** | DevOps |
| 2 | **Tela branca no ProductDetailModal (Cliente)** | 🔴 Crítica | Investigando | Surgeon |
| 3 | **Kiosk: produtos fixos não adicionam ao carrinho** | 🔴 Crítica | **OPEN** | Product+Surgeon |
| 4 | Onboarding aparece em cada reload | 🟡 Média | Pendente | Product |
| 5 | Bug Detector usando Gemini (não Kimi) | 🟢 Baixa | Pendente | DevOps |

Detalhes completos em: [[memory/bugs]]

---

## 🎯 Próximos Passos Imediatos

1. **🔴 Corrigir CORS nas Edge Functions** (BUG-001)
   - Headers CORS adicionados às 3 Edge Functions (corrigido)
   - Deployar Edge Functions atualizadas
   - Testar pedido end-to-end na Vercel

2. **🔴 Corrigir ProductDetailModal WSOD** (BUG-003)
   - Adicionar Error Boundary
   - Simplificar useEffect do scrollRef
   - Adicionar `key` ao AnimatePresence

3. **🔴 Corrigir botão "Añadir" no Kiosk** (BUG-004)
   - Remover `disabled={quantidade === 0}`
   - Ajustar handler para fallback quantidade = 1

4. **🟡 Deploy para Vercel** após correções
   - `node scripts/deploy-all.mjs`
   - Validar fluxo completo Cliente → KDS

5. **🟢 Documentar lições em** `memory/decisions.md` e `memory/bugs.md`

---

## 📚 Links Rápidos do Brain

- [[index]] — Guia de uso do sistema de memória
- [[personas/architect]] — Arquiteto de software
- [[personas/surgeon]] — Cirurgião de código / debugger
- [[personas/product]] — Visionário de produto / UX
- [[personas/devops]] — Engenheiro de infra / deploy
- [[memory/decisions]] — ADRs (decisões arquiteturais)
- [[memory/bugs]] — Registro de bugs e lições
- [[memory/patterns]] — Padrões de código do projeto
- [[knowledge/domain]] — Regras de negócio da sorveteria
- [[knowledge/stack]] — Stack técnico e dependências
- [[knowledge/api]] — Contratos de API e integrações

---

*Brain version: 2.0*
*Sistema: PARA + Zettelkasten + 4 Personas especializadas*
*Inspirado em: Tiago Forte, Niklas Luhmann, Anthropic, JetBrains, BMAD Method*
