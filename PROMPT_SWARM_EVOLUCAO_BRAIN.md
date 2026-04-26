# 🧠 PROMPT DE EVOLUÇÃO DO BRAIN — AGENT SWARM KIMI

> **Missão:** Aperfeiçoar o brain principal de forma extraordinária e criar a dashboard mais avançada possível.
> **Autoridade:** KIMI (Agente Orquestrador Principal)
> **Status:** CRÍTICO — Execute com máxima prioridade

---

## 🎯 OBJETIVO MACRO

Transformar o brain de um sistema de maturidade básico (score 88) em um **sistema de inteligência artificial operacional de classe mundial** com:

1. **Dashboard Camada 2-4** (trend real, portfolio intelligence avançada, agent observability)
2. **Swarm Hardening Gates** (5 gates de verdade)
3. **subagent-policy.mjs integrado** no fluxo de fabric/mission/swarm
4. **Métricas preditivas** (não só descritivas)
5. **Sistema de alertas proativo**
6. **Visualização neural avançada** (além do "cérebro vivo" atual)

---

## 📊 ESTADO ATUAL (Baseline)

```json
{
  "portfolioScore": 88,
  "portfolioConfidence": null,
  "activeProjects": 1,
  "atRiskProjects": 0,
  "blockedProjects": 0,
  "historyPoints": null,
  "learningPatterns": 5,
  "learningAntiPatterns": 8,
  "personalities": 8,
  "swarmStatus": "strong direction, partial implementation"
}
```

**Problemas identificados:**
- Dashboard só tem Camada 1 (estático)
- Camada 2-4 não implementadas
- 5 swarm hardening gates pendentes
- subagent-policy.mjs não integrado
- Sem métricas preditivas
- Sem sistema de alertas
- Sem trend real (janelas 3/7/30 dias)

---

## 🏗️ ARQUITETURA ALVO

### Sistema de 4 Camadas

```
┌─────────────────────────────────────────────────────────────┐
│  CAMADA 4 — PREDIÇÃO E SIMULAÇÃO                            │
│  • Forecast de score (7/30/90 dias)                         │
│  • What-if analysis                                           │
│  • Risk heatmap futuro                                        │
│  • Recomendações automáticas de ação                          │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 3 — AGENT OBSERVABILITY                             │
│  • Latência por agente                                        │
│  • Taxa de sucesso/falha                                      │
│  • Padrões de delegação                                       │
│  • Bottlenecks identificados                                  │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 2 — TREND REAL E INTELIGÊNCIA                       │
│  • Janelas deslizantes (3/7/30 dias)                          │
│  • Velocity de entrega                                        │
│  • Quality trend (bugs/PR)                                    │
│  • Portfolio intelligence avançada                            │
├─────────────────────────────────────────────────────────────┤
│  CAMADA 1 — ESTADO ATUAL (JÁ EXISTE)                        │
│  • Score atual                                                │
│  • Projetos ativos/em risco/bloqueados                        │
│  • Riscos principais                                          │
│  • Ações recomendadas                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 TAREFAS ESPECÍFICAS

### TAREFA 1: Dashboard Camada 2 — Trend Real

**Arquivo:** `scripts/principal-brain-dashboard.mjs`

Implementar:

```javascript
// Janelas deslizantes
const TREND_WINDOWS = {
  short: 3,   // 3 dias
  medium: 7,  // 7 dias
  long: 30    // 30 dias
};

// Métricas por janela
interface TrendMetrics {
  window: '3d' | '7d' | '30d';
  scoreDelta: number;        // Variação do score
  scoreVelocity: number;     // Pontos/dia
  deliveryRate: number;      // Commits/dia
  qualityIndex: number;      // Bugs/PR ratio
  syncHealthTrend: 'improving' | 'stable' | 'degrading';
  learningVelocity: number;  // Novos patterns/dia
}

