# 🔬 ANÁLISE ARQUITETURAL — Demo → Produção
> TPV Sorveteria Sabadell Nord | Análise Completa | 2026-04-21

---

## 📊 RESUMO EXECUTIVO

| Aspecto | Nota | Status |
|---|---|---|
| **Arquitetura** | ⭐⭐⭐⭐⭐ | Monorepo bem estruturado, 4 apps independentes |
| **Separação Mock/Real** | ⭐⭐⭐⭐⭐ | Adapter pattern impecável, troca é só trocar o modo |
| **UX/UI** | ⭐⭐⭐⭐⭐ | Onboarding, animações, responsividade, i18n 100% |
| **Segurança** | ⭐⭐ | Tudo client-side, sem autenticação real |
| **Performance** | ⭐⭐⭐ | Chunks grandes (>500KB), sem code-splitting |
| **Testes** | ⭐⭐⭐⭐ | 27 E2E Playwright passando, mas só caminho feliz |
| **Infraestrutura** | ⭐⭐⭐ | Vercel OK, mas sem CI/CD, sem PWA ativo |
| **Prontidão Produção** | **65%** | Arquitetura pronta, faltam camadas de segurança e infra |

---

## 🏗️ 1. ARQUITETURA — O QUE ESTÁ EXCELENTE

### 1.1 Monorepo Bem Estruturado
```
├── apps/cliente/      → PWA para clientes (celular)
├── apps/kiosk/        → Touchscreen na mesa (Elo Wallaby)
├── apps/admin/        → Dashboard gestão
├── apps/kds/          → Kitchen Display System
├── packages/shared/   → Tipos, stores, componentes, i18n, realtime
├── server/            → Demo server Node.js (SSE realtime)
└── supabase/          → Schema SQL completo + RPCs
```
**Cada app tem build independente** — Vite config separada, deploy separado.

### 1.2 Adapter Pattern: Demo ↔ Produção
A transição entre mock e real é **brilhante**:

```typescript
// packages/shared/src/realtime/client.ts
let runtimeMode: 'supabase' | 'standalone' = hasSupabaseConfig ? 'supabase' : 'standalone';

// Todas as operações verificam o modo:
export async function createRemoteOrder(payload) {
  if (getRuntimeMode() === 'standalone' || !supabase) {
    return buildStandaloneOrder(getStandaloneSnapshot(), payload);  // DEMO
  }
  const result = await supabase.rpc('create_demo_order', ...);      // REAL
}
```

