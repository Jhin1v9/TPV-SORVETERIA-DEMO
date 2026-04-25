import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, '.brain-orchestrator', 'SUBAGENT_REGISTRY.json');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const [rawKey, inlineValue] = token.slice(2).split('=');
    const next = argv[i + 1];
    const value = inlineValue ?? (next && !next.startsWith('--') ? next : true);
    args[rawKey] = value;
    if (inlineValue == null && value !== true) i += 1;
  }
  return args;
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

function chooseUnique(list, used = new Set()) {
  const available = list.filter((item) => !used.has(item));
  const pool = available.length > 0 ? available : list;
  const value = pool[Math.floor(Math.random() * pool.length)];
  used.add(value);
  return value;
}

function generateAgentName(role, naming, id) {
  const used = new Set();
  const adjective = chooseUnique(naming.adjectives, used);
  const noun = chooseUnique(naming.nouns, used);
  const shortId = String(id).padStart(2, '0');
  return `${role}-${adjective}-${noun}-${shortId}`;
}

function inferRoles(goal, registry) {
  const text = goal.toLowerCase();
  const picks = [];
  const add = (role) => {
    if (!picks.includes(role)) picks.push(role);
  };

  if (/(pesquisa|research|web|internet|docs|benchmark|referenc)/.test(text)) add('WEB_SCOUT');
  if (/(codigo|repo|arquiv|analis|trace|mapear|map)/.test(text)) add('CODE_SCOUT');
  if (/(implementar|fix|consert|patch|refactor|mudar|editar)/.test(text)) add('SURGEON');
  if (/(test|valid|smoke|build|verifica)/.test(text)) add('VERIFIER');
  if (/(review|revis|risco|auditoria)/.test(text)) add('REVIEWER');

  if (picks.length === 0) {
    add('CODE_SCOUT');
    add('SYNTHESIZER');
  }

  if (!picks.includes('SYNTHESIZER')) add('SYNTHESIZER');

  return picks.filter((role) => registry.roles.some((entry) => entry.role === role));
}

function makeContract(role, goal, taskType, registryEntry) {
  const scopeByRole = {
    WEB_SCOUT: 'IN: web/docs/changelogs/benchmarks. OUT: code edits and speculative implementation.',
    CODE_SCOUT: 'IN: repo mapping, ownership, dependencies, hotspots. OUT: code edits unless explicitly granted.',
    SURGEON: 'IN: bounded implementation with explicit ownership. OUT: broad uncontrolled refactors.',
    VERIFIER: 'IN: build/test/smoke/regression validation. OUT: feature design changes.',
    REVIEWER: 'IN: risk review, regression review, missing tests. OUT: implementation changes.',
    SYNTHESIZER: 'IN: merge findings into one state of truth. OUT: raw unsorted dumps.'
  };

  const outputByRole = {
    WEB_SCOUT: 'links + summary + risks + strongest references',
    CODE_SCOUT: 'file map + flow map + technical hotspots',
    SURGEON: 'files changed + rationale + residual risks',
    VERIFIER: 'pass/fail + commands + artifacts + residual risk',
    REVIEWER: 'findings prioritized by severity + affected files + test gaps',
    SYNTHESIZER: 'state of truth + decisions + next actions'
  };

  const doneByRole = {
    WEB_SCOUT: 'Primary sources gathered, summarized, and ranked by confidence.',
    CODE_SCOUT: 'Relevant files and flows mapped with exact paths.',
    SURGEON: 'Requested patch completed with bounded ownership and no unresolved conflicts.',
    VERIFIER: 'Validation commands executed and outcome recorded with evidence.',
    REVIEWER: 'Top risks and missing tests clearly enumerated.',
    SYNTHESIZER: 'One coherent state drafted with conflicts resolved or called out.'
  };

  const riskByRole = {
    WEB_SCOUT: 'stale or secondary sources, low-authority references',
    CODE_SCOUT: 'missing hidden coupling, stale assumptions',
    SURGEON: 'regression outside owned files',
    VERIFIER: 'false green from incomplete scenario coverage',
    REVIEWER: 'over-reporting cosmetic issues over real bugs',
    SYNTHESIZER: 'flattening important uncertainty'
  };

  return [
    'MAMIS/1',
    `ROLE: ${role}`,
    `GOAL: ${goal}`,
    `SCOPE: ${scopeByRole[role] ?? 'bounded specialist scope'}`,
    'INPUTS:',
    `- task_type=${taskType}`,
    `- role_category=${registryEntry.category}`,
    `- can_write=${String(registryEntry.can_write)}`,
    `- best_for=${registryEntry.best_for.join(', ')}`,
    'OUTPUT:',
    `- ${outputByRole[role] ?? 'structured specialist output'}`,
    'DONE:',
    `- ${doneByRole[role] ?? 'task complete with evidence'}`,
    'RISK:',
    `- ${riskByRole[role] ?? 'unknown risk surface'}`
  ].join('\n');
}