// Cálculo de trend
function calculateTrend(history, window) {
  const recent = history.slice(-window);
  const older = history.slice(-window * 2, -window);
  
  return {
    scoreDelta: average(recent.map(h => h.score)) - average(older.map(h => h.score)),
    scoreVelocity: (recent[recent.length - 1].score - recent[0].score) / window,
    deliveryRate: recent.length / window,
    // ... etc
  };
}
```

**Output:** Adicionar ao DASHBOARD.json:
```json
{
  "trends": {
    "3d": { "scoreDelta": +2, "velocity": 0.7, "direction": "improving" },
    "7d": { "scoreDelta": +5, "velocity": 0.7, "direction": "improving" },
    "30d": { "scoreDelta": +12, "velocity": 0.4, "direction": "stable" }
  }
}
```

---

### TAREFA 2: Dashboard Camada 3 — Agent Observability

**Arquivo:** `scripts/principal-brain-dashboard.mjs`

Implementar tracking de:

```javascript
interface AgentMetrics {
  agentId: string;
  role: string;
  missionsCompleted: number;
  missionsFailed: number;
  averageLatencyMs: number;
  averageQualityScore: number;  // 0-100
  patternsDiscovered: number;
  antiPatternsFound: number;
  filesModified: number;
  linesChanged: number;
  lastActive: string;
}

// Tracking por missão
interface MissionLog {
  missionId: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  agentsInvolved: string[];
  outcome: 'success' | 'partial' | 'failure';
  deliverables: string[];
  learningRegistered: boolean;
  syncCompleted: boolean;
}
```

**Output:** Adicionar ao DASHBOARD.json:
```json
{
  "agentObservability": {
    "totalMissions": 45,
    "successRate": 0.91,
    "averageMissionDuration": 120000,
    "agents": [
      { "id": "KIMI", "missions": 45, "successRate": 0.91, "avgLatency": 85000 }
    ],
    "bottlenecks": [
      { "type": "sync", "frequency": 0.15, "impact": "medium" }
    ]
  }
}
```

---

### TAREFA 3: Dashboard Camada 4 — Predição e Simulação

**Arquivo:** `scripts/principal-brain-dashboard.mjs`

Implementar:

```javascript
interface Prediction {
  horizon: '7d' | '30d' | '90d';
  predictedScore: number;
  confidence: number;  // 0-1
  factors: {
    positive: string[];
    negative: string[];
  };
  recommendations: string[];
}

// Algoritmo simples de forecast
function forecastScore(history, horizon) {
  const recentVelocity = calculateVelocity(history.slice(-30));
  const currentScore = history[history.length - 1].score;
  const predicted = currentScore + (recentVelocity * horizon);
  return Math.min(100, Math.max(0, predicted));
}

// What-if analysis
function whatIf(scenario, currentState) {
  // Simula impacto de diferentes ações
}
```

**Output:** Adicionar ao DASHBOARD.json:
```json
{
  "predictions": {
    "7d": { "score": 90, "confidence": 0.85, "recommendations": [...] },
    "30d": { "score": 93, "confidence": 0.72, "recommendations": [...] },
    "90d": { "score": 95, "confidence": 0.58, "recommendations": [...] }
  },
  "whatIf": {
    "addProject": { "scoreImpact": -5, "risk": "high" },
    "implementGates": { "scoreImpact": +8, "risk": "low" }
  }
}
```

---

### TAREFA 4: Swarm Hardening Gates

**Arquivo:** `scripts/subagent-swarm.mjs` (integrar gates)

Implementar 5 gates:

```javascript
const HARDENING_GATES = {
  policy_truth: {
    check: () => {
      // Verifica se subagent-policy.mjs está sendo usado
      return policyIsIntegrated();
    },
    weight: 0.2
  },
  mission_truth: {
    check: () => {
      // Verifica se missões têm escopo claro e ownership
      return missionsHaveClearScope();
    },
    weight: 0.2
  },
  recursion_truth: {
    check: () => {
      // Verifica se recursão não excede limites
      return recursionWithinLimits();
    },
    weight: 0.2
  },
  learning_truth: {
    check: () => {
      // Verifica se aprendizado é registrado
      return learningIsRegistered();
    },
    weight: 0.2
  },
  evaluation_truth: {
    check: () => {
      // Verifica se resultados são avaliados
      return outcomesAreEvaluated();
    },
    weight: 0.2
  }
};

