#!/usr/bin/env node
/**
 * Brain Dashboard Server — Interface web tipo "cérebro vivo"
 * WebSocket + HTML5 Canvas para visualização em tempo real
 */

import { createServer } from 'node:http';
import { readFile, watch } from 'node:fs/promises';
import { WebSocketServer } from 'ws';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PRINCIPAL_BRAIN = 'C:\\Users\\Administrator\\Documents\\.brain';
const PORT = Number(process.env.BRAIN_DASHBOARD_PORT || 3333);

// ─── Estado do Brain (carregado do disco) ─────────────────────────

let brainState = {
  projects: [],
  portfolioScore: 0,
  portfolioConfidence: 0,
  activeProjects: 0,
  atRiskProjects: 0,
  blockedProjects: 0,
  integrityAlerts: 0,
  topRisks: [],
  lastSync: null,
  generatedAt: null,
  historyPoints: 0,
  syncHealth: 'unknown',
  learningPatterns: 0,
  learningAntiPatterns: 0,
  personalities: 0,
  swarmStatus: 'unknown'
};

async function loadBrainState() {
  try {
    const dashboardJson = JSON.parse(await readFile(path.join(PRINCIPAL_BRAIN, 'DASHBOARD.json'), 'utf8'));
    const projectsJson = JSON.parse(await readFile(path.join(PRINCIPAL_BRAIN, 'PROJECTS.json'), 'utf8'));
    
    // Contar learning
    let patterns = 0, antiPatterns = 0;
    try {
      const patternsData = JSON.parse(await readFile(path.join(PRINCIPAL_BRAIN, 'learning', 'patterns.json'), 'utf8'));
      patterns = patternsData.patterns?.length || 0;
    } catch {}
    try {
      const antiData = JSON.parse(await readFile(path.join(PRINCIPAL_BRAIN, 'learning', 'anti-patterns.json'), 'utf8'));
      antiPatterns = antiData.antiPatterns?.length || 0;
    } catch {}

    // Contar personalidades
    let personalities = 0;
    try {
      const { readdir } = await import('node:fs/promises');
      const files = await readdir(path.join(PRINCIPAL_BRAIN, 'personalities'));
      personalities = files.filter(f => f.endsWith('.md')).length;
    } catch {}

    brainState = {
      projects: dashboardJson.projects || [],
      portfolioScore: dashboardJson.portfolioScore || 0,
      portfolioConfidence: dashboardJson.portfolioConfidence || 0,
      activeProjects: dashboardJson.activeProjects || 0,
      atRiskProjects: dashboardJson.atRiskProjects || 0,
      blockedProjects: dashboardJson.blockedProjects || 0,
      integrityAlerts: dashboardJson.integrityAlerts || 0,
      topRisks: dashboardJson.topRisks || [],
      lastSync: projectsJson.projects?.[0]?.lastSyncAt || null,
      generatedAt: dashboardJson.generatedAt || new Date().toISOString(),
      historyPoints: dashboardJson.historyPoints || 0,
      syncHealth: dashboardJson.projects?.[0]?.trend || 'unknown',
      learningPatterns: patterns,
      learningAntiPatterns: antiPatterns,
      personalities,
      swarmStatus: 'strong direction, partial implementation'
    };
  } catch (err) {
    console.log('[brain-dashboard] failed to load state:', err.message);
  }
}

