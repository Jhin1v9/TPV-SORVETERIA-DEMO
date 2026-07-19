#!/usr/bin/env node
/**
 * Start all 4 Vite dev servers at once.
 * Usage: npm run dev:all
 *
 * Ports are fixed in each app's vite.config.ts:
 *   cliente -> 5101, kiosk -> 5102, kds -> 5103, admin -> 5104
 */

import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const apps = ['cliente', 'kiosk', 'kds', 'admin'];

const children = apps.map((app) => {
  const child = spawn('npx', ['vite', '--config', `apps/${app}/vite.config.ts`], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  child.on('exit', (code) => {
    console.log(`[dev:all] ${app} exited with code ${code}`);
  });
  return child;
});

function shutdown() {
  for (const child of children) {
    child.kill();
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
