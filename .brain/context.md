# 🧠 TPV Sorveteria Demo — Contexto Persistente

> **Este é o "dashboard" do projeto. Atualize-o após cada sessão significativa.**
> Para entender o sistema completo de memória, leia: [[index]]

## Última Atualização
**2026-04-24** — Novo projeto Supabase criado e configurado. Todas as RPCs restauradas. Pedido E2E #003 confirmado no kiosk.

### Mudanças Críticas
- **Novo projeto Supabase:** `dproxlygtabihfhtxdvm` (antigo `jmvikjujftidgcezmlfc` corrompido)
- **RPCs renomeadas** para contornar PostgREST cache bug:
  - `upsert_customer` → `save_customer`
  - `upsert_store_settings` → `save_store_settings`
  - `reset_demo_data` → `restore_demo_data`
- **Dados demo populados** via `restore_demo_data()` — produtos, sabores, toppings, pedidos
- **Build OK** — 4 apps compilam sem erros
- **Teste E2E OK** — Pedido #003 criado com sucesso via kiosk

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

### Conectividade
- **Localhost:** ✅ Supabase conecta, RPCs funcionam, Realtime funciona
- **Novo projeto Supabase:** ✅ `dproxlygtabihfhtxdvm` — todas as 10 RPCs expostas na API
- **Vercel (Produção):** 🟡 Aguardando deploy com novas credenciais

---

## 🗄️ Supabase

- **URL:** https://dproxlygtabihfhtxdvm.supabase.co
- **Projeto anterior (corrompido):** https://jmvikjujftidgcezmlfc.supabase.co
- **Schema definitivo:** `supabase/schema-expanded.sql`
- **Migrações separadas:** `supabase/migrations/func_*.sql` (9 arquivos)

### Tabelas
`categories` (legado), `product_categories`, `products`, `flavors`, `toppings`, `orders`, `order_items`, `customers`, `store_settings`, `inventory_log`, `kiosk_codes`

### RPCs Funcionais (novo projeto)
| RPC | Status | Notas |
|-----|--------|-------|
| `create_order` | ✅ | Suporta formato `product` + legado `categoria` |
| `update_order_status` | ✅ | |
| `adjust_flavor_stock` | ✅ | |
| `set_product_availability` | ✅ | |
| `set_flavor_availability` | ✅ | |
| `save_store_settings` | ✅ | Renomeado de `upsert_store_settings` |
| `save_customer` | ✅ | Renomeado de `upsert_customer` |
| `restore_demo_data` | ✅ | Renomeado de `reset_demo_data` |
| `generate_kiosk_code` | ✅ | Código 5 dígitos, TTL 5 min |
| `validate_kiosk_code` | ✅ | Valida e retorna `customer_id` |

### Nota Técnica: PostgREST Cache Bug
> Funções com nomes `upsert_*` e `reset_*` ficam permanentemente invisíveis na API REST mesmo existindo no Postgres. `NOTIFY pgrst, 'reload schema'` e restart do projeto não resolvem. **Solução: renomear as funções.**

### Realtime
- Publicação `supabase_realtime` configurada para todas as tabelas
- WebSocket funciona

---

## 📦 Modelo de Dados (Atual)

### Produtos
- **Fixos:** `copa-bahia`, `copa-oreo`, `cafe`, `agua`, etc. — preço fixo
- **Personalizáveis:** `acai`, `helado-terra`, `cono`, `gofre`, `granizado`, `batido`, `orxata`, `tarrina-nata` — com `opcoes` e `limites`

### Pedidos
- Armazenam `product_snapshot` JSONB imutável + `selections` JSONB
- Com `customer_id` FK para vincular ao perfil
- Campos legados populados automaticamente pela RPC

### Estoque
- Sabores artesanais com `stock_buckets` (float)
- `inventory_log` para auditoria
- Consumo automático por categoria

---

## 🎨 Fluxos de UX

### Cliente PWA
```
Cardápio → [ProductDetailModal opcional] → Fly-to-cart → Tab Carrinho
→ PagamentoModal → ProcessandoPagamento (2.5s) → ConfirmacaoPedido
```

### Kiosk
```
AttractScreen → HolaScreen (swipe idiomas) → CardapioScreen
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
| 1 | **Kiosk carousel preto entre transições** | 🟡 Média | **OPEN** | Product |
| 2 | Onboarding aparece em cada reload | 🟡 Média | Pendente | Product |
| 3 | Bug Detector usando Gemini (não Kimi) | 🟢 Baixa | Pendente | DevOps |

**BUG-001 CORS** — Edge Functions atualizadas com headers CORS (aguardando deploy).
**BUG-002 RPCs** ✅ — Novo projeto Supabase, todas as RPCs funcionando.
**BUG-003 WSOD** ✅ — ErrorBoundary + guards null-check adicionados ao ProductDetailModal.
**BUG-004 Produtos fixos kiosk** ✅ — Código já corrigido, testado E2E.

Detalhes completos em: [[memory/bugs]]

---

## 🎯 Próximos Passos Imediatos

1. **🟡 Corrigir Kiosk carousel preto** (BUG-005)
   - Ajustar transições CSS no AttractScreen

2. **🟡 Deploy para Vercel** após correções
   - `node scripts/deploy-all.mjs`
   - Validar fluxo completo Cliente → KDS

3. **🟢 Documentar lições** em `memory/decisions.md` e `memory/bugs.md`

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
