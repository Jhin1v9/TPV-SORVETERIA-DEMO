import fs from 'node:fs/promises';
import path from 'node:path';

const PRINCIPAL_BRAIN = 'C:\\Users\\Administrator\\Documents\\.brain';

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

async function readDirNames(target) {
  try {
    const entries = await fs.readdir(target, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  } catch {
    return [];
  }
}

function scoreProject(project) {
  let score = 0;
  if (project.hasBrainMirror) score += 15;
  if (project.hasOrchestratorMirror) score += 15;
  if (project.hasSyncResult) score += 10;
  if (project.syncPushOk) score += 15;
  else if (project.hasRemote) score += 8;
  if (project.hasKnowledge) score += 10;
  if (project.hasSessions) score += 10;
  if (project.hasOperationsRuntime) score += 10;
  if (project.hasSnapshots) score += 10;
  if (project.hasRollbackRuntime) score += 5;
  return Math.min(score, 100);
}

function maturityLabel(score) {
  if (score >= 90) return 'Elite';
  if (score >= 75) return 'Strong';
  if (score >= 55) return 'Developing';
  return 'Basic';
}

function healthEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 75) return '🟡';
  if (score >= 55) return '🟠';
  return '🔴';
}

async function collectProject(slug) {
  const root = path.join(PRINCIPAL_BRAIN, 'projects', slug);
  const brain = path.join(root, 'project-brain');
  const orchestrator = path.join(root, 'project-brain-orchestrator');
  const projectMeta = await readJson(path.join(root, 'PROJECT.json'), {});
  const syncMeta = await readJson(path.join(root, 'SYNC.json'), {});
  const snapshotMeta = await readJson(path.join(root, 'SNAPSHOT.json'), {});
  const rollbackMeta = await readJson(path.join(root, 'ROLLBACK.json'), { restorePoints: [] });
  const syncResult = await readJson(path.join(root, 'SYNC_RESULT.json'), {});
  const snapshotIndex = await readJson(path.join(root, 'snapshots', 'index.json'), { snapshots: [] });

  const hasBrainMirror = await exists(brain);
  const hasOrchestratorMirror = await exists(orchestrator);
  const hasKnowledge = await exists(path.join(brain, 'knowledge'));
  const hasSessions = await exists(path.join(brain, 'memory', 'sessions'));
  const hasOperationsRuntime =
    (await exists(path.join(orchestrator, 'OPERACAO_AGENTES.md')))
    && (await exists(path.join(orchestrator, 'PRINCIPAL_AGENT_RUNTIME.md')))
    && (await exists(path.join(orchestrator, 'BRAIN_SYNC_RUNTIME.md')));
  const hasRollbackRuntime = await exists(path.join(root, 'ROLLBACK_LOG.md'));

  const project = {
    slug,
    root,
    hasBrainMirror,
    hasOrchestratorMirror,
    hasKnowledge,
    hasSessions,
    hasOperationsRuntime,
    hasRollbackRuntime,
    hasSyncResult: Boolean(syncResult && Object.keys(syncResult).length > 0),
    hasRemote: Boolean(syncMeta?.hasRemote ?? syncResult?.hasRemote),
    syncPushOk: (syncMeta?.pushState ?? syncResult?.pushState) === 'ok',
    lastSync: syncMeta?.syncedAt ?? syncResult?.syncedAt ?? null,
    lastCommit: syncMeta?.commitMessage ?? syncResult?.commitMessage ?? '',
    hasSnapshots: Array.isArray(snapshotIndex.snapshots) && snapshotIndex.snapshots.length > 0,
    snapshotCount: Array.isArray(snapshotIndex.snapshots) ? snapshotIndex.snapshots.length : 0,
    latestSnapshot: snapshotIndex.latest ?? null,
    stage: projectMeta.stage ?? 'operational',
    status: projectMeta.status ?? 'active',
    priority: projectMeta.priority ?? 'high',
    lastActivityAt: projectMeta.lastActivityAt ?? syncMeta?.syncedAt ?? syncResult?.syncedAt ?? null,
    rollbackReady: Boolean(rollbackMeta.currentPointer),
    openRisks: Number(snapshotMeta?.risk?.openRisks ?? 0),
    blockedCount: Number(snapshotMeta?.risk?.blockedCount ?? 0),
    trend: (syncMeta?.syncHealth ?? 'healthy') === 'healthy' ? 'stable' : 'watch',
    healthScoreHint: Number(snapshotMeta?.healthScore ?? 0),
    maturityScoreHint: Number(snapshotMeta?.maturityScore ?? 0)
  };

  const score = scoreProject(project);
  return {
    ...project,
    score: project.maturityScoreHint || score,
    maturity: maturityLabel(project.maturityScoreHint || score),
    health: healthEmoji(project.healthScoreHint || score),
    healthScore: project.healthScoreHint || score
  };
}

