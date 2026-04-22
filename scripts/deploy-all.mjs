#!/usr/bin/env node
/**
 * Deploy all apps to Vercel
 * Strategy: build locally, then deploy dist/ folders directly
 * This avoids workspace:* protocol issues on Vercel
 */

import { execSync } from 'child_process';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const apps = [
  { name: 'cliente', project: 'cliente' },
  { name: 'kiosk', project: 'kiosk' },
  { name: 'admin', project: 'admin' },
  { name: 'kds', project: 'kds' },
];

function run(cmd, cwd = root) {
  console.log(`\n> ${cmd}`);
  return execSync(cmd, { cwd, stdio: 'inherit' });
}

async function deploy() {
  const target = process.argv.includes('--prod') ? '--prod' : '';

  for (const app of apps) {
    console.log(`\n========================================`);
    console.log(`  Deploying ${app.name.toUpperCase()}`);
    console.log(`========================================`);

    // 1. Build
    console.log(`\n[1/3] Building ${app.name}...`);
    run(`npm run build:${app.name}`);

    // 2. Copy .vercel/project.json into dist
    console.log(`\n[2/3] Preparing dist/${app.name} for deploy...`);
    const vercelDir = join(root, 'dist', app.name, '.vercel');
    const projectJsonSrc = join(root, 'apps', app.name, '.vercel', 'project.json');
    const projectJsonDst = join(vercelDir, 'project.json');

    if (!existsSync(projectJsonSrc)) {
      console.error(`Missing ${projectJsonSrc}. Skipping ${app.name}.`);
      continue;
    }

    mkdirSync(vercelDir, { recursive: true });
    copyFileSync(projectJsonSrc, projectJsonDst);

    // 3. Deploy
    console.log(`\n[3/3] Deploying ${app.name} to Vercel...`);
    run(`npx vercel ${target} --yes`, join(root, 'dist', app.name));
  }

  console.log(`\n========================================`);
  console.log('  ALL APPS DEPLOYED!');
  console.log('========================================');
}

deploy().catch((err) => {
  console.error(err);
  process.exit(1);
});
