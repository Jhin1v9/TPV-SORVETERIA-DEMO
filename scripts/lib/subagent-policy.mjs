/**
 * Subagent Policy Engine — Otimizado para Performance
 * 
 * ALTERAÇÕES DE PERFORMANCE:
 * 1. Cache de regex compilados (evita recompilação a cada chamada)
 * 2. Early returns em inferComplexity
 * 3. Mapas pré-computados em vez de arrays
 * 4. Redução de iterações em buildRoleCounts
 * 5. groupIntoSupervisorLanes simplificado
 */

// ─── Cache de Regex Compilados ─────────────────────────────────────
const REGEX_CACHE = new Map();
function getRegex(pattern) {
  if (!REGEX_CACHE.has(pattern)) {
    REGEX_CACHE.set(pattern, new RegExp(pattern));
  }
  return REGEX_CACHE.get(pattern);
}

// Regex pré-compilados para inferMissionType
const MISSION_TYPE_REGEX = {
  incident: /(incidente|incident|outage|produc|live|falha)/,
  audit: /(audit|auditoria|review|revis|bugs|exaustiv)/,
  implementation: /(implementar|fix|consert|patch|refactor|editar)/
};

// Regex pré-compilados para inferRoles
const ROLE_REGEX = {
  WEB_SCOUT: /(pesquisa|research|web|internet|docs|benchmark|referenc)/,
  CODE_SCOUT: /(codigo|repo|arquiv|analis|trace|mapear|map)/,
  SURGEON: /(implementar|fix|consert|patch|refactor|mudar|editar)/,
  VERIFIER: /(test|valid|smoke|build|verifica)/,
  REVIEWER: /(review|revis|risco|auditoria)/
};

// Regex pré-compilados para inferComplexity
const COMPLEXITY_REGEX = {
  high: /(exaustiv|supremo|deep|profund|completo|massiv|large|grande|max)/,
  medium: /(paralel|swarm|multi|muitos|varios|vários|todos)/,
  research: /(research|pesquisa|audit|auditoria|incident|incidente)/
};

// Regex pré-compilados para inferStrategy
const STRATEGY_REGEX = {
  aggressive: /(maximo|máximo|maximum|swarm|todos|paralel|exaustiv|supremo)/,
  conservative: /(leve|light|minim|small)/
};

// ─── Funções Utilitárias Otimizadas ────────────────────────────────

function availableRoleSet(registry) {
  // Usa Set diretamente sem array intermediário
  const set = new Set();
  for (const entry of registry.roles ?? []) {
    set.add(entry.role);
  }
  return set;
}

function uniqueRoles(roles, registry) {
  const allowed = availableRoleSet(registry);
  const seen = new Set();
  const result = [];
  for (const role of roles) {
    if (!seen.has(role) && allowed.has(role)) {
      seen.add(role);
      result.push(role);
    }
  }
  return result;
}

// ─── Inferência Otimizada ──────────────────────────────────────────

export function inferMissionType(goal) {
  const text = goal.toLowerCase();
  if (MISSION_TYPE_REGEX.incident.test(text)) return 'incident';
  if (MISSION_TYPE_REGEX.audit.test(text)) return 'audit';
  if (MISSION_TYPE_REGEX.implementation.test(text)) return 'implementation';
  return 'research';
}

export function recommendedRolesForTaskType(taskType) {
  // Mapa estático em vez de objeto recriado
  switch (taskType) {
    case 'research': return ['WEB_SCOUT', 'CODE_SCOUT', 'SYNTHESIZER'];
    case 'implementation': return ['CODE_SCOUT', 'SURGEON', 'VERIFIER'];
    case 'audit': return ['CODE_SCOUT', 'REVIEWER', 'VERIFIER', 'SYNTHESIZER'];
    case 'incident': return ['WEB_SCOUT', 'CODE_SCOUT', 'VERIFIER', 'SYNTHESIZER'];
    default: return ['CODE_SCOUT', 'SYNTHESIZER'];
  }
}

