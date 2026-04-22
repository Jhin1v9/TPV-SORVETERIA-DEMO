#!/usr/bin/env node
/**
 * Deploy a single app to Vercel
 * Usage: node scripts/deploy-app.mjs <app-name> [--prod]
 */

import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const appName = process.argv[2];
const isProd = process.argv.includes('--prod');

if (!appName) {
  console.error('Usage: node scripts/deploy-app.mjs <app-name> [--prod]');
  process.exit(1);
}

const validApps = ['cliente', 'kiosk', 'admin', 'kds'];
if (!validApps.includes(appName)) {
  console.error(`Invalid app: ${appName}. Must be one of: ${validApps.join(', ')}`);
  process.exit(1);
}

console.log(`Deploying ${appName}...`);

// Copy .vercel/project.json into dist
const vercelDir = join(root, 'dist', appName, '.vercel');
const projectJsonSrc = join(root, 'apps', appName, '.vercel', 'project.json');
const projectJsonDst = join(vercelDir, 'project.json');

if (!existsSync(projectJsonSrc)) {
  console.error(`Missing ${projectJsonSrc}. Run 'vercel link' in apps/${appName} first.`);
  process.exit(1);
}

mkdirSync(vercelDir, { recursive: true });
copyFileSync(projectJsonSrc, projectJsonDst);

// Deploy
const target = isProd ? '--prod' : '';
const cmd = `npx vercel ${target} --yes`;
console.log(`> ${cmd}`);
execSync(cmd, { cwd: join(root, 'dist', appName), stdio: 'inherit' });
