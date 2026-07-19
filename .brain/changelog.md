# Changelog

- [2026-07-19] Fixed Vercel deploy paths — each app's `vercel.json` pointed `outputDirectory` at a path relative to the app dir, so Vercel never found the build; now `../../dist/<app>`, and `npm ci` replaced with `npm install` (lock drift broke ci).
- [2026-07-19] Added fixed dev ports per app (cliente 5101, kiosk 5102, kds 5103, admin 5104) in each `vite.config.ts`.
- [2026-07-19] Added `npm run dev:all` (`scripts/dev-all.mjs`) to start all 4 Vite servers at once.
