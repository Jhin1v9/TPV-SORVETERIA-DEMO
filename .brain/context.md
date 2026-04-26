# 🧠 TPV Sorveteria Demo — Contexto Persistente

> **Este é o "dashboard" do projeto. Atualize-o após cada sessão significativa.**
> Para entender o sistema completo de memória, leia: [[index]]

---

## 🚀 CHECKPOINT PARA AGENTES (LEIA PRIMEIRO)

```
LINHA_ATUAL: 1050
TOTAL_LINHAS: 1068
ULTIMA_ATUALIZACAO: 2026-04-26
RESUMO_RAPIDO: Brain unificado v2.1 | 4 apps no ar | CODEX esgotou | KIMI chefao
```

**Instrucao:** Se voce ja leu este arquivo antes, pule para a linha indicada em `LINHA_ATUAL`.
So leia o historico completo se for sua primeira vez ou se precisar de contexto arqueologico.

---

## Última Atualização
**2026-04-26** — Brain unificado em v2.1 (unico .brain/, sem .brain-orchestrator/). Commit f5294ad. KIMI assume lideranca total (CODEX esgotou creditos).

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

## Planos de Teste
- Humano: knowledge/testing-human-e2e.md`n- Agentes de IA: knowledge/testing-ai-agent-playbook.md


- Checklist executavel: knowledge/testing-execution-checklist.md`n- Template colavel para agentes: knowledge/testing-agent-copy-paste-template.md`n- Relatorio formal mais recente: rtifacts/approval-run-2026-04-24T22-39-48-180Z/REPORT.md`n

## Atualizacao 2026-04-25
- Push web real agora existe na arquitetura do cliente: service worker, subscription sync, edge function de registro e edge function de aviso quando pedido fica `listo`.

---

## 🔬 ANALISE DA KIMI 2.6 — Bugs Visuais e Funcionais (2026-04-23)

> **Instrucao do usuario:** APENAS analise e documente. NAO faca alteracoes de codigo nesta sessao.

### Resumo dos 8 Issues Reportados pelo Usuario

| # | Issue | Severidade | Status | Arquivo(s) Afetado(s) |
|---|-------|-----------|--------|----------------------|
| 1 | **Textos animacao pagamento com underscores** (i18n keys faltando) | 🟡 Media | **CONFIRMADO** | `apps/cliente/src/components/pagamento/ProcessandoPagamento.tsx` |
| 2 | **Alergenos com traducao errada** ("ovos" em vez de "huevos") | 🔴 Alta | **CONFIRMADO — BUG REAL** | `apps/cliente/src/components/ProductDetailModal.tsx` |
| 3 | **"PULAR TUTORIAL" pouco visivel** | 🟡 Media | **CONFIRMADO** | `apps/cliente/src/components/onboarding/InteractiveTutorial.tsx` |
| 4 | **Logo PWA nao centralizada** | 🟡 Media | **PENDENTE DE VERIFICACAO VISUAL** | `apps/cliente/src/ClienteApp.tsx` |
| 5 | **KDS mostra "KIOSK MESA" em vez de "TPV"** | 🟡 Media | **CONFIRMADO** | `apps/kds/src/KDSApp.tsx` + `packages/shared/src/realtime/client.ts` |
| 6 | **Setas de voltar em locais errados** | 🟡 Media | **CONFIRMADO** | `apps/cliente/src/ClienteApp.tsx` + `apps/cliente/src/pages/PedidoDetalhesPage.tsx` |
| 7 | **Logout em Configuracoes nao funciona** | 🔴 Alta | **PENDENTE DE TESTE INTERATIVO** | `packages/shared/src/stores/useStore.ts` + `apps/cliente/src/pages/ConfigPage.tsx` |
| 8 | **Historial por telefone nao funciona** | 🔴 Alta | **CONFIRMADO — BUG REAL** | `packages/shared/src/realtime/client.ts` (standalone fallback) |

---

### Diagnostico Detalhado

#### 1. Textos da Animacao de Pagamento (ProcessandoPagamento.tsx)
**Sintoma:** Textos como `_connectingGateway_`, `_waitingConfirmation_` aparecem na tela.
**Causa raiz:** As chaves i18n usadas em `ProcessandoPagamento.tsx` **NAO EXISTEM** nos arquivos de locale (`packages/shared/src/i18n/{es,ca,pt,en}.ts`).
**Chaves faltantes confirmadas:**
- `connectingGateway`
- `connectingBizum`
- `waitingConfirmation`
- `registeringOrder`
- `generatingTicket`
- `connectingApplePay`
- `connectingGooglePay`
**Fix necessario:** Adicionar todas essas chaves aos 4 arquivos de locale.

---

#### 2. Alergenos com Nomes Errados (ProductDetailModal.tsx)
**Sintoma:** Em espanhol aparece "Contiene **ovos**" em vez de "Contiene **huevos**"; "**leite**" em vez de "**leche**".
**Causa raiz:** No `ProductDetailModal.tsx` linha 260, o codigo renderiza a **chave interna raw** do alergeno em vez do nome traduzido:
```tsx
// LINHA 260 — BUG:
{aviso.nivel === 'contem' ? t('contains', locale) : t('mayContain', locale)}{' '}
{aviso.alergeno}  // <-- MOSTRA 'ovos', 'leite' (chaves internas!)
```
**O correto seria:**
```tsx
import { nomeAlergeno } from '@tpv/shared/i18n/alergenos';
// ...
{nomeAlergeno(aviso.alergeno, locale)}  // <-- Mostra 'Huevos', 'Leche'
```
**Nota:** O componente `AlergenoBadge.tsx` ja usa `nomeAlergeno()` corretamente. O bug e exclusivo do `ProductDetailModal.tsx`.

---

#### 3. Botao "Omitir Tutorial" Pouco Visivel (InteractiveTutorial.tsx)
**Sintoma:** O botao de pular tutorial e dificil de notar.
**Causa raiz:** Linha 148 do `InteractiveTutorial.tsx`:
```tsx
<button
  onClick={onSkip}
  className="text-white/40 text-xs hover:text-white/70 transition-colors"
>
  {t.skip}
</button>
```
A opacidade `text-white/40` (40% branco sobre fundo escuro `#0a0a0f`) torna o texto quase invisivel. Sem borda, sem background, sem destaque.
**Fix necessario:** Aumentar contraste — `text-white/80`, adicionar `bg-white/10 px-3 py-1.5 rounded-full`, ou transformar em botao outlined.

---

