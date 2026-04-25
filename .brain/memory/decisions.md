# 🏛️ Architectural Decision Records (ADRs)

> Decisões arquiteturais são contratos com o futuro. Quebre-os só com boas razões.

## Formato
Cada decisão segue o formato:
```
### [ID] — Título da Decisão
**Data:** YYYY-MM-DD
**Status:** [PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED]
**Contexto:** Por que precisamos decidir isso?
**Decisão:** O que decidimos?
**Consequências:** O que ganhamos/perdemos?
**Links:** [[outra-decisao]]
```

---

### ADR-001 — Supabase como Fonte Única de Verdade
**Data:** 2026-04-15
**Status:** ✅ ACCEPTED
**Contexto:** Precisávamos sincronizar 4 apps (cliente, kiosk, kds, admin) em tempo real.
**Decisão:** Usar Supabase (Postgres + Realtime) como backend unificado. Cada app se conecta via WebSocket e recebe snapshots completos.
**Consequências:**
- ✅ Sincronização em tempo real entre todos os apps
- ✅ Schema SQL versionado em `supabase/schema-expanded.sql`
- ✅ RPCs com `security definer` para escritas sensíveis
- ⚠️ Dependência de conectividade internet
- ⚠️ CORS precisa ser configurado manualmente no dashboard
**Links:** [[ADR-003 — Modo Standalone como Fallback]]

---

### ADR-002 — Monorepo com Vite + Shared Package
**Data:** 2026-04-10
**Status:** ✅ ACCEPTED
**Contexto:** 4 apps compartilham tipos, stores, lógica de negócio e mappers.
**Decisão:** Estrutura monorepo com `packages/shared/` contendo types, stores (Zustand), i18n, supabase client, realtime sync e utilitários.
**Consequências:**
- ✅ Código compartilhado sem duplicação
- ✅ Tipos TypeScript consistentes entre apps
- ✅ Build otimizado por Vite com path aliases (`@tpv/shared`)
- ⚠️ Mudança em shared pode quebrar múltiplos apps
- ⚠️ Build mais complexo (precisa compilar shared primeiro)
**Links:** [[ADR-005 — Zustand + Persist para Estado Global]]

---

### ADR-003 — Modo Standalone como Fallback
**Data:** 2026-04-12
**Status:** ✅ ACCEPTED
**Contexto:** Demo precisa funcionar offline ou sem configuração do Supabase.
**Decisão:** Implementar modo `standalone` no `RealtimeManager`: quando não há `VITE_SUPABASE_URL`, usa `localStorage` com snapshot completo.
**Consequências:**
- ✅ Demo funciona sem backend (localStorage only)
- ✅ Útil para desenvolvimento offline
- ⚠️ **CRÍTICO:** localStorage é isolado por domínio/aba. Cliente e KDS em abas diferentes NÃO compartilham dados.
- ⚠️ Não há sincronização real entre dispositivos no modo standalone
**Links:** [[ADR-001 — Supabase como Fonte Única de Verdade]]

---

### ADR-004 — Formato Novo de Produtos (JSONB) com Compatibilidade Legado
**Data:** 2026-04-18
**Status:** ✅ ACCEPTED
**Contexto:** Migração de categoria-based (legado) para produto-based (novo) sem quebrar KDS/Admin.
**Decisão:**
- Produtos têm `opcoes` e `limites` JSONB para personalização
- RPC `create_order` aceita AMBOS formatos (detecta via `item_record ? 'categoria'`)
- Campos legados (`category_sku`, `category_name`, `flavors[]`, `toppings[]`) são populados automaticamente pela RPC para compatibilidade com KDS/Admin
**Consequências:**
- ✅ KDS e Admin funcionam sem mudanças de UI
- ✅ Novos produtos (Kiosk, Cliente) usam formato rico
- ✅ `product_snapshot` JSONB imutável preserva estado no momento da compra
- ⚠️ RPC `create_order` é complexa (200+ linhas)
- ⚠️ Dados legados ocupam espaço desnecessário no banco

---

### ADR-005 — Zustand + Persist para Estado Global
**Data:** 2026-04-10
**Status:** ✅ ACCEPTED
**Contexto:** Precisávamos de estado global reativo com persistência.
**Decisão:** Zustand com middleware `persist` (localStorage) para estado global. Cada app tem seu próprio slice mas compartilha types e utilities.
**Consequências:**
- ✅ API simples (hooks-based)
- ✅ Persistência automática
- ✅ Não requer Provider wrapping complexo
- ⚠️ localStorage tem limite de ~5MB
- ⚠️ Não é adequado para dados sensíveis

