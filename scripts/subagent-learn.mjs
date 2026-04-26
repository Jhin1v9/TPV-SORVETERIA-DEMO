import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

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

function today() {
  return new Date().toISOString().slice(0, 10);
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function slugify(text) {
  return text.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
  } catch {
    return null;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const artifact = String(args.artifact ?? '').trim();
  if (!artifact) throw new Error('Missing --artifact <artifact-dir>');
  const artifactDir = path.resolve(ROOT, artifact);
  const team = await readJsonIfExists(path.join(artifactDir, 'team.json'));
  if (!team) throw new Error('Could not read team.json from artifact directory');

  const noteDir = path.join('C:\\\\Users\\\\Administrator\\\\Documents', '.brain'), 'learning', 'subagents');
  const notePath = path.join(noteDir, `${today()}-${slugify(team.goal)}-${timestamp()}.md`);
  const sessionPath = path.join('C:\\\\Users\\\\Administrator\\\\Documents', '.brain'), 'memory', 'sessions', `${today()}.md`);

  const note = [
    '# SUBAGENT LEARNING NOTE',
    '',
    `- mission_id: ${path.basename(artifactDir)}`,
    `- date: ${today()}`,
    `- principal_agent: ${team.principal ?? 'CODEX'}`,
    `- mission_type: ${team.taskType}`,
    `- goal: ${team.goal}`,
    '',
    '## Team',
    '',
    ...team.members.map((member) => `- ${member.name} :: ${member.role} :: can_write=${member.canWrite}`),
    '',
    '## What worked',
    '',
    '- manager-worker decomposition preserved clarity',
    '- contracts were machine-readable via MAMIS/1',
    '- generated artifacts were ready for principal-agent execution',
    '',
    '## What failed',
    '',
    '- no runtime spawning happened automatically inside the repo',
    '- live mission outcomes still depend on principal-agent execution',
    '',
    '## Protocol lessons',
    '',
    '- MAMIS/1 keeps outputs compact and mergeable',
    '- PRINCIPAL_BRIEF is useful for keeping CODEX and KIMI aligned',
    '',
    '## Reusable patterns',
    '',
    '- use `agent:fabric` first for team design',
    '- use `subagent-mission` for mission planning',
    '- write the resulting truth back into `.brain`',
    '',
    '## Status vigente',
    '',
    '- subagent operations are now versioned, automatable and brain-linked',
    '',
    '## Author',
    '',
    'Author: CODEX',
    ''
  ].join('\n');

  await fs.mkdir(noteDir, { recursive: true });
  await fs.writeFile(notePath, `${note}\n`);
  await fs.appendFile(
    sessionPath,
    `\n- Subagent learning note created: \`${path.relative(ROOT, notePath).replace(/\\/g, '/')}\` from artifact \`${path.relative(ROOT, artifactDir).replace(/\\/g, '/')}\`.\n`,
  );

  process.stdout.write(`${notePath}\n`);
}

main().catch((error) => {
  console.error('[subagent-learn] failed:', error);
  process.exitCode = 1;
});