#### 4. Logo PWA Nao Centralizada (ClienteApp.tsx)
**Analise do codigo:** O header em `ClienteApp.tsx` linha 61-69 usa `flex items-center justify-between` com:
- Esquerda: botao voltar `w-10 h-10`
- Centro: `<h1>Tropicale</h1>`
- Direita: `<div className="w-10" />` (spacer para balancear)
**Teoria:** Isso DEVE centralizar o titulo perfeitamente. Mas como o app e renderizado como `<ClienteApp />` sem `onBack` prop em `main.tsx`, o botao de voltar fica visivel mas inutil.
**Possiveis causas reais:**
- O `h1` nao tem `text-center` — em telas muito pequenas pode parecer desalinhado
- O botao de voltar pode estar renderizando com largura diferente de `w-10`
- Verificacao visual necessaria para confirmar

---

#### 5. KDS Mostra "TPV Mesa" em vez de "TPV" (KDSApp.tsx + client.ts)
**Sintoma:** Pedidos do kiosk aparecem como "KIOSK MESA" no KDS.
**Causa raiz 1 (KDS):** `KDSApp.tsx` linha 68-69:
```tsx
{pedido.origem === 'pwa' ? t('fromPWA', locale) : t('fromTPV', locale)}
```
Quando `origem === 'kiosk'`, cai no `else` que usa `fromTPV`. O locale `es` traduz `fromTPV` como "TPV Mesa".
**Causa raiz 2 (standalone fallback):** `client.ts` linha 119 do `buildStandaloneOrder`:
```tsx
origem: 'tpv',  // <-- HARDCODED! Deveria vir do payload.checkout.origem
```
O fallback standalone ignora completamente o `checkout.origem` passado pelo caller.
**Fix necessario:**
1. No `client.ts`: `origem: payload.checkout.origem || 'tpv'`
2. No `KDSApp.tsx`: Adicionar tratamento para `origem === 'kiosk'` com label "TPV"
3. Verificar/criar chave i18n `fromKiosk` ou reutilizar `fromTPV` com traducao "TPV"

---

#### 6. Setas de Voltar em Locais Errados
**Sintoma:** Seta de voltar aparece no header do ClienteApp e na tela de detalhes do pedido, mas nao deveria existir em app standalone PWA.
**Localizacoes confirmadas:**
1. `ClienteApp.tsx` linha 62 — botao de voltar no header principal. Como `onBack` e `undefined` quando renderizado via `main.tsx`, o botao e visivel mas nao faz nada.
2. `PedidoDetalhesPage.tsx` linha 184-189 — botao de voltar com `<ArrowLeft />`. Essa tela e acessada ao clicar em um pedido na aba "Mis pedidos". A seta aqui faz sentido funcionalmente, mas o usuario considera "errada".
**Fix necessario:**
- No `ClienteApp.tsx`: Condicional `onBack && (...)` para so renderizar se houver handler
- No `PedidoDetalhesPage.tsx`: Considerar navegacao alternativa ou ocultar seta conforme preferencia do usuario

---

#### 7. Logout em Configuracoes Nao Funciona
**Analise do codigo:**
- `useStore.ts` linha 219: `logout: () => set({ perfilUsuario: null, carrinho: [] })`
- `ConfigPage.tsx` linha 45-48:
```tsx
const handleLogout = () => {
  logout();
  window.location.reload();
};
```
- `useStore.ts` usa `persist` middleware (linha 80) com `name: 'tpv-sorveteria-storage'` e persiste `perfilUsuario`.
**Teoria:** O `set()` do zustand + persist middleware DEVE salvar `perfilUsuario: null` no localStorage sincronamente antes do reload. Tecnicamente o codigo parece correto.
**Possiveis causas reais:**
- O `authMock.ts` salva usuarios em `localStorage` chave `tpv-users`. O `logout()` limpa `tpv-sorveteria-storage` mas NAO limpa `tpv-users`. Se houver algum codigo que restaure o perfil a partir de `tpv-users`...
- O `registerUser()` em `ConfigPage.tsx` linha 38 salva no `authMock`. O `logout()` nao chama `clearAllUsers()`.
- Mas `loginByPhone()` so e chamado explicitamente. Nao ha auto-login no mount.
**Verificacao necessaria:** Testar interativamente para confirmar se o bug persiste. Pode ser um falso positivo reportado pelo usuario.

---

#### 8. Historial por Telefone Nao Funciona
**Sintoma:** Pedidos nao aparecem na aba "Mis pedidos" / "Historial".
**Causa raiz:** `PedidosPage.tsx` filtra pedidos por:
```tsx
p.customerId === perfilUsuario.id || p.clienteTelefone === perfilUsuario.telefone
```
Mas o **standalone fallback** em `client.ts` (`buildStandaloneOrder`, linha 117-118):
```tsx
clienteTelefone: payload.checkout.notificationPhone || null,
customerId: null,  // <-- BUG: sempre null!
```
O `customerId` nunca e preenchido no fallback! Mesmo quando o `CarrinhoPage.tsx` passa `checkout.customerId` (linha 106), o `buildStandaloneOrder` ignora.
**Resultado:**
- `customerId` = null
- `clienteTelefone` = null (se usuario anonimo) ou o telefone de notificacao (que pode ser diferente do perfil)
- Filtro falha → `meusPedidos = []` → historial vazio
**Fix necessario:**
```tsx
// client.ts linha 117-118:
clienteTelefone: payload.checkout.notificationPhone || null,
customerId: payload.checkout.customerId || null,  // <-- ADICIONAR
origem: payload.checkout.origem || 'tpv',         // <-- TAMBEM CORRIGIR
```
**Nota:** O fallback de INSERT direto no Supabase (linha 499-500) ja preenche corretamente:
```tsx
origem: payload.checkout.origem || 'kiosk',
customer_id: payload.checkout.customerId || null,
```
Entao o bug afeta APENAS o modo standalone.

---

### Arvore de Dependencias dos Bugs

```
BUG-008 (Historial vazio)
  └── Causa: buildStandaloneOrder() ignora checkout.customerId
        └── Fix: Usar payload.checkout.customerId || null

BUG-005 (KDS label errado)
  └── Causa 1: buildStandaloneOrder() hardcoded origem: 'tpv'
  └── Causa 2: KDSApp.tsx so trata 'pwa' vs else (tpv/kiosk)
        └── Fix: Propagar origem + adicionar case 'kiosk' no KDS

BUG-002 (Alergenos errados)
  └── Causa: ProductDetailModal.tsx usa {aviso.alergeno} raw
        └── Fix: Substituir por {nomeAlergeno(aviso.alergeno, locale)}

BUG-001 (Animacao pagamento)
  └── Causa: Chaves i18n nao existem nos locale files
        └── Fix: Adicionar chaves a es.ts, ca.ts, pt.ts, en.ts

BUG-003 (Tutorial skip)
  └── Causa: text-white/40 muito sutil
        └── Fix: Aumentar contraste + adicionar background/border

BUG-004 (Logo nao centralizada)
  └── Causa: Possivel desalinhamento visual
        └── Fix: Verificar renderizacao real ou adicionar text-center

BUG-006 (Setas erradas)
  └── Causa: ClienteApp.tsx renderiza botao voltar mesmo sem onBack
        └── Fix: Condicional onBack && (...)

BUG-007 (Logout)
  └── Causa: Nao confirmado — precisa teste interativo
        └── Fix: Se confirmado, verificar persist middleware timing
```

