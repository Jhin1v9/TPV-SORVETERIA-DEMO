import path from 'node:path';
import { spawn } from 'node:child_process';
import fs from 'node:fs';

const ROOT = process.cwd();
const WATCH_TARGETS = [
  'C:\\\\Users\\\\Administrator\\\\Documents\\\\.brain',
  null // removido
];

let timer = null;
let running = false;
let queued = false;

function runSync() {
  if (running) {
    queued = true;
    return;
  }
  running = true;
  const child = spawn('node', ['scripts/sync-principal-brain.mjs'], {
    cwd: ROOT,
    stdio: 'inherit'
  });
  child.on('exit', () => {
    running = false;
    if (queued) {
      queued = false;
      schedule();
    }
  });
}

function schedule() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    runSync();
  }, 1200);
}

for (const target of WATCH_TARGETS) {
  fs.watch(target, { recursive: true }, () => {
    schedule();
  });
}

console.log('[brain-sync-watch] watching .brain and .brain-orchestrator');
runSync();