function buildTeamMarkdown(team) {
  const lines = [];
  lines.push('# SUBAGENT FABRIC');
  lines.push('');
  lines.push(`- generated_at: ${team.generatedAt}`);
  lines.push(`- protocol: ${team.protocol}`);
  lines.push(`- pattern: ${team.pattern}`);
  lines.push(`- goal: ${team.goal}`);
  lines.push(`- task_type: ${team.taskType}`);
  lines.push('');
  lines.push('## Team');
  lines.push('');
  for (const member of team.members) {
    lines.push(`### ${member.name}`);
    lines.push(`- role: ${member.role}`);
    lines.push(`- category: ${member.category}`);
    lines.push(`- can_write: ${member.canWrite}`);
    lines.push(`- best_for: ${member.bestFor.join(', ')}`);
    lines.push('');
    lines.push('```text');
    lines.push(member.contract);
    lines.push('```');
    lines.push('');
  }
  lines.push('## Communication');
  lines.push('');
  lines.push('- Every subagent must speak in `MAMIS/1`.');
  lines.push('- Facts before inference.');
  lines.push('- Evidence before narrative.');
  lines.push('- Output must be compact and machine-mergeable.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function buildPrincipalBrief(team, principal) {
  return [
    '# PRINCIPAL BRIEF',
    '',
    `- principal_agent: ${principal}`,
    `- generated_at: ${team.generatedAt}`,
    `- protocol: ${team.protocol}`,
    `- pattern: ${team.pattern}`,
    `- goal: ${team.goal}`,
    '',
    '## Execution Order',
    '',
    '1. confirm whether delegation is truly needed',
    '2. spawn only the members that reduce uncertainty fastest',
    '3. collect all outputs in MAMIS/1',
    '4. synthesize one status vigente',
    '5. write the updated truth into `.brain`',
    '',
    '## Team Members',
    '',
    ...team.members.map((member) => `- ${member.name} :: ${member.role} :: can_write=${member.canWrite}`),
    '',
    '## Principal Rules',
    '',
    '- keep the user intent centralized',
    '- do not outsource final judgment',
    '- prefer evidence over confidence',
    '- prefer live validation over static reasoning',
    '- if CODEX and KIMI disagree, preserve history and elevate the strongest current evidence',
    ''
  ].join('\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const goal = String(args.goal ?? args.task ?? 'Build a specialized subagent team').trim();
  const taskType = String(args['task-type'] ?? args.mode ?? 'general').trim();
  const registry = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
  const explicitRoles = typeof args.roles === 'string'
    ? args.roles.split(',').map((item) => item.trim()).filter(Boolean)
    : [];
  const roles = explicitRoles.length > 0 ? explicitRoles : inferRoles(goal, registry);
  const maxParallel = Number(args['max-parallel'] ?? registry.spawn_policy.default_max_parallel ?? 3);
  const generatedAt = new Date().toISOString();
  const principal = String(args.principal ?? 'CODEX').trim().toUpperCase();
  const members = roles.map((role, index) => {
    const registryEntry = registry.roles.find((entry) => entry.role === role);
    if (!registryEntry) {
      throw new Error(`Unknown role: ${role}`);
    }
    return {
      role,
      name: generateAgentName(role, registry.naming, index + 1),
      category: registryEntry.category,
      canWrite: registryEntry.can_write,
      bestFor: registryEntry.best_for,
      contract: makeContract(role, goal, taskType, registryEntry)
    };
  });

  const team = {
    generatedAt,
    protocol: registry.protocol,
    pattern: registry.default_pattern,
    goal,
    taskType,
    principal,
    maxParallel,
    members
  };

  const outDir = args.out
    ? path.resolve(ROOT, String(args.out))
    : path.join(ROOT, 'artifacts', `subagent-fabric-${slugify(goal)}-${timestamp()}`);

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'team.json'), `${JSON.stringify(team, null, 2)}\n`);
  await fs.writeFile(path.join(outDir, 'TEAM.md'), buildTeamMarkdown(team));
  await fs.writeFile(path.join(outDir, 'PRINCIPAL_BRIEF.md'), buildPrincipalBrief(team, principal));
  await fs.writeFile(
    path.join(outDir, 'SPAWN_MESSAGES.md'),
    `${members.map((member) => `## ${member.name}\n\n\`\`\`text\n${member.contract}\n\`\`\`\n`).join('\n')}`,
  );

  process.stdout.write(`${outDir}\n`);
}

main().catch((error) => {
  console.error('[subagent-fabric] failed:', error);
  process.exitCode = 1;
});