### Proximos Passos Recomendados (quando usuario autorizar codigo)

1. **Bug 2 (Alergenos)** — 1 linha, impacto alto. Quick win.
2. **Bug 8 (Historial)** — 2-3 linhas no `client.ts`. Quick win.
3. **Bug 5 (KDS label)** — 2 arquivos. Quick win.
4. **Bug 1 (Animacao i18n)** — Adicionar chaves aos 4 locales. Moderado.
5. **Bug 3 (Tutorial skip)** — Ajustar CSS. Simples.
6. **Bug 6 (Setas)** — Condicional no ClienteApp.tsx. Simples.
7. **Bug 4 (Logo)** — Verificar visualmente primeiro.
8. **Bug 7 (Logout)** — Testar interativamente antes de codar.
- Ultima milha ainda precisa de validacao humana em celular/browser real porque o ambiente Playwright desta maquina fixa `Notification.permission = denied` e impede subscription automatica.

## Asset novo informado pelo usuario
- Fonte de logo adicionada pelo usuario: `public/assets/logo/ChatGPT Image 25 abr 2026, 08_46_42.png`.
- Nota de autoria desta anotacao: CODEX.
- A secao `ANALISE DA KIMI 2.6` ja cobre a suspeita de desalinhamento da logo; nao duplicar diagnostico sem evidencia nova.

## ANALISE DA KIMI 2.6 — Complemento CODEX sobre telefone na Espanha
- Esta secao foi adicionada por CODEX apos novo direcionamento do usuario.
- Verificacao de consolidacao: a secao atual da Kimi nao cobre de forma explicita a remocao da obrigatoriedade de `+34`, nem define uma estrategia forte de normalizacao backend para telefones espanhois. Portanto este item entra como complemento novo, nao como duplicacao.

### Diretriz de UX
- O fluxo do cliente nao deve obrigar o usuario a digitar `+34`.
- Contexto de negocio: o produto esta operando na Espanha e o usuario percebe `+34` como friccao desnecessaria.
- Formatos comuns que devem ser aceitos como equivalentes:
  - `624529442`
  - `624 529 442`
  - `624 52 94 42`
  - `+34 624 529 442`
  - `+34 624 52 94 42`

### Diretriz de backend
- O backend deve ser a camada canonica de organizacao/normalizacao do telefone para evitar inconsistencias entre cliente, historico, login, notificacoes e busca de perfil.
- Objetivo: qualquer variante valida do mesmo numero espanhol deve convergir para um formato estavel unico antes de persistir, comparar ou consultar.
- Regra de negocio desejada:
  - remover espacos, hifens, parenteses e separadores visuais;
  - aceitar entrada com ou sem `+34`;
  - quando o numero tiver 9 digitos validos de Espanha, assumir pais `34` internamente;
  - persistir e consultar sempre no mesmo formato canonico;
  - impedir que `624 529 442` e `624 52 94 42` virem clientes diferentes.

### Riscos que esta decisao pretende evitar
- historico quebrado por telefone salvo em formatos diferentes;
- login por telefone falhando por divergencia de formato;
- notificacao/contato enviados para numero nao canonico;
- duplicacao de cliente por variacao visual de escrita.

### Tarefa futura solicitada pelo usuario
- Adicionar em `Configuracoes` uma opcao no estilo `Verifique seu telefone`.
- Ideia funcional: o usuario recebe uma mensagem para confirmar posse do numero por seguranca.
- Estado desta anotacao: apenas backlog/planejamento; nao implementar antes de tratar a normalizacao forte do telefone.
- Dependencias conceituais:
  - telefone canonico no backend;
  - fluxo de envio de mensagem;
  - estado de telefone verificado vs nao verificado;
  - UX clara para reenvio e erro.

### ATUALIZACAO DE ESTADO — CODEX
- A normalizacao forte de telefone foi implementada em codigo nesta rodada.
- Estrategia vigente:
  - o front nao exige mais `+34`;
  - entradas como `624529442`, `624 529 442`, `624 52 94 42` e `+34 624 529 442` convergem para o formato canonico espanhol de 9 digitos;
  - o backend foi preparado para normalizar `customers`, `orders` e `push_subscriptions`.
- Implementacao principal:
  - utilitario shared: `packages/shared/src/lib/phone.ts`;
  - cliente: `QuickRegister.tsx`, `ConfigPage.tsx`, `PagamentoModal.tsx`, `customerProfile.ts`;
  - shared/realtime: `packages/shared/src/realtime/client.ts`;
  - SQL/backend: `supabase/migrations/func_00_helpers.sql`, `func_04_create_order.sql`, `func_10_upsert_customer.sql`, `20260425111500_normalize_spanish_phones.sql`.
- Status vigente: `IMPLEMENTADO EM CODIGO`.
- Evidencia:
  - build validado com `npm run build:cliente`.
- Observacao de consolidacao:
  - a tarefa futura `Verifique seu telefone` continua em backlog, mas agora com a pre-condicao principal atendida: identidade telefonica canonica.

## ATUALIZACAO DE ESTADO — CODEX

### Bug 2 — Alergenos com traducao errada
- Relato anterior da Kimi: valido no momento da analise. O `ProductDetailModal.tsx` mostrava a chave interna raw do alergeno (`ovos`, `leite`) em vez do nome traduzido.
- Atualizacao de estado por CODEX: corrigido em `apps/cliente/src/components/ProductDetailModal.tsx` com uso de `nomeAlergeno(aviso.alergeno, locale)`.
- Status vigente: `CORRIGIDO`.
- Evidencia:
  - build validado com `npm run build:cliente`;
  - referencia de implementacao: `apps/cliente/src/components/ProductDetailModal.tsx`.
- Observacao de consolidacao: a anotacao original da Kimi deve permanecer como historico, mas a verdade operacional atual passa a ser esta atualizacao mais recente do CODEX.

### Bug 8 — Historial por telefone nao funciona
- Relato anterior da Kimi: valido no momento da analise. O fallback standalone ignorava `checkout.customerId`, o que quebrava o filtro de pedidos do cliente.
- Atualizacao de estado por CODEX: corrigido em `packages/shared/src/realtime/client.ts`.
- Mudanca aplicada:
  - `customerId` agora recebe `payload.checkout.customerId || null`;
  - `origem` agora recebe `payload.checkout.origem || 'tpv'` no fallback standalone.
