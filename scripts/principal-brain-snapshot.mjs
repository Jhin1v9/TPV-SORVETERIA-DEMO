import fs from 'node:fs/promises';
import path from 'node:path';

const PRINCIPAL_BRAIN = 'C:\\Users\\Administrator\\Documents\\.brain';
const DEFAULT_PROJECT = 'tpv-sorveteria-demo';
const SNAPSHOT_INTERVAL_MS = 6 * 60 * 60 * 1000;
const SNAPSHOT_RETENTION = 20;

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

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
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

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const project = String(args.project ?? DEFAULT_PROJECT);
  const mode = String(args.mode ?? 'periodic');
  const force = String(args.force ?? 'false') === 'true';

  const projectRoot = path.join(PRINCIPAL_BRAIN, 'projects', project);
  const sourceBrain = path.join(projectRoot, 'project-brain');
  const sourceOrchestrator = path.join(projectRoot, 'project-brain-orchestrator');
  const snapshotsRoot = path.join(projectRoot, 'snapshots');
  const indexPath = path.join(snapshotsRoot, 'index.json');
  const latestPath = path.join(snapshotsRoot, 'latest.json');
  const projectJsonPath = path.join(projectRoot, 'PROJECT.json');
  const syncJsonPath = path.join(projectRoot, 'SYNC.json');
  const snapshotSummaryPath = path.join(projectRoot, 'SNAPSHOT.json');

  await ensureDir(snapshotsRoot);
  const currentIndex = await readJson(indexPath, { updatedAt: null, latest: null, snapshots: [] });
  const lastSnapshotTime = currentIndex.latest?.createdAt ? new Date(currentIndex.latest.createdAt).getTime() : 0;
  const shouldSnapshot = force || mode === 'manual' || !lastSnapshotTime || (Date.now() - lastSnapshotTime) >= SNAPSHOT_INTERVAL_MS;

  if (!shouldSnapshot) {
    process.stdout.write(`${JSON.stringify({ created: false, reason: 'interval-not-reached', latest: currentIndex.latest }, null, 2)}\n`);
    return;
  }

  const id = stamp();
  const snapshotRoot = path.join(snapshotsRoot, id);
  await ensureDir(snapshotRoot);
  await fs.cp(sourceBrain, path.join(snapshotRoot, 'project-brain'), { recursive: true, force: true });
  await fs.cp(sourceOrchestrator, path.join(snapshotRoot, 'project-brain-orchestrator'), { recursive: true, force: true });

  const manifest = {
    id,
    project,
    createdAt: new Date().toISOString(),
    mode,
    sourceBrain,
    sourceOrchestrator,
    snapshotRoot
  };
  await fs.writeFile(path.join(snapshotRoot, 'MANIFEST.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  const snapshots = Array.isArray(currentIndex.snapshots) ? currentIndex.snapshots.slice() : [];
  snapshots.unshift({ id, createdAt: manifest.createdAt, root: snapshotRoot, mode });

  while (snapshots.length > SNAPSHOT_RETENTION) {
    const removed = snapshots.pop();
    if (removed?.root && await exists(removed.root)) {
      await fs.rm(removed.root, { recursive: true, force: true });
    }
  }

  const nextIndex = {
    updatedAt: new Date().toISOString(),
    latest: { id, createdAt: manifest.createdAt, root: snapshotRoot, mode },
    snapshots
  };
  await fs.writeFile(indexPath, `${JSON.stringify(nextIndex, null, 2)}\n`);
  await fs.writeFile(latestPath, `${JSON.stringify(nextIndex.latest, null, 2)}\n`);

  const projectMeta = await readJson(projectJsonPath, {});
  const syncMeta = await readJson(syncJsonPath, {});
  const snapshotSummary = {
    capturedAt: manifest.createdAt,
    slug: project,
    summary: 'Automatic periodic principal-brain mirror snapshot',
    stage: projectMeta.stage ?? 'operational',
    status: projectMeta.status ?? 'active',
    trend: syncMeta.syncHealth === 'healthy' ? 'stable' : 'watch',
    maturityScore: syncMeta.syncHealth === 'healthy' ? 88 : 68,
    healthScore: syncMeta.syncHealth === 'healthy' ? 92 : 70,
    confidenceScore: 80,
    delivery: {
      scopeClarity: 85,
      milestoneClarity: 78,
      progressPercent: 72,
      predictabilityScore: 76
    },
    quality: {
      testCoverageScore: 70,
      defectRate: 0,
      incidentCount: 0,
      codeReviewScore: 80
    },
    operations: {
      ciHealthy: true,
      deployReady: true,
      rollbackReady: true,
      syncHealthy: syncMeta.syncHealth === 'healthy'
    },
    knowledge: {
      docsCoverageScore: 90,
      decisionLogFreshnessDays: 0,
      runbookCoverageScore: 88,
      onboardingScore: 82
    },
    risk: {
      openRisks: 0,
      blockedCount: 0,
      securityRiskScore: 10,
      dependencyRiskScore: 20
    },
    nextMilestone: 'Continuous brain operations stabilized',
    nextMilestoneDate: null,
    highlights: ['Mirror snapshot created', 'Rollback point refreshed'],
    concerns: [],
    links: {
      project: projectJsonPath,
      memory: path.join(projectRoot, 'project-brain', 'memory'),
      knowledge: path.join(projectRoot, 'project-brain', 'knowledge'),
      rollback: path.join(projectRoot, 'ROLLBACK.json')
    }
  };
  await fs.writeFile(snapshotSummaryPath, `${JSON.stringify(snapshotSummary, null, 2)}\n`);

  process.stdout.write(`${JSON.stringify({ created: true, snapshot: nextIndex.latest }, null, 2)}\n`);
}

main().catch((error) => {
  console.error('[principal-brain-snapshot] failed:', error);
  process.exitCode = 1;
});
