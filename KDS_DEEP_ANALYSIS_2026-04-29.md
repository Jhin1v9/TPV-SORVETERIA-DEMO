# Análise Profunda — KDS Tropicale vs. Referências de Mercado

**Data:** 2026-04-29  
**Autor:** KIMI (análise com integração ao .brain principal)  
**Protocolo:** MAMIS/1  
**Fontes:** Código-fonte `apps/kds/`, pesquisa WEB (Toast, Lightspeed, Square, Fresh KDS, Upserve, Revel, TechRyde), `.brain/memory/`, `.brain/knowledge/`

---

## 1. RESUMO EXECUTIVO

| Dimensão | Nosso KDS | Mercado (Toast, Lightspeed, Square) | Gap |
|----------|-----------|-------------------------------------|-----|
| **Complexidade** | 287 linhas, 1 arquivo | Ecossistemas de 10k-100k+ linhas | 🔴 Crítico |
| **Estação/Rotas** | Não existe | Routing inteligente por prep station | 🔴 Crítico |
| **Nível de item** | Status do pedido inteiro | Bump por item, checkmark individual | 🔴 Crítico |
| **Expo/Expeditor** | Não existe | Visão consolidada multi-estação | 🔴 Crítico |
| **Analytics** | Contagem estática no footer | Prep times, bottlenecks, waste, menu engineering | 🔴 Crítico |
| **Offline** | Standalone localStorage | Cache local + sync automático pós-queda | 🟡 Médio |
| **Priorização** | FIFO simples (timestamp) | AI-driven, load balancing, rush orders | 🟡 Médio |
| **Coursing** | Não existe | Entradas → principais → sobremesas com timing | 🟡 Médio |
| **Add-ons/Voids** | Não tratado | Add-ons separados, voids propagados | 🟡 Médio |
| **Notificações** | Beep sonoro simples | SMS ao cliente, push, smartwatch | 🟢 Baixo |
| **i18n** | ✅ 4 idiomas | Geralmente 1-2 (EN/ES) | 🟢 Vantagem |
| **Realtime** | Supabase + fallback | Cloud-native, multi-region | 🟢 Paridade |
| **UX Visual** | Dark mode, cards animados | Variável (Toast = funcional; Fresh = clean) | 🟢 Paridade |

**Score Comparativo Estimado:**
- Nosso KDS: **42/100** (Funcional para demo/single-station)
- Fresh KDS / Square: **65/100** (Entry-level produção)
- Toast KDS / Lightspeed: **85/100** (Full-service, multi-station)
- TechRyde AI / Revel: **92/100** (Enterprise, AI-driven)

---

## 2. O QUE O NOSSO KDS FAZ BEM (Forças)

### 2.1 Arquitetura de Sincronização (Padrão P1 do .brain)
O realtime sync via Supabase com fallback standalone é **sólido** e segue o padrão documentado em `.brain/memory/patterns.md` (P1: Realtime Sync Pattern). O `RealtimeManager` tem:
- Healthcheck foreground/background
- Reconnect automático com debounce
- Fallback para localStorage em modo standalone
- Ciclo de vida bound a `focus`/`online`/`visibilitychange`

**Benchmark:** Paridade técnica com Square KDS e Fresh KDS em termos de sync. Superior a alguns KDS legacy que não têm fallback offline.