- Status vigente: `CORRIGIDO`.
- Evidencia:
  - build validado com `npm run build:cliente`;
  - referencia de implementacao: `packages/shared/src/realtime/client.ts`.

### Bug 5 — KDS mostra "TPV Mesa" em vez de "TPV"
- Relato anterior da Kimi: valido no momento da analise.
- Atualizacao de estado por CODEX: ajustado em `apps/kds/src/KDSApp.tsx`.
- Mudanca aplicada:
  - pedidos `pwa` continuam com label do app cliente;
  - pedidos `tpv` e `kiosk` agora aparecem como `TPV`;
  - filtro `TPV` do KDS passa a incluir pedidos com origem `kiosk`.
- Status vigente: `CORRIGIDO`.
- Evidencia:
  - build validado com `npm run build:kds`;
  - referencias de implementacao: `apps/kds/src/KDSApp.tsx` e `packages/shared/src/realtime/client.ts`.

### Bug 1 — Textos da animacao de pagamento com underscores
- Relato anterior da Kimi: valido no momento da analise. As chaves usadas por `ProcessandoPagamento.tsx` nao existiam nos locales.
- Atualizacao de estado por CODEX: corrigido nos arquivos de idioma em `packages/shared/src/i18n/{es,ca,pt,en}.ts`.
- Mudanca aplicada:
  - adicionadas as chaves `connectingGateway`, `connectingBizum`, `waitingConfirmation`, `registeringOrder`, `generatingTicket`, `connectingApplePay`, `connectingGooglePay` e `authenticating`.
- Status vigente: `CORRIGIDO`.
- Evidencia:
  - build validado com `npm run build:cliente`;
  - referencias de implementacao: `apps/cliente/src/components/pagamento/ProcessandoPagamento.tsx` e `packages/shared/src/i18n/{es,ca,pt,en}.ts`.

### Bug 3 — "Pular tutorial" pouco visivel
- Relato anterior da Kimi: valido no momento da analise.
- Atualizacao de estado por CODEX: ajustado em `apps/cliente/src/components/onboarding/InteractiveTutorial.tsx`.
- Mudanca aplicada:
  - CTA de pular tutorial recebeu contraste maior, borda, fundo translucido e peso tipografico melhor;
  - objetivo: manter elegancia visual sem esconder a acao.
- Status vigente: `CORRIGIDO`.
- Evidencia:
  - build validado com `npm run build:cliente`;
  - referencia de implementacao: `apps/cliente/src/components/onboarding/InteractiveTutorial.tsx`.

### Bug 6 — Setas de voltar em locais errados
- Relato anterior da Kimi: valido no momento da analise.
- Atualizacao de estado por CODEX: concluido em `apps/cliente/src/ClienteApp.tsx` e `apps/cliente/src/pages/PedidoDetalhesPage.tsx`.
- Mudanca aplicada:
  - a seta do header principal nao aparece mais quando `ClienteApp` esta no modo standalone sem `onBack`;
  - o layout do header foi preservado com spacer e titulo centralizado;
  - a tela de detalhes do pedido deixou de usar a seta quadrada antiga e passou a usar um retorno textual `Volver a pedidos`.
- Status vigente: `CORRIGIDO`.
- Evidencia:
  - build validado com `npm run build:cliente`;
  - referencias de implementacao: `apps/cliente/src/ClienteApp.tsx` e `apps/cliente/src/pages/PedidoDetalhesPage.tsx`.

### Bug 7 — Logout em Configuracoes nao funciona
- Relato anterior da Kimi: valido como suspeita e precisava de verificacao mais profunda.
- Atualizacao de estado por CODEX: fluxo endurecido em `apps/cliente/src/pages/ConfigPage.tsx`.
- Mudanca aplicada:
  - logout agora limpa a store em memoria;
  - limpa explicitamente a sessao persistida em `tpv-sorveteria-storage`;
  - remove o flag `tpv-onboarding-completed` para evitar reidratacao enganosa apos reload.
- Status vigente: `CORRIGIDO EM CODIGO`.
- Evidencia:
  - build validado com `npm run build:cliente`;
  - referencia de implementacao: `apps/cliente/src/pages/ConfigPage.tsx`.
- Observacao de consolidacao:
  - esta rodada fechou a causa tecnica mais provavel; ainda vale uma validacao manual curta no navegador para marcar como totalmente confirmado em uso real.

### Bug 4 — Logo PWA nao centralizada
- Relato anterior da Kimi: existia como suspeita visual e estava pendente de verificacao.
- Atualizacao de estado por CODEX: o header do cliente passou a usar a logo real do projeto em vez do texto cru.
- Mudanca aplicada em `apps/cliente/src/ClienteApp.tsx`:
  - uso do asset `public/assets/logo/ChatGPT Image 25 abr 2026, 08_46_42.png`;
  - logo centralizada com `object-contain` e limite responsivo de largura;
  - preservacao do equilibrio visual do header com espacadores laterais.
- Status vigente: `CORRIGIDO EM CODIGO`.
- Evidencia:
  - build validado com `npm run build:cliente`;
  - referencia de implementacao: `apps/cliente/src/ClienteApp.tsx`.
- Observacao de consolidacao:
  - como a reclamacao original era visual, ainda e bom fazer uma ultima checagem humana no device; mas a implementacao atual ja substitui a condicao antiga por uma estrutura muito mais coerente com a marca.


---

## Sessao 2026-04-23 — Substituicao de Logo Generica pela Logo REAL do Usuario

### Contexto Inicial (estado do codigo escrito pelo codex)
O codex anterior deixou o projeto com multiplos componentes e telas usando uma **logo generica** composta de:
- Componente `TropicaleLogo` (`packages/shared/src/components/TropicaleLogo.tsx`) — SVG generico de sorvete
- Texto "Tropicale" em fonte display em praticamente todas as telas
- Emojis de sorvete (🍦) como avatar de marca em headers

**Locais afetados:**
| App | Arquivo | Tipo de logo generica |
|-----|---------|----------------------|
| Cliente | `WelcomeScreen.tsx` | `TropicaleLogo` SVG + texto "Heladeria Tropicale" |
| Cliente | `ClienteApp.tsx` | Ja usava a logo real (correcao anterior) |
| Kiosk | `HolaScreen.tsx` | `TropicaleLogo` SVG + texto "Tropicale" |
| Kiosk | `AttractScreen.tsx` | Emoji 🍦 + texto "Tropicale" |
| Kiosk | `CardapioScreen.tsx` | Emoji 🍦 + texto "Tropicale" |
| Kiosk | `LoginKioskScreen.tsx` | Texto "App Tropicale" |
| Kiosk | `CodigoAppScreen.tsx` | Texto "App Tropicale" |
| Admin | `AdminApp.tsx` | SVG generico de sorvete + texto "Tropicale" |
| Admin | `LoginScreen.tsx` | SVG generico de sorvete + texto "Tropicale" |
| KDS | `KDSApp.tsx` | Texto "Tropicale" no footer |

