# Decisions

- [2026-04] Monorepo with 4 independent Vite apps sharing code via `packages/shared` — each app deploys on its own (Vercel) but stays in sync through Supabase Realtime.
- [2026-04] Realtime over Supabase with BroadcastChannel fallback, so the ecosystem keeps working locally even without connectivity/credentials.
- [2026-04] Full i18n (ES/CA/PT/EN) from day one — real customers in Catalonia.
- [2026-07-19] Fixed dev ports per app (5101–5104) to make the 4-app local ecosystem reproducible with a single command.
