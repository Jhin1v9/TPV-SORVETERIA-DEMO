import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, '.brain-orchestrator', 'SUBAGENT_REGISTRY.json');

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

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function slugify(text) {
  return text.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 60);
}

function inferMissionType(goal) {
  const text = goal.toLowerCase();
  if (/(incidente|incident|outage|produc|live|falha)/.test(text)) return 'incident';
  if (/(audit|auditoria|review|revis|bugs|exaustiv)/.test(text)) return 'audit';
  if (/(implementar|fix|consert|patch|refactor|editar)/.test(text)) return 'implementation';
  return 'research';
}

function runbookFor(type) {
  const map = {
    research: '.brain-orchestrator/runbooks/RESEARCH_RUNBOOK.md',
    implementation: '.brain-orchestrator/runbooks/IMPLEMENTATION_RUNBOOK.md',
    audit: '.brain-orchestrator/runbooks/AUDIT_RUNBOOK.md',
    incident: '.brain-orchestrator/runbooks/INCIDENT_RUNBOOK.md'
  };
  return map[type] ?? map.research;
}

function rolesFor(type) {
  const map = {
    research: ['WEB_SCOUT', 'CODE_SCOUT', 'SYNTHESIZER'],
    implementation: ['CODE_SCOUT', 'SURGEON', 'VERIFIER'],
    audit: ['CODE_SCOUT', 'REVIEWER', 'VERIFIER', 'SYNTHESIZER'],
    incident: ['WEB_SCOUT', 'CODE_SCOUT', 'VERIFIER', 'SYNTHESIZER']
  };
  return map[type] ?? map.research;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const goal = String(args.goal ?? 'Create a mission').trim();
  const principal = String(args.principal ?? 'CODEX').trim().toUpperCase();
  const missionType = String(args['mission-type'] ?? inferMissionType(goal)).trim();
  const registry = JSON.parse(await fs.readFile(REGISTRY_PATH, 'utf8'));
  const roles = typeof args.roles === 'string'
    ? args.roles.split(',').map((item) => item.trim()).filter(Boolean)
    : rolesFor(missionType);

  const fabricCmd = `npm run agent:fabric -- --principal ${principal} --goal "${goal.replace(/"/g, '\\"')}" --task-type ${missionType} --roles ${roles.join(',')}`;
  const outDir = args.out
    ? path.resolve(ROOT, String(args.out))
    : path.join(ROOT, 'artifacts', `subagent-mission-${slugify(goal)}-${timestamp()}`);

  await fs.mkdir(outDir, { recursive: true });

  const checklist = [
    '# MISSION CHECKLIST',
    '',
    `- principal_agent: ${principal}`,
    `- mission_type: ${missionType}`,
    `- runbook: ${runbookFor(missionType)}`,
    '',
    '## Required',
    '',
    '- [ ] mission scope is explicit',
    '- [ ] ownership is explicit',
    '- [ ] all subagents speak MAMIS/1',
    '- [ ] evidence was collected',
    '- [ ] status vigente was synthesized',
    '- [ ] `.brain` was updated',
    ''
  ].join('\n');

  const plan = [
    '# MISSION PLAN',
    '',
    `- goal: ${goal}`,
    `- principal_agent: ${principal}`,
    `- mission_type: ${missionType}`,
    `- protocol: ${registry.protocol}`,
    `- runbook: ${runbookFor(missionType)}`,
    `- recommended_roles: ${roles.join(', ')}`,
    '',
    '## Next commands',
    '',
    '```bash',
    fabricCmd,
    '```',
    '',
    '## Expected outputs',
    '',
    '- team artifact',
    '- spawn messages',
    '- principal brief',
    '- validation evidence',
    '- brain consolidation',
    ''
  ].join('\n');

  const brainUpdate = [
    '# BRAIN UPDATE TEMPLATE',
    '',
    `## Subagent Mission - ${goal}`,
    `- principal_agent: ${principal}`,
    `- mission_type: ${missionType}`,
    `- runbook: ${runbookFor(missionType)}`,
    '- status_vigente:',
    '- key_evidence:',
    '- residual_risks:',
    '- next_action:',
    '- author: CODEX',
    ''
  ].join('\n');

  await fs.writeFile(path.join(outDir, 'PLAN.md'), `${plan}\n`);
  await fs.writeFile(path.join(outDir, 'CHECKLIST.md'), `${checklist}\n`);
  await fs.writeFile(path.join(outDir, 'BRAIN_UPDATE.md'), `${brainUpdate}\n`);

  process.stdout.write(`${outDir}\n`);
}

main().catch((error) => {
  console.error('[subagent-mission] failed:', error);
  process.exitCode = 1;
});