---

### ADR-006 — Kiosk Codes para Login Rápido
**Data:** 2026-04-20
**Status:** ✅ ACCEPTED
**Contexto:** Usuários do Cliente PWA querem usar o Kiosk sem digitar dados pessoais.
**Decisão:** Sistema de códigos de 5 dígitos (TTL 5 min) vinculados a `customer_id`. Gerado via RPC `generate_kiosk_code`, validado via `validate_kiosk_code`.
**Consequências:**
- ✅ Login kiosk em 5 segundos
- ✅ Sem senhas ou formulários
- ✅ Código expira automaticamente
- ⚠️ Requer tabela extra `kiosk_codes`
- ⚠️ Não é criptograficamente seguro (códigos curtos, propósito de conveniência)

---

### ADR-007 — Vercel para Deploy (4 Apps Separadas)
**Data:** 2026-04-15
**Status:** ✅ ACCEPTED
**Contexto:** Precisávamos hospedar 4 SPAs com builds independentes.
**Decisão:** Cada app tem seu próprio `vercel.json` com build command apontando para `dist/[app]`. Deploy via `scripts/deploy-app.mjs`.
**Consequências:**
- ✅ Cada app deploya independentemente
- ✅ URLs separadas (cliente-pearl, kds-one, etc.)
- ✅ Build otimizado por Vite
- ⚠️ 4 deploys = 4 pontos de falha
- ⚠️ Variáveis de ambiente duplicadas em cada `vercel.json`
**Links:** [[ADR-008 — CORS Configuração no Supabase]]

---

### ADR-008 — CORS Configuração no Supabase
**Data:** 2026-04-23
**Status:** 🚨 CRÍTICO — PENDENTE DE AÇÃO
**Contexto:** Pedidos do Cliente PWA funcionam localmente mas falham na Vercel com erro de conexão.
**Decisão:** Configurar CORS no dashboard do Supabase para permitir origens dos apps Vercel + localhost.
**Consequências:**
- ✅ Navegador permitirá fetches cross-origin
- ✅ Realtime/WebSocket funcionará em produção
- ⚠️ Se não configurado, apps ficam em modo offline/standalone
- ⚠️ Configuração manual no dashboard (não versionada em código)
**Links:** [[ADR-007 — Vercel para Deploy]], [[BUG-001 — CORS bloqueando pedidos]]

---

## Decisões Propostas

### ADR-009 — Edge Function para Proxy de API (Mitigação CORS)
**Data:** 2026-04-23
**Status:** 📝 PROPOSED
**Contexto:** CORS no Supabase pode não ser configurável no plano gratuito.
**Decisão:** Criar uma Supabase Edge Function que faz proxy para as tabelas/RPCs, adicionando headers CORS dinamicamente.
**Consequências:**
- ✅ Controle total de CORS via código
- ✅ Possível rate limiting e caching
- ⚠️ Latência extra (hop adicional)
- ⚠️ Custo de execução de Edge Functions
**Links:** [[ADR-008 — CORS Configuração no Supabase]]

---

*Atualizado em: 2026-04-23*
*Próxima revisão: quando nova decisão arquitetural for necessária*

### ADR-010 - Manager-Worker como padrao de subagentes
**Data:** 2026-04-25
**Status:** ACCEPTED
**Contexto:** O projeto precisa de um modelo estavel para delegar pesquisa, leitura de codigo, implementacao e verificacao sem perder coerencia entre agentes.
**Decisao:** Adotar `manager-worker` como padrao oficial de subagentes, com `MAMIS/1` como protocolo de comunicacao, registry versionado e geracao automatica de times via `scripts/subagent-fabric.mjs`.
**Consequencias:**
- Menos improviso na delegacao
- Roles e ownership claros
- Melhor sintese entre CODEX e KIMI como agentes principais
- Mais rastreabilidade no `.brain` e nos artefatos de equipe
- Custo adicional de coordenacao quando a tarefa e pequena
**Links:** `.brain-orchestrator/OPERACAO_AGENTES.md`, `.brain-orchestrator/SUBAGENT_REGISTRY.json`, `.brain-orchestrator/SUBAGENT_PROMPTS.md`, `.brain/knowledge/subagent-scientific-operating-system.md`
