# 🛠️ Stack Técnico

> "A stack é uma ferramenta, não uma identidade. Escolha o que resolve o problema, não o que é hype."

## Overview

```
┌─────────────────────────────────────────────┐
│  Frontend (4 SPAs)                          │
│  ├── Cliente PWA   → React + Vite + Tailwind│
│  ├── Kiosk         → React + Vite + Tailwind│
│  ├── KDS           → React + Vite + Tailwind│
│  └── Admin         → React + Vite + Tailwind│
├─────────────────────────────────────────────┤
│  Shared Package (@tpv/shared)               │
│  ├── Types (TypeScript)                     │
│  ├── Stores (Zustand + persist)             │
│  ├── i18n (custom, 4 idiomas)               │
│  ├── Supabase Client                        │
│  ├── Realtime Sync Manager                  │
│  └── Utilities (pricing, mappers)           │
├─────────────────────────────────────────────┤
│  Backend (Supabase)                         │
│  ├── Postgres 17                            │
│  ├── PostgREST (API REST automática)        │
│  ├── Realtime (WebSocket)                   │
│  ├── Auth (anon key, public RLS)            │
│  └── Edge Functions (não usado ainda)       │
├─────────────────────────────────────────────┤
│  Infra / Deploy                             │
│  ├── Vercel (4 apps separados)              │
│  ├── Git (GitHub)                           │
│  └── Demo Server (Node.js SSE, legado)      │
└─────────────────────────────────────────────┘
```

## Dependências Principais

### Runtime
| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `react` | ^19.0.0 | UI framework |
| `react-dom` | ^19.0.0 | React DOM renderer |
| `zustand` | ^5.0.0 | Estado global |
| `@supabase/supabase-js` | ^2.49.0 | Cliente Supabase |
| `framer-motion` | ^12.0.0 | Animações |
| `lucide-react` | ^0.475.0 | Ícones |
| `sonner` | ^2.0.0 | Toast notifications |
| `html2canvas` | ^1.4.0 | Screenshot para QR/fatura |

### Dev / Build
| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `vite` | ^7.0.0 | Bundler / dev server |
| `typescript` | ^5.7.0 | Type checking |
| `tailwindcss` | ^4.0.0 | CSS utility framework |
| `vitest` | ^3.0.0 | Testes unitários |
| `playwright` | ^1.51.0 | Testes E2E |
| `@vitejs/plugin-react` | ^4.4.0 | Plugin React para Vite |

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Todos os apps em paralelo (5173-5176)
npm run dev:cliente      # Apenas Cliente PWA (5173)
npm run dev:kiosk        # Apenas Kiosk (5174)
npm run dev:admin        # Apenas Admin (5175)
npm run dev:kds          # Apenas KDS (5176)

# Build
npm run build:all        # Build de todos os apps
npm run build:cliente    # Build Cliente → dist/cliente
npm run build:kiosk      # Build Kiosk → dist/kiosk
npm run build:admin      # Build Admin → dist/admin
npm run build:kds        # Build KDS → dist/kds

# Testes
npm test                 # Vitest (unitários)
npm run test:e2e         # Playwright (E2E)

# Deploy
node scripts/deploy-all.mjs    # Deploy todos para Vercel
node scripts/deploy-app.mjs    # Deploy app específico
```

## Configuração de Ambiente

### `.env.local` (desenvolvimento)
```env
VITE_SUPABASE_URL=https://jmvikjujftidgcezmlfc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_oSg8rtPqfJnPCrl_Axw-_g_rRvugcnV
```

### `vercel.json` (produção)
Cada app tem seu `vercel.json` com:
- `buildCommand`: `npm run build:[app]`
- `outputDirectory`: `dist/[app]`
- `env`: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

## Monorepo Structure

```
tpvdemo/
├── apps/
│   ├── cliente/       # PWA para clientes
│   ├── kiosk/         # Self-service kiosk
│   ├── kds/           # Kitchen Display System
│   └── admin/         # Painel administrativo
├── packages/
│   └── shared/        # Código compartilhado
│       ├── src/
│       │   ├── types/         # Typescript types/interfaces
│       │   ├── stores/        # Zustand stores
│       │   ├── i18n/          # Traduções (pt, es, ca, en)
│       │   ├── supabase/      # Cliente + mappers
│       │   ├── realtime/      # RealtimeManager + hook
│       │   └── utils/         # Pricing, helpers
│       └── package.json
├── supabase/
│   ├── schema-expanded.sql    # Schema definitivo (use este!)
│   ├── schema-clean.sql       # Versão limpa
│   ├── schema-no-reset.sql    # Sem DROPs
│   ├── reset-and-schema.sql   # Com DROPs
│   └── migration-*.sql        # Migrations incrementais
├── server/
│   └── demo-server.mjs        # Servidor demo legado (SSE)
├── e2e/
│   └── *.spec.ts              # Testes Playwright
└── scripts/
    ├── deploy-all.mjs
    └── deploy-app.mjs
```

## Path Aliases

```typescript
// tsconfig.json (cada app)
"paths": {
  "@tpv/shared/*": ["../../packages/shared/src/*"]
}

// Uso nos apps
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
```

## Versionamento

- **Git**: commits em português, formato livre
- **Nenhum** versionamento semântico formal (projeto demo)
- **Branch**: `main` única (fluxo simples)

---

*Atualizado em: 2026-04-23*
*Próxima revisão: quando nova dependência for adicionada ou versão atualizada*
