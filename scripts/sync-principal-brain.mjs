import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const PROJECT_BRAIN = 'C:\\\\Users\\\\Administrator\\\\Documents\\\\.brain';
const PROJECT_ORCHESTRATOR = null; // removido - brain unificado
const PRINCIPAL_BRAIN = 'C:\\Users\\Administrator\\Documents\\.brain';
const PROJECT_SLUG = 'tpv-sorveteria-demo';

function runGit(args, cwd) {
  return spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: 'pipe'
  });
}

function runNode(scriptPath, args = []) {
  return spawnSync('node', [scriptPath, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: 'pipe'
  });
}

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(target) {
  await fs.mkdir(target, { recursive: true });
}

async function writeFile(target, content) {
  await ensureDir(path.dirname(target));
  await fs.writeFile(target, content);
}

async function appendFile(target, content) {
  await ensureDir(path.dirname(target));
  await fs.appendFile(target, content);
}

async function readJson(target, fallback = null) {
  try {
    return JSON.parse(await fs.readFile(target, 'utf8'));
  } catch {
    return fallback;
  }
}

function now() {
  return new Date().toISOString();
}

async function main() {
  const syncRoot = path.join(PRINCIPAL_BRAIN, 'projects', PROJECT_SLUG);
  const targetBrain = path.join(syncRoot, 'project-brain');
  const targetOrchestrator = path.join(syncRoot, 'project-brain-orchestrator');
  const syncJsonPath = path.join(syncRoot, 'SYNC.json');
  const projectJsonPath = path.join(syncRoot, 'PROJECT.json');
  const rollbackJsonPath = path.join(syncRoot, 'ROLLBACK.json');

  await ensureDir(syncRoot);
  await fs.rm(targetBrain, { recursive: true, force: true });
  await fs.rm(targetOrchestrator, { recursive: true, force: true });
  await fs.cp(PROJECT_BRAIN, targetBrain, { recursive: true, force: true });
  await fs.cp(PROJECT_ORCHESTRATOR, targetOrchestrator, { recursive: true, force: true });

  const syncNote = [
    '# PRINCIPAL BRAIN SYNC',
    '',
    `- synced_at: ${now()}`,
    `- project: ${PROJECT_SLUG}`,
    `- source_brain: ${PROJECT_BRAIN}`,
    `- source_orchestrator: ${PROJECT_ORCHESTRATOR}`,
    `- target_root: ${syncRoot}`,
    '- policy: project brain changes must also land in the principal brain',
    '- author: CODEX',
    ''
  ].join('\n');

  const projectIndex = [
    '# PROJECT MIRROR',
    '',
    `- project: ${PROJECT_SLUG}`,
    `- last_sync: ${now()}`,
    '',
    '## Mirrors',
    '',
    `- brain: ${targetBrain}`,
    `- orchestrator: ${targetOrchestrator}`,
    '',
    '## Rule',
    '',
    '- The principal brain is the independent long-lived memory system.',
    '- The project repo brain is an operational mirror for local execution.',
    '- CODEX must update both when changing the project brain.',
    ''
  ].join('\n');

  const rootProjectIndex = [
    '# PROJECTS',
    '',
    '## Active Mirrors',
    '',
    `- ${PROJECT_SLUG}: projects/${PROJECT_SLUG}/PROJECT_INDEX.md`,
    '',
    '## Rule',
    '',
    '- Principal brain is the canonical independent knowledge base.',
    '- Each project sync should be committed after updates.',
    ''
  ].join('\n');

  const rootPolicy = [
    '',
    '---',
    '',
    '## Atualizacao 2026-04-25 - Brain principal como canonico',
    '',
    '- `C:\\Users\\Administrator\\Documents\\.brain` e agora o brain principal e independente.',
    '- Mudancas no `.brain` de qualquer projeto relevante devem ser espelhadas aqui.',
    '- Cada sync deve preferencialmente resultar em `git add + git commit + git push` neste brain principal.',
    '- Quando push nao for possivel por falta de remote/credencial, isso deve ser registrado como bloqueio operacional, nao omitido.',
    ''
  ].join('\n');

  await writeFile(path.join(syncRoot, 'LATEST_SYNC.md'), `${syncNote}\n`);
  await writeFile(path.join(syncRoot, 'PROJECT_INDEX.md'), `${projectIndex}\n`);
  await writeFile(path.join(PRINCIPAL_BRAIN, 'PROJECTS.md'), `${rootProjectIndex}\n`);
  await writeFile(
    path.join(PRINCIPAL_BRAIN, 'PROJECTS.json'),
    `${JSON.stringify({
      updatedAt: now(),
      projects: [
        {
          slug: PROJECT_SLUG,
          path: `projects/${PROJECT_SLUG}`,
          brain: `projects/${PROJECT_SLUG}/project-brain`,
          orchestrator: `projects/${PROJECT_SLUG}/project-brain-orchestrator`
        }
      ]
    }, null, 2)}\n`,
  );

  const rootReadme = path.join(PRINCIPAL_BRAIN, 'README.md');
  const currentReadme = await fs.readFile(rootReadme, 'utf8');
  if (!currentReadme.includes('Brain principal como canonico')) {
    await fs.writeFile(rootReadme, `${currentReadme}${rootPolicy}`);
  }

  const changelogPath = path.join(PRINCIPAL_BRAIN, 'CHANGELOG.md');
  if (!(await exists(changelogPath))) {
    await writeFile(
      changelogPath,
      '# Principal Brain Changelog\n\n',
    );
  }
  await appendFile(
    changelogPath,
    `## ${now()} - sync ${PROJECT_SLUG}\n- mirror updated in \`projects/${PROJECT_SLUG}\`\n- source: project .brain + .brain-orchestrator\n- author: CODEX\n\n`,
  );

  const gitDir = path.join(PRINCIPAL_BRAIN, '.git');
  if (!(await exists(gitDir))) {
    runGit(['init'], PRINCIPAL_BRAIN);
    await writeFile(
      path.join(PRINCIPAL_BRAIN, '.gitignore'),
      '.DS_Store\nThumbs.db\n',
    );
  }

  let committed = false;
  let commitMessage = '';
  let commitError = '';
  let commitSha = '';
  const remoteCheck = runGit(['remote', '-v'], PRINCIPAL_BRAIN);
  const hasRemote = remoteCheck.status === 0 && remoteCheck.stdout.trim().length > 0;
  let pushState = 'skipped:no-remote';
  runGit(['add', '.'], PRINCIPAL_BRAIN);
  const status = runGit(['status', '--short'], PRINCIPAL_BRAIN).stdout.trim();

  if (status) {
    commitMessage = `brain sync: ${PROJECT_SLUG} @ ${new Date().toISOString()}`;
    const resultPreview = {
      syncedAt: now(),
      principalBrain: PRINCIPAL_BRAIN,
      projectMirror: syncRoot,
      committed: 'pending',
      hasRemote,
      pushState
    };
    await writeFile(path.join(syncRoot, 'SYNC_RESULT.json'), `${JSON.stringify(resultPreview, null, 2)}\n`);

    runGit(['add', '.'], PRINCIPAL_BRAIN);
    const commit = runGit(['commit', '-m', commitMessage], PRINCIPAL_BRAIN);
    committed = commit.status === 0;
    if (!committed) {
      commitError = `${commit.stderr || commit.stdout}`.trim();
    } else {
      commitSha = runGit(['rev-parse', 'HEAD'], PRINCIPAL_BRAIN).stdout.trim();
    }
  }

  if (hasRemote) {
    const branchCheck = runGit(['branch', '--show-current'], PRINCIPAL_BRAIN);
    const branch = branchCheck.stdout.trim() || 'main';
    const push = runGit(['push', '-u', 'origin', branch], PRINCIPAL_BRAIN);
    pushState = push.status === 0 ? 'ok' : `failed:${(push.stderr || push.stdout).trim()}`;
  }

  const result = {
    syncedAt: now(),
    principalBrain: PRINCIPAL_BRAIN,
    projectMirror: syncRoot,
    committed,
    commitMessage,
    commitError,
    hasRemote,
    pushState
  };

  await writeFile(path.join(syncRoot, 'SYNC_RESULT.json'), `${JSON.stringify(result, null, 2)}\n`);
  runGit(['add', path.join('projects', PROJECT_SLUG, 'SYNC_RESULT.json')], PRINCIPAL_BRAIN);
  const finalStatus = runGit(['status', '--short'], PRINCIPAL_BRAIN).stdout.trim();
  if (finalStatus) {
    const finalizeCommit = runGit(['commit', '-m', `brain sync finalize: ${PROJECT_SLUG} @ ${new Date().toISOString()}`], PRINCIPAL_BRAIN);
    if (finalizeCommit.status !== 0 && !commitError) {
      commitError = `${finalizeCommit.stderr || finalizeCommit.stdout}`.trim();
    } else if (finalizeCommit.status === 0) {
      commitSha = runGit(['rev-parse', 'HEAD'], PRINCIPAL_BRAIN).stdout.trim();
    }
  }

  const syncHealth = pushState === 'ok' ? 'healthy' : hasRemote ? 'degraded' : 'local-only';
  const syncWarnings = [];
  if (!hasRemote) syncWarnings.push('no-remote-configured');
  if (pushState !== 'ok' && hasRemote) syncWarnings.push('push-not-ok');
  if (commitError) syncWarnings.push('commit-error');

  const syncJson = {
    syncedAt: result.syncedAt,
    slug: PROJECT_SLUG,
    sourceBrain: PROJECT_BRAIN,
    sourceOrchestrator: PROJECT_ORCHESTRATOR,
    targetRoot: syncRoot,
    committed,
    commitMessage,
    commitSha,
    hasRemote,
    pushState,
    syncHealth,
    syncWarnings
  };
  await writeFile(syncJsonPath, `${JSON.stringify(syncJson, null, 2)}\n`);

  const existingProjectJson = await readJson(projectJsonPath, {});
  await writeFile(projectJsonPath, `${JSON.stringify({
    slug: PROJECT_SLUG,
    name: existingProjectJson.name ?? 'TPV Sorveteria Demo',
    status: existingProjectJson.status ?? 'active',
    stage: existingProjectJson.stage ?? 'operational',
    priority: existingProjectJson.priority ?? 'high',
    owner: existingProjectJson.owner ?? 'CODEX',
    repoPath: ROOT,
    brainPath: targetBrain,
    snapshotPath: path.join(syncRoot, 'snapshots'),
    rollbackPath: rollbackJsonPath,
    createdAt: existingProjectJson.createdAt ?? result.syncedAt,
    updatedAt: result.syncedAt,
    lastActivityAt: result.syncedAt,
    lastSyncAt: result.syncedAt,
    lastSnapshotAt: existingProjectJson.lastSnapshotAt ?? null,
    lastRollbackPointAt: existingProjectJson.lastRollbackPointAt ?? null,
    tags: existingProjectJson.tags ?? ['brain', 'orchestration', 'tpv', 'autonomous']
  }, null, 2)}\n`);

  const existingRollbackJson = await readJson(rollbackJsonPath, {
    updatedAt: result.syncedAt,
    slug: PROJECT_SLUG,
    currentPointer: null,
    restoreStrategy: 'mirror-restore-from-snapshot',
    restorePoints: []
  });
  await writeFile(rollbackJsonPath, `${JSON.stringify({
    ...existingRollbackJson,
    updatedAt: result.syncedAt,
    slug: PROJECT_SLUG,
    restoreStrategy: existingRollbackJson.restoreStrategy ?? 'mirror-restore-from-snapshot'
  }, null, 2)}\n`);

  const snapshotRun = runNode('scripts/principal-brain-snapshot.mjs', ['--project', PROJECT_SLUG, '--mode', 'periodic']);
  const snapshotOutput = `${snapshotRun.stdout || ''}`.trim();
  const snapshotJson = snapshotOutput ? JSON.parse(snapshotOutput) : null;
  if (snapshotJson?.created && snapshotJson.snapshot) {
    const projectJson = JSON.parse(await fs.readFile(projectJsonPath, 'utf8'));
    projectJson.lastSnapshotAt = snapshotJson.snapshot.createdAt;
    await writeFile(projectJsonPath, `${JSON.stringify(projectJson, null, 2)}\n`);

    const rollbackJson = JSON.parse(await fs.readFile(rollbackJsonPath, 'utf8'));
    rollbackJson.currentPointer = snapshotJson.snapshot.id;
    rollbackJson.updatedAt = new Date().toISOString();
    rollbackJson.restorePoints = [
      {
        id: snapshotJson.snapshot.id,
        createdAt: snapshotJson.snapshot.createdAt,
        type: 'periodic',
        label: `snapshot ${snapshotJson.snapshot.id}`,
        summary: 'Automatic periodic mirror snapshot',
        gitCommit: commitSha,
        brainCommit: commitSha,
        syncCommit: commitSha,
        snapshotFile: snapshotJson.snapshot.root,
        changedFiles: ['project-brain', 'project-brain-orchestrator'],
        integrityStatus: 'verified-copy',
        verifiedAt: new Date().toISOString(),
        retentionClass: 'rolling'
      },
      ...rollbackJson.restorePoints
    ].slice(0, 20);
    await writeFile(rollbackJsonPath, `${JSON.stringify(rollbackJson, null, 2)}\n`);
  }

  const dashboardRun = runNode('scripts/principal-brain-dashboard.mjs');
  if (dashboardRun.status !== 0) {
    console.error(dashboardRun.stderr || dashboardRun.stdout);
  }

  runGit(['add', '.'], PRINCIPAL_BRAIN);
  const postArtifactsStatus = runGit(['status', '--short'], PRINCIPAL_BRAIN).stdout.trim();
  if (postArtifactsStatus) {
    const dashboardCommit = runGit(['commit', '-m', `brain sync artifacts: ${PROJECT_SLUG} @ ${new Date().toISOString()}`], PRINCIPAL_BRAIN);
    if (dashboardCommit.status === 0) {
      commitSha = runGit(['rev-parse', 'HEAD'], PRINCIPAL_BRAIN).stdout.trim();
      result.commitMessage = `brain sync artifacts: ${PROJECT_SLUG} @ ${new Date().toISOString()}`;
      syncJson.commitMessage = result.commitMessage;
    } else if (!commitError) {
      commitError = `${dashboardCommit.stderr || dashboardCommit.stdout}`.trim();
    }
    if (hasRemote) {
      const branch = runGit(['branch', '--show-current'], PRINCIPAL_BRAIN).stdout.trim() || 'main';
      const push = runGit(['push', '-u', 'origin', branch], PRINCIPAL_BRAIN);
      pushState = push.status === 0 ? 'ok' : `failed:${(push.stderr || push.stdout).trim()}`;
    }
  }
  result.commitError = commitError;
  result.pushState = pushState;
  result.commitSha = commitSha;
  syncJson.commitSha = commitSha;
  syncJson.pushState = pushState;
  syncJson.syncHealth = pushState === 'ok' ? 'healthy' : hasRemote ? 'degraded' : 'local-only';
  await writeFile(path.join(syncRoot, 'SYNC_RESULT.json'), `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(syncJsonPath, `${JSON.stringify(syncJson, null, 2)}\n`);
  runGit(['add', path.join('projects', PROJECT_SLUG, 'SYNC_RESULT.json'), path.join('projects', PROJECT_SLUG, 'SYNC.json')], PRINCIPAL_BRAIN);
  const finalMetadataStatus = runGit(['status', '--short'], PRINCIPAL_BRAIN).stdout.trim();
  if (finalMetadataStatus) {
    const finalMetadataCommit = runGit(['commit', '-m', `brain sync metadata: ${PROJECT_SLUG} @ ${new Date().toISOString()}`], PRINCIPAL_BRAIN);
    if (finalMetadataCommit.status === 0) {
      result.commitSha = runGit(['rev-parse', 'HEAD'], PRINCIPAL_BRAIN).stdout.trim();
      result.commitMessage = `brain sync metadata: ${PROJECT_SLUG} @ ${new Date().toISOString()}`;
      syncJson.commitMessage = result.commitMessage;
      syncJson.commitSha = result.commitSha;
    } else if (!commitError) {
      result.commitError = `${finalMetadataCommit.stderr || finalMetadataCommit.stdout}`.trim();
    }
    if (hasRemote) {
      const branch = runGit(['branch', '--show-current'], PRINCIPAL_BRAIN).stdout.trim() || 'main';
      const push = runGit(['push', '-u', 'origin', branch], PRINCIPAL_BRAIN);
      result.pushState = push.status === 0 ? 'ok' : `failed:${(push.stderr || push.stdout).trim()}`;
    }
    await writeFile(path.join(syncRoot, 'SYNC_RESULT.json'), `${JSON.stringify(result, null, 2)}\n`);
  }
  runGit(['add', path.join('projects', PROJECT_SLUG, 'SYNC_RESULT.json')], PRINCIPAL_BRAIN);
  const finalStateStatus = runGit(['status', '--short'], PRINCIPAL_BRAIN).stdout.trim();
  if (finalStateStatus) {
    const finalStateCommit = runGit(['commit', '-m', `brain sync final-state: ${PROJECT_SLUG} @ ${new Date().toISOString()}`], PRINCIPAL_BRAIN);
    if (finalStateCommit.status === 0) {
      result.commitSha = runGit(['rev-parse', 'HEAD'], PRINCIPAL_BRAIN).stdout.trim();
    } else if (!result.commitError) {
      result.commitError = `${finalStateCommit.stderr || finalStateCommit.stdout}`.trim();
    }
    if (hasRemote) {
      const branch = runGit(['branch', '--show-current'], PRINCIPAL_BRAIN).stdout.trim() || 'main';
      const push = runGit(['push', '-u', 'origin', branch], PRINCIPAL_BRAIN);
      result.pushState = push.status === 0 ? 'ok' : `failed:${(push.stderr || push.stdout).trim()}`;
    }
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

main().catch((error) => {
  console.error('[sync-principal-brain] failed:', error);
  process.exitCode = 1;
});
