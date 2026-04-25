import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const PRINCIPAL_BRAIN = 'C:\\Users\\Administrator\\Documents\\.brain';
const DEFAULT_PROJECT = 'tpv-sorveteria-demo';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const [key, inlineValue] = token.slice(2).split('=');
    const next = argv[i + 1];
    const value = inlineValue ?? (next && !next.startsWith('--') ? next : true);
    args[key] = value;
    if (inlineValue == null && value !== true) i += 1;
  }
  return args;
}

function runGit(args, cwd) {
  return spawnSync('git', args, { cwd, encoding: 'utf8', stdio: 'pipe' });
}

async function readJson(target, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(target, 'utf8'));
  } catch {
    return fallback;
  }
}

async function ensureDir(target) {
  await fs.mkdir(target, { recursive: true });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const project = String(args.project ?? DEFAULT_PROJECT);
  const snapshotId = String(args.snapshot ?? '').trim();
  const reason = String(args.reason ?? 'logical rollback').trim();
  if (!snapshotId) {
    throw new Error('Missing --snapshot <snapshot-id>');
  }

  const projectRoot = path.join(PRINCIPAL_BRAIN, 'projects', project);
  const snapshotsRoot = path.join(projectRoot, 'snapshots');
  const snapshotRoot = path.join(snapshotsRoot, snapshotId);
  const manifest = await readJson(path.join(snapshotRoot, 'MANIFEST.json'));
  if (!manifest) {
    throw new Error(`Snapshot not found: ${snapshotId}`);
  }

  const targetBrain = path.join(projectRoot, 'project-brain');
  const targetOrchestrator = path.join(projectRoot, 'project-brain-orchestrator');
  const rollbackJsonPath = path.join(projectRoot, 'ROLLBACK.json');
  const projectJsonPath = path.join(projectRoot, 'PROJECT.json');
  await fs.rm(targetBrain, { recursive: true, force: true });
  await fs.rm(targetOrchestrator, { recursive: true, force: true });
  await fs.cp(path.join(snapshotRoot, 'project-brain'), targetBrain, { recursive: true, force: true });
  await fs.cp(path.join(snapshotRoot, 'project-brain-orchestrator'), targetOrchestrator, { recursive: true, force: true });

  const rollbackLog = path.join(projectRoot, 'ROLLBACK_LOG.md');
  const lines = [
    `## ${new Date().toISOString()} - rollback ${project}`,
    `- snapshot: ${snapshotId}`,
    `- reason: ${reason}`,
    '- author: CODEX',
    ''
  ].join('\n');
  await ensureDir(projectRoot);
  await fs.appendFile(rollbackLog, lines);

  const rollbackJson = await readJson(rollbackJsonPath, {
    updatedAt: new Date().toISOString(),
    slug: project,
    currentPointer: null,
    restoreStrategy: 'mirror-restore-from-snapshot',
    restorePoints: []
  });
  rollbackJson.updatedAt = new Date().toISOString();
  rollbackJson.currentPointer = snapshotId;
  await fs.writeFile(rollbackJsonPath, `${JSON.stringify(rollbackJson, null, 2)}\n`);

  const projectJson = await readJson(projectJsonPath, {});
  projectJson.lastRollbackPointAt = new Date().toISOString();
  projectJson.updatedAt = new Date().toISOString();
  await fs.writeFile(projectJsonPath, `${JSON.stringify(projectJson, null, 2)}\n`);

  runGit(['add', '.'], PRINCIPAL_BRAIN);
  const commitMessage = `brain rollback: ${project} -> ${snapshotId}`;
  const commit = runGit(['commit', '-m', commitMessage], PRINCIPAL_BRAIN);
  const remote = runGit(['remote', '-v'], PRINCIPAL_BRAIN);
  let pushState = 'skipped:no-remote';
  if (remote.status === 0 && remote.stdout.trim()) {
    const branch = runGit(['branch', '--show-current'], PRINCIPAL_BRAIN).stdout.trim() || 'main';
    const push = runGit(['push', '-u', 'origin', branch], PRINCIPAL_BRAIN);
    pushState = push.status === 0 ? 'ok' : `failed:${(push.stderr || push.stdout).trim()}`;
  }

  process.stdout.write(`${JSON.stringify({
    project,
    snapshotId,
    reason,
    committed: commit.status === 0,
    commitMessage,
    pushState
  }, null, 2)}\n`);
}

main().catch((error) => {
  console.error('[principal-brain-rollback] failed:', error);
  process.exitCode = 1;
});