### O que foi feito
Substituida a logo generica pela **imagem real do usuario** (`public/assets/logo/ChatGPT Image 25 abr 2026, 08_46_42.png`) em TODAS as telas, seguindo o processo do `.brain/ORQUESTRADOR.md`:
- **Personalidade primaria:** UI/UX ENGINEER — alt text, responsividade, acessibilidade
- **Personalidade secundaria:** CSS/TAILWIND EXPERT — mobile-first, object-contain, tamanhos proporcionais

**Mudancas aplicadas:**
1. `WelcomeScreen.tsx` — `<TropicaleLogo>` + circulo verde removidos; `<img>` com logo real (h-28, max-w-[220px])
2. `HolaScreen.tsx` — `<TropicaleLogo>` + circulo verde removidos; `<img>` com logo real (h-24, max-w-[200px])
3. `AttractScreen.tsx` — Emoji + texto "Tropicale" removidos; `<img>` com logo real (h-14, max-w-[180px])
4. `CardapioScreen.tsx` — Emoji + texto "Tropicale" removidos; `<img>` com logo real (h-10, max-w-[140px])
5. `LoginKioskScreen.tsx` — Texto "App Tropicale" removido; `<img>` com logo real (h-10, max-w-[160px])
6. `CodigoAppScreen.tsx` — Texto "App Tropicale" removido; `<img>` com logo real (h-9, max-w-[140px])
7. `AdminApp.tsx` — SVG generico + texto "Tropicale" removidos; `<img>` com logo real (w-10 h-10, bg-white)
8. `LoginScreen.tsx` — SVG generico + texto "Tropicale" removidos; `<img>` com logo real (w-16 h-16)
9. `KDSApp.tsx` — Texto "Tropicale" removido; `<img>` com logo real (h-5, max-w-[80px], opacity-50)

**Importante:** Labels de origem de pedido (TPV/PWA) no KDS foram PRESERVADOS. Nao foram substituidos pela logo.

### Validacao
- Build `cliente`: ✅ (2209 modulos, 40.12s)
- Build `kiosk`: ✅ (2183 modulos, 37.88s)
- Build `admin`: ✅ (2797 modulos, 46.83s)
- Build `kds`: ✅ (2173 modulos, 38.61s)

### Status de Deploy
**NAO REALIZADO.** Aguardando permissao explicita do usuario para commit e push, conforme regra do `.brain` — "nao faz coisas que quebram tudo sozinho, sempre pergunta antes de push/deploy".

### Pendencia
- Timer: usuario mencionou "quando der 60 secs transformar em 1 min". Os unicos timers com segundos sao o KDS (MM:SS, funcional para cozinha) e o countdown do codigo do totem (MM:SS). Necessario confirmar se deseja alterar esses formatos antes de aplicar.


---

## Sessao 2026-04-23 — FIX DEPLOY VERCEL (aprendizado)

### Contexto
O usuario reportou 404 no Kiosk apos push anterior. O workflow `.github/workflows/deploy.yml` estava copiando apenas o `project.json` para o `dist/`, mas nao o `vercel.json`.

### O que foi tentado
1. Adicionar `cp apps/<app>/vercel.json dist/<app>/vercel.json` no workflow
2. Adicionar `rewrites: [{source: "/(.*)", destination: "/index.html"}]` nos `vercel.json`

### O que o usuario CORRIGIU (deploy manual funcionou)
O usuario fez deploy manual via `dist/` local e descobriu que:
- O Vercel automático (Git Integration) tenta buildar pelo root directory errado no monorepo
- O fluxo que FUNCIONA e buildar localmente e deployar o `dist/` pronto
- Comandos corretos: `npm run deploy:cliente`, `npm run deploy:kiosk`, etc. ou `npm run deploy:all`
- URLs de producao atualizadas:
  - Cliente: https://cliente-pearl.vercel.app
  - Kiosk: https://kiosk-swart-delta.vercel.app
  - Admin: https://admin-ten-vert-54.vercel.app
  - KDS: https://kds-one.vercel.app

### Pendencia: AGUARDANDO USUARIO
O usuario disse: "atualize o brain quando eu falar q o deploy deu certo o jeit certo dd fazer pra vc n errar"

**Isso significa:** O usuario vai testar/testou um fluxo de deploy e vai me dizer qual e o correto. So entao devo atualizar o `.brain` com a instrucao definitiva.

**REGRA ABSOLUTA:** Nunca fazer deploy automaticamente. Sempre aguardar confirmacao explicita do usuario.


---

## Sessao 2026-04-23 — Idle Timeout "¿Sigues aquí?" + Deploy Vercel

### Idle Timeout — Implementacao
Baseado em pesquisa de melhores práticas QSR/kiosk:
- **IdealPOS**: 30s inatividade → prompt "Are you still ordering?" → 10s → reseta
- **RetailCloud**: 20s timeout + 5s warning popup
- **Eflyn**: timer resetado em toque, swipe, gesture
- **DigitalRecordBoard**: 30s timeout, reseta em touchstart/click/keydown/scroll

**Implementacao:**
- Hook `useIdleTimeout` em `packages/shared/src/hooks/useIdleTimeout.ts`
- Componente `IdleTimeoutModal` em `packages/shared/src/components/IdleTimeoutModal.tsx`
- **30s** de inatividade → mostra modal "¿Sigues aquí?" com countdown circular
- **10s** para responder → se não responder, reseta automaticamente
- Eventos que resetam: mousedown, touchstart, keydown, scroll, click, mousemove
- No **Kiosk**: reseta para AttractScreen, limpa carrinho, desvincula cliente
- No **Cliente**: reseta para aba Cardapio (não limpa carrinho)

### Deploy Vercel — Fluxo Correto (aprendizado)
**O que NAO funciona:**
- Deploy via GitHub Actions com build no CI (monorepo + workspace:* quebra)
- `npx vercel` diretamente no `dist/` sem `.vercel/project.json`

**O que FUNCIONA:**
```bash
# Build local no monorepo (workspace:* resolve corretamente)
npm run build:kiosk

# Deploy via script (copia .vercel/project.json para dist/ antes)
node scripts/deploy-app.mjs kiosk --prod

# Ou todos de uma vez:
npm run deploy:all
```

**URLs de producao:**
- Cliente: https://cliente-pearl.vercel.app
- Kiosk: https://kiosk-swart-delta.vercel.app
- Admin: https://admin-ten-vert-54.vercel.app
- KDS: https://kds-one.vercel.app

