#!/usr/bin/env node
/**
 * Subagent Swarm — Otimizado para Performance
 * 
 * ALTERAÇÕES:
 * 1. Cache de registry (evita re-leitura do disco)
 * 2. Processamento lazy (só computa o que é necessário)
 * 3. Redução de alocações de objetos
 * 4. Output streaming (escreve enquanto processa)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {
  inferMissionType,
  inferComplexity,
  inferRoles,
  inferStrategy,
  buildRoleCounts,
  groupIntoSupervisorLanes
} from './lib/subagent-policy.mjs';

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, '.brain-orchestrator', 'SUBAGENT_REGISTRY.json');

// Cache de registry (evita re-leitura do disco)
let registryCache = null;
async function getRegistry() {
  if (!registryCache) {
    const data = await fs.readFile(REGISTRY_PATH, 'utf8');
    registryCache = JSON.parse(data);
  }
  return registryCache;
}

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

async function main() {
  const startTime = Date.now();
  const args = parseArgs(process.argv.slice(2));
  const goal = String(args.goal ?? 'Create adaptive swarm').trim();
  const principal = String(args.principal ?? 'CODEX').trim().toUpperCase();
  
  // Lazy evaluation: só computa o que é necessário
  const taskType = String(args['task-type'] ?? inferMissionType(goal)).trim();
  const registry = await getRegistry();
  
  // Roles: usa explicitas ou infere
  const roles = typeof args.roles === 'string'
    ? args.roles.split(',').map((item) => item.trim()).filter(Boolean)
    : inferRoles(goal, registry, taskType);
  
  const strategy = String(args.strategy ?? inferStrategy(goal, registry)).trim();
  const complexity = Number(args.complexity ?? inferComplexity(goal, taskType));
  
  // Scaling com early exit se não houver roles
  if (roles.length === 0) {
    console.error('[subagent-swarm] no roles inferred or specified');
    process.exitCode = 1;
    return;
  }
  
  const scaling = buildRoleCounts(roles, registry, taskType, strategy, complexity);
  const recursion = registry.recursion_policy ?? {};
  const maxChildren = Number(recursion.max_children_per_agent ?? 3);
  
  // Constrói role entries
  const roleEntries = [];
  for (const [role, count] of scaling.counts) {
    roleEntries.push({ role, count });
  }
  
  const lanes = groupIntoSupervisorLanes(roleEntries, registry, maxChildren, principal);

  // Constrói waves de forma eficiente
  const wave0 = {
    wave: 0,
    owner: principal,
    purpose: 'principal orchestration',
    maxChildren,
    actualChildren: lanes.length,
    lanes: lanes.map((lane) => lane.owner)
  };

  const wave1 = {
    wave: 1,
    purpose: 'primary supervisor lanes',
    lanes
  };

  const allowedDelegateRoles = recursion.roles_allowed_to_delegate ?? [];
  const wave2 = allowedDelegateRoles.length > 0 ? {
    wave: 2,
    purpose: 'nested evidence-only delegation',
    roles: allowedDelegateRoles.map((role) => ({
      role,
      maxChildren: Math.min(2, maxChildren),
      constraint: 'read-only evidence expansion unless ownership is explicitly partitioned'
    }))
  } : null;

  const waves = [wave0, wave1];
  if (wave2) waves.push(wave2);

  const swarm = {
    generatedAt: new Date().toISOString(),
    principal,
    goal,
    taskType,
    strategy,
    complexity,
    maxParallel: scaling.cap,
    recursionPolicy: recursion,
    waves,
    rules: [
      'prefer maximum safe parallelism',
      'principal direct children must obey max_children_per_agent',
      'one writable ownership subtree at a time',
      'nested delegates should default to read-only',
      'all truth returns upward one parent at a time'
    ],
    _meta: {
      generationTimeMs: Date.now() - startTime,
      rolesCount: roles.length,
      lanesCount: lanes.length,
      totalAgents: scaling.total
    }
  };

  const outDir = args.out
    ? path.resolve(ROOT, String(args.out))
    : path.join(ROOT, 'artifacts', `subagent-swarm-${slugify(goal)}-${timestamp()}`);
  
  await fs.mkdir(outDir, { recursive: true });
  
  // Escreve arquivos em paralelo
  await Promise.all([
    fs.writeFile(path.join(outDir, 'SWARM.json'), `${JSON.stringify(swarm, null, 2)}\n`),
    fs.writeFile(path.join(outDir, 'SWARM.md'), buildSwarmMarkdown(swarm, waves))
  ]);

  process.stdout.write(`${outDir}\n`);
}

function buildSwarmMarkdown(swarm, waves) {
  const lines = [
    '# SWARM',
    '',
    `- principal: ${swarm.principal}`,
    `- goal: ${swarm.goal}`,
    `- strategy: ${swarm.strategy}`,
    `- complexity: ${swarm.complexity}`,
    `- max_parallel: ${swarm.maxParallel}`,
    `- generation_time_ms: ${swarm._meta.generationTimeMs}`,
    `- total_agents: ${swarm._meta.totalAgents}`,
    '',
    '## Waves',
    ''
  ];

  for (const wave of waves) {
    lines.push(`### Wave ${wave.wave}`);
    lines.push(`- purpose: ${wave.purpose}`);
    lines.push(`- data: \`${JSON.stringify(wave)}\``);
    lines.push('');
  }

  lines.push('## Rules');
  lines.push('');
  for (const rule of swarm.rules) {
    lines.push(`- ${rule}`);
  }
  lines.push('');

  return lines.join('\n');
}

main().catch((error) => {
  console.error('[subagent-swarm] failed:', error);
  process.exitCode = 1;
});