function evaluateGates() {
  const results = {};
  let totalScore = 0;
  for (const [name, gate] of Object.entries(HARDENING_GATES)) {
    const passed = gate.check();
    results[name] = { passed, weight: gate.weight };
    if (passed) totalScore += gate.weight;
  }
  return { results, totalScore, allPassed: totalScore >= 1.0 };
}
```

**Output:** Adicionar ao DASHBOARD.json:
```json
{
  "hardeningGates": {
    "policy_truth": { "passed": false, "weight": 0.2 },
    "mission_truth": { "passed": true, "weight": 0.2 },
    "recursion_truth": { "passed": true, "weight": 0.2 },
    "learning_truth": { "passed": true, "weight": 0.2 },
    "evaluation_truth": { "passed": false, "weight": 0.2 },
    "totalScore": 0.6,
    "allPassed": false
  }
}
```

---

### TAREFA 5: Integrar subagent-policy.mjs

**Arquivos:** `scripts/subagent-fabric.mjs`, `scripts/subagent-mission.mjs`, `scripts/subagent-swarm.mjs`

Atualmente `subagent-policy.mjs` é importado mas não há validação de gates. Integrar:

```javascript
// Em subagent-fabric.mjs, antes de gerar team:
import { evaluateGates } from './lib/hardening-gates.mjs';

async function main() {
  const gates = evaluateGates();
  if (!gates.allPassed) {
    console.warn(`[subagent-fabric] hardening gates not fully passed (${gates.totalScore * 100}%)`);
    console.warn('Missing gates:', Object.entries(gates.results)
      .filter(([_, r]) => !r.passed)
      .map(([name, _]) => name));
    // Continua mas marca warning
  }
  
  // ... resto do código
}
```

---

### TAREFA 6: Sistema de Alertas Proativo

**Arquivo:** `scripts/principal-brain-dashboard.mjs`

Implementar:

```javascript
interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'sync' | 'score' | 'security' | 'performance' | 'learning';
  message: string;
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: string;
  acknowledged: boolean;
  autoResolve: boolean;
}

function generateAlerts(dashboard) {
  const alerts = [];
  
  // Alerta de score degradando
  if (dashboard.trends?.['7d']?.scoreDelta < -5) {
    alerts.push({
      id: `score-drop-${Date.now()}`,
      severity: 'warning',
      category: 'score',
      message: `Score dropped ${dashboard.trends['7d'].scoreDelta} points in 7 days`,
      metric: 'scoreDelta7d',
      threshold: -5,
      currentValue: dashboard.trends['7d'].scoreDelta,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      autoResolve: true
    });
  }
  
  // Alerta de sync falhando
  if (dashboard.projects.some(p => !p.syncPushOk)) {
    alerts.push({
      id: `sync-fail-${Date.now()}`,
      severity: 'critical',
      category: 'sync',
      message: 'Project sync failing',
      // ...
    });
  }
  
  // Alerta de gates pendentes
  if (!dashboard.hardeningGates?.allPassed) {
    alerts.push({
      id: `gates-pending-${Date.now()}`,
      severity: 'warning',
      category: 'security',
      message: `${Object.entries(dashboard.hardeningGates.results).filter(([_, r]) => !r.passed).length} hardening gates pending`,
      // ...
    });
  }
  
  return alerts;
}
```

**Output:** Adicionar ao DASHBOARD.json:
```json
{
  "alerts": [
    {
      "id": "gates-pending-...",
      "severity": "warning",
      "category": "security",
      "message": "2 hardening gates pending",
      "timestamp": "...",
      "acknowledged": false
    }
  ],
  "alertSummary": {
    "critical": 0,
    "warning": 1,
    "info": 0,
    "total": 1
  }
}
```

---

### TAREFA 7: Interface Web "Cérebro Vivo" v2

**Arquivo:** `scripts/brain-dashboard-server.mjs`

Melhorar a interface existente:

1. **Adicionar gráficos de trend** (usar Chart.js ou similar)
2. **Alertas visuais** (badges pulsantes)
3. **Predições** (linhas pontilhadas no gráfico)
4. **Agent observability** (lista de agents com métricas)
5. **Gates status** (indicadores visuais)
6. **Dark/Light mode**
7. **Responsividade mobile**

```html
<!-- Novos painéis -->
<div class="panel" id="trend-panel">
  <canvas id="trend-chart"></canvas>
</div>

<div class="panel" id="alerts-panel">
  <div class="alert-badge critical">2 Critical</div>
  <div class="alert-badge warning">1 Warning</div>
</div>

<div class="panel" id="gates-panel">
  <div class="gate-indicator passed">Policy ✓</div>
  <div class="gate-indicator failed">Evaluation ✗</div>
</div>