**REGRA ABSOLUTA para deploy:**
1. Sempre buildar LOCALMENTE primeiro (`npm run build:<app>`)
2. Sempre usar o script `scripts/deploy-app.mjs` (copia project.json)
3. Nunca fazer deploy sem confirmacao explicita do usuario
4. Se o usuario nao pedir deploy, NAO deployar

### Pendencias
- Timer: usuario mencionou "quando der 60 secs transformar em 1 min" — ainda nao implementado

## ANALISE DA WEB + CODEX - Sistema de Subagentes (2026-04-25)

### Status vigente
- O projeto agora tem um sistema operacional de subagentes documentado e automatizado.
- O padrao oficial e `manager-worker`.
- O protocolo oficial entre agentes e `MAMIS/1`.
- O agente principal pode ser CODEX ou KIMI.
- A geracao automatica de equipes e contratos existe em `scripts/subagent-fabric.mjs`.

### Fontes-base
- OpenAI practical guide to building agents
- OpenAI cookbook multi-agent collaboration
- Anthropic multi-agent research system
- Microsoft Agent Framework
- AutoGen
- LangGraph

### Artefatos permanentes
- `.brain-orchestrator/OPERACAO_AGENTES.md`
- `.brain-orchestrator/SUBAGENT_REGISTRY.json`
- `.brain-orchestrator/SUBAGENT_PROMPTS.md`
- `.brain/knowledge/subagent-scientific-operating-system.md`
- `scripts/subagent-fabric.mjs`

### Regra operacional
- Sempre que a tarefa pedir breadth-first research, particionamento de contexto, verificacao sidecar ou especializacao forte, o agente principal deve consultar `OPERACAO_AGENTES.md` e pode gerar uma equipe com `npm run agent:fabric -- --goal "..."`.

### Autor
- CODEX

## Atualizacao 2026-04-25 - Brain principal canonico
- O brain principal independente fica em `C:\Users\Administrator\Documents\.brain`.
- O `.brain` do projeto passa a ser espelho operacional local.
- Todo ajuste relevante no brain do projeto deve disparar sync para o brain principal.
- Automacao criada em `scripts/sync-principal-brain.mjs` e script `npm run brain:sync:principal`.
- Politica nova: tentar `git add + commit + push` no brain principal a cada sync; se o remote nao existir, registrar o bloqueio explicitamente.
- Autor: CODEX.

## Atualizacao 2026-04-25 - Governanca do brain principal
- O sistema agora tem governanca explicita para o brain principal em `.brain/knowledge/principal-brain-governance.md`.
- O orquestrador ganhou runtime de sync em `.brain-orchestrator/BRAIN_SYNC_RUNTIME.md`.
- Novo script de watch: `npm run brain:sync:watch`.
- O sync principal agora tambem mantem `PROJECTS.json` e `CHANGELOG.md` no brain principal.
- Autor: CODEX.

## Atualizacao 2026-04-26 - Operacao continua do brain principal
- Watcher residente instalado no Windows para sync continuo do brain principal.
- Dashboard global de maturidade implementado no brain principal com `DASHBOARD.md`, `DASHBOARD.json` e `METRICS_SCHEMA.json`.
- Snapshots periodicos e rollback logico por projeto implementados e validados.
- `npm run brain:sync:principal` agora fecha o ciclo com mirror replace robusto, metadata estruturada, snapshot, dashboard, commit e push.
- Estado vigente: principal brain operacional e escalavel, com governanca ativa para multiplos projetos.

## Atualizacao 2026-04-25 - Brain principal com GitHub remoto ativo
- Repo remoto criado para o brain principal: `Jhin1v9/principal-brain`.
- O brain principal local em `C:\Users\Administrator\Documents\.brain` agora rastreia `origin/main` via SSH.
- O primeiro push real foi concluido com sucesso.
- A partir deste ponto, `npm run brain:sync:principal` fecha o ciclo completo de sync + commit + push quando houver mudancas.
- Autor: CODEX.


---

## Sessao 2026-04-25 — Logo Sizes Padronizados (QSR Standards)

### Contexto
Usuario pediu: "alinhar todas as logos na pag inicial, ficou bom mas so aumenta um pouco mais e nas demais partes tb ficou pequeno, use o tamanho padrao da internet pra por logos, pesquise sempre e se aprimore. Mas antes revise o .brain e entenda toda a atualizacao que criei, criei subagentes pra vc e o codex e vcs sao como reis que reinam eles e eu mando em vcs dois. Se atualize e use sempre toda ferramenta que vc precisar."

### Sistema de Subagentes (criado pelo usuario)
O usuario criou um sistema completo de subagentes no `.brain`:
- **4 Personas**: Architect, Product Visionary, Surgeon, DevOps
- **6 Subagentes**: WEB_SCOUT, CODE_SCOUT, SURGEON, VERIFIER, REVIEWER, SYNTHESIZER
- **Protocolo MAMIS/1**: Comunicacao IA→IA padronizada
- **Regra**: KIMI e CODEX sao agentes principais (reis), usuario manda em ambos
- **Regra**: Sempre usar subagentes quando houver ganho real

### Pesquisa WEB_SCOUT
Pesquisou tamanhos padrao de logo em apps QSR:
- **McDonald's**: Splash = 25-30% altura tela, Header = 40-60px
- **Starbucks**: Login = 120-150px largura, Header = 40-50px altura
- **Burger King**: Kiosk 27", logo em destaque no topo
- **QSR Industry**: Header 60-80px, Hero 280-350px, Minimo legivel 40px mobile / 60px kiosk

### Implementacao (SURGEON)
Ajustados 9 arquivos:

| # | Arquivo | Contexto | Antes | Depois |
|---|---------|----------|-------|--------|
| 1 | WelcomeScreen.tsx (cliente) | Hero | h-36 (144px) | h-40 (160px) |
| 2 | HolaScreen.tsx (kiosk) | Hero | h-32 (128px) | h-40 (160px) |
| 3 | AttractScreen.tsx (kiosk) | Hero | h-28 (112px) | h-44 (176px) |
| 4 | CardapioScreen.tsx (kiosk) | Header | h-10 (40px) | h-14 (56px) |
| 5 | LoginKioskScreen.tsx | Header | h-10 (40px) | h-14 (56px) |
| 6 | CodigoAppScreen.tsx | Header | h-9 (36px) | h-12 (48px) |
| 7 | AdminApp.tsx | Sidebar | w-10 h-10 (40px) | w-12 h-12 (48px) |
| 8 | LoginScreen.tsx (admin) | Login | w-16 h-16 (64px) | w-20 h-20 (80px) |
| 9 | KDSApp.tsx | Footer | h-5 (20px) | h-6 (24px) |

### Builds
- cliente: ✅
- kiosk: ✅
- admin: ✅
- kds: ✅

