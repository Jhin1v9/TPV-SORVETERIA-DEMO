# Análise Profunda — Ecossistema Completo: Cliente + Kiosk + Admin + KDS

**Data:** 2026-04-29  
**Autor:** KIMI (análise com integração ao .brain principal)  
**Protocolo:** MAMIS/1  
**Fontes:** Código-fonte dos 4 apps (`apps/cliente/`, `apps/kiosk/`, `apps/admin/`, `apps/kds/`), pesquisa WEB (Starbucks, McDonald's, Toast, Square, Lightspeed, ChowNow, Craver, Revel, Restaurant365), `.brain/memory/`, `.brain/knowledge/`

---

## 1. RESUMO EXECUTIVO DO ECOSSISTEMA

Nosso projeto é um **ecossistema QSR (Quick Service Restaurant)** composto por 4 apps + 1 pacote compartilhado:

| App | Público | Linhas Próprias | Complexidade | Score vs Mercado |
|-----|---------|-----------------|--------------|------------------|
| **Cliente** | Consumidor final (PWA mobile) | ~3.300 | Alta | **58/100** |
| **Kiosk** | Self-service in-store | ~1.924 | Média-Alta | **52/100** |
| **Admin** | Gerência/Operação | ~1.274 | Baixa-Média | **48/100** |
| **KDS** | Cozinha/Back-of-house | ~287 | Baixa | **42/100** |
| **Shared** | Infraestrutura comum | ~10.929 | Alta | — |

**Score Médio do Ecossistema: `50/100`** — funcional para demo/PoC, mas 2-3 gerações atrás dos líderes de mercado para operação real.

---

## 2. MATRIZ COMPARATIVA vs. REFERÊNCIAS DE MERCADO

### 2.1 Customer App (PWA)

| Dimensão | Nosso Cliente | Benchmark (Starbucks, Chick-fil-A, Craver) | Gap |
|----------|---------------|--------------------------------------------|-----|
| **Loyalty/Rewards** | ❌ Não existe | Starbucks Rewards: stars, tiers, free drinks, birthday rewards | 🔴 **Crítico** |
| **One-tap reorder** | ❌ Não existe | McDonald's: pedido anterior em 1 toque | 🔴 **Crítico** |
| **Push notifications** | 🟡 Web Push preparado | Starbucks: deep-link para promoções, status de pedido, local-based | 🟡 Médio |
| **Payment wallets** | ✅ Stripe + Apple/Google Pay | Paridade com os melhores | 🟢 **Vantagem** |
| **Alergenos** | ✅ 8 tipos + detecção de conflito | Raro no mercado; Starbucks tem apenas "customizations" | 🟢 **Vantagem** |
| **Onboarding** | ✅ 6 passos gamificado | Superior à maioria (geralmente é skip direto) | 🟢 **Vantagem** |
| **Delivery tracking** | 🟡 Status básico (5 estados) | Domino's: GPS do driver, ETAs dinâmicos, pizza tracker visual | 🟡 Médio |
| **Social/Share** | ❌ Não existe | Chipotle: share order, group ordering, gift cards | 🟡 Médio |
| **Offline browsing** | 🟡 Catálogo local (produtosLocal.ts) | Starbucks: full offline menu + saved favorites | 🟡 Médio |
| **Reservations/Booking** | ❌ Não existe | OpenTable integration em apps premium | 🟢 Baixo (não aplica a QSR) |
| **Gamification** | 🟡 Tutorial interativo | Starbucks: challenges, streaks, bonus star days | 🟡 Médio |
| **Multi-location** | ❌ Não existe | McDonald's: escolhe loja, drive-thru mode, curbside | 🟡 Médio |

**Score Cliente: 58/100** — O app de cliente é nosso componente **mais maduro**. Tem onboarding excelente, pagamentos robustos, i18n completo, e gestão de alergenos rara no mercado. O gap crítico é **loyalty program** e **one-tap reorder**, que são conversores de retenção.

### 2.2 Kiosk (Self-Service In-Store)

| Dimensão | Nosso Kiosk | Benchmark (Toast, McDonald's, Panera, Peblla) | Gap |
|----------|-------------|-----------------------------------------------|-----|
| **Upselling inteligente** | ❌ Não existe | McDonald's: "Quer acrescentar batata?" aumenta ticket 15-30% | 🔴 **Crítico** |
| **AI-powered suggestions** | ❌ Não existe | Peblla: recomendações baseadas em horário/clima/histórico | 🔴 **Crítico** |
| **Loyalty integration** | 🟡 Código de 5 dígitos | Toast: scan QR code do app, auto-identifica cliente | 🟡 Médio |
| **Multiple payment methods** | 🟡 3 métodos (mock card) | Toast: card real, cash, NFC, wallets, QR code | 🟡 Médio |
| **Attract screen** | ✅ Slideshow + partículas | Paridade visual com Peblla/Toast | 🟢 **Vantagem** |
| **Idle timeout** | ✅ 30s + 10s countdown | Melhor que muitos (geralmente não têm countdown visual) | 🟢 **Vantagem** |
| **Hardware integration** | ❌ Types apenas, não implementado | Toast: TPV real, impressora, NFC, scanner | 🔴 **Crítico** |
| **Combo/meal builder** | 🟡 Produtos personalizáveis | McDonald's: combo flow otimizado (drink + side + main) | 🟡 Médio |
| **Accessibility (ADA)** | ❌ Não avaliado | Toast kiosks: voice guidance, high contrast, height adjustable | 🟡 Médio |
| **Order-ready SMS** | ❌ Não existe | Toast/Lightspeed: SMS automático quando pedido pronto | 🟡 Médio |
| **Kitchen routing** | ❌ Não existe | Toast: envia para KDS com routing por estação | 🔴 **Crítico** |
| **Real-time menu sync** | ✅ Supabase realtime | Paridade com cloud-based kiosks | 🟢 Paridade |

**Score Kiosk: 52/100** — Visualmente atraente e com UX fluida, mas perde muito dinheiro na mesa por não ter **upselling automático** e **integração de hardware real**. O benchmark da indústria mostra aumento de 15-30% no ticket médio com kiosks bem implementados.

### 2.3 Admin Dashboard

| Dimensão | Nosso Admin | Benchmark (Toast Back-office, Lightspeed, Square Dashboard, Restaurant365) | Gap |
|----------|-------------|----------------------------------------------------------------------------|-----|
| **Labor/Staff scheduling** | ❌ Não existe | 7shifts/Deputy: scheduling, clock-in, labor cost % | 🔴 **Crítico** |
| **Ingredient-level inventory** | ❌ Não existe | Lightspeed: deduz tomate por pizza vendida; MarketMan integration | 🔴 **Crítico** |
| **Menu engineering** | ❌ Não existe | Lightspeed: "magic quadrant" — o que manter/cortar/promover | 🔴 **Crítico** |
| **Predictive analytics** | ❌ Não existe | Toast AI (Fev/2026): predictive labor, auto-reorder, upsell AI | 🔴 **Crítico** |
| **Multi-location** | ❌ Não existe | Square Hub: até 500 locations, unified reporting | 🔴 **Crítico** |
| **CRM/Customer insights** | ❌ Não existe | Incentivio: 360 CRM, customer segments, LTV tracking | 🔴 **Crítico** |
| **Exportação de dados** | ✅ CSV de pedidos | Paridade básica | 🟢 Paridade |
| **Realtime dashboard** | 🟡 KPIs estáticos | Toast: live sales, labor vs sales, void tracking em tempo real | 🟡 Médio |
| **Gráficos** | ✅ 4 tipos (recharts) | Paridade visual com entry-level | 🟢 Paridade |
| **Estoque de sabores** | ✅ Ajuste manual + simulador | Mais específico que genéricos; mas sem auto-depleção | 🟡 Médio |
| **Controle de acesso/RBAC** | ❌ Login mock (senha fixa) | Toast: roles (manager, server, owner), permissions granulares | 🔴 **Crítico** |
| **Financial/Accounting integration** | ❌ Não existe | Lightspeed: QuickBooks/Xero sync; Restaurant365: full accounting | 🔴 **Crítico** |
| **Delivery aggregator mgmt** | ❌ Não existe | Toast: UberEats/DoorDash/Grubhub orders em 1 tela | 🟡 Médio |

**Score Admin: 48/100** — O admin é intencionalmente enxuto (~1.300 linhas), mas isso significa que é apenas uma **camada de visualização** sobre o shared. Faltam todas as ferramentas de **gestão operacional** que transformam dados em decisões.

### 2.4 KDS (Kitchen Display System)

*(Já detalhado em `KDS_DEEP_ANALYSIS_2026-04-29.md` — resumo abaixo)*

| Dimensão | Nosso KDS | Benchmark (Toast, Lightspeed, Fresh KDS) | Gap |
|----------|-----------|------------------------------------------|-----|
| **Routing por estação** | ❌ | ✅ Grill/Fry/Salad/Expo | 🔴 **Crítico** |
| **Item-level completion** | ❌ | ✅ Bump por item | 🔴 **Crítico** |
| **Analytics de cozinha** | ❌ | ✅ Prep times, bottlenecks | 🔴 **Crítico** |
| **Offline resilience** | 🟡 localStorage | ✅ Queue + auto-sync | 🟡 Médio |
| **Realtime sync** | ✅ Supabase | ✅ Paridade | 🟢 Paridade |
| **i18n** | ✅ 4 idiomas | 🟡 Geralmente 1-2 | 🟢 **Vantagem** |

**Score KDS: 42/100** — O componente mais fraco do ecossistema. Funciona para demo single-station, mas não escala para operação real.

---

## 3. ANÁLISE DE DEPENDÊNCIAS CRUZADAS

Esta é a seção mais importante: **como uma mudança em um app afeta os outros**.

### 3.1 Matriz de Impacto Cruzado

| Se mudarmos em... | Afeta Cliente | Afeta Kiosk | Afeta Admin | Afeta KDS | Severidade |
|-------------------|:-------------:|:-----------:|:-----------:|:---------:|:----------:|
| **Add Item-level status** (KDS) | 🟢 Não | 🟢 Não | 🟡 Leve (detalhes de pedido) | 🔴 Base | 🔴 Alta |
| **Add Prep Station Routing** (KDS) | 🟢 Não | 🟡 Leve (origem do pedido) | 🟡 Leve (config de estações) | 🔴 Base | 🔴 Alta |
| **Add Loyalty** (Cliente) | 🔴 Base | 🟡 Leve (vinculação de conta) | 🔴 Alta (gestão de programa) | 🟢 Não | 🔴 Alta |
| **Add Upselling** (Kiosk) | 🟢 Não | 🔴 Base | 🟡 Leve (analytics de upsell) | 🟢 Não | 🟡 Média |
| **Add Ingredient Inventory** (Admin) | 🟢 Não | 🟡 Leve (indisponibilidade) | 🔴 Base | 🔴 Alta (86 items) | 🔴 Alta |
| **Add Labor Scheduling** (Admin) | 🟢 Não | 🟢 Não | 🔴 Base | 🟡 Leve (staff por turno) | 🟡 Média |
| **Add One-tap Reorder** (Cliente) | 🔴 Base | 🟢 Não | 🟢 Não | 🟢 Não | 🟢 Baixa |
| **Add Combo Builder** (Kiosk) | 🟡 Leve (catálogo compartilhado) | 🔴 Base | 🟡 Leve (gestão de combos) | 🟡 Leve (itens do combo) | 🟡 Média |
| **Add Delivery Aggregators** (Admin) | 🔴 Alta (novos pedidos) | 🟢 Não | 🔴 Base | 🔴 Alta (novas origens) | 🔴 Alta |
| **Add SMS Notifications** (KDS/Cliente) | 🟡 Leve (push + SMS) | 🟡 Leve (número no pedido) | 🟢 Não | 🔴 Base | 🟡 Média |
| **Add Menu Engineering** (Admin) | 🟡 Leve (recomendações) | 🟡 Leve (destacar items) | 🔴 Base | 🟢 Não | 🟡 Média |
| **Add RBAC** (Admin) | 🟢 Não | 🟢 Não | 🔴 Base | 🟡 Leve (quem pode cancelar) | 🟡 Média |

### 3.2 Gaps Sistêmicos (problemas que só existem por falta de integração)

#### GS-1: "O KDS não sabe de onde veio o pedido"
O KDS atual distingue apenas `tpv` vs `pwa`. Mas o **cliente** tem onboarding rico (nome, alergias, telefone), o **kiosk** tem código de vinculação, e o **admin** vê pedidos genéricos. Não há uma **visão unificada do cliente** que atravesse todos os apps.

**Impacto:** O cook no KDS não sabe se o pedido é de um cliente VIP (loyalty), se tem alergias críticas, ou se é um pedido de delivery com deadline.

#### GS-2: "O Admin vê dados, mas não toma decisões"
O admin tem gráficos bonitos, mas não há **ações automatizadas** baseadas neles. Ex: "sabor X está acabando" → deveria desativar automaticamente no cliente/kiosk. Hoje é manual.

**Impacto:** Produtos esgotados continuam sendo vendidos até alguém manualmente desativar no admin.

#### GS-3: "O Kiosk não aprende com o Cliente"
O cliente tem histórico de pedidos, alergias, preferências. O kiosk, ao receber um código de vinculação, poderia usar esses dados para **personalizar o catálogo** (ex: não mostrar itens com alergenos do usuário, sugerir favoritos). Hoje o código só vincula o perfil para tracking.

**Impacto:** Experiência de kiosk genérica, mesmo para clientes conhecidos. Perda de oportunidade de upsell personalizado.

#### GS-4: "Analytics fragmentados"
Cada app tem seus próprios "analytics" (admin tem gráficos, KDS tem contagem de pedidos, cliente não tem). Não há um **data warehouse unificado** que correlacione:
- Quem pediu no cliente vs kiosk (LTV por canal)
- Quais itens demoram mais (KDS data) vs margem de lucro (admin data)
- Horários de pico (admin) vs staff alocado (não existe)

**Impacto:** Decisões de negócio baseadas em fragmentos, não no todo.

---

## 4. INTEGRAÇÃO COM O .BRAIN

### 4.1 O que o .brain nos diz sobre maturidade de ecossistemas

Do `.brain/memory/sessions/2026-04-26-auditoria-completa-brain.md`:
> "O sistema brain está operacional mas não extraordinário. Score atual: 83/100 (Strong)."

**Paralelo:** Nosso ecossistema está exatamente no mesmo patamar — **operacional mas não extraordinário**. Funciona para demo, mas não competiria em produção.

Do `.brain/memory/patterns.md` (P1: Realtime Sync Pattern):
> "Sempre que múltiplos clients precisam dados sincronizados."

**Insight:** O pattern P1 é a **cola do ecossistema**. Sem ele, os 4 apps seriam silos. Com ele, temos consistência de dados. Mas o P1 ainda é "full snapshot refresh", não "delta sync". Isso escala mal para milhares de pedidos.

Do `.brain/learning/outcomes/positive/2026-04-23-idle-timeout-qsr.md`:
> "Sempre pesquisar padrões de mercado antes de implementar UX crítica."

**Aplicação:** Esta análise é a aplicação dessa regra ao ecossistema completo. O idle timeout do kiosk foi implementado com base em pesquisa real (IdealPOS, RetailCloud, Eflyn). Deveríamos fazer o mesmo para loyalty, upselling, e analytics.

### 4.2 Regra de Governança do .brain aplicada ao ecossistema

> "O principal brain é o canônico, o projeto é o espelho operacional."

**Aplicação:** As decisões de arquitetura do ecossistema (ex: "vamos adicionar loyalty?") devem ser registradas no `.brain/memory/decisions.md` antes de serem implementadas no código. Isso garante que a visão estratégica não se perda em PRs fragmentados.

---

## 5. ROADMAP DE EVOLUÇÃO CONJUNTO — DO DEMO AO PRODUTO

### Fase 1: Foundation (Semanas 1-3) — Ecossistema 50→65

#### KDS (Score 42→55)
1. **Routing por categoria** — Helados → Fria; Crepes → Quente
2. **Item-level status** — Checkbox por item dentro do card
3. **Thresholds configuráveis** — Por categoria (milk-shake 3min, sundae 5min)

#### Cliente (Score 58→65)
4. **One-tap reorder** — Card "Pedir de novo" no topo do cardápio
5. **Favoritos** — Star/heart nos produtos; seção "Seus favoritos"

#### Kiosk (Score 52→60)
6. **Upselling básico** — "Quer adicionar topping por +€0.50?" no carrinho
7. **Combo builder** — Flow "Escolha bebida + sobremesa" com desconto

#### Admin (Score 48→55)
8. **Auto-86 items** — Quando sabor chega a 0, desativa automaticamente no catálogo
9. **Alertas de estoque** — Banner no admin quando stock < alerta

**Dependências cruzadas:**
- Item-level status (KDS) requer que `order_items` tenha campo `status` no schema
- Auto-86 (Admin) afeta cliente e kiosk via realtime
- Upselling (Kiosk) requer dados de "itens complementares" no schema

---

### Fase 2: Operational Intelligence (Semanas 4-7) — Ecossistema 65→75

#### KDS (Score 55→68)
10. **Expo view** — Tab consolidada multi-estação
11. **Analytics básico** — Tempo médio de preparo por produto/hora
12. **Rush order** — Botão de prioridade

#### Cliente (Score 65→72)
13. **Loyalty básico** — Pontos por € gasto (1 ponto = €0.10); resgate simples
14. **Push notifications ativas** — "Seu pedido está pronto!", promoções
15. **Order ETA** — Estimativa de tempo baseada em fila atual do KDS

#### Kiosk (Score 60→68)
16. **Loyalty integration** — Scan QR code do app cliente; acumula pontos
17. **Smart suggestions** — "Clientes também pediram..." no carrinho
18. **Order-ready SMS** — Campo de telefone obrigatório para SMS

#### Admin (Score 55→68)
19. **Menu engineering básico** — Matriz popularidade vs margem (BCG simplificada)
20. **Labor tracking** — Registro de entrada/saída de staff (clock-in/out)
21. **Forecasting básico** — "Amanhã precisará de X baldes baseado em histórico"

**Dependências cruzadas:**
- Loyalty (Cliente + Kiosk) requer tabela `loyalty_transactions` e schema compartilhado
- Order ETA (Cliente) requer dados do KDS (fila + tempo médio)
- Menu engineering (Admin) requer custo de ingredientes (ainda não existe)
- Forecasting (Admin) requer histórico de vendas por hora (já existe parcialmente)

---

### Fase 3: Enterprise (Semanas 8-12) — Ecossistema 75→85

#### KDS (Score 68→80)
22. **Meal pacing** — Controle de timing para combos multi-item
23. **Offline queue** — Fila de mutações com sync automático
24. **Bump bar support** — Teclas de atalho F1-F12
25. **Kitchen names** — Nomes diferentes POS vs KDS

#### Cliente (Score 72→80)
26. **Gamification** — Streaks, challenges, bonus points
27. **Group ordering** — "Pedir com amigos" — link compartilhável
28. **Delivery tracking avançado** — Integração com drivers (se houver delivery)
29. **Personalized recommendations** — "Baseado nos seus últimos pedidos..."

#### Kiosk (Score 68→78)
30. **Hardware real** — Integração TPV (Stripe Terminal), impressora, NFC
31. **Accessibility** — Voice guidance, high contrast, font size adjustable
32. **Multi-kiosk sync** — Quando 1 kiosk desativa item, todos atualizam

#### Admin (Score 68→78)
33. **RBAC completo** — Roles: owner, manager, cook, cashier. Permissions granulares
34. **Ingredient-level inventory** — Cada produto consome X ingredientes; auto-depleção
35. **Supplier management** — Fornecedores, pedidos de compra, lead times
36. **Delivery aggregator integration** — UberEats/Glovo/Deliveroo orders em 1 tela
37. **Financial integration** — Exportação para QuickBooks/Xero/Contabilidade

**Dependências cruzadas:**
- Hardware real (Kiosk) requer `KioskHardwareConfig` sair do mock
- Ingredient-level inventory (Admin) afeta KDS (86 items) e Cliente/Kiosk (indisponibilidade)
- RBAC (Admin) afeta quem pode fazer o quê no KDS (ex: só manager pode cancelar)
- Multi-kiosk sync requer broadcast entre kiosks (hoje só há broadcast via Supabase)

---

### Fase 4: AI-Driven (Semanas 13-20) — Ecossistema 85→92

#### Todos os apps
38. **Predictive prep** — Prever demanda nos próximos 30min; sugerir prep antecipado
39. **Dynamic pricing** — Ajustar preços baseado em demanda (surge pricing suave)
40. **Smart routing** — KDS roteia baseado em carga de cada cook
41. **AI upselling** — "Você gosta de X, experimente Y" baseado em similaridade de clientes
42. **Churn prediction** — Identificar clientes que vão parar de vir; disparar oferta
43. **Auto-menu optimization** — Sugerir remover itens lentos; testar novos preços
44. **Voice ordering** — "Quero um sundae de chocolate" no kiosk/cliente
45. **Fraud detection** — Detectar padrões de cancelamento suspeitos no admin

---

## 6. CONCLUSÃO E RECOMENDAÇÃO FINAL

### Veredicto por App

| App | Diagnóstico | Prioridade de Investimento |
|-----|-------------|---------------------------|
| **Cliente** | MVP sólido, gaps em retenção (loyalty) | 🟡 Média — já é o mais maduro |
| **Kiosk** | UX bonita, mas não gera revenue (sem upsell/hardware) | 🔴 **Alta** — ROI imediato com upselling |
| **Admin** | Apenas visualização; zero decisões automatizadas | 🔴 **Alta** — base para tudo else |
| **KDS** | O mais fraco; bottleneck operacional | 🔴 **Alta** — sem ele, não escala |

### Ordem de Implementação Recomendada

**Imediato (esta semana):**
1. **Auto-86 no Admin** → afeta Cliente + Kiosk automaticamente (quick win)
2. **Upselling básico no Kiosk** → ROI imediato (+15% ticket)
3. **One-tap reorder no Cliente** → retenção rápida

**Curto prazo (semanas 2-4):**
4. **Item-level status no KDS** → base para Expo view e analytics
5. **Loyalty básico (Cliente + Kiosk)** → retenção + vinculação de canais
6. **Menu engineering no Admin** → decisões baseadas em dados

**Médio prazo (semanas 5-8):**
7. **Expo view + Routing no KDS** → operação multi-estação
8. **Ingredient-level inventory** → integração Admin-KDS-Cliente
9. **RBAC + Labor tracking** → gestão operacional real

### Insight do .brain (ADR-style)

**Decisão:** O ecossistema como um todo está no "vale da demo". Para sair, precisamos de **três quick wins** que demonstrem valor operacional real:
1. Dinheiro: upselling no kiosk (aumenta ticket médio)
2. Tempo: auto-86 + auto-sync (reduz trabalho manual)
3. Retenção: one-tap reorder + loyalty (faz cliente voltar)

**Dono:** KIMI lidera discovery + UX de todos os apps. CODEX lidera runtime integrity, schema changes, e shared package.

**Métrica de sucesso:** Score médio do ecossistema ≥ 65/100 (paridade com entry-level do mercado: Square Online + Fresh KDS + basic loyalty).

**Registro:** Esta análise deve ser sincronizada ao `.brain` principal via `npm run brain:sync:principal`.

---

*Análise consolidada do ecossistema completo. 4 apps analisados, 45 features mapeadas, 20+ referências de mercado pesquisadas, integração com .brain principal.*