### 2.2 UX Dark Mode e Animações
- Cards com `framer-motion` (layout, enter/exit)
- Cores por status (#2196F3 → #FFC107 → #4CAF50 → #9E9E9E)
- Timer com blink vermelho quando >5min
- Badge de origem (TPV vs PWA)

**Benchmark:** Visualmente superior ao Toast KDS (mais funcional/industrial), comparável ao Fresh KDS (clean).

### 2.3 i18n Completo
- 4 idiomas (ca, es, pt, en) via `@tpv/shared/i18n`
- Textos localizados para todos os labels do KDS

**Benchmark:** Vantagem. A maioria dos KDS do mercado é EN-only ou EN/ES.

### 2.4 Product Snapshot Immutability (Padrão P4 do .brain)
Pedidos preservam `productSnapshot` JSONB, garantindo que alterações de cardápio não corrompam pedidos históricos. Este é um padrão **enterprise-grade** raro em KDS entry-level.

### 2.5 Dual Model (Legacy + Product)
Suporta tanto o modelo antigo (`Categoria`/`Sabor`/`Topping`) quanto o novo (`Product`/`ProductCategory`/`Selections`). Isso demonstra maturidade de migração de dados.

---

## 3. GAPS CRÍTICOS — O QUE NOS SEPARA DOS MELHORES

### 3.1 🔴 Não há Routing por Prep Station (Estação de Preparo)
**O que é:** Em restaurantes reais, pedidos são roteados para diferentes telas: grill, fry, salad, drinks, expo.

**Como o Toast faz:**
- Cada item do menu tem um `routingGroup` (grill, cold, expo)
- O KDS filtra tickets por grupo
- O Expo Station combina múltiplos grupos numa visão consolidada

**Nosso estado:** Todo pedido aparece numa única tela. Não há distinção entre "quem prepara o quê".

**Impacto:** Para uma sorveteria pequena, isso é aceitável (todos fazem tudo). Para operação com múltiplas estações (ex: crepes quentes vs. sorvete frio), é impossível usar.

### 3.2 🔴 Não há Item-Level Completion (Bump por Item)
**O que é:** Em vez de marcar o pedido inteiro como "preparando", o cook marca cada item individualmente.

**Como o Toast/BoA KDS faz:**
- Cada item tem um checkbox
- Quando todos os itens estão checked, o ticket auto-bumpa
- Permite "bump bar" físico (teclado de atalho)

**Nosso estado:** Apenas status do pedido inteiro (pendiente → preparando → listo → entregado).

**Impacto:** Perde granularidade. Não é possível ver "o sundae está pronto, mas o milk-shake ainda não".

### 3.3 🔴 Não há Expo/Expeditor View
**O que é:** Uma tela consolidada que mostra tickets de múltiplas estações, permitindo ao expeditor saber quando todo o pedido está pronto para sair.

**Como o Toast faz:**
- Tab "Expo" combina grill + salad + drinks
- Mostra status por item de cada estação
- Quando tudo pronto, o expeditor dá "bump final"

**Nosso estado:** Não existe conceito de expo.

### 3.4 🔴 Não há Analytics / KPIs de Cozinha
**O que o mercado oferece:**
- **Toast:** Prep times por hora do dia, menu engineering, void/comp insights
- **Upserve:** Kitchen performance analytics, waste reduction tracking
- **Lightspeed:** Meal-pacing AI, station load-balancing
- **TechRyde:** Predictive prep, 99% accurate delivery promise

**Nosso estado:** Apenas contagem estática no footer:
```
Pendiente: X | Preparando: Y | Listo: Z | Pedidos: N
```

**Impacto:** Zero capacidade de otimização operacional. Não dá para saber:
- Qual item demora mais?
- Em qual horário a cozinha engasga?
- Qual sabor esgota mais rápido?

### 3.5 🔴 Não há Thresholds de Tempo Configuráveis
**O que o mercado faz:**
- **Toast KDS / BoA KDS:** Dois thresholds configuráveis (ex: 3min = amarelo, 6min = vermelho)
- Cores mudam progressivamente

**Nosso estado:** Hardcoded >300s (5min) = vermelho. Sem configuração por categoria/item.

### 3.6 🟡 Não há Meal Pacing / Course Firing
**O que é:** Controle de quando disparar cada curso (entrada → prato principal → sobremesa).

**Como o Lightspeed faz:**
- "Meal-Pacing AI" calcula cook times e seat numbers
- Auto-fires cursos para que entradas saiam numa janela de ±30 segundos

**Nosso estado:** Não aplicável a sorveteria (tudo é "main"), mas limita expansão para full-service.

### 3.7 🟡 Não há Add-on / Void / Refire Handling
**O que o mercado faz:**
- Add-ons aparecem no mesmo ticket com separador "ADD-ON"
- Itens voidados são propagados ao KDS em tempo real
- Refire (refazer) cria novo ticket prioritário

**Nosso estado:** Não suportado. Um pedido modificado precisaria ser cancelado e recriado.

### 3.8 🟡 Offline Mode Básico
**Nosso estado:** Standalone com localStorage. Funciona offline, mas:
- Não sincroniza multi-device em standalone
- Não há fila de mutações pendentes para sync posterior
- Não imprime backup tickets de emergência

**Benchmark:** Toast e Lightspeed têm "Built-in Offline Mode for iPads" com sync automático pós-reconexão e fila de operações.

---

## 4. ANÁLISE INTEGRADA COM O .BRAIN

### 4.1 O que o .brain nos diz sobre nosso nível de maturidade

Do `.brain/memory/sessions/2026-04-26-auditoria-completa-brain.md`:
> "O sistema brain está operacional mas não extraordinário. Score atual: 83/100 (Strong)."

**Paralelo com o KDS:** O KDS está exatamente no mesmo patamar — **operacional mas não extraordinário**. Funciona para a demo, mas não competiria em produção real contra Toast/Square.

Do `.brain/memory/patterns.md` (P5: Fallback/Standalone Pattern):
> "Quando usar: Demo, desenvolvimento offline, fallback de conectividade. Quando NÃO usar: Produção com sincronização multi-device."

**Insight:** O próprio .brain reconhece que o modo standalone é para demo. Nosso KDS é tecnicamente um "demo system" — o que explica os gaps de produção.

### 4.2 Regra do Learning Outcome (`.brain/learning/outcomes/positive/2026-04-23-idle-timeout-qsr.md`):
> "Sempre pesquisar padrões de mercado antes de implementar UX crítica. Usar dados reais de concorrentes/indústria."

**Aplicação ao KDS:** Esta análise é exatamente a aplicação dessa regra. Antes de evoluir o KDS, precisamos entender o benchmark.

---

## 5. ROADMAP DE EVOLUÇÃO — DO DEMO AO PRODUTO

### Fase 1: Foundation (2-3 semanas) — Score 42→60
1. **Routing por categoria** (mínimo viable): Helados vão para tela Fria; Crepes/Waffles vão para tela Quente
2. **Item-level status**: Checkbox por item dentro do card
3. **Expo view**: Tab que consolida todas as estações
4. **Thresholds configuráveis**: Por categoria de produto (ex: milk-shake 3min, sundae 5min)

### Fase 2: Operational Intelligence (3-4 semanas) — Score 60→75
5. **Analytics básico**: Tempo médio de preparo por produto, por hora do dia
6. **Load indicator**: Fila por estação (quem está mais sobrecarregado)
7. **Rush order**: Botão de prioridade para pedidos urgentes
8. **Add-on handling**: Itens adicionados posteriormente aparecem destacados
9. **Void propagation**: Cancelamento de item individual

### Fase 3: Enterprise (4-6 semanas) — Score 75→85
10. **Meal pacing**: Controle de timing para combos multi-item
11. **Offline queue**: Fila de mutações com sync automático (melhorar P5)
12. **Kitchen names**: Nomes diferentes para POS vs KDS (abreviações)
13. **Bump bar support**: Teclas de atalho (F1-F12) para operações sem mouse
14. **SMS/Push ao cliente**: Quando pedido muda para "listo"
15. **Integração com delivery aggregators**: UberEats, Glovo, Deliveroo

### Fase 4: AI-Driven (8-12 semanas) — Score 85→92
16. **Predictive prep**: Prever demanda nos próximos 30min baseado em histórico
17. **Dynamic prioritization**: Reordenar fila baseado em tempo de prep + prioridade
18. **Smart routing**: Roteamento baseado em carga atual de cada cook
19. **Waste tracking**: Correlação entre prep time e descarte
20. **Menu engineering**: Sugestões de remoção/adjuste de itens lentos

---

## 6. CONCLUSÃO E RECOMENDAÇÃO

### Veredicto
Nosso KDS é um **excelente MVP para demonstração** de sorveteria/QSR simples. Tem arquitetura de sync sólida, UX visual agradável, e i18n completo. No entanto, está **2-3 gerações atrás** dos líderes de mercado (Toast, Lightspeed, TechRyde) em termos de funcionalidade operacional.

### Risco de Negócio
Se o usuário tentar usar este KDS numa operação real com:
- Mais de 1 estação de preparo → **Falha operacional imediata**
- Volume >30 pedidos/hora → **Perda de visibilidade e priorização**
- Múltiplos canais (delivery + presencial) → **Confusão na fila**

### Recomendação do .brain (ADR-style)
**Decisão:** Priorizar Fase 1 (Foundation) antes de qualquer feature nova no kiosk/cliente. O KDS é o bottleneck operacional do sistema.
**Dono:** KIMI (discovery + UX) + CODEX (runtime integrity + sync)
**Métrica de sucesso:** Score KDS ≥ 60/100 (paridade com Fresh KDS entry-level)

---

*Análise gerada com integração ao .brain principal. Sync recomendado via `npm run brain:sync:principal`.*