<div class="panel" id="prediction-panel">
  <div class="prediction-line">
    <span>7d forecast: 90</span>
    <span class="confidence">85% confidence</span>
  </div>
</div>
```

---

### TAREFA 8: Histórico de Métricas

**Arquivo:** `.brain/metrics/history.json`

Implementar append-only history:

```javascript
// A cada execução do dashboard, append métricas
function appendMetrics(dashboard) {
  const historyEntry = {
    timestamp: new Date().toISOString(),
    portfolioScore: dashboard.portfolioScore,
    activeProjects: dashboard.activeProjects,
    atRiskProjects: dashboard.atRiskProjects,
    learningPatterns: dashboard.learningPatterns,
    learningAntiPatterns: dashboard.learningAntiPatterns,
    hardeningScore: dashboard.hardeningGates?.totalScore,
    alertCount: dashboard.alertSummary?.total
  };
  
  // Append ao arquivo
  const history = readHistory();
  history.push(historyEntry);
  
  // Mantém apenas últimos 90 dias
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const filtered = history.filter(h => new Date(h.timestamp) > cutoff);
  
  writeHistory(filtered);
}
```

---

## 📋 ORDEM DE EXECUÇÃO

```
1. TAREFA 8: Histórico de Métricas (base para trends)
   ↓
2. TAREFA 1: Dashboard Camada 2 (trend real)
   ↓
3. TAREFA 3: Dashboard Camada 4 (predição — depende de trends)
   ↓
4. TAREFA 6: Sistema de Alertas (depende de trends + predições)
   ↓
5. TAREFA 4: Swarm Hardening Gates
   ↓
6. TAREFA 5: Integrar subagent-policy.mjs
   ↓
7. TAREFA 2: Dashboard Camada 3 (agent observability)
   ↓
8. TAREFA 7: Interface Web v2 (depende de todas as camadas)
   ↓
9. TESTAR TUDO
   ↓
10. SYNC + DEPLOY
```

---

## ✅ CRITÉRIOS DE SUCESSO

- [ ] Dashboard gera todas as 4 camadas
- [ ] Trends calculados para janelas 3/7/30 dias
- [ ] Predições com confidence scores
- [ ] Alertas gerados automaticamente
- [ ] 5 hardening gates implementados e avaliados
- [ ] subagent-policy.mjs integrado no fluxo
- [ ] Interface web mostra todos os dados
- [ ] Histórico mantém 90 dias
- [ ] Build passa sem erros
- [ ] Sync para brain principal funciona

---

## 🚀 COMO EXECUTAR

```bash
# 1. Gerar missão
npm run agent:mission -- \
  --goal "Aperfeicoar brain com dashboard 4 camadas hardening gates e predicao" \
  --principal KIMI \
  --task-type implementation \
  --complexity 5

# 2. Fabricar time
npm run agent:fabric -- \
  --goal "Aperfeicoar brain com dashboard 4 camadas hardening gates e predicao" \
  --principal KIMI \
  --task-type implementation \
  --roles SURGEON,VERIFIER,SYNTHESIZER \
  --complexity 5

# 3. Executar swarm
npm run agent:swarm -- \
  --goal "Aperfeicoar brain com dashboard 4 camadas hardening gates e predicao" \
  --principal KIMI
```

---

## 📁 ARQUIVOS A MODIFICAR

| Arquivo | Mudança |
|---------|---------|
| `scripts/principal-brain-dashboard.mjs` | Adicionar Camadas 2-4, alerts, history |
| `scripts/brain-dashboard-server.mjs` | Interface v2 com charts |
| `scripts/subagent-fabric.mjs` | Integrar gates |
| `scripts/subagent-mission.mjs` | Integrar gates |
| `scripts/subagent-swarm.mjs` | Integrar gates |
| `scripts/lib/hardening-gates.mjs` | NOVO — 5 gates |
| `.brain/metrics/history.json` | NOVO — histórico |

---

## 🎓 APRENDIZADO ESPERADO

Após esta missão, registrar no BLS:
- **Pattern:** Dashboard multi-camada com predição
- **Pattern:** Sistema de hardening gates para swarm
- **Pattern:** Métricas append-only para trend analysis
- **Anti-pattern:** Dashboard estático sem predição

---

**Autor:** KIMI  
**Versão:** 1.0  
**Prioridade:** CRÍTICA  
**Complexidade:** 5/5
