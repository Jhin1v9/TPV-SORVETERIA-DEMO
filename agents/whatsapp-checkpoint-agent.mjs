/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║           WHATSAPP CHECKPOINT AGENT v6.0                                    ║
 * ║     Com Mapeamento Completo + Extração de Texto via page.evaluate()        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * 
 * BASEADO EM PESQUISA DE MÚLTIPLAS FONTES:
 * - HARPA AI (automação em produção): span.selectable-text.copyable-text
 * - whatsapp-web.js (12k+ stars): page.evaluate() para acesso DOM
 * - Playwright Docs: textContent para extração de texto bruto
 * - GitHub Issue #521: span[dir="ltr"] para mensagens formatadas
 */

import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════
const CONFIG = {
  CDP_PORT: 9222,
  CHECK_INTERVAL_MS: 30 * 60 * 1000, // 30 minutos
  DATA_DIR: path.join(__dirname, '..', 'data'),
  CHECKPOINT_FILE: path.join(__dirname, '..', 'data', 'whatsapp-checkpoints.json'),
  MAP_FILE: path.join(__dirname, '..', 'data', 'whatsapp-map.json'),
  GROUP_NAME: '🏆Production - 2026🙏',
  DASHBOARD_URL: 'http://localhost:3456/api/whatsapp-checkpoint',
  MAX_MESSAGES_PER_CHECK: 50,
  CONTEXT_MAX_CHARS: 4000
};

// ═══════════════════════════════════════════════════════════════════════════════
// SELETORES CONFIRMADOS (baseados em pesquisa de múltiplas fontes)
// ═══════════════════════════════════════════════════════════════════════════════
const SELECTORS = {
  // ⭐ EXTRAÇÃO DE TEXTO - Seletores confirmados por HARPA AI e whatsapp-web.js
  MESSAGE_TEXT: 'span.selectable-text.copyable-text',           // HARPA AI - produção
  MESSAGE_TEXT_ALT: 'span[dir="ltr"].selectable-text',         // GitHub wwebjs
  MESSAGE_CONTAINER_IN: '.message-in',                          // Mensagens recebidas
  MESSAGE_CONTAINER_OUT: '.message-out',                        // Mensagens enviadas
  MESSAGE_CONTAINER: '.message-in, .message-out',               // Ambas
  COPYABLE_TEXT: '.copyable-text',                              // Para metadata
  
  // Navegação
  CHAT_LIST: '[data-testid="chat-list"], #pane-side div[role="listitem"]',
  CHAT_LIST_CONTAINER: '[data-testid="chat-list"]',
  CHAT_TITLE: 'span[dir="auto"], span[title]',
  SEARCH_INPUT: '[data-testid="chat-list-search"], div[contenteditable="true"][data-tab="3"]',
  
  // Header e info
  CONVERSATION_HEADER: '[data-testid="conversation-info-header"]',
  
  // Input
  MESSAGE_INPUT: '[data-testid="conversation-compose-box-input"], footer div[contenteditable="true"]',
  SEND_BUTTON: '[data-testid="send"], [data-icon="send"]'
};