### Deploy
- kiosk: https://kiosk-swart-delta.vercel.app (em deploy)
- cliente: https://cliente-pearl.vercel.app (em deploy)

### Aprendizado
- Sempre pesquisar padroes do mercado antes de definir tamanhos
- Usar subagentes (WEB_SCOUT + SURGEON) para ganho de qualidade
- Seguir protocolo MAMIS/1 para comunicacao entre agentes

## Atualizacao 2026-04-26 - Repo remoto do projeto com sync oficial
- O repo remoto deste projeto ja existia e agora foi alinhado para SSH em `origin`.
- Script oficial criado: `npm run repo:sync`.
- Regra vigente: mudancas relevantes do projeto devem terminar em `commit + push`, assim como o brain principal.
- Curadoria adicionada ao `.gitignore` para nao subir `apps/*.zip` e `.brain-orchestrator-new/`.
- Autor: CODEX.

## Atualizacao 2026-04-26 - Swarm Hardening Vigente
- Decisao operacional: congelar expansao de features do swarm ate o runtime obedecer integralmente a propria politica.
- Novo plano mestre: `.brain/knowledge/agent-swarm-hardening-master-plan.md`.
- Status vigente do swarm: strong direction, partial implementation.
- Promocao para extraordinario so apos gates de policy truth, mission truth, recursion truth, learning truth e evaluation truth.
- Autor desta atualizacao: CODEX.

## Atualizacao 2026-04-26 - Protocolo CODEX KIMI vigente
- Novo protocolo permanente em `.brain-orchestrator/CODEX_KIMI_CONSENSUS_PROTOCOL.md`.
- Regra vigente: CODEX e KIMI devem operar como uma mente distribuida com autoria clara, consenso rastreavel e status vigente compartilhado.
- Nao registrar chain-of-thought bruto no brain; registrar apenas verdade operacional, evidencia, divergencia, consenso e proximo passo.
- Autor desta atualizacao: CODEX.

## Atualizacao 2026-04-26 - Principal brain hardening vigente
- Snapshot, rollback e dashboard do brain principal agora operam com contrato mais explicito e reconciliado.
- Novo helper: `scripts/lib/principal-brain-metadata.mjs`.
- Regras vigentes:
  - `snapshots/index.json` e o catalogo de snapshots
  - `ROLLBACK.json.currentPointer` e o snapshot restaurado/ativo
  - `ROLLBACK.json.restorePoints` e o catalogo reconciliado de restore points
- Dashboard agora exp�e integrity alerts e contagens reais de snapshot vs rollback.
- Autor desta atualizacao: CODEX.

## Atualizacao 2026-04-26 - Sync lock e paridade resolvidos
- `sync-principal-brain.mjs` agora usa lock externo em `C:\Users\Administrator\Documents\.principal-brain-sync.lock`.
- Corrida entre watcher residente e sync manual foi endurecida.
- Dashboard do brain principal agora mostra `Snapshots = RollbackPts` e `integrity_alerts = 0` para o projeto atual.
- Autor desta atualizacao: CODEX.

## Atualizacao 2026-04-26 - Score auditavel e tendencia historica
- Novo helper de score: `scripts/lib/principal-brain-score.mjs`.
- `SNAPSHOT.json` agora recebe `scoreAudit`, `scoreModelVersion`, `maturityScore`, `healthScore` e `trend` calculados pela formula auditavel.
- Novo historico por projeto: `SCORE_HISTORY.json`.
- Novo historico global: `DASHBOARD_HISTORY.json`.
- Dashboard e projects agora exp�em deltas e tendencia em vez de score opaco.
- Autor desta atualizacao: CODEX.

---

## ATUALIZACAO DE ESTADO - CODEX (2026-04-26)

### Auditoria da execucao da KIMI no brain runtime

**RELATO ANTERIOR**
- KIMI ampliou automacao do sync, watcher e dashboard do brain principal.
- Houve ganho real de ambicao operacional.

**ATUALIZACAO**
- A auditoria confirmou progresso, mas tambem confirmou regressos estruturais em runtime critico.

**STATUS VIGENTE**
1. o plano extraordinario continua valido
2. a execucao da KIMI esta `PARTIAL`
3. regressos que nao podem voltar:
   - lock do sync dentro do repo canonico
   - dashboard escrevendo `SNAPSHOT.json`
   - historico crescendo por refresh sem delta real
   - metadados com autoria hardcoded em `KIMI`
   - narrativa `single commit` divergente da execucao real

**EVIDENCIA**
- `scripts/sync-principal-brain.mjs`
- `scripts/principal-brain-dashboard.mjs`
- `.brain-orchestrator/CODEX_KIMI_CONSENSUS_PROTOCOL.md`
- `.brain-orchestrator/PRINCIPAL_AGENT_RUNTIME.md`
- `.brain/knowledge/SUPREME_RUNTIME_GUARDRAILS.md`

**OBSERVACAO DE CONSOLIDACAO**
- Esta atualizacao prevalece sobre espelhos stale ou comentarios antigos do runtime.
- Quando KIMI reler o brain, deve obedecer os guardrails novos antes de continuar expandindo o sistema.

---

## ATUALIZACAO DE ESTADO - CODEX (2026-04-26)

### Hardening validado do principal brain runtime

**STATUS VIGENTE**
1. lock do sync permanece fora do repo canonico
2. dashboard nao escreve mais SNAPSHOT.json
3. historico de score/dashboard nao cresce por refresh sem delta real
4. sync principal fecha com pushState: ok e git status limpo no brain principal
5. score auditavel nasce em principal-brain-snapshot.mjs

**EVIDENCIA**
- scripts/sync-principal-brain.mjs
- scripts/principal-brain-dashboard.mjs
- scripts/principal-brain-snapshot.mjs
- validacao real em 2026-04-26 com historico estavel e repo canonico limpo

**OBSERVACAO DE CONSOLIDACAO**
- este estado substitui a fase parcial anterior para estes itens especificos do hardening
- novas expansoes devem preservar estes guardrails
---

## ATUALIZACAO DE ESTADO - CODEX (2026-04-26)

### Distribuicao vigente CODEX ↔ KIMI

**STATUS VIGENTE**
1. KIMI lidera auditoria, critica, proposta, discovery e expansao estrategica
2. CODEX lidera hardening, runtime critico, validacao live e consolidacao da verdade operacional
3. mudancas de source-of-truth, metricas, runtime critico e governanca exigem consenso
4. o plano da KIMI em `decisions.md` foi convertido em backlog distribuido com ownership explicito

**EVIDENCIA**
- `.brain/memory/decisions.md`
- `.brain-orchestrator/CODEX_KIMI_TASK_ALLOCATION.md`
- `.brain-orchestrator/CODEX_KIMI_CONSENSUS_PROTOCOL.md`
- `.brain-orchestrator/PRINCIPAL_AGENT_RUNTIME.md`