async function main() {
  const projectRoot = path.join(PRINCIPAL_BRAIN, 'projects');
  const slugs = await readDirNames(projectRoot);
  const projects = [];
  for (const slug of slugs) {
    projects.push(await collectProject(slug));
  }

  const dashboardJson = {
    generatedAt: new Date().toISOString(),
    portfolioScore: projects.length ? Math.round(projects.reduce((sum, project) => sum + project.score, 0) / projects.length) : 0,
    activeProjects: projects.filter((project) => project.status === 'active').length,
    atRiskProjects: projects.filter((project) => project.blockedCount > 0 || !project.syncPushOk).length,
    blockedProjects: projects.filter((project) => project.blockedCount > 0).length,
    projectsByStage: projects.reduce((acc, project) => ({ ...acc, [project.stage]: (acc[project.stage] ?? 0) + 1 }), {}),
    projectsByHealth: projects.reduce((acc, project) => ({ ...acc, [project.health]: (acc[project.health] ?? 0) + 1 }), {}),
    projectsByTrend: projects.reduce((acc, project) => ({ ...acc, [project.trend]: (acc[project.trend] ?? 0) + 1 }), {}),
    topRisks: projects
      .filter((project) => project.blockedCount > 0 || !project.syncPushOk)
      .map((project) => ({
        project: project.slug,
        type: project.blockedCount > 0 ? 'blocked-work' : 'sync-health',
        severity: project.blockedCount > 0 ? 'high' : 'medium'
      })),
    projects: projects.map((project) => ({
      slug: project.slug,
      maturityScore: project.score,
      healthScore: project.healthScore,
      trend: project.trend,
      stage: project.stage,
      lastActivityAt: project.lastActivityAt,
      openRisks: project.openRisks,
      blockedCount: project.blockedCount,
      rollbackReady: project.rollbackReady
    }))
  };

  const metricsSchema = {
    version: '1.0',
    maturityBands: { elite: '>=90', strong: '>=75', developing: '>=55', basic: '<55' },
    healthBands: { healthy: '>=90', watch: '>=75', fragile: '>=55', critical: '<55' },
    trendRules: ['stable when sync is healthy', 'watch when sync is degraded or blocks exist'],
    requiredSnapshotFields: ['maturityScore', 'healthScore', 'risk.openRisks', 'risk.blockedCount', 'operations.syncHealthy'],
    requiredRollbackFields: ['currentPointer', 'restorePoints[].id', 'restorePoints[].snapshotFile']
  };

  const lines = [];
  lines.push('# Principal Brain Dashboard');
  lines.push('');
  lines.push(`- generated_at: ${dashboardJson.generatedAt}`);
  lines.push(`- portfolio_score: ${dashboardJson.portfolioScore}`);
  lines.push(`- active_projects: ${dashboardJson.activeProjects}`);
  lines.push(`- at_risk_projects: ${dashboardJson.atRiskProjects}`);
  lines.push(`- blocked_projects: ${dashboardJson.blockedProjects}`);
  lines.push('');
  lines.push('| Health | Project | Score | Maturity | Last Sync | Snapshots | Push |');
  lines.push('|---|---|---:|---|---|---:|---|');
  for (const project of projects.sort((a, b) => b.score - a.score)) {
    lines.push(`| ${project.health} | ${project.slug} | ${project.score} | ${project.maturity} | ${project.lastSync ?? '-'} | ${project.snapshotCount} | ${project.syncPushOk ? 'ok' : project.hasRemote ? 'pending' : 'no-remote'} |`);
  }
  lines.push('');
  if (dashboardJson.topRisks.length > 0) {
    lines.push('## Top Risks');
    lines.push('');
    for (const risk of dashboardJson.topRisks) {
      lines.push(`- ${risk.project} :: ${risk.type} :: ${risk.severity}`);
    }
    lines.push('');
  }
  lines.push('## Criteria');
  lines.push('');
  lines.push('- mirror completeness');
  lines.push('- orchestrator/runtime presence');
  lines.push('- sync state and push health');
  lines.push('- knowledge and sessions coverage');
  lines.push('- snapshots and rollback readiness');
  lines.push('');

  const projectsJson = {
    updatedAt: dashboardJson.generatedAt,
    version: '2.0',
    projects: projects.map((project) => ({
      slug: project.slug,
      name: project.slug,
      status: project.status,
      priority: project.priority,
      path: `projects/${project.slug}`,
      repoPath: project.root,
      brainPath: path.join(project.root, 'project-brain'),
      snapshotPath: path.join(project.root, 'snapshots'),
      rollbackPath: path.join(project.root, 'ROLLBACK.json'),
      lastSyncAt: project.lastSync,
      lastSnapshotAt: project.latestSnapshot?.createdAt ?? null,
      lastRollbackPointAt: project.rollbackReady ? project.latestSnapshot?.createdAt ?? null : null,
      maturityScore: project.score,
      healthScore: project.healthScore
    }))
  };

  await fs.writeFile(path.join(PRINCIPAL_BRAIN, 'DASHBOARD.md'), `${lines.join('\n')}\n`);
  await fs.writeFile(path.join(PRINCIPAL_BRAIN, 'DASHBOARD.json'), `${JSON.stringify(dashboardJson, null, 2)}\n`);
  await fs.writeFile(path.join(PRINCIPAL_BRAIN, 'METRICS_SCHEMA.json'), `${JSON.stringify(metricsSchema, null, 2)}\n`);
  await fs.writeFile(path.join(PRINCIPAL_BRAIN, 'PROJECTS.json'), `${JSON.stringify(projectsJson, null, 2)}\n`);
  process.stdout.write(`${path.join(PRINCIPAL_BRAIN, 'DASHBOARD.json')}\n`);
}

main().catch((error) => {
  console.error('[principal-brain-dashboard] failed:', error);
  process.exitCode = 1;
});
