# 2026-04-23 — Kiosk: Language Swiper + Scrollbars Customizadas + Imagens HD

**Tags:** #feature #kiosk #ux #swiper #scrollbars #i18n #español

---

## Requisitos do Usuário

1. **Idioma MAIN = ESPANHOL sempre** — ES é o idioma padrão em todo o projeto
2. **Swiper de idiomas** na HolaScreen — bandeira grande, "Hola" traduzido, swipe lateral
3. **Imagens ALTA RESOLUÇÃO** na AttractScreen — URLs do Unsplash
4. **Scrollbars customizadas** — PWA + Kiosk, estilo Apple/Notion
5. **SEGUIR O .BRAIN sempre** — regra absoluta

---

## O que foi implementado

### 1. Idioma Padrão: ESPANHOL (es)

**Verificação:**
- `packages/shared/src/stores/useStore.ts:82` → `locale: 'es'` ✅
- `apps/kiosk/src/screens/HolaScreen.tsx` → `currentIndex: 0` (Español) ✅
- `apps/kiosk/src/screens/HolaScreen.tsx` → `languages[0].locale === 'es'` ✅

**Não encontrado nenhum outro lugar** onde o locale padrão seja diferente de 'es'.

### 2. LanguageSwiper na HolaScreen

**Arquivo:** `apps/kiosk/src/screens/HolaScreen.tsx`

**Funcionalidades:**
- **Swipe/drag horizontal** com Framer Motion
- **Bandeira grande** (8rem/128px) com animação flutuante
- **"Hola" traduzido** para cada idioma:
  - 🇪🇸 ES → "¡Hola!" → "Comenzar pedido"
  - 🏴󠁥󠁳󠁣󠁴󠁿 CA → "Hola!" → "Començar comanda"
  - 🇧🇷 PT → "Olá!" → "Fazer pedido"
  - 🇬🇧 EN → "Hello!" → "Start order"
- **Setas laterais** ‹ › para navegação
- **Dots animados** de paginação
- **Botão CTA traduzido** muda conforme idioma selecionado
- **Botão "Tengo la app"** também traduzido

### 3. AttractScreen com Imagens HD (Unsplash)

**Arquivo:** `apps/kiosk/src/screens/AttractScreen.tsx`

**Imagens de alta resolução (1920px wide):**
| Slide | Produto | URL Unsplash |
|-------|---------|-------------|
| 1 | Açaí Tropical | `images.unsplash.com/photo-1627308594190-a057cd4bfac8` |
| 2 | Cones Artesanais | `images.unsplash.com/photo-1497034825429-c343d7c6a68f` |
| 3 | Copa Bahia | `images.unsplash.com/photo-1590288488147-f46142daf112` |
| 4 | Gelato Artesanal | `images.unsplash.com/photo-1562790879-dfde82829db0` |

Todas as imagens são do **Unsplash** (gratuitas para uso comercial, sem atribuição).

### 4. Scrollbars Customizadas (PWA + Kiosk)

**Arquivo:** `packages/shared/src/index.css`

**Implementação:**
- **WebKit/Blink** (Chrome, Edge, Safari): `::-webkit-scrollbar` fina (6px), thumb arredondado, cor branca 15% opacidade
- **Firefox**: `scrollbar-color` + `scrollbar-width: thin`
- **Hover**: thumb fica mais claro (30% opacidade)
- **Touch devices**: scrollbar reduzida para 2px
- **Estilo**: combina com tema escuro (#0a0a0f)

---

## Build Status

| App | Status |
|-----|--------|
| Cliente PWA | ✅ Passou |
| Kiosk | ✅ Passou |

---

## Decisões

- **Não usamos swiper.js** — Framer Motion já está no projeto e faz o mesmo com menos bundle
- **Imagens externas (Unsplash)** — São gratuitas, alta resolução, e carregam lazy. Em produção, substituir por imagens próprias.
- **ES como idioma padrão** — Confirmado em todo o projeto. O kiosk sempre começa em ES.