export function inferRoles(goal, registry, taskType = inferMissionType(goal)) {
  const text = goal.toLowerCase();
  const picks = [];
  const pickSet = new Set(); // Para verificação O(1)
  
  const add = (role) => {
    if (!pickSet.has(role)) {
      pickSet.add(role);
      picks.push(role);
    }
  };

  // Verificações de regex em ordem de probabilidade
  if (ROLE_REGEX.SURGEON.test(text)) add('SURGEON');
  if (ROLE_REGEX.CODE_SCOUT.test(text)) add('CODE_SCOUT');
  if (ROLE_REGEX.WEB_SCOUT.test(text)) add('WEB_SCOUT');
  if (ROLE_REGEX.VERIFIER.test(text)) add('VERIFIER');
  if (ROLE_REGEX.REVIEWER.test(text)) add('REVIEWER');

  // Defaults por task type
  for (const role of recommendedRolesForTaskType(taskType)) {
    add(role);
  }

  if (!pickSet.has('SYNTHESIZER') && taskType !== 'implementation') {
    add('SYNTHESIZER');
  }

  return uniqueRoles(picks, registry);
}

export function inferComplexity(goal, taskType) {
  const text = `${goal} ${taskType}`.toLowerCase();
  let score = 1;
  if (COMPLEXITY_REGEX.high.test(text)) score += 2;
  else if (COMPLEXITY_REGEX.medium.test(text)) score += 2;
  else if (COMPLEXITY_REGEX.research.test(text)) score += 1;
  return Math.min(score, 5);
}

export function inferStrategy(goal, registry) {
  const text = goal.toLowerCase();
  if (STRATEGY_REGEX.aggressive.test(text)) {
    return registry.spawn_policy?.default_strategy ?? 'aggressive-safe';
  }
  if (STRATEGY_REGEX.conservative.test(text)) return 'conservative';
  return 'balanced';
}

// ─── Scaling Otimizado ─────────────────────────────────────────────

function resolveParallelCap(strategy, registry) {
  const strategyCap = Number(strategy?.max_parallel ?? registry.spawn_policy?.default_max_parallel ?? 3);
  const recursionCap = Number(registry.recursion_policy?.max_parallel_global ?? strategyCap);
  const hardCap = Number(registry.spawn_policy?.hard_max_parallel ?? strategyCap);
  return Math.min(strategyCap, recursionCap, hardCap);
}

export function buildRoleCounts(roles, registry, taskType, strategyName, complexity) {
  const safeRoles = uniqueRoles(roles, registry);
  const strategy = registry.adaptive_scaling?.strategies?.[strategyName]
    ?? registry.adaptive_scaling?.strategies?.balanced
    ?? { max_parallel: registry.spawn_policy?.default_max_parallel ?? 3 };
  const caps = registry.adaptive_scaling?.role_caps ?? {};
  const counts = new Map();
  const cap = resolveParallelCap(strategy, registry);

  // Mapa de configuração por task type
  const taskConfig = {
    research: { WEB_SCOUT: 'research_web_scouts', CODE_SCOUT: 'research_code_scouts', SYNTHESIZER: 1 },
    implementation: { CODE_SCOUT: 'research_code_scouts', SURGEON: 'implementation_surgeons', VERIFIER: 'validation_verifiers' },
    audit: { CODE_SCOUT: 'research_code_scouts', REVIEWER: 'reviewer', VERIFIER: 'validation_verifiers', SYNTHESIZER: 1 },
    incident: { WEB_SCOUT: 'research_web_scouts', CODE_SCOUT: 'research_code_scouts', VERIFIER: 'validation_verifiers', SYNTHESIZER: 1 }
  };

  const config = taskConfig[taskType] ?? {};
  
  // Aplica configuração base
  for (const [role, value] of Object.entries(config)) {
    if (!safeRoles.includes(role)) continue;
    const base = typeof value === 'string' ? Number(strategy[value] ?? 1) : value;
    counts.set(role, Math.max(1, base));
  }

  // Adiciona roles faltantes com count 1
  for (const role of safeRoles) {
    if (!counts.has(role)) {
      counts.set(role, 1);
    }
  }

  // Ajuste por estratégia
  if (strategyName === 'aggressive-safe') {
    for (const [role, count] of counts) {
      if (role !== 'SYNTHESIZER') {
        counts.set(role, count + Math.max(0, complexity - 2));
      }
    }
  } else if (strategyName === 'balanced' && complexity >= 4) {
    for (const [role, count] of counts) {
      if (role !== 'SYNTHESIZER') {
        counts.set(role, count + 1);
      }
    }
  }

  // Aplica caps por role
  for (const [role, count] of counts) {
    const roleCap = Number(caps[role] ?? count);
    if (count > roleCap) {
      counts.set(role, roleCap);
    }
  }

  // Reduz se excede cap global (algoritmo O(n) em vez de while loop)
  let total = 0;
  for (const count of counts.values()) total += count;

  if (total > cap) {
    const excess = total - cap;
    const reducible = [];
    for (const [role, count] of counts) {
      if (role !== 'SYNTHESIZER' && count > 1) {
        reducible.push({ role, count, reducible: count - 1 });
      }
    }
    
    // Ordena por maior capacidade de redução
    reducible.sort((a, b) => b.reducible - a.reducible);
    
    let remaining = excess;
    for (const item of reducible) {
      if (remaining <= 0) break;
      const reduceBy = Math.min(item.reducible, remaining);
      counts.set(item.role, item.count - reduceBy);
      remaining -= reduceBy;
    }
  }

  return { counts, cap, strategy, total: Math.min(total, cap) };
}