// ═══════════════════════════════════════════════════════════════════════════════
// GERENCIADOR DE CHECKPOINTS
// ═══════════════════════════════════════════════════════════════════════════════
class CheckpointManager {
  constructor() {
    this.data = {
      version: '6.0',
      lastCheck: null,
      seenMessageIds: new Set(),
      checkpoints: [],
      compactedReports: [],
      stats: {
        totalMessagesSeen: 0,
        totalCheckpoints: 0,
        lastCompactedAt: null
      }
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(CONFIG.CHECKPOINT_FILE)) {
        const raw = JSON.parse(fs.readFileSync(CONFIG.CHECKPOINT_FILE, 'utf8'));
        this.data = {
          ...this.data,
          ...raw,
          seenMessageIds: new Set(raw.seenMessageIds || [])
        };
        console.log(`[CHECKPOINT] Carregado: ${this.data.seenMessageIds.size} mensagens vistas`);
      }
    } catch (e) {
      console.log('[CHECKPOINT] Arquivo não encontrado, criando novo');
    }
  }

  save() {
    const toSave = {
      ...this.data,
      seenMessageIds: Array.from(this.data.seenMessageIds)
    };
    fs.writeFileSync(CONFIG.CHECKPOINT_FILE, JSON.stringify(toSave, null, 2));
  }

  hasSeen(messageId) {
    return this.data.seenMessageIds.has(messageId);
  }

  markSeen(messageId) {
    this.data.seenMessageIds.add(messageId);
    this.data.stats.totalMessagesSeen++;
  }

  addCheckpoint(checkpoint) {
    this.data.checkpoints.push(checkpoint);
    this.data.stats.totalCheckpoints++;
    
    // Mantém apenas os últimos 100 checkpoints
    if (this.data.checkpoints.length > 100) {
      this.data.checkpoints = this.data.checkpoints.slice(-100);
    }
    
    this.save();
  }

  addCompactedReport(report) {
    this.data.compactedReports.push(report);
    this.data.stats.lastCompactedAt = new Date().toISOString();
    
    // Mantém apenas os últimos 20 relatórios compactados
    if (this.data.compactedReports.length > 20) {
      this.data.compactedReports = this.data.compactedReports.slice(-20);
    }
    
    this.save();
  }

  getCompactedContext() {
    if (this.data.compactedReports.length === 0) return '';
    
    const recent = this.data.compactedReports.slice(-3);
    return recent.map(r => 
      `=== Relatório ${r.timestamp} ===\n${r.summary}\nTarefas: ${r.tasks.join(', ')}\nDecisões: ${r.decisions.join(', ')}`
    ).join('\n\n');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITÁRIOS
// ═══════════════════════════════════════════════════════════════════════════════
function generateMessageId(msg) {
  const hash = crypto.createHash('md5');
  hash.update(`${msg.sender}|${msg.text}|${msg.time}`);
  return hash.digest('hex').substring(0, 16);
}

function extractTask(text) {
  const taskPatterns = [
    /(?:tarefa|task|todo|fazer|precisa|necessário|urgente|importante)\s*:?\s*(.+)/i,
    /(?:@abner|@nonoke|@elias|@todos)\s+(.+)/i,
    /(?:prazo|deadline|até|para)\s+(?:dia\s+)?(\d+)[\/\-]?(\d+)?\s*:?\s*(.+)/i
  ];
  
  for (const pattern of taskPatterns) {
    const match = text.match(pattern);
    if (match) return match[1] || match[3] || match[0];
  }
  return null;
}

function detectMentions(text) {
  const mentions = [];
  const mentionPatterns = {
    abner: /@abner|abner|ábner/i,
    nonoke: /@nonoke|nonoke/i,
    elias: /@elias|elias/i,
    todos: /@todos|todos|equipe|galera|pessoal/i
  };
  
  for (const [name, pattern] of Object.entries(mentionPatterns)) {
    if (pattern.test(text)) mentions.push(name);
  }
  return mentions;
}

function detectDecision(text) {
  const decisionPatterns = [
    /\b(ok|feito|pronto|entregue|aprovado|confirmado|resolvido|finalizado)\b/i,
    /\b(negado|rejeitado|cancelado|não vamos|descartado)\b/i
  ];
  
  for (const pattern of decisionPatterns) {
    const match = text.match(pattern);
    if (match) return { type: match[1].toLowerCase(), text: match[0] };
  }
  return null;
}

function compactContext(messages) {
  const tasks = [];
  const decisions = [];
  const mentions = new Set();
  const senders = new Set();
  
  for (const msg of messages) {
    senders.add(msg.sender);
    
    const task = extractTask(msg.text);
    if (task) tasks.push({ task, sender: msg.sender, time: msg.time });
    
    const decision = detectDecision(msg.text);
    if (decision) decisions.push({ ...decision, sender: msg.sender, time: msg.time });
    
    const msgMentions = detectMentions(msg.text);
    msgMentions.forEach(m => mentions.add(m));
  }
  
  const summary = `Período: ${messages[0]?.time || '?'} - ${messages[messages.length - 1]?.time || '?'}` +
    ` | ${messages.length} mensagens | ${senders.size} participantes` +
    ` | ${tasks.length} tarefas | ${decisions.length} decisões` +
    ` | Menções: ${Array.from(mentions).join(', ') || 'nenhuma'}`;
  
  return {
    timestamp: new Date().toISOString(),
    summary,
    tasks: tasks.map(t => `[${t.time}] ${t.sender}: ${t.task}`),
    decisions: decisions.map(d => `[${d.time}] ${d.sender}: ${d.text}`),
    mentions: Array.from(mentions),
    messageCount: messages.length,
    senderCount: senders.size
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
class WhatsAppCheckpointAgent {
  constructor() {
    this.browser = null;
    this.page = null;
    this.checkpointManager = new CheckpointManager();
    this.isRunning = false;
    this.viewport = { width: 0, height: 0 };
    this.mapData = null;
  }

  /**
   * Conecta ao Chrome via CDP
   */
  async connect() {
    console.log('[AGENT] Conectando ao Chrome CDP na porta', CONFIG.CDP_PORT);
    
    this.browser = await chromium.connectOverCDP(`http://localhost:${CONFIG.CDP_PORT}`);
    const contexts = this.browser.contexts();
    
    if (contexts.length === 0) {
      throw new Error('Nenhum contexto encontrado no Chrome CDP');
    }
    
    const pages = contexts[0].pages();
    this.page = pages[0] || await contexts[0].newPage();
    
    this.viewport = await this.page.viewportSize();
    console.log(`[AGENT] Conectado! Viewport: ${this.viewport.width}x${this.viewport.height}`);
    
    // Carrega mapa se existir
    this.loadMap();
    
    return this;
  }

  /**
   * Carrega mapa salvo
   */
  loadMap() {
    try {
      if (fs.existsSync(CONFIG.MAP_FILE)) {
        this.mapData = JSON.parse(fs.readFileSync(CONFIG.MAP_FILE, 'utf8'));
        console.log(`[AGENT] Mapa carregado: ${Object.keys(this.mapData.elements).length} elementos`);
      }
    } catch (e) {
      console.log('[AGENT] Nenhum mapa carregado');
    }
  }

  /**
   * Converte coordenadas relativas para absolutas
   */
  relToAbs(relX, relY) {
    return {
      x: Math.round(relX * this.viewport.width),
      y: Math.round(relY * this.viewport.height)
    };
  }

  /**
   * ⭐ MÉTODO PRINCIPAL: Extrai mensagens usando page.evaluate()
   * 
   * Baseado em pesquisa de múltiplas fontes:
   * - HARPA AI: span.selectable-text.copyable-text
   * - whatsapp-web.js: page.evaluate() para acesso DOM nativo
   * - Playwright Docs: textContent para texto bruto
   */
  async getMessages() {
    console.log('[AGENT] Extraindo mensagens via page.evaluate()...');
    
    const messages = await this.page.evaluate((selectors) => {
      const results = [];
      
      // Seletores de texto confirmados por múltiplas fontes
      const textSelectors = [
        'span.selectable-text.copyable-text',     // HARPA AI - produção
        'span[dir="ltr"].selectable-text',        // wwebjs
        'span.selectable-text.invisible-space.copyable-text'  // GitHub #521
      ];
      
      // Encontra todos os containers de mensagem
      const containers = document.querySelectorAll(selectors.MESSAGE_CONTAINER);
      
      containers.forEach((container, index) => {
        // ⭐ Tenta extrair texto com múltiplos seletores
        let textElement = null;
        let text = '';
        
        for (const textSelector of textSelectors) {
          textElement = container.querySelector(textSelector);
          if (textElement) {
            // ⭐ Usa textContent (mais confiável que innerText para extração)
            text = textElement.textContent?.trim() || '';
            if (text && text.length > 0) break;
          }
        }
        
        // Se não achou com seletores específicos, tenta busca mais ampla
        if (!text) {
          const allSpans = container.querySelectorAll('span[dir="ltr"], span[dir="auto"]');
          for (const span of allSpans) {
            const spanText = span.textContent?.trim() || '';
            // Filtra spans que são apenas classes CSS ou muito curtos
            if (spanText.length > 2 && !spanText.match(/^(tail-|_|[0-9]+)$/)) {
              text = spanText;
              break;
            }
          }
        }
        
        // Ignora mensagens sem texto real
        if (!text || text.length < 2) return;
        
        // Ignora classes CSS comuns que foram erroneamente capturadas
        const cssClasses = ['tail-in', 'tail-out', '_3yg5l', '_1VzZY', 'invisible-space'];
        if (cssClasses.includes(text)) return;
        
        // Extrai autor do data-pre-plain-text
        const copyableEl = container.querySelector(selectors.COPYABLE_TEXT);
        const prePlainText = copyableEl?.getAttribute('data-pre-plain-text') || '';
        const authorMatch = prePlainText.match(/\]\s*(.*?):\s*/);
        let sender = authorMatch ? authorMatch[1].trim() : 'Unknown';
        
        // Se não achou autor no pre-plain-text, tenta outros métodos
        if (sender === 'Unknown') {
          // Para mensagens de grupo, pode ter o nome do remetente em outro lugar
          const senderEl = container.querySelector('span[dir="auto"][title]');
          if (senderEl) sender = senderEl.getAttribute('title') || senderEl.textContent?.trim() || 'Unknown';
        }
        
        // Extrai timestamp
        let time = '';
        const timeMatch = container.textContent.match(/(\d{1,2}:\d{2})/);
        if (timeMatch) time = timeMatch[1];
        
        // Determina se é mensagem enviada ou recebida
        const isOutgoing = container.classList.contains('message-out');
        
        // Extrai ID da mensagem se disponível
        const msgId = container.getAttribute('data-id') || 
                     `${sender}-${text.substring(0, 20)}-${time}`;
        
        results.push({
          id: msgId,
          text,
          sender,
          time,
          isOutgoing,
          index
        });
      });
      
      return results;
    }, SELECTORS);
    
    console.log(`[AGENT] ${messages.length} mensagens extraídas`);
    
    // Log das primeiras mensagens para debug
    messages.slice(-5).forEach((msg, i) => {
      const preview = msg.text.substring(0, 60).replace(/\n/g, ' ');
      console.log(`  ${i + 1}. [${msg.time}] ${msg.sender}: ${preview}${msg.text.length > 60 ? '...' : ''}`);
    });
    
    return messages;
  }

  /**
   * Encontra e clica em um chat pelo nome
   */
  async openChatByName(name) {
    console.log(`[AGENT] Abrindo chat: "${name}"`);
    
    // Primeiro tenta usar o mapa
    const mapKey = `chat_${name}`;
    if (this.mapData?.elements?.[mapKey]) {
      const pos = this.mapData.elements[mapKey].absolute;
      console.log(`  → Usando mapa: (${pos.x}, ${pos.y})`);
      await this.page.mouse.click(pos.x, pos.y);
      await this.page.waitForTimeout(1500);
      return true;
    }
    
    // Busca dinâmica via JavaScript
    const found = await this.page.evaluate((searchName) => {
      const chatElements = document.querySelectorAll('[data-testid="chat-list"] > div[role="row"], #pane-side div[role="listitem"]');
      
      for (const el of chatElements) {
        const titleEl = el.querySelector('span[dir="auto"], span[title]');
        const title = titleEl?.textContent?.trim() || titleEl?.getAttribute('title') || '';
        
        if (title.toLowerCase().includes(searchName.toLowerCase())) {
          const rect = el.getBoundingClientRect();
          return {
            found: true,
            title,
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
        }
      }
      
      return { found: false };
    }, name);
    
    if (found.found) {
      console.log(`  ✓ Chat encontrado: "${found.title}" em (${found.x}, ${found.y})`);
      await this.page.mouse.click(found.x, found.y);
      await this.page.waitForTimeout(1500);
      return true;
    }
    
    // Último recurso: pesquisa
    console.log('  → Tentando via pesquisa...');
    const searchBox = await this.page.locator(SELECTORS.SEARCH_INPUT).first();
    if (await searchBox.count() > 0) {
      await searchBox.fill(name);
      await this.page.waitForTimeout(1000);
      
      // Clica no primeiro resultado
      const firstResult = await this.page.locator(SELECTORS.CHAT_LIST).first();
      if (await firstResult.count() > 0) {
        await firstResult.click();
        await this.page.waitForTimeout(1500);
        return true;
      }
    }
    
    console.log('  ✗ Chat não encontrado');
    return false;
  }

  /**
   * Verifica se está no chat correto
   */
  async verifyChat(name) {
    const title = await this.page.evaluate(() => {
      const titleEl = document.querySelector('[data-testid="conversation-info-header"] span[dir="auto"], header span[dir="auto"]');
      return titleEl?.textContent?.trim() || titleEl?.getAttribute('title') || '';
    });
    
    const isCorrect = title.toLowerCase().includes(name.toLowerCase());
    console.log(`[AGENT] Chat atual: "${title}" ${isCorrect ? '✓' : '✗ (esperado: ' + name + ')'}`);
    return isCorrect;
  }

  /**
   * Processa novas mensagens e cria checkpoint
   */
  async processMessages() {
    const allMessages = await this.getMessages();
    const newMessages = [];
    
    for (const msg of allMessages) {
      const msgId = generateMessageId(msg);
      
      if (!this.checkpointManager.hasSeen(msgId)) {
        this.checkpointManager.markSeen(msgId);
        newMessages.push({ ...msg, msgId });
      }
    }
    
    if (newMessages.length === 0) {
      console.log('[AGENT] Nenhuma mensagem nova');
      return null;
    }
    
    console.log(`[AGENT] ${newMessages.length} mensagens novas`);
    
    // Analisa mensagens
    const tasks = [];
    const decisions = [];
    const mentions = new Set();
    
    for (const msg of newMessages) {
      const task = extractTask(msg.text);
      if (task) tasks.push({ task, sender: msg.sender, time: msg.time });
      
      const decision = detectDecision(msg.text);
      if (decision) decisions.push({ ...decision, sender: msg.sender, time: msg.time });
      
      const msgMentions = detectMentions(msg.text);
      msgMentions.forEach(m => mentions.add(m));
    }
    
    const checkpoint = {
      timestamp: new Date().toISOString(),
      group: CONFIG.GROUP_NAME,
      newMessages: newMessages.length,
      messages: newMessages.map(m => ({
        sender: m.sender,
        text: m.text.substring(0, 200),
        time: m.time,
        isOutgoing: m.isOutgoing
      })),
      analysis: {
        tasks: tasks.length > 0 ? tasks : null,
        decisions: decisions.length > 0 ? decisions : null,
        mentions: Array.from(mentions),
        urgency: tasks.length > 2 || mentions.has('todos') ? 'high' : 'normal'
      }
    };
    
    this.checkpointManager.addCheckpoint(checkpoint);
    
    // Compacta contexto se necessário
    if (this.checkpointManager.data.seenMessageIds.size > 100) {
      const compacted = compactContext(allMessages.slice(-20));
      this.checkpointManager.addCompactedReport(compacted);
    }
    
    return checkpoint;
  }

  /**
   * Envia checkpoint para o dashboard
   */
  async sendToDashboard(checkpoint) {
    try {
      const response = await fetch(CONFIG.DASHBOARD_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkpoint)
      });
      
      if (response.ok) {
        console.log('[AGENT] Checkpoint enviado ao dashboard');
      } else {
        console.log('[AGENT] Falha ao enviar:', response.status);
      }
    } catch (e) {
      console.log('[AGENT] Dashboard não disponível:', e.message);
    }
  }

  /**
   * Ciclo de verificação principal
   */
  async checkCycle() {
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`[AGENT] Checkpoint Cycle - ${new Date().toLocaleString('pt-BR')}`);
    console.log('═══════════════════════════════════════════════════════════════');
    
    try {
      // 1. Abre o grupo
      await this.openChatByName(CONFIG.GROUP_NAME);
      
      // 2. Verifica se está no chat correto
      const isCorrect = await this.verifyChat(CONFIG.GROUP_NAME);
      if (!isCorrect) {
        console.log('[AGENT] Chat incorreto, tentando novamente...');
        await this.page.waitForTimeout(2000);
        await this.openChatByName(CONFIG.GROUP_NAME);
      }
      
      // 3. Aguarda mensagens carregarem
      await this.page.waitForTimeout(1000);
      
      // 4. Extrai e processa mensagens
      const checkpoint = await this.processMessages();
      
      if (checkpoint) {
        console.log('\n[CHECKPOINT] Resumo:');
        console.log(`  Mensagens novas: ${checkpoint.newMessages}`);
        console.log(`  Tarefas: ${checkpoint.analysis.tasks?.length || 0}`);
        console.log(`  Decisões: ${checkpoint.analysis.decisions?.length || 0}`);
        console.log(`  Menções: ${checkpoint.analysis.mentions.join(', ') || 'nenhuma'}`);
        console.log(`  Urgência: ${checkpoint.analysis.urgency}`);
        
        // Envia para dashboard
        await this.sendToDashboard(checkpoint);
      }
      
      this.checkpointManager.data.lastCheck = new Date().toISOString();
      this.checkpointManager.save();
      
    } catch (error) {
      console.error('[AGENT] Erro no ciclo:', error.message);
    }
    
    console.log('═══════════════════════════════════════════════════════════════\n');
  }

  /**
   * Inicia o agente em loop
   */
  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('[AGENT] Iniciando WhatsApp Checkpoint Agent v6.0');
    console.log(`[AGENT] Intervalo: ${CONFIG.CHECK_INTERVAL_MS / 60000} minutos`);
    console.log(`[AGENT] Grupo: ${CONFIG.GROUP_NAME}`);
    
    await this.connect();
    
    // Primeira verificação imediata
    await this.checkCycle();
    
    // Loop de verificação
    this.intervalId = setInterval(() => {
      this.checkCycle().catch(err => console.error('[AGENT] Erro:', err));
    }, CONFIG.CHECK_INTERVAL_MS);
    
    console.log('[AGENT] Agente rodando. Pressione Ctrl+C para parar.');
  }

  /**
   * Para o agente
   */
  async stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.browser) {
      await this.browser.disconnect();
    }
    
    console.log('[AGENT] Agente parado');
  }

  /**
   * Executa uma verificação única (modo manual)
   */
  async runOnce() {
    await this.connect();
    await this.checkCycle();
    await this.stop();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMANDOS INTERATIVOS VIA TECLADO
// ═══════════════════════════════════════════════════════════════════════════════
const COMMANDS = {
  // Navegação rápida
  '1': { desc: 'Chat 1 da lista', action: 'clickChat', index: 0 },
  '2': { desc: 'Chat 2 da lista', action: 'clickChat', index: 1 },
  '3': { desc: 'Chat 3 da lista', action: 'clickChat', index: 2 },
  '4': { desc: 'Chat 4 da lista', action: 'clickChat', index: 3 },
  '5': { desc: 'Chat 5 da lista', action: 'clickChat', index: 4 },
  
  // Grupos específicos
  'p': { desc: 'Grupo Production', action: 'openChat', name: '🏆Production - 2026🙏' },
  'g': { desc: 'Abrir grupo por nome', action: 'promptGroup' },
  
  // Ações
  'm': { desc: 'Mapear interface', action: 'mapInterface' },
  'r': { desc: 'Rodar checkpoint', action: 'runCheckpoint' },
  's': { desc: 'Screenshot', action: 'screenshot' },
  'f': { desc: 'Fullscreen', action: 'fullscreen' },
  'x': { desc: 'Maximizar janela', action: 'maximize' },
  
  // Info
  'i': { desc: 'Info do agente', action: 'info' },
  'h': { desc: 'Ajuda (esta lista)', action: 'help' },
  'q': { desc: 'Sair', action: 'quit' }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXECUÇÃO PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'daemon';
  
  const agent = new WhatsAppCheckpointAgent();
  
  if (mode === 'once') {
    console.log('[MAIN] Modo: verificação única');
    await agent.runOnce();
    process.exit(0);
    
  } else if (mode === 'map') {
    console.log('[MAIN] Modo: mapeamento apenas');
    const { runFullMapping } = require('./whatsapp-mapper');
    await runFullMapping();
    process.exit(0);
    
  } else if (mode === 'interactive') {
    console.log('[MAIN] Modo: interativo');
    await agent.connect();
    
    // Mostra ajuda
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║           COMANDOS DISPONÍVEIS                               ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    for (const [key, cmd] of Object.entries(COMMANDS)) {
      console.log(`  ${key.padEnd(3)} - ${cmd.desc}`);
    }
    console.log('');
    
    // Setup stdin para comandos
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', async (key) => {
      const cmd = COMMANDS[key];
      
      if (key === '\u0003') { // Ctrl+C
        await agent.stop();
        process.exit(0);
      }
      
      if (!cmd) return;
      
      console.log(`\n[CMD] Executando: ${cmd.desc}`);
      
      try {
        switch (cmd.action) {
          case 'clickChat':
            const chats = await agent.page.evaluate(() => {
              const els = document.querySelectorAll('[data-testid="chat-list"] > div[role="row"]');
              return Array.from(els).map((el, i) => {
                const rect = el.getBoundingClientRect();
                return { index: i, x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
              });
            });
            if (chats[cmd.index]) {
              await agent.page.mouse.click(chats[cmd.index].x, chats[cmd.index].y);
              console.log(`  ✓ Clicou no chat ${cmd.index + 1}`);
            }
            break;
            
          case 'openChat':
            await agent.openChatByName(cmd.name);
            break;
            
          case 'promptGroup':
            // Em modo interativo simples, abre o grupo padrão
            await agent.openChatByName(CONFIG.GROUP_NAME);
            break;
            
          case 'mapInterface':
            const { runFullMapping } = require('./whatsapp-mapper');
            await runFullMapping();
            agent.loadMap(); // Recarrega mapa
            break;
            
          case 'runCheckpoint':
            await agent.checkCycle();
            break;
            
          case 'screenshot':
            const ssPath = path.join(CONFIG.DATA_DIR, `screenshot_${Date.now()}.png`);
            await agent.page.screenshot({ path: ssPath });
            console.log(`  ✓ Screenshot: ${ssPath}`);
            break;
            
          case 'fullscreen':
            await agent.page.evaluate(() => {
              document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
            });
            console.log('  ✓ Fullscreen toggled');
            break;
            
          case 'maximize':
            const session = await agent.page.context().newCDPSession(agent.page);
            const { windowId } = await session.send('Browser.getWindowForTarget');
            await session.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'maximized' }});
            await session.detach();
            console.log('  ✓ Janela maximizada');
            break;
            
          case 'info':
            console.log('\n[INFO] Agente:');
            console.log(`  Running: ${agent.isRunning}`);
            console.log(`  Viewport: ${agent.viewport.width}x${agent.viewport.height}`);
            console.log(`  Mensagens vistas: ${agent.checkpointManager.data.seenMessageIds.size}`);
            console.log(`  Checkpoints: ${agent.checkpointManager.data.checkpoints.length}`);
            console.log(`  Mapa: ${agent.mapData ? 'Carregado' : 'Não carregado'}`);
            break;
            
          case 'help':
            console.log('\nComandos:');
            for (const [k, c] of Object.entries(COMMANDS)) {
              console.log(`  ${k.padEnd(3)} - ${c.desc}`);
            }
            break;
            
          case 'quit':
            await agent.stop();
            process.exit(0);
        }
      } catch (e) {
        console.error('  ✗ Erro:', e.message);
      }
    });
    
  } else {
    // Modo daemon (padrão)
    console.log('[MAIN] Modo: daemon (loop a cada 30min)');
    await agent.start();
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRATAMENTO DE SINAIS
// ═══════════════════════════════════════════════════════════════════════════════
process.on('SIGINT', async () => {
  console.log('\n[MAIN] Encerrando...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[MAIN] Encerrando...');
  process.exit(0);
});

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTAÇÕES
// ═══════════════════════════════════════════════════════════════════════════════
export {
  WhatsAppCheckpointAgent,
  CheckpointManager,
  SELECTORS,
  CONFIG,
  generateMessageId,
  extractTask,
  detectMentions,
  detectDecision,
  compactContext
};

// Executa se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error('[MAIN] Erro fatal:', err);
    process.exit(1);
  });
}
