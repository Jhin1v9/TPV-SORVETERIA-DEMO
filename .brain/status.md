# Status — TPV Sorveteria Demo

## Current focus
Monorepo with 4 synchronized apps for an ice-cream shop: TPV/kiosk, customer PWA, kitchen display (KDS) and admin panel. Client project (MVP complete, not deployed by client's decision); kept as flagship demo.

## What's working
- All 4 apps run in dev: `npm run dev:all` (cliente :5101, kiosk :5102, kds :5103, admin :5104)
- Real-time sync across apps via Supabase Realtime, offline fallback via BroadcastChannel
- Full i18n: ES / CA / PT / EN
- 58-product real catalog with photos
- PWA installable (manifest + service worker)

## What's broken / pending
- Production deployment depends on Supabase credentials (see `.env.example`)
- Per-app Vercel deploy config was fixed 2026-07-19; not yet re-validated with a real deploy