export function childDelegationAllowed(role, registry, depth) {
  const policy = registry.recursion_policy ?? {};
  if (!policy.allow_nested_delegation) return false;
  if (depth >= Number(policy.max_depth ?? 2)) return false;
  
  const never = policy.roles_never_delegate ?? [];
  for (const r of never) {
    if (r === role) return false;
  }
  
  const allowed = policy.roles_allowed_to_delegate ?? [];
  for (const r of allowed) {
    if (r === role) return true;
  }
  
  return false;
}

export function groupIntoSupervisorLanes(entries, registry, maxChildrenPerAgent, principal) {
  const limit = Math.max(1, Number(maxChildrenPerAgent ?? 1));
  const maxWriteAgents = Math.max(1, Number(registry.recursion_policy?.max_write_agents_per_parent ?? 1));
  
  // Mapa de metadados de role para lookup O(1)
  const roleMeta = new Map();
  for (const entry of registry.roles ?? []) {
    roleMeta.set(entry.role, entry);
  }

  // Cria slots
  const slots = [];
  for (const entry of entries) {
    const count = Number(entry.count ?? 0);
    if (count <= 0) continue;
    
    const meta = roleMeta.get(entry.role);
    const canWrite = Boolean(meta?.can_write);
    
    if (canWrite) {
      // Cada agente com write fica em slot separado
      for (let i = 0; i < count; i++) {
        slots.push({ role: entry.role, count: 1, writeAgents: 1 });
      }
    } else {
      // Agrupa read-only agents em chunks
      let remaining = count;
      while (remaining > 0) {
        const chunk = Math.min(remaining, limit);
        slots.push({ role: entry.role, count: chunk, writeAgents: 0 });
        remaining -= chunk;
      }
    }
  }

  // Ordena: write agents primeiro, depois por count decrescente
  slots.sort((a, b) => {
    if (b.writeAgents !== a.writeAgents) return b.writeAgents - a.writeAgents;
    return b.count - a.count;
  });

  // Distribui em lanes
  const lanes = [];
  for (const slot of slots) {
    let lane = null;
    
    // Procura lane existente que aceite o slot
    for (const candidate of lanes) {
      if (candidate.directChildren + slot.count <= limit &&
          candidate.writeAgents + slot.writeAgents <= maxWriteAgents) {
        lane = candidate;
        break;
      }
    }
    
    // Cria nova lane se necessário
    if (!lane) {
      lane = {
        lane: lanes.length + 1,
        owner: `${principal}-lane-${lanes.length + 1}`,
        roles: [],
        directChildren: 0,
        directRoleSlots: 0,
        writeAgents: 0
      };
      lanes.push(lane);
    }

    lane.roles.push({ role: slot.role, count: slot.count });
    lane.directChildren += slot.count;
    lane.directRoleSlots += 1;
    lane.writeAgents += slot.writeAgents;
  }

  return lanes;
}
