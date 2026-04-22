# Deploy Guide

## Status

All 4 apps are now deployed and working:

| App | URL |
|-----|-----|
| Cliente | https://cliente-pearl.vercel.app |
| Kiosk | https://kiosk-swart-delta.vercel.app |
| Admin | https://admin-ten-vert-54.vercel.app |
| KDS | https://kds-one.vercel.app |

---

## Problem Fixed

Vercel deployments were failing because:
1. `apps/cliente/package.json` had `"@tpv/shared": "workspace:*"` — npm doesn't support this protocol
2. Other apps (kiosk/admin/kds) had no `package.json`, and `vercel.json` tried `cd ../.. && npm install` which couldn't access the root `package-lock.json`
3. Vercel only uploads files within the project's Root Directory (e.g., `apps/cliente/`)

**Solution**: Build locally + deploy the `dist/` folder directly. This bypasses all npm/workspace issues on Vercel's cloud builders.

---

## Manual Deploy (from your machine)

### Deploy all apps at once
```bash
npm run deploy:all
```

### Deploy a single app
```bash
npm run deploy:cliente
npm run deploy:kiosk
npm run deploy:admin
npm run deploy:kds
```

### Or manually step by step
```bash
# Build
npm run build:cliente

# Deploy
node scripts/deploy-app.mjs cliente --prod
```

---

## Automatic Deploy via GitHub Actions

A GitHub Actions workflow is configured in `.github/workflows/deploy.yml`. It automatically builds and deploys all apps on every push to `main`.

### Setup Required

1. Get your Vercel token:
   ```bash
   npx vercel login
   npx vercel tokens create
   # Or go to https://vercel.com/account/tokens
   ```

2. Add the token to GitHub Secrets:
   - Go to your repo on GitHub → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `VERCEL_TOKEN`
   - Value: your token

3. (Optional) Disable Vercel's Git Integration auto-deploy for each project:
   - Go to each project on Vercel (cliente, kiosk, admin, kds)
   - Settings → Git → Uncheck "Auto deploy on push"
   - This prevents Vercel from trying (and failing) to build on its own

---

## Architecture

```
Monorepo Root
├── apps/
│   ├── cliente/      (no package.json — uses root deps)
│   ├── kiosk/        (no package.json)
│   ├── admin/        (no package.json)
│   └── kds/          (no package.json)
├── packages/shared/  (resolved via Vite aliases)
├── dist/
│   ├── cliente/      ← deployed to Vercel
│   ├── kiosk/        ← deployed to Vercel
│   ├── admin/        ← deployed to Vercel
│   └── kds/          ← deployed to Vercel
└── package.json      (all deps here)
```

All apps share the root `node_modules`. Vite aliases resolve `@tpv/shared` to `packages/shared/src`.

---

## Troubleshooting

### "Missing .vercel/project.json"
Run `vercel link` inside each app directory:
```bash
cd apps/cliente && npx vercel link
cd apps/kiosk && npx vercel link
cd apps/admin && npx vercel link
cd apps/kds && npx vercel link
```

### "Build fails locally"
All builds are tested and working. Make sure you have Node 20+ and run `npm install` from the root.
