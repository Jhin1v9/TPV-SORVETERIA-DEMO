# Bugs

## Open

(none known)

## Resolved

- [2026-07-19] Vercel deploy failed for all 4 apps: `outputDirectory` in `apps/*/vercel.json` was relative to the app folder instead of the repo root (`dist/<app>` → `../../dist/<app>`).
- [2026-07-19] `npm ci` failed on Vercel due to package-lock drift; install command switched to `npm install`.
