# 🍦 TPV Sorveteria Sabadell Nord — Versão Final Fusionada

> **Demo conectada em tempo real** para sorveteria artesanal.  
> Kiosk (mesa) + Cliente PWA (celular) + Cocina KDS + Admin Dashboard.  
> Todos sincronizados via Supabase Realtime ou fallback local.

---

## 🚀 Apps

| App | Descrição | Acesso |
|-----|-----------|--------|
| **Kiosk** | Autoatendimento touch na mesa | Seletor → Kiosk |
| **Cliente** | PWA para pedir pelo celular | Seletor → Cliente |
| **Cocina KDS** | Fila de pedidos em tempo real | Seletor → Cocina |
| **Admin** | Gestão, estoque, analytics | Seletor → Admin |

---

## 🌐 Idiomas (i18n 100%)

| Idioma | Código | Status |
|--------|--------|--------|
| **Español** | `es` | Principal |
| Català | `ca` | Completo |
| **Português** | `pt` | **Novo — Completo** |
| English | `en` | Completo |

---

## 📦 Stack

- **React 19** + TypeScript + Vite
- **Tailwind CSS** + Framer Motion
- **Zustand** (estado global com persistência seletiva)
- **Supabase** (Realtime + Postgres + RPCs)
- **PWA** (vite-plugin-pwa, Service Worker, instalável)

---

## 🖼️ Assets Reais

15 fotos reais dos sorvetes artesanais em `public/assets/sabores/`:
- Crema Catalana, Chocolate Negro, Vainilla Madagascar, Menta Fresca, Stracciatella
- Café Espresso, Tiramisú, Coco Tropical, Pistacho, Frutos Rojos
- Mango Alphonso, Limón Siciliano, Turrón Jijona, Yogurt Griego, Amarena

---

## 🗂️ Produtos (58 total)

- **15 sabores artesanais** (com fotos reais)
- **43 produtos adicionais** do cardápio completo:
  - Açaí, Cremas, Picolés (tradicionais, premium, duplos)
  - Conos, Melhorados, Sundaes, Sabores Especiais
  - Yogurt Especial, Barquillos, Donuts

---

## ⚡ Realtime

- **Modo Supabase:** Sincronização via `postgres_changes` em todas as tabelas
- **Modo Standalone:** Fallback com `localStorage` + `BroadcastChannel`
- Pedidos do Kiosk e do PWA Cliente chegam instantaneamente no KDS

---

## 🛠️ Scripts

```bash
npm install
npm run dev      # localhost:3000
npm run build    # dist/ pronto para deploy
```

---

## 🔑 Acesso Admin (Demo)

- Email: `admin@sorveteria.com`
- Senha: `123456`

---

*Projeto fusionado a partir de `TPV-SORVETERIA-DEMO` (GitHub/Supabase) + `Tropicale TPV` (Local/58 produtos).*
