import { spawnSync } from 'node:child_process';

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

function runGit(args) {
  return spawnSync('git', args, {
    encoding: 'utf8',
    stdio: 'pipe'
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const message = String(args.message ?? `repo sync: ${new Date().toISOString()}`);

  runGit(['add', '.']);
  const status = runGit(['status', '--short']).stdout.trim();
  if (!status) {
    process.stdout.write(`${JSON.stringify({ committed: false, pushed: false, reason: 'clean-worktree' }, null, 2)}\n`);
    return;
  }

  const commit = runGit(['commit', '-m', message]);
  if (commit.status !== 0) {
    throw new Error((commit.stderr || commit.stdout).trim() || 'git commit failed');
  }

  const branch = runGit(['branch', '--show-current']).stdout.trim() || 'main';
  const push = runGit(['push', '-u', 'origin', branch]);
  if (push.status !== 0) {
    throw new Error((push.stderr || push.stdout).trim() || 'git push failed');
  }

  const sha = runGit(['rev-parse', 'HEAD']).stdout.trim();
  process.stdout.write(`${JSON.stringify({ committed: true, pushed: true, branch, sha, message }, null, 2)}\n`);
}

main().catch((error) => {
  console.error('[project-repo-sync] failed:', error);
  process.exitCode = 1;
});