**Para ir para produção:**
1. Adicionar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env`
2. O app detecta automaticamente e muda para modo Supabase
3. Sem mudar UMA LINHA de código nos componentes

### 1.3 Schema SQL de Produção Já Existe
`supabase/schema.sql` tem:
- Tabelas: `categories`, `flavors`, `toppings`, `orders`, `order_items`, `store_settings`
- RPCs: `create_demo_order`, `update_order_status`, `adjust_flavor_stock`, `reset_demo_data`
- Row Level Security (RLS) habilitado
- Realtime publication configurada
- Funções de serialização JSONB

**Isso é produção-ready.**

### 1.4 i18n Completo (4 idiomas)
- `es` (principal), `ca`, `pt`, `en`
- Todas as strings centralizadas
- Fallback inteligente: `ca → pt → en → key`

### 1.5 Zustand + Persistência Seletiva
```typescript
persist(
  (set, get) => ({...}),
  {
    name: 'tpv-sorveteria-storage',
    partialize: (state) => ({
      locale: state.locale,
      perfilUsuario: state.perfilUsuario,
      // NOTA: isAdminLogged NÃO é persistido (segurança)
    }),
  }
)
```

---

## 🎨 2. CLIENTE PWA — ANÁLISE DETALHADA

### 2.1 O que está PRONTO para produção
| Feature | Status | Detalhes |
|---|---|---|
| Onboarding 5 passos | ✅ | Welcome → Registro → Consumo → Alergia → Tutorial |
| Retornante detection | ✅ | Detecta perfil no localStorage, oferece continuar |
| Cartão de produtos | ✅ | Grid responsivo, filtros por categoria, search |
| Alerta de alérgenos | ✅ | Badge amarelo se conflita com perfil do usuário |
| Carrinho drawer | ✅ | Slide-in, cálculo de totais com IVA 10% |
| Pagamento modal | ✅ | Tarjeta, Bizum, Efectivo com validação |
| Confirmação pedido | ✅ | Número sequencial, redirecionamento para pedidos |
| Tabs de navegação | ✅ | Cardápio, Carrinho, Pedidos, Config |
| Responsividade | ✅ | Mobile-first, grid adaptativo |

### 2.2 O que precisa de EVOLUÇÃO para produção
| Feature | Prioridade | Esforço | Descrição |
|---|---|---|---|
| **Personalização de produtos** | 🔴 Alta | 3-4 dias | Hoje: "adicionar" adiciona produto fixo. Precisa: tela de escolha de tamanho, sabor, toppings para produtos personalizáveis (Açaí, Gofre, Helado à carta) |
| **Tela de acompanhamento do pedido** | 🔴 Alta | 2 dias | Hoje: lista genérica de TODOS os pedidos. Precisa: tela dedicada "Meu Pedido #42" com status em tempo real, contagem regressiva, notificação quando ficar pronto |
| **Notificações Push** | 🟡 Média | 2-3 dias | Service Worker está instalado mas PWA não configurado. Precisa: `vite-plugin-pwa` ativo, push subscription, servidor de push |
| **PWA Install** | 🟡 Média | 1 dia | `vite-plugin-pwa` instalado mas NÃO configurado no vite.config.ts. Precisa: manifest, service worker, ícones, offline fallback |
| **Vibration + som** | 🟢 Baixa | 0.5 dia | API já existe no KDS (`navigator.vibrate`, Web Audio). Só copiar para Cliente |
| **Offline mode** | 🟡 Média | 2 dias | Hoje: sem cache de assets. Precisa: Workbox precaching, cache de cardápio, queue de pedidos offline |
| **Histórico de pedidos do USUÁRIO** | 🟡 Média | 1 dia | Hoje: mostra TODOS os pedidos do sistema. Precisa: filtrar por `clienteTelefone` ou `perfilUsuario.id` |

---

## 🖥️ 3. KIOSK — ANÁLISE DETALHADA

### 3.1 O que está PRONTO para produção
| Feature | Status | Detalhes |
|---|---|---|
| Fluxo completo | ✅ | Hola → Categorias → Sabores → Toppings → Carrinho → Pagamento → Confirmação |
| Inactividade timeout | ✅ | 60s sem interação → volta para tela Hola |
| Responsividade 19-21" | ✅ | Tipografia grande, botões touch-friendly |
| Integração realtime | ✅ | Usa `createRemoteOrder` (mesma função do Cliente) |

### 3.2 O que precisa de EVOLUÇÃO
| Feature | Prioridade | Esforço | Descrição |
|---|---|---|---|
| **Suporte ao novo cardápio** | 🔴 Alta | 2-3 dias | Hoje: modelo antigo `Categoria → Sabor → Topping`. Precisa: suportar `ProdutoFixo` (adicionar direto) e `ProdutoPersonalizavel` (abrir tela de opções) como no Cliente |
| **Integração com POS físico** | 🟡 Média | 3-5 dias | Hoje: pagamento simulado. Produção: integrar com TPV físico (RedSys, Stripe Terminal, SumUp) |
| **Impressão de ticket** | 🟡 Média | 2 dias | Hoje: QR code na confirmação. Produção: integrar com impressora térmica via USB/Bluetooth |

---

## 📊 4. ADMIN — ANÁLISE DETALHADA

### 4.1 O que está PRONTO
| Feature | Status | Detalhes |
|---|---|---|
| Login básico | ✅ | Email/senha mock (admin@sorveteria.com / 123456) |
| Dashboard analytics | ✅ | Gráficos Recharts (vendas, top sabores, métodos pagamento, heatmap horas) |
| Gestão de estoque | ✅ | Ajuste de stock, disponibilidade de sabores |
| Lista de pedidos | ✅ | Todos os pedidos com filtros |
| Configurações | ✅ | Dados do estabelecimento |

### 4.2 O que precisa de EVOLUÇÃO
| Feature | Prioridade | Esforço | Descrição |
|---|---|---|---|
| **Autenticação real** | 🔴 Alta | 2 dias | Hoje: senha hardcoded no frontend (`password === '123456'`). **ISSO É INACEITÁVEL EM PRODUÇÃO.** Precisa: Supabase Auth, JWT, roles (admin, caixa, cozinha) |
| **Persistência de login** | 🔴 Alta | 0.5 dia | Hoje: `isAdminLogged` NÃO persiste (segurança correta), mas não há token JWT. Precisa: session com refresh token |
| **CRUD de cardápio** | 🟡 Média | 3-4 dias | Hoje: cardápio é código (`produtosLocal.ts`). Precisa: tela para adicionar/editar/remover produtos, upload de fotos |
| **CRUD de funcionários** | 🟡 Média | 2 dias | Hoje: lista mock. Precisa: tela de gestão com permissões |
| **Relatórios exportáveis** | 🟡 Média | 2 dias | Exportar vendas para Excel/PDF |
| **Fechamento de caixa** | 🟡 Média | 2 dias | Contagem de dinheiro no final do dia, diferenças |

---

## 👨‍🍳 5. KDS — ANÁLISE DETALHADA

### 5.1 O que está PRONTO
| Feature | Status | Detalhes |
|---|---|---|
| Fila de pedidos em tempo real | ✅ | Via Supabase Realtime ou SSE |
| Timer de preparação | ✅ | Contador regressivo por pedido, alerta se >5min |
| Mudança de status | ✅ | Pendiente → Preparando → Listo → Entregado |
| Som de notificação | ✅ | Web Audio API beep quando novo pedido chega |
| Filtro por origem | ✅ | TPV vs PWA |

### 5.2 O que precisa de EVOLUÇÃO
| Feature | Prioridade | Esforço | Descrição |
|---|---|---|---|
| **Múltiplas estações** | 🟡 Média | 2 dias | Hoje: 1 KDS mostra tudo. Produção: KDS de preparação, KDS de embalagem, KDS de entrega |
| **Tempos médios por categoria** | 🟢 Baixa | 1 dia | Mostrar tempo estimado baseado no histórico |
| **Priorização automática** | 🟢 Baixa | 1 dia | Pedidos PWA com "Para llevar" prioridade |

---

## 🔐 6. SEGURANÇA — GAPS CRÍTICOS

### 6.1 Problemas CRÍTICOS (bloqueantes para produção)
1. **Senha de admin hardcoded no frontend** (`LoginScreen.tsx: password === '123456'`)
   - Qualquer um abre o DevTools e vê a senha
   - **Solução:** Supabase Auth com email/password, roles no JWT

2. **Autenticação de cliente é mock** (`authMock.ts`)
   - Usuários em localStorage, sem criptografia
   - Qualquer um pode modificar o perfil no DevTools
   - **Solução:** Supabase Auth OTP por telefone + tabela `profiles`

3. **Row Level Security (RLS) permite tudo**
   - `create policy ... for select to anon, authenticated using (true)`
   - Qualquer um pode ler TODOS os pedidos, estoques, configurações
   - **Solução:** Políticas RLS por user_id, restrigir INSERT/UPDATE/DELETE

4. **RPCs sem autenticação**
   - `create_demo_order`, `update_order_status` etc são `security definer` e acessíveis por `anon`
   - Qualquer um pode criar pedidos, alterar status, resetar dados
   - **Solução:** Verificar `auth.uid()` nas RPCs, ou usar Row Level Security nas tabelas

### 6.2 Problemas MÉDIOS
5. **Sem rate limiting** — alguém pode floodar pedidos
6. **Sem validação de telefone** — regex básica, não verifica se é real
7. **Dados sensíveis no localStorage** — perfil do usuário, alergias (dados de saúde!)
   - localStorage é acessível por qualquer script na página
   - **Solução:** IndexedDB com criptografia, ou não persistir dados de saúde localmente

---

## ⚡ 7. PERFORMANCE — OPORTUNIDADES

### 7.1 Chunks grandes (>500KB)
```
cliente: 715 KB (gzip: 207 KB)
kiosk:   618 KB (gzip: 184 KB)
admin:  1012 KB (gzip: 290 KB) ← 1MB!
kds:     566 KB (gzip: 170 KB)
```

**Solução:** Code-splitting por rota + `manualChunks` no Vite
```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom'],
        'vendor-ui': ['framer-motion', 'lucide-react', 'sonner'],
        'vendor-charts': ['recharts'],
        'vendor-supabase': ['@supabase/supabase-js'],
      }
    }
  }
}
```
**Impacto:** Reduzir chunk principal em ~40-50%.

### 7.2 Imagens
- Todas as imagens do cardápio usam URLs do Unsplash (externas)
- Sem lazy loading nativo (componente `OptimizedImage` existe mas usa `loading="lazy"` básico)
- **Solução:** CDN próprio (Cloudflare Images, Cloudinary), geração de srcset

### 7.3 PWA não configurado
- `vite-plugin-pwa` instalado mas NÃO usado
- Sem manifest.json, sem service worker, sem cache
- **Solução:** Configurar plugin PWA com workbox precaching

---

## 🧪 8. TESTES — ESTADO ATUAL

### 8.1 Cobertura Atual
| Suite | Testes | Status | Cobertura |
|---|---|---|---|
| Onboarding E2E | 13 | ✅ Passando | Caminho feliz completo |
| Pagamento E2E | 6 | ✅ Passando | 3 métodos + validação + fechar |
| Tutorial E2E | 6 | ✅ Passando | 6 passos, navegação, confetti |
| Fluxo Completo | 2 | ✅ Passando | Pedido + persistência |
| **Total E2E** | **27** | **✅ 100%** | — |
| Unit (Vitest) | ~5 | ✅ Passando | Cálculos, i18n, store |

### 8.2 O que falta testar
- **Caminhos de erro:** Sem internet, Supabase offline, campos inválidos
- **SegurançA:** Tentativa de acesso admin sem login, SQL injection, XSS
- **Performance:** Lighthouse CI, bundle size tracking
- **Acessibilidade:** Screen readers, keyboard navigation, WCAG
- **Cross-browser:** Safari iOS, Chrome Android, Firefox

---

## 🗺️ 9. ROADMAP: DEMO → PRODUÇÃO

### FASE 1: SEGURANÇA (Semana 1) — 🔴 Bloqueante
| Tarefa | Esforço | Owner |
|---|---|---|
| Configurar Supabase Auth (email/phone OTP) | 2 dias | Backend |
| Trocar `authMock.ts` por Supabase Auth | 1 dia | Frontend |
| Implementar roles (admin, caixa, cozinha) | 1 dia | Backend |
| Trocar login admin hardcoded por Supabase Auth | 0.5 dia | Frontend |
| Atualizar RLS policies no schema SQL | 1 dia | Backend |
| Auditar RPCs (adicionar `auth.uid()` checks) | 1 dia | Backend |

### FASE 2: INFRAESTRUTURA PWA (Semana 2) — 🟡 Importante
| Tarefa | Esforço | Owner |
|---|---|---|
| Configurar `vite-plugin-pwa` nos 4 apps | 1 dia | DevOps |
| Criar manifest.json por app | 0.5 dia | Frontend |
| Implementar Service Worker com cache | 1 dia | Frontend |
| Push notifications (OneSignal ou Firebase) | 2 dias | Backend |
| Code-splitting (manualChunks) | 1 dia | Frontend |

### FASE 3: FUNCIONALIDADES CLIENTE (Semana 3)
| Tarefa | Esforço | Owner |
|---|---|---|
| Tela de personalização de produtos | 3 dias | Frontend |
| Tela "Meu Pedido" com realtime | 2 dias | Frontend |
| Offline mode (queue de pedidos) | 2 dias | Frontend |
| Vibration + som quando pedido pronto | 0.5 dia | Frontend |
| Histórico de pedidos filtrado por usuário | 1 dia | Frontend |

### FASE 4: ADMIN + KIOSK (Semana 4)
| Tarefa | Esforço | Owner |
|---|---|---|
| CRUD de cardápio no Admin | 3 dias | Frontend |
| Upload de fotos (Supabase Storage) | 1 dia | Backend |
| Kiosk: suporte a ProdutoFixo/ProdutoPersonalizavel | 2 dias | Frontend |
| Integração com impressora térmica | 2 dias | Hardware |
| Relatórios exportáveis (Excel/PDF) | 2 dias | Frontend |

### FASE 5: PRODUÇÃO (Semana 5)
| Tarefa | Esforço | Owner |
|---|---|---|
| CI/CD GitHub Actions (build + test + deploy) | 2 dias | DevOps |
| Monitoramento (Sentry + LogRocket) | 1 dia | DevOps |
| Backup automático Supabase | 0.5 dia | DevOps |
| Documentação de deploy | 1 dia | DevOps |
| Testes de carga (k6) | 1 dia | QA |

---

## 💰 10. ESTIMATIVA DE INVESTIMENTO

### Custos de Infraestrutura (mensal)
| Serviço | Custo estimado | Para quê |
|---|---|---|
| Supabase Pro | €25/mês | Postgres, Auth, Realtime, Storage |
| Vercel Pro | €20/mês | 4 projetos, analytics, preview deploys |
| Cloudflare Images / Cloudinary | €10/mês | CDN de imagens, otimização |
| OneSignal / Firebase FCM | Gratuito | Push notifications |
| Sentry | €26/mês | Error tracking |
| **Total** | **~€81/mês** | — |

### Custos de Desenvolvimento (one-time)
| Fase | Dias | Custo (dev senior €400/dia) |
|---|---|---|
| Segurança | 6.5 | €2,600 |
| Infra PWA | 5.5 | €2,200 |
| Funcionalidades Cliente | 8.5 | €3,400 |
| Admin + Kiosk | 10 | €4,000 |
| Produção | 5.5 | €2,200 |
| **Total** | **~36 dias** | **~€14,400** |

---

## 🎯 CONCLUSÃO

**O projeto está arquiteturalmente MUITO bem feito.** A separação entre demo e produção é limpa, o adapter pattern é elegante, e a UX está polida.

**Os 3 gaps críticos para produção são:**
1. **Segurança** — Autenticação real, RLS, proteção de dados de saúde
2. **PWA** — Service worker, offline, push notifications
3. **Personalização** — O cardápio real da sorveteria (Copas, Açaí, Gofres) precisa de tela de customização

**Tempo estimado para produção: 5-6 semanas** com 1 desenvolvedor full-stack senior.
