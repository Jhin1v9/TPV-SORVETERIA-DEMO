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