// ─── HTTP Server (serve HTML estático) ─────────────────────────────

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>🧠 Brain Dashboard — Cérebro Vivo</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #0a0a0f;
  color: #e0e0e0;
  font-family: 'Segoe UI', system-ui, sans-serif;
  overflow: hidden;
  height: 100vh;
}
#brain-canvas {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 1;
}
#ui-layer {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 10;
  pointer-events: none;
}
.panel {
  position: absolute;
  background: rgba(10, 10, 15, 0.85);
  border: 1px solid rgba(100, 200, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  pointer-events: auto;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}
.panel:hover {
  border-color: rgba(100, 200, 255, 0.4);
  box-shadow: 0 0 30px rgba(100, 200, 255, 0.1);
}
.panel-header {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #64c8ff;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.pulse-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #00ff88;
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
.score-big {
  font-size: 48px;
  font-weight: 200;
  color: #fff;
  line-height: 1;
}
.score-label {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}
.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-size: 13px;
}
.metric-row:last-child { border-bottom: none; }
.metric-value { font-weight: 600; color: #64c8ff; }
.metric-value.warning { color: #ffaa00; }
.metric-value.danger { color: #ff4444; }
.metric-value.success { color: #00ff88; }
.project-node {
  position: absolute;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(5px);
  transition: all 0.5s ease;
  cursor: pointer;
}
.project-node:hover {
  transform: scale(1.1);
  z-index: 100;
}
.project-node.healthy { border-color: #00ff88; color: #00ff88; }
.project-node.warning { border-color: #ffaa00; color: #ffaa00; }
.project-node.danger { border-color: #ff4444; color: #ff4444; }
#status-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  height: 32px;
  background: rgba(10,10,15,0.9);
  border-top: 1px solid rgba(100,200,255,0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  font-size: 11px;
  color: #666;
  z-index: 20;
}
#status-bar .live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #00ff88;
}
.risk-item {
  padding: 4px 8px;
  margin: 2px 0;
  border-radius: 4px;
  font-size: 11px;
  background: rgba(255,100,0,0.1);
  border-left: 2px solid #ffaa00;
}
.risk-item.high {
  background: rgba(255,0,0,0.1);
  border-left-color: #ff4444;
}
</style>
</head>
<body>
<canvas id="brain-canvas"></canvas>

<div id="ui-layer">
  <!-- Score Principal -->
  <div class="panel" style="top: 20px; left: 20px; width: 200px;">
    <div class="panel-header"><span class="pulse-dot"></span> Portfolio Score</div>
    <div class="score-big" id="score-value">--</div>
    <div class="score-label" id="score-maturity">--</div>
  </div>

  <!-- Métricas -->
  <div class="panel" style="top: 20px; left: 240px; width: 220px;">
    <div class="panel-header">📊 Métricas</div>
    <div class="metric-row">
      <span>Projetos Ativos</span>
      <span class="metric-value success" id="metric-active">--</span>
    </div>
    <div class="metric-row">
      <span>Em Risco</span>
      <span class="metric-value warning" id="metric-risk">--</span>
    </div>
    <div class="metric-row">
      <span>Bloqueados</span>
      <span class="metric-value danger" id="metric-blocked">--</span>
    </div>
    <div class="metric-row">
      <span>Alertas</span>
      <span class="metric-value" id="metric-alerts">--</span>
    </div>
    <div class="metric-row">
      <span>Histórico</span>
      <span class="metric-value" id="metric-history">--</span>
    </div>
  </div>

  <!-- Learning -->
  <div class="panel" style="top: 20px; left: 480px; width: 200px;">
    <div class="panel-header">🎓 Learning</div>
    <div class="metric-row">
      <span>Padrões</span>
      <span class="metric-value success" id="metric-patterns">--</span>
    </div>
    <div class="metric-row">
      <span>Anti-patterns</span>
      <span class="metric-value warning" id="metric-anti">--</span>
    </div>
    <div class="metric-row">
      <span>Personalidades</span>
      <span class="metric-value" id="metric-personalities">--</span>
    </div>
    <div class="metric-row">
      <span>Swarm</span>
      <span class="metric-value" id="metric-swarm">--</span>
    </div>
  </div>

  <!-- Riscos -->
  <div class="panel" style="top: 20px; right: 20px; width: 260px; max-height: 200px; overflow-y: auto;">
    <div class="panel-header">⚠️ Riscos</div>
    <div id="risks-container">
      <div style="color: #666; font-size: 12px;">Nenhum risco detectado</div>
    </div>
  </div>

  <!-- Projetos (posicionados dinamicamente) -->
  <div id="projects-container"></div>
</div>

<div id="status-bar">
  <div class="live-indicator">
    <span class="pulse-dot"></span>
    <span>LIVE — WebSocket conectado</span>
  </div>
  <div id="last-update">Última atualização: --</div>
  <div>Brain Universal v2.0</div>
</div>

<script>
const canvas = document.getElementById('brain-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let neurons = [];
let synapses = [];
let ws = null;
let brainData = null;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ─── Neurônios (partículas que pulsam) ────────────────────────────
class Neuron {
  constructor(x, y, type = 'background') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = type === 'project' ? 6 + Math.random() * 4 : 2 + Math.random() * 2;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.02 + Math.random() * 0.03;
    this.connections = [];
    this.energy = Math.random();
  }

  update() {
    this.pulsePhase += this.pulseSpeed;
    this.energy = 0.5 + 0.5 * Math.sin(this.pulsePhase);
    // Movimento sutil
    this.x += Math.sin(this.pulsePhase * 0.5) * 0.3;
    this.y += Math.cos(this.pulsePhase * 0.3) * 0.3;
  }

  draw() {
    const alpha = this.type === 'project' ? 0.6 + this.energy * 0.4 : 0.2 + this.energy * 0.3;
    const color = this.type === 'project' 
      ? \`rgba(100, 200, 255, \${alpha})\`
      : \`rgba(100, 200, 255, \${alpha * 0.5})\`;
    
    // Glow
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Sinapses (conexões entre neurônios) ──────────────────────────
class Synapse {
  constructor(n1, n2) {
    this.n1 = n1;
    this.n2 = n2;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.01 + Math.random() * 0.02;
    this.active = Math.random() > 0.7;
  }

  update() {
    this.pulsePhase += this.pulseSpeed;
    if (Math.random() > 0.995) this.active = !this.active;
  }

  draw() {
    if (!this.active) return;
    const alpha = 0.1 + 0.2 * Math.sin(this.pulsePhase);
    ctx.strokeStyle = \`rgba(100, 200, 255, \${alpha})\`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(this.n1.x, this.n1.y);
    ctx.lineTo(this.n2.x, this.n2.y);
    ctx.stroke();

    // Pulso viajando
    const t = (Math.sin(this.pulsePhase) + 1) / 2;
    const px = this.n1.x + (this.n2.x - this.n1.x) * t;
    const py = this.n1.y + (this.n2.y - this.n1.y) * t;
    ctx.fillStyle = \`rgba(100, 200, 255, \${alpha * 2})\`;
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── Inicializar neurônios ────────────────────────────────────────
function initNeurons() {
  neurons = [];
  synapses = [];
  
  // Neurônios de fundo
  for (let i = 0; i < 80; i++) {
    neurons.push(new Neuron(
      Math.random() * width,
      Math.random() * height,
      'background'
    ));
  }

  // Criar sinapses próximas
  for (let i = 0; i < neurons.length; i++) {
    for (let j = i + 1; j < neurons.length; j++) {
      const dx = neurons[i].x - neurons[j].x;
      const dy = neurons[i].y - neurons[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150 && Math.random() > 0.85) {
        synapses.push(new Synapse(neurons[i], neurons[j]));
      }
    }
  }
}

// ─── Animação ─────────────────────────────────────────────────────
function animate() {
  ctx.fillStyle = 'rgba(10, 10, 15, 0.15)';
  ctx.fillRect(0, 0, width, height);

  synapses.forEach(s => { s.update(); s.draw(); });
  neurons.forEach(n => { n.update(); n.draw(); });

  requestAnimationFrame(animate);
}

// ─── WebSocket ────────────────────────────────────────────────────
function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  ws = new WebSocket(\`\${protocol}//\${window.location.host}\`);

  ws.onopen = () => {
    console.log('[brain-dashboard] WebSocket conectado');
  };

  ws.onmessage = (event) => {
    try {
      brainData = JSON.parse(event.data);
      updateUI(brainData);
    } catch (e) {
      console.error('[brain-dashboard] erro ao parsear:', e);
    }
  };

  ws.onclose = () => {
    console.log('[brain-dashboard] WebSocket desconectado, reconectando...');
    setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = (err) => {
    console.error('[brain-dashboard] WebSocket erro:', err);
  };
}

// ─── Atualizar UI ─────────────────────────────────────────────────
function updateUI(data) {
  // Score
  document.getElementById('score-value').textContent = data.portfolioScore || '--';
  const maturity = data.portfolioScore >= 90 ? 'Elite' : 
                   data.portfolioScore >= 75 ? 'Strong' : 
                   data.portfolioScore >= 55 ? 'Developing' : 'Basic';
  document.getElementById('score-maturity').textContent = maturity;

  // Métricas
  document.getElementById('metric-active').textContent = data.activeProjects || 0;
  document.getElementById('metric-risk').textContent = data.atRiskProjects || 0;
  document.getElementById('metric-blocked').textContent = data.blockedProjects || 0;
  document.getElementById('metric-alerts').textContent = data.integrityAlerts || 0;
  document.getElementById('metric-history').textContent = data.historyPoints || 0;

  // Learning
  document.getElementById('metric-patterns').textContent = data.learningPatterns || 0;
  document.getElementById('metric-anti').textContent = data.learningAntiPatterns || 0;
  document.getElementById('metric-personalities').textContent = data.personalities || 0;
  document.getElementById('metric-swarm').textContent = data.swarmStatus === 'strong direction, partial implementation' ? 'Parcial' : 'OK';

  // Riscos
  const risksContainer = document.getElementById('risks-container');
  if (data.topRisks && data.topRisks.length > 0) {
    risksContainer.innerHTML = data.topRisks.map(r => 
      \`<div class="risk-item \${r.severity}">\${r.type} — \${r.severity}</div>\`
    ).join('');
  } else {
    risksContainer.innerHTML = '<div style="color: #666; font-size: 12px;">Nenhum risco detectado</div>';
  }

  // Projetos
  updateProjects(data.projects || []);

  // Status bar
  document.getElementById('last-update').textContent = 
    'Última atualização: ' + new Date().toLocaleTimeString();
}

function updateProjects(projects) {
  const container = document.getElementById('projects-container');
  container.innerHTML = '';
  
  projects.forEach((p, i) => {
    const angle = (i / projects.length) * Math.PI * 2;
    const radius = Math.min(width, height) * 0.35;
    const x = width / 2 + Math.cos(angle) * radius;
    const y = height / 2 + Math.sin(angle) * radius;
    
    const healthClass = p.healthScore >= 90 ? 'healthy' : 
                        p.healthScore >= 75 ? 'warning' : 'danger';
    
    const node = document.createElement('div');
    node.className = \`project-node \${healthClass}\`;
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    node.style.transform = 'translate(-50%, -50%)';
    node.innerHTML = \`
      <div style="font-weight:600">\${p.slug}</div>
      <div style="font-size:10px;opacity:0.7">Score: \${p.maturityScore}</div>
    \`;
    container.appendChild(node);

    // Adicionar neurônio no canvas
    neurons.push(new Neuron(x, y, 'project'));
  });
}

// ─── Iniciar ──────────────────────────────────────────────────────
initNeurons();
animate();
connectWebSocket();
</script>
</body>
</html>`;

// ─── HTTP Server ───────────────────────────────────────────────────

const httpServer = createServer(async (req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlContent);
  } else if (req.url === '/api/state') {
    await loadBrainState();
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(brainState));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// ─── WebSocket Server ──────────────────────────────────────────────

const wss = new WebSocketServer({ server: httpServer });

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(msg);
    }
  });
}

wss.on('connection', (ws) => {
  console.log('[brain-dashboard] cliente conectado');
  // Enviar estado atual
  loadBrainState().then(() => {
    ws.send(JSON.stringify(brainState));
  });
});

// ─── Watch files for changes ───────────────────────────────────────

async function watchBrainFiles() {
  try {
    const watcher = watch(PRINCIPAL_BRAIN, { recursive: true });
    for await (const event of watcher) {
      if (event.filename?.includes('DASHBOARD.json') || 
          event.filename?.includes('PROJECTS.json') ||
          event.filename?.includes('learning')) {
        console.log('[brain-dashboard] mudança detectada:', event.filename);
        await loadBrainState();
        broadcast(brainState);
      }
    }
  } catch (err) {
    console.error('[brain-dashboard] watch error:', err.message);
  }
}

// ─── Periodic refresh ──────────────────────────────────────────────

setInterval(async () => {
  await loadBrainState();
  broadcast(brainState);
}, 5000); // Atualiza a cada 5 segundos

// ─── Start ─────────────────────────────────────────────────────────

httpServer.listen(PORT, async () => {
  await loadBrainState();
  console.log(`
🧠 BRAIN DASHBOARD — Cérebro Vivo
═══════════════════════════════════════
📡 Servidor HTTP:  http://localhost:${PORT}
🔌 WebSocket:      ws://localhost:${PORT}
📊 API:            http://localhost:${PORT}/api/state

Abra http://localhost:${PORT} no navegador para ver o dashboard.

O dashboard atualiza automaticamente quando:
• O brain principal muda (file watcher)
• A cada 5 segundos (refresh periódico)
• Via WebSocket push para todos os clientes conectados

Pressione Ctrl+C para parar.
`);
  watchBrainFiles();
});