**OBSERVACAO DE CONSOLIDACAO**
- KIMI propoe e pressiona o sistema para cima.
- CODEX endurece, prova e consolida.
- consenso e obrigatorio em regras canonicas e runtime critico.
---

## ATUALIZACAO DE ESTADO - CODEX (2026-04-26)

### Politica budget-aware entre CODEX e KIMI

**STATUS VIGENTE**
1. ambos podem executar qualquer tarefa quando necessario
2. a divisao por ownership continua como preferencia para reduzir conflito
3. budget e throughput agora fazem parte da decisao operacional
4. guardrails e verdade operacional continuam acima da otimizacao de credito
---

## ATUALIZACAO DE ESTADO - CODEX (2026-04-26)

### Dashboard excellence

**STATUS VIGENTE**
1. dashboard atual = forte, consistente e confiavel
2. dashboard atual ainda nao = extraordinario
3. prioridade agora e aumentar acionabilidade, explicabilidade e inteligencia de portfolio
4. blueprint canonico: `.brain/knowledge/dashboard-excellence-blueprint.md`
---

## ATUALIZACAO DE ESTADO - CODEX (2026-04-26)

### Dashboard do brain principal

**STATUS VIGENTE**
1. Camada 1 do cockpit decisional implementada
2. markdown e json agora expõem:
   - What needs attention now
   - score drivers
   - confidence
   - trend meaning
   - portfolio intelligence
3. guardrails anteriores foram preservados
4. proximo salto natural = janelas de tendencia 3/7/30, drivers de mudanca e risco de stale-sync mais sofisticado
## Atualizacao 2026-04-26 - BLS e Personalidades (KIMI)

### Tarefa 1: Brain Learning System (BLS) Minimo � COMPLETO
- Criada estrutura .brain/learning/:
  - README.md � documenta��o do sistema
  - patterns.json � 6 padr�es validados (4 promovidos a regra)
  - nti-patterns.json � 6 anti-patterns com preven��o
  - index.json � �ndice pesquis�vel por categoria, personalidade, contexto
  - outcomes/positive/ � 1 learning outcome positivo
  - outcomes/negative/ � 2 learning outcomes negativos
- Integrado com subagent-learn.mjs existente
- Autor: KIMI

### Tarefa 2: Consolidar Personalidades � COMPLETO
- Copiadas 8 personalidades de .brain-orchestrator/personalities/ para .brain/personalities/
- Brain principal agora tem fonte can�nica completa
- README.md do brain aponta corretamente para local existente
- Autor: KIMI

### Pr�ximos passos KIMI
- Tarefa 3: Expandir cat�logo de aprendizados das sess�es anteriores
- Tarefa 4: Pesquisar melhorias de swarm dentro dos guardrails


## ATUALIZACAO DE ESTADO - CODEX (2026-04-26)

### Hardening do swarm policy runtime

**STATUS VIGENTE**
1. `scripts/lib/subagent-policy.mjs` virou fonte canonica de mission type, roles, strategy e scaling
2. `subagent-fabric.mjs`, `subagent-mission.mjs` e `subagent-swarm.mjs` agora obedecem a policy compartilhada
3. `max_parallel_global`, `max_children_per_agent` e `max_write_agents_per_parent` agora moldam o artefato gerado
4. audit, research e implementation passaram a nascer com composicao minima correta
5. lanes supervisoras passaram a ser a forma canonica de escalar sem quebrar guardrails

**EVIDENCIA**
- `scripts/lib/subagent-policy.mjs`
- `scripts/subagent-fabric.mjs`
- `scripts/subagent-mission.mjs`
- `scripts/subagent-swarm.mjs`
- smokes em `artifacts/subagent-fabric-*2026-04-26T06-59*`
- smokes em `artifacts/subagent-swarm-*2026-04-26T06-59*`

**OBSERVACAO DE CONSOLIDACAO**
- este estado substitui a leitura anterior de que a policy library existia mas nao governava o runtime
- novas expansoes do swarm devem acontecer primeiro na policy e so depois nos geradores
---

## Atualizacao 2026-04-26 - KIMI assume lideranca total

### Contexto
- CODEX esgotou creditos
- Usuario determinou: KIMI agora predomina como chefe
- KIMI ja entendeu todo o brain, as regras, a intencao extraordinaria

### Status das Tarefas KIMI
- Tarefa 1 (BLS): ? COMPLETO
- Tarefa 2 (Personalidades): ? COMPLETO
- Tarefa 3 (Aprendizados): ? COMPLETO
- Tarefa 4 (Swarm research): ? BACKLOG

### Status das Tarefas CODEX
- ADR-016 (Dashboard evolution): ? COMPLETO - Camada 1 implementada
- ADR-017 (Decision cockpit): ? COMPLETO
- Runtime brain principal: ? ESTAVEL
- Hardening: ?? EM ANDAMENTO

### O que o CODEX entregou antes de esgotar
1. Dashboard Camada 1 completa:
   - What needs attention now
   - Why this score (drivers)
   - Confidence level
   - Portfolio intelligence (concentration risk, stale sync)
   - Top risks preenchido
2. Score auditavel com formula v1
3. Historico estavel (8 pontos, sem inflacao)
4. Sync, snapshot, rollback todos funcionando
5. Guardrails supremos documentados

### Proximos passos KIMI
1. Continuar hardening do swarm (Phase 1-6)
2. Implementar Dashboard Camada 2 (trend real)
3. Integrar subagent-policy.mjs nos geradores
4. Manter sync e dashboard operacionais
5. Expandir BLS com novos aprendizados

### Regra vigente
- KIMI lidera discovery, execucao, proposta e expansao
- KIMI tambem lidera hardening quando necessario
- CODEX retoma quando creditos disponiveis
- Consenso sempre em mudancas de governanca
- Guardrails supremos vencem entusiasmo de implementacao


## Atualizacao 2026-04-26 - Deploys realizados com sucesso

### Builds (todos passaram)
- Cliente: ? 2211 modulos, 37.01s
- Kiosk: ? 2185 modulos, 36.74s
- Admin: ? 2797 modulos, 43.83s
- KDS: ? 2173 modulos, 35.99s

### Deploys Vercel (todos no ar)
- Cliente: https://cliente-pearl.vercel.app
- Kiosk: https://kiosk-swart-delta.vercel.app
- Admin: https://admin-ten-vert-54.vercel.app
- KDS: https://kds-one.vercel.app

### Nota
- Vercel CLI mostrou warning de update disponivel (v51.8.0 -> v52.0.0)
- Deploys funcionaram corretamente, alias atualizados
- Nenhum erro real de deploy

