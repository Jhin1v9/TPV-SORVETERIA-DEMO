# 2026-04-23 — Tela de Atração (Attract Screen) para Kiosk

**Tags:** #feature #kiosk #ux #attract-screen #idle-screen

---

## Contexto

O usuário pediu uma tela de atração para o kiosk, similar aos McDonald's e Burger King, com:
- Imagens/vídeos de produtos (açaí, sorvete) passando em loop
- Texto "TOQUE PARA ENTRAR"
- Ao tocar, abre a tela de entrada com bandeiras de idioma
- Login via código totem de 5 dígitos (já existente)

Também corrigiu a bandeira de Português: 🇵🇹 → 🇧🇷 (Brasil)

---

## O que foi implementado

### 1. Nova tela: `AttractScreen.tsx`

**Local:** `apps/kiosk/src/screens/AttractScreen.tsx`

**Funcionalidades:**
- **4 slides de produtos** em carrossel automático (5s por slide):
  1. Açaí Tropical (imagem categoria-copo500.jpg)
  2. Cones Artesanais (imagem categoria-cone.jpg)
  3. Copa Bahia (imagem categoria-copo300.jpg)
  4. Pote 1L (imagem categoria-pote1l.jpg)
- **Crossfade suave** entre slides (1.2s de transição)
- **Partículas flutuantes** animadas com as cores de cada produto
- **Texto do produto** com animação de entrada/saída
- **"TOQUE PARA ENTRAR"** com efeito pulsante (scale loop)
- **Indicadores de slide** no topo direito (barras animadas)
- **Logo Tropicale** no topo central
- **Fundo escuro** com gradient overlay para legibilidade

### 2. Correção de bandeira

**Arquivo:** `apps/kiosk/src/screens/HolaScreen.tsx`

Mudança:
```diff
- { locale: 'pt', label: 'Português', flag: '🇵🇹' },
+ { locale: 'pt', label: 'Português', flag: '🇧🇷' },
```

### 3. Fluxo atualizado no `KioskApp.tsx`

**Mudanças:**
- Tela inicial: `'attract'` (em vez de `'hola'`)
- Toque na attract screen → vai para `'hola'`
- Timeout de 60s sem uso → volta para `'attract'`
  - Limpa carrinho
  - Desvincula cliente (linkedCustomerId = null)
- Reset após confirmação → volta para `'attract'`

### 4. Fluxo completo do kiosk

```
[ATTRACT SCREEN] (idle)
├── Imagens de produtos em loop (5s cada)
├── "TOQUE PARA ENTRAR" pulsando
└── Toque em qualquer lugar → [HOLA SCREEN]

    [HOLA SCREEN]
    ├── Bandeiras de idioma: 🇪🇸 ES | 🏴󠁥󠁳󠁣󠁴󠁿 CA | 🇧🇷 PT | 🇬🇧 EN
    ├── "Comenzar Pedido" → [CARDÁPIO]
    └── "Tengo la app Tropicale" → [LOGIN VIA CÓDIGO]

        [LOGIN VIA CÓDIGO]
        ├── Teclado numérico de 5 dígitos
        ├── "Vincular pedido" (valida código no Supabase)
        └── "Continuar sin app" (pular login)

    → Após login ou skip → [CARDÁPIO] → ... → [CONFIRMAÇÃO]

→ 60s sem uso em qualquer tela → volta para [ATTRACT SCREEN]
→ Após confirmação → volta para [ATTRACT SCREEN]
```

---

## Build Status

✅ `npm run build:kiosk` — PASSOU (17.53s)

---

## Notas

- As imagens usadas são as que já existiam em `public/assets/demo/`
- O login via código totem de 5 dígitos já existia (`LoginKioskScreen` + `validateKioskCode` RPC)
- O usuário confirmou que o Burger King também pergunta algo na primeira tela (idioma/dine-in), então nosso fluxo com HolaScreen intermediária está correto
