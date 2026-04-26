import fs from 'node:fs/promises';
import path from 'node:path';

export async function readJson(target, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(target, 'utf8'));
  } catch {
    return fallback;
  }
}

export async function writeJson(target, value) {
  await fs.writeFile(target, `${JSON.stringify(value, null, 2)}\n`);
}

export function createRestorePoint(snapshot, commitSha = '', overrides = {}) {
  return {
    id: snapshot.id,
    createdAt: snapshot.createdAt,
    type: snapshot.mode ?? 'periodic',
    label: `snapshot ${snapshot.id}`,
    summary: snapshot.mode === 'manual'
      ? 'Manual mirror snapshot'
      : 'Automatic periodic mirror snapshot',
    gitCommit: commitSha,
    brainCommit: commitSha,
    syncCommit: commitSha,
    snapshotFile: snapshot.root,
    changedFiles: ['project-brain', 'project-brain-orchestrator'],
    integrityStatus: 'verified-copy',
    verifiedAt: new Date().toISOString(),
    retentionClass: 'rolling',
    ...overrides
  };
}

export function mergeRestorePoints(existingPoints = [], newPoint, retention = 20) {
  const next = [newPoint, ...existingPoints.filter((point) => point?.id !== newPoint.id)];
  return next.slice(0, retention);
}

export function reconcileRollbackCatalog(indexSnapshots = [], rollbackMeta = {}, retention = 20, commitSha = '') {
  const existingPoints = Array.isArray(rollbackMeta.restorePoints) ? rollbackMeta.restorePoints : [];
  const byId = new Map(existingPoints.map((point) => [point.id, point]));

  const reconciled = indexSnapshots.map((snapshot) => (
    byId.get(snapshot.id)
    ?? createRestorePoint(snapshot, commitSha)
  ));

  return {
    ...rollbackMeta,
    restorePoints: reconciled.slice(0, retention)
  };
}

export function snapshotParity(indexSnapshots = [], restorePoints = []) {
  const snapshotIds = new Set(indexSnapshots.map((entry) => entry.id));
  const restoreIds = new Set(restorePoints.map((entry) => entry.id));
  const missingRollbackPoints = indexSnapshots
    .filter((entry) => !restoreIds.has(entry.id))
    .map((entry) => entry.id);
  const orphanRestorePoints = restorePoints
    .filter((entry) => !snapshotIds.has(entry.id))
    .map((entry) => entry.id);

  return {
    snapshotCount: indexSnapshots.length,
    rollbackPointCount: restorePoints.length,
    parityOk: missingRollbackPoints.length === 0 && orphanRestorePoints.length === 0,
    missingRollbackPoints,
    orphanRestorePoints
  };
}

export function buildIntegrityAlerts({
  snapshotIndex,
  rollbackMeta,
  projectMeta,
  syncMeta
}) {
  const alerts = [];
  const snapshots = Array.isArray(snapshotIndex?.snapshots) ? snapshotIndex.snapshots : [];
  const restorePoints = Array.isArray(rollbackMeta?.restorePoints) ? rollbackMeta.restorePoints : [];
  const parity = snapshotParity(snapshots, restorePoints);

  if (!parity.parityOk) {
    alerts.push({
      type: 'snapshot-rollback-parity',
      severity: 'high',
      details: parity
    });
  }

  if (snapshotIndex?.latest?.id && rollbackMeta?.currentPointer && !snapshots.some((entry) => entry.id === rollbackMeta.currentPointer)) {
    alerts.push({
      type: 'rollback-pointer-missing-from-snapshots',
      severity: 'high',
      details: { currentPointer: rollbackMeta.currentPointer }
    });
  }

  if (projectMeta?.lastSnapshotAt && snapshotIndex?.latest?.createdAt && projectMeta.lastSnapshotAt !== snapshotIndex.latest.createdAt) {
    alerts.push({
      type: 'project-lastSnapshotAt-drift',
      severity: 'medium',
      details: {
        projectLastSnapshotAt: projectMeta.lastSnapshotAt,
        latestSnapshotAt: snapshotIndex.latest.createdAt
      }
    });
  }

  if (projectMeta?.lastRollbackPointAt && rollbackMeta?.lastRestoredAt && projectMeta.lastRollbackPointAt !== rollbackMeta.lastRestoredAt) {
    alerts.push({
      type: 'project-lastRollbackPointAt-drift',
      severity: 'medium',
      details: {
        projectLastRollbackPointAt: projectMeta.lastRollbackPointAt,
        rollbackLastRestoredAt: rollbackMeta.lastRestoredAt
      }
    });
  }

  if ((syncMeta?.pushState ?? '') !== 'ok') {
    alerts.push({
      type: 'sync-push-not-ok',
      severity: 'medium',
      details: { pushState: syncMeta?.pushState ?? 'unknown' }
    });
  }

  return {
    alerts,
    parity
  };
}

// ─── Git Lock Helpers ──────────────────────────────────────────────

export async function isGitLockStale(cwd, maxAgeMs = 60000) {
  const lockFile = path.join(cwd, '.git', 'index.lock');
  try {
    const stats = await fs.stat(lockFile);
    const age = Date.now() - stats.mtime.getTime();
    return age > maxAgeMs;
  } catch {
    return false; // no lock file = not stale
  }
}

export async function removeGitLock(cwd) {
  const lockFile = path.join(cwd, '.git', 'index.lock');
  try {
    await fs.rm(lockFile, { force: true });
    return true;
  } catch {
    return false;
  }
}

export async function waitForGitLock(cwd, timeoutMs = 30000, checkIntervalMs = 500) {
  const lockFile = path.join(cwd, '.git', 'index.lock');
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await fs.access(lockFile);
      // lock exists, check if stale
      if (await isGitLockStale(cwd, 60000)) {
        await removeGitLock(cwd);
        return 'stale-removed';
      }
      await new Promise((r) => setTimeout(r, checkIntervalMs));
    } catch {
      return 'available'; // lock gone
    }
  }
  throw new Error(`Git lock timeout after ${timeoutMs}ms in ${cwd}`);
}
