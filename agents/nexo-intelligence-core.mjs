/**
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║           NEXO INTELLIGENCE CORE v7.0 — Pipeline Multi-Agente                   ║
 * ║                                                                                  ║
 * ║  ARQUITETURA BASEADA EM PESQUISA DE PRODUÇÃO 2026:                              ║
 *  ║  - LangGraph-style pipeline (GitHub: temporal-ai-agent-pipeline)               ║
 * ║  - Conversation Analytics (OvalEdge, Amazon Connect)                           ║
 * ║  - Multi-Agent Orchestration (Beam.ai patterns)                                ║
 * ║  - Agent Assist + Real-time Context (Computer-Talk)                            ║
 * ║                                                                                  ║
 * ║  CONTATOS:                                                                       ║
 * ║  - Abner (você): 685093192                                                      ║
 * ║  - Enoque (Superclim): pai, tem 2 números                                      ║
 * ║  - Nonoke: membro do grupo                                                     ║
 * ║                                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════════
const CONFIG = {
  CDP_URL: 'http://127.0.0.1:9222',
  GROUP_NAME: '🏆Production - 2026🙏',
  GROUP_NAME_SHORT: 'Production - 2026',
  DATA_DIR: path.join(__dirname, '..', 'data'),
  MEMORY_DIR: path.join(__dirname, '..', 'data', 'memory'),
  CHECKPOINT_FILE: path.join(__dirname, '..', 'data', 'whatsapp-checkpoints-v7.json'),
  CONTEXT_FILE: path.join(__dirname, '..', 'data', 'conversation-context.md'),
  TASKS_FILE: path.join(__dirname, '..', 'data', 'tasks-board.json'),
  IDEAS_FILE: path.join(__dirname, '..', 'data', 'ideas-bank.json'),
  HISTORY_FILE: path.join(__dirname, '..', 'data', 'task-history.json'),
  DASHBOARD_DATA_FILE: path.join(__dirname, '..', 'apps', 'admin', 'public', 'whatsapp-data.json'),
  CHECK_INTERVAL_MS: 30 * 60 * 1000,
  SCROLL_BATCH_SIZE: 20,
  MAX_SCROLLS: 30,
  MAX_MESSAGES_PER_CHECK: 200,
  CONTEXT_MAX_CHARS: 6000
};

// Contatos conhecidos
const CONTACTS = {
  '685093192': { name: 'Abner', role: 'admin', isYou: true },
  'Superclim': { name: 'Enoque (Superclim)', role: 'pai', aliases: ['Superclim', 'Enoque', 'pai'] },
  'Nonoke': { name: 'Nonoke', role: 'membro' },
  'Kuruma': { name: 'Kuruma Netejes', role: 'membro' }
};

// ═══════════════════════════════════════════════════════════════════════════════════
// SELETORES CONFIRMADOS
// ═══════════════════════════════════════════════════════════════════════════════════
const SELECTORS = {
  MESSAGE_TEXT: 'span.selectable-text.copyable-text',
  MESSAGE_TEXT_ALT: 'span[dir="ltr"].selectable-text',
  MESSAGE_CONTAINER: '.message-in, .message-out',
  COPYABLE_TEXT: '.copyable-text',
  CHAT_LIST: '[data-testid="chat-list"] > div[role="row"], #pane-side div[role="listitem"]',
  CHAT_LIST_ALT: '#pane-side [role="grid"] > div',
  CHAT_LIST_CELL: 'div[data-testid="cell-frame"]',
  CHAT_TITLE: 'span[dir="auto"], span[title]',
  MESSAGES_CONTAINER: '[data-testid="conversation-panel-messages"], div[role="application"]',
  MESSAGE_INPUT: '[data-testid="conversation-compose-box-input"], footer div[contenteditable="true"]'
};

// ═══════════════════════════════════════════════════════════════════════════════════
// UTILITÁRIOS
// ═══════════════════════════════════════════════════════════════════════════════════
function hash(str) {
  return crypto.createHash('md5').update(str).digest('hex').substring(0, 12);
}

function now() {
  return new Date().toISOString();
}

function timeBR() {
  return new Date().toLocaleString('pt-BR');
}

function log(msg, level = 'info') {
  const icons = { info: 'ℹ️', success: '✅', warn: '⚠️', error: '❌', agent: '🤖', chat: '💬', task: '📋', idea: '💡' };
  console.log(`[${timeBR()}] ${icons[level] || '•'} ${msg}`);
}

// ═══════════════════════════════════════════════════════════════════════════════════
// AGENTE 1: EXTRACTOR
// ═══════════════════════════════════════════════════════════════════════════════════
class ExtractorAgent {
  constructor(page) {
    this.page = page;
    this.seenIds = new Set();
  }

  async extractAllMessages() {
    log('Agente EXTRACTOR iniciando extração...', 'agent');

    const allMessages = [];
    let scrollCount = 0;
    let previousHeight = 0;
    let noNewCount = 0;

    await this.page.evaluate(() => {
      const container = document.querySelector('[data-testid="conversation-panel-messages"]') ||
                       document.querySelector('div[role="application"]');
      if (container) container.scrollTop = container.scrollHeight;
    });
    await this.page.waitForTimeout(800);

    while (scrollCount < CONFIG.MAX_SCROLLS && noNewCount < 3) {
      const batch = await this.page.evaluate((selectors) => {
        const results = [];
        const containers = document.querySelectorAll(selectors.MESSAGE_CONTAINER);

        containers.forEach((container) => {
          const textSelectors = [
            'span.selectable-text.copyable-text',
            'span[dir="ltr"].selectable-text',
            'span.selectable-text.invisible-space.copyable-text'
          ];

          let text = '';
          let textElement = null;

          for (const sel of textSelectors) {
            textElement = container.querySelector(sel);
            if (textElement) {
              text = textElement.textContent?.trim() || '';
              if (text.length > 1) break;
            }
          }

          if (!text) {
            const spans = container.querySelectorAll('span[dir="ltr"], span[dir="auto"]');
            for (const span of spans) {
              const t = span.textContent?.trim() || '';
              if (t.length > 2 && !t.match(/^(tail-|_|[0-9]+$)/)) {
                text = t;
                break;
              }
            }
          }

          if (!text || text.length < 2) return;

          const cssClasses = ['tail-in', 'tail-out', '_3yg5l', '_1VzZY', 'invisible-space'];
          if (cssClasses.includes(text)) return;

          const copyableEl = container.querySelector(selectors.COPYABLE_TEXT);
          const prePlainText = copyableEl?.getAttribute('data-pre-plain-text') || '';
          const authorMatch = prePlainText.match(/\]\s*(.*?):\s*/);
          let sender = authorMatch ? authorMatch[1].trim() : 'Unknown';

          if (sender === 'Unknown' || sender === text) {
            const titleEl = document.querySelector('[data-testid="conversation-info-header"] span[dir="auto"]');
            sender = titleEl?.textContent?.trim() || 'Unknown';
          }

          const timeMatch = container.textContent.match(/(\d{1,2}:\d{2})/);
          const time = timeMatch ? timeMatch[1] : '';

          const dateMatch = prePlainText.match(/\[(\d{2}\/\d{2}\/\d{4})/);
          const date = dateMatch ? dateMatch[1] : new Date().toLocaleDateString('pt-BR');

          const isOutgoing = container.classList.contains('message-out');
          const isSystem = container.classList.contains('message-system') ||
                          text.includes('Messages and calls are end-to-end encrypted');

          const msgId = `${date}-${time}-${sender}-${text.substring(0, 20).replace(/\s/g, '_')}`;

          results.push({
            id: msgId,
            text,
            sender,
            time,
            date,
            isOutgoing,
            isSystem,
            hasMedia: !!container.querySelector('img, video, audio'),
            hasDocument: !!container.querySelector('[data-testid="document"]')
          });
        });

        return results;
      }, SELECTORS);

      const newBatch = batch.filter(m => !this.seenIds.has(m.id));
      newBatch.forEach(m => this.seenIds.add(m.id));

      if (newBatch.length > 0) {
        allMessages.push(...newBatch);
        noNewCount = 0;
        log(`  Scroll ${scrollCount}: +${newBatch.length} mensagens novas (total: ${allMessages.length})`, 'info');
      } else {
        noNewCount++;
      }

      const currentHeight = await this.page.evaluate(() => {
        const container = document.querySelector('[data-testid="conversation-panel-messages"]') ||
                         document.querySelector('div[role="application"]');
        if (container) {
          const before = container.scrollTop;
          container.scrollBy(0, -800);
          return { before, after: container.scrollTop, height: container.scrollHeight };
        }
        return null;
      });

      if (!currentHeight || currentHeight.after === currentHeight.before) {
        noNewCount++;
      }

      previousHeight = currentHeight?.height || 0;
      scrollCount++;

      await this.page.waitForTimeout(600 + Math.random() * 400);
    }

    log(`EXTRACTOR completo: ${allMessages.length} mensagens únicas em ${scrollCount} scrolls`, 'success');
    return allMessages;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// AGENTE 2: UNDERSTANDER
// ═══════════════════════════════════════════════════════════════════════════════════
class UnderstanderAgent {
  constructor() {
    this.context = {
      currentTopic: null,
      participants: new Set(),
      mood: 'neutral',
      urgency: 'normal'
    };
  }

  analyzeConversation(messages) {
    const analysis = {
      topics: [],
      tasks: [],
      decisions: [],
      ideas: [],
      mentions: [],
      questions: [],
      completed: [],
      urgency: 'normal',
      mood: 'neutral',
      participants: new Set(),
      summary: ''
    };

    for (const msg of messages) {
      const text = msg.text.toLowerCase();
      const sender = msg.sender;
      analysis.participants.add(sender);

      // TAREFAS
      const taskPatterns = [
        { pattern: /\b(precisamos|precisa|tem que|temos que|falta|devemos|vamos)\s+(.+)/i, type: 'action_needed' },
        { pattern: /\b(tarefa|todo|task|fazer|resolver|terminar|enviar|criar|atualizar)\b/i, type: 'task_keyword' },
        { pattern: /\b(prazo|deadline|até|para (segunda|terça|quarta|quinta|sexta|sábado|domingo|\d+\/\d+))\b/i, type: 'deadline' },
        { pattern: /\b(urgente|urgência|rápido|imediato|agora|hj|hoje)\b/i, type: 'urgent' }
      ];

      for (const tp of taskPatterns) {
        const match = msg.text.match(tp.pattern);
        if (match) {
          const taskText = match[2] || match[0];
          analysis.tasks.push({
            text: taskText.substring(0, 200),
            sender,
            time: msg.time,
            date: msg.date,
            type: tp.type,
            priority: tp.type === 'urgent' ? 'high' : 'medium',
            status: 'pending',
            id: hash(`${sender}-${taskText}-${msg.time}`)
          });
          break;
        }
      }

      // DECISÕES
      const decisionPatterns = [
        { pattern: /\b(ok|feito|pronto|entregue|aprovado|confirmado|resolvido|finalizado|concluído|fechado)\b/i, type: 'approved' },
        { pattern: /\b(negado|rejeitado|cancelado|não vamos|descartado|desistimos)\b/i, type: 'rejected' },
        { pattern: /\b(vamos|decidimos|vai ser|será|fica assim|combinado|acordo|aceito)\b/i, type: 'decided' }
      ];

      for (const dp of decisionPatterns) {
        if (dp.pattern.test(msg.text)) {
          analysis.decisions.push({
            text: msg.text.substring(0, 200),
            sender,
            time: msg.time,
            date: msg.date,
            type: dp.type
          });
          break;
        }
      }

      // IDEIAS
      const ideaPatterns = [
        /\b(ideia|que tal|e se|podemos|poderíamos|seria bom|seria legal|pensa assim|imagine)\b/i,
        /\b(inovação|melhorar|otimizar|automatizar|integrar|nova funcionalidade)\b/i
      ];

      for (const ip of ideaPatterns) {
        if (ip.test(msg.text)) {
          analysis.ideas.push({
            text: msg.text.substring(0, 300),
            sender,
            time: msg.time,
            date: msg.date,
            category: this.categorizeIdea(msg.text)
          });
          break;
        }
      }

      // MENÇÕES
      const mentionPatterns = {
        abner: /\b(abner|ábner|685093192)\b/i,
        enoque: /\b(enoque|enoqu|superclim|pai)\b/i,
        nonoke: /\b(nonoke|nono)\b/i,
        todos: /\b(@todos|todos|equipe|galera|pessoal|time)\b/i
      };

      for (const [name, pattern] of Object.entries(mentionPatterns)) {
        if (pattern.test(msg.text)) {
          analysis.mentions.push({ to: name, from: sender, text: msg.text.substring(0, 100) });
        }
      }

      // PERGUNTAS
      if (msg.text.includes('?')) {
        analysis.questions.push({
          text: msg.text.substring(0, 200),
          sender,
          time: msg.time,
          answered: false
        });
      }

      // CONCLUSÕES
      const completionPatterns = [
        /\b(já (fiz|fizemos|terminamos|enviamos|atualizamos|resolvemos))\b/i,
        /\b(pronto|feito|entregue|concluído|finalizado|resolvido)\b/i,
        /\b(check|✓|✅|concluído|done)\b/i
      ];

      for (const cp of completionPatterns) {
        if (cp.test(msg.text)) {
          analysis.completed.push({
            text: msg.text.substring(0, 200),
            sender,
            time: msg.time,
            date: msg.date
          });
          break;
        }
      }

      // URGÊNCIA
      if (/\b(urgente|urgência|crítico|emergência|agora|hj|hoje|imediato)\b/i.test(msg.text)) {
        analysis.urgency = 'high';
      }

      // HUMOR
      if (/\b(obrigado|valeu|show|excelente|perfeito|maravilha|bom demais|top)\b/i.test(msg.text)) {
        analysis.mood = 'positive';
      } else if (/\b(problema|erro|bug|falha|quebrou|não funciona|deu ruim)\b/i.test(msg.text)) {
        analysis.mood = 'negative';
      }
    }

    analysis.summary = this.generateSummary(analysis);
    analysis.participants = Array.from(analysis.participants);

    return analysis;
  }

  categorizeIdea(text) {
    const lower = text.toLowerCase();
    if (lower.includes('dashboard') || lower.includes('interface') || lower.includes('ui')) return 'ui/ux';
    if (lower.includes('api') || lower.includes('backend') || lower.includes('server')) return 'backend';
    if (lower.includes('whatsapp') || lower.includes('automação') || lower.includes('bot')) return 'automation';
    if (lower.includes('cliente') || lower.includes('venda') || lower.includes('marketing')) return 'business';
    if (lower.includes('financeiro') || lower.includes('pagamento') || lower.includes('dinheiro')) return 'finance';
    return 'general';
  }

  generateSummary(analysis) {
    const parts = [];
    if (analysis.tasks.length > 0) parts.push(`${analysis.tasks.length} tarefas`);
    if (analysis.decisions.length > 0) parts.push(`${analysis.decisions.length} decisões`);
    if (analysis.ideas.length > 0) parts.push(`${analysis.ideas.length} ideias`);
    if (analysis.mentions.length > 0) parts.push(`${analysis.mentions.length} menções`);
    if (analysis.questions.length > 0) parts.push(`${analysis.questions.length} perguntas`);
    if (analysis.completed.length > 0) parts.push(`${analysis.completed.length} conclusões`);

    return parts.join(' | ') || 'Conversa geral';
  }

  crossReferenceTasks(existingTasks, newCompleted) {
    const updated = [...existingTasks];
    const resolved = [];

    for (const completion of newCompleted) {
      const matchIndex = updated.findIndex(t =>
        t.status === 'pending' &&
        (completion.text.toLowerCase().includes(t.text.toLowerCase().substring(0, 30)) ||
         t.text.toLowerCase().includes(completion.text.toLowerCase().substring(0, 30)))
      );

      if (matchIndex >= 0) {
        updated[matchIndex].status = 'completed';
        updated[matchIndex].completedAt = now();
        updated[matchIndex].completedBy = completion.sender;
        resolved.push(updated[matchIndex]);
      }
    }

    return { updated, resolved };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// AGENTE 3: MEMORY KEEPER
// ═══════════════════════════════════════════════════════════════════════════════════
class MemoryKeeperAgent {
  constructor() {
    this.ensureDirs();
    this.tasks = this.loadJSON(CONFIG.TASKS_FILE, { tasks: [], version: '1.0' });
    this.ideas = this.loadJSON(CONFIG.IDEAS_FILE, { ideas: [], version: '1.0' });
    this.history = this.loadJSON(CONFIG.HISTORY_FILE, { completed: [], version: '1.0' });
    this.checkpoints = this.loadJSON(CONFIG.CHECKPOINT_FILE, { checkpoints: [], version: '1.0' });
  }

  ensureDirs() {
    [CONFIG.DATA_DIR, CONFIG.MEMORY_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  loadJSON(file, defaultValue) {
    try {
      if (fs.existsSync(file)) {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      }
    } catch (e) {
      log(`Erro carregando ${file}: ${e.message}`, 'error');
    }
    return defaultValue;
  }

  saveJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  }

  addTasks(newTasks) {
    const added = [];
    for (const task of newTasks) {
      const exists = this.tasks.tasks.some(t => t.id === task.id);
      if (!exists) {
        this.tasks.tasks.push(task);
        added.push(task);
      }
    }
    if (added.length > 0) {
      this.saveJSON(CONFIG.TASKS_FILE, this.tasks);
      log(`MEMORY: ${added.length} tarefas adicionadas`, 'task');
    }
    return added;
  }

  completeTasks(tasksToComplete) {
    const completed = [];
    for (const task of this.tasks.tasks) {
      if (task.status === 'pending') {
        const match = tasksToComplete.find(c =>
          c.text.toLowerCase().includes(task.text.toLowerCase().substring(0, 30)) ||
          task.text.toLowerCase().includes(c.text.toLowerCase().substring(0, 30))
        );
        if (match) {
          task.status = 'completed';
          task.completedAt = now();
          task.completedBy = match.sender;
          completed.push(task);
          this.history.completed.push({
            ...task,
            completedAt: now(),
            originalContext: match.text
          });
        }
      }
    }
    if (completed.length > 0) {
      this.saveJSON(CONFIG.TASKS_FILE, this.tasks);
      this.saveJSON(CONFIG.HISTORY_FILE, this.history);
      log(`MEMORY: ${completed.length} tarefas marcadas como concluídas`, 'success');
    }
    return completed;
  }

  addIdeas(newIdeas) {
    const added = [];
    for (const idea of newIdeas) {
      const exists = this.ideas.ideas.some(i =>
        i.text.substring(0, 50) === idea.text.substring(0, 50)
      );
      if (!exists) {
        idea.id = hash(idea.text + idea.time);
        idea.status = 'new';
        this.ideas.ideas.push(idea);
        added.push(idea);
      }
    }
    if (added.length > 0) {
      this.saveJSON(CONFIG.IDEAS_FILE, this.ideas);
      log(`MEMORY: ${added.length} ideias adicionadas`, 'idea');
    }
    return added;
  }

  addCheckpoint(checkpoint) {
    this.checkpoints.checkpoints.push(checkpoint);
    if (this.checkpoints.checkpoints.length > 50) {
      this.checkpoints.checkpoints = this.checkpoints.checkpoints.slice(-50);
    }
    this.saveJSON(CONFIG.CHECKPOINT_FILE, this.checkpoints);
  }

  writeDashboardData(analysis, messages, checkpoint) {
    // Garante que o diretório existe
    const dashboardDir = path.dirname(CONFIG.DASHBOARD_DATA_FILE);
    if (!fs.existsSync(dashboardDir)) {
      fs.mkdirSync(dashboardDir, { recursive: true });
    }

    const dashboardData = {
      version: '7.0',
      updatedAt: now(),
      group: CONFIG.GROUP_NAME,
      stats: {
        totalMessages: messages.length,
        pendingTasks: this.tasks.tasks.filter(t => t.status === 'pending').length,
        completedTasks: this.history.completed.length,
        totalIdeas: this.ideas.ideas.length,
        urgency: analysis.urgency,
        mood: analysis.mood
      },
      tasks: {
        pending: this.tasks.tasks.filter(t => t.status === 'pending'),
        completed: this.history.completed.slice(-10)
      },
      ideas: this.ideas.ideas.slice(-20),
      recentMessages: messages.slice(-30).map(m => ({
        sender: m.sender,
        text: m.text.substring(0, 200),
        time: m.time,
        date: m.date
      })),
      analysis: {
        summary: analysis.summary,
        participants: analysis.participants,
        decisions: analysis.decisions,
        mentions: analysis.mentions,
        questions: analysis.questions.length
      },
      checkpoint: {
        timestamp: checkpoint.timestamp,
        newTasks: checkpoint.stats?.newTasks || 0,
        newIdeas: checkpoint.stats?.newIdeas || 0
      }
    };

    fs.writeFileSync(CONFIG.DASHBOARD_DATA_FILE, JSON.stringify(dashboardData, null, 2));
    log(`DASHBOARD: Dados exportados para ${CONFIG.DASHBOARD_DATA_FILE}`, 'success');
  }

  writeContextMD(analysis, messages) {
    const content = `# Contexto de Conversa — ${CONFIG.GROUP_NAME}
## Atualizado em: ${timeBR()}

### 📊 Resumo
${analysis.summary}

### 👥 Participantes
${analysis.participants.map(p => `- ${p}`).join('\n')}

### 😊 Humor: ${analysis.mood} | ⚡ Urgência: ${analysis.urgency}

### 📋 Tarefas Pendentes (${this.tasks.tasks.filter(t => t.status === 'pending').length})
${this.tasks.tasks.filter(t => t.status === 'pending').map(t => `- [ ] ${t.text} (por ${t.sender}, ${t.date} ${t.time})`).join('\n') || 'Nenhuma'}

### ✅ Tarefas Concluídas (últimas 10)
${this.history.completed.slice(-10).map(t => `- [x] ${t.text} (por ${t.completedBy}, ${t.completedAt})`).join('\n') || 'Nenhuma'}

### 💡 Ideias Recentes
${this.ideas.ideas.slice(-10).map(i => `- ${i.text.substring(0, 100)} (por ${i.sender}, ${i.category})`).join('\n') || 'Nenhuma'}

### 📝 Mensagens Recentes
${messages.slice(-20).map(m => `- **[${m.time}] ${m.sender}:** ${m.text.substring(0, 150)}${m.text.length > 150 ? '...' : ''}`).join('\n')}

### 🎯 DICAS PARA O AGENTE DE INTEGRAÇÃO
- Superclim = Enoque (pai do Abner), tem 2 números
- Nonoke = membro ativo do grupo
- Abner (você) = 685093192
- Quando alguém diz "pronto", "feito", "entregue" → verificar se é conclusão de tarefa
- Tarefas com prazo devem ter prioridade alta
- Ideias devem ser categorizadas por área (ui/ux, backend, automation, business, finance)
- Mensagens de sistema (encriptação) devem ser ignoradas
`;

    fs.writeFileSync(CONFIG.CONTEXT_FILE, content);
    log(`MEMORY: Contexto salvo em ${CONFIG.CONTEXT_FILE}`, 'success');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// ORQUESTRADOR PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════
export class NexoIntelligenceCore {
  constructor() {
    this.browser = null;
    this.page = null;
    this.extractor = null;
    this.understander = new UnderstanderAgent();
    this.memory = new MemoryKeeperAgent();
    this.isRunning = false;
  }

  async connect() {
    log('Conectando ao Chrome CDP...', 'agent');
    this.browser = await chromium.connectOverCDP(CONFIG.CDP_URL);
    const contexts = this.browser.contexts();
    if (contexts.length === 0) throw new Error('Sem contextos CDP');

    this.page = contexts[0].pages()[0];
    if (!this.page) throw new Error('Sem páginas no contexto');

    this.extractor = new ExtractorAgent(this.page);
    log('Conectado!', 'success');
    return this;
  }

  async openGroup() {
    log(`Abrindo grupo: ${CONFIG.GROUP_NAME}...`, 'chat');

    const found = await this.page.evaluate((searchName) => {
      const selectors = [
        '[data-testid="chat-list"] > div[role="row"]',
        '#pane-side div[role="listitem"]',
        '#pane-side [role="grid"] > div',
        'div[data-testid="cell-frame"]'
      ];

      let els = [];
      for (const sel of selectors) {
        els = document.querySelectorAll(sel);
        if (els.length > 0) break;
      }

      for (const el of els) {
        const titleEl = el.querySelector('span[dir="auto"], span[title]');
        const title = titleEl?.textContent?.trim() || titleEl?.getAttribute('title') || '';

        if (title.toLowerCase().includes(searchName.toLowerCase().replace(/[^a-z0-9]/g, '')) ||
            title.toLowerCase().includes('production') && title.includes('2026')) {
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
    }, CONFIG.GROUP_NAME_SHORT);

    if (found.found) {
      await this.page.mouse.click(found.x, found.y);
      await this.page.waitForTimeout(1500);
      log(`Grupo aberto: "${found.title}"`, 'success');
      return true;
    }

    log('Grupo não encontrado na lista visível', 'warn');
    return false;
  }

  async runCycle() {
    const cycleStart = now();
    log(`\n${'='.repeat(70)}`, 'agent');
    log(`🦀 NEXO INTELLIGENCE CORE — Ciclo iniciado`, 'agent');
    log(`${'='.repeat(70)}\n`, 'agent');

    try {
      // PASSO 1: EXTRAÇÃO
      await this.openGroup();
      const messages = await this.extractor.extractAllMessages();

      if (messages.length === 0) {
        log('Nenhuma mensagem nova', 'warn');
        return null;
      }

      // PASSO 2: ENTENDIMENTO
      log('\nAgente UNDERSTANDER analisando contexto...', 'agent');
      const analysis = this.understander.analyzeConversation(messages);

      log(`  📋 ${analysis.tasks.length} tarefas detectadas`, 'task');
      log(`  ✅ ${analysis.decisions.length} decisões`, 'success');
      log(`  💡 ${analysis.ideas.length} ideias`, 'idea');
      log(`  ❓ ${analysis.questions.length} perguntas`, 'info');
      log(`  🏁 ${analysis.completed.length} conclusões`, 'success');
      log(`  👥 Participantes: ${analysis.participants.join(', ')}`, 'chat');
      log(`  ⚡ Urgência: ${analysis.urgency} | 😊 Humor: ${analysis.mood}`, 'info');

      // PASSO 3: CRUZAMENTO DE TAREFAS
      const { updated: updatedTasks, resolved } = this.understander.crossReferenceTasks(
        this.memory.tasks.tasks,
        analysis.completed
      );
      this.memory.tasks.tasks = updatedTasks;
      if (resolved.length > 0) {
        this.memory.saveJSON(CONFIG.TASKS_FILE, this.memory.tasks);
        log(`  ✅ ${resolved.length} tarefas marcadas como concluídas automaticamente`, 'success');
      }

      // PASSO 4: PERSISTÊNCIA
      const newTasks = this.memory.addTasks(analysis.tasks);
      const newIdeas = this.memory.addIdeas(analysis.ideas);
      this.memory.completeTasks(analysis.completed);

      // PASSO 5: CHECKPOINT
      const checkpoint = {
        timestamp: cycleStart,
        group: CONFIG.GROUP_NAME,
        stats: {
          totalMessages: messages.length,
          newTasks: newTasks.length,
          newIdeas: newIdeas.length,
          resolvedTasks: resolved.length,
          urgency: analysis.urgency,
          mood: analysis.mood
        },
        analysis: {
          summary: analysis.summary,
          tasks: analysis.tasks.map(t => ({ text: t.text, priority: t.priority, status: t.status })),
          decisions: analysis.decisions,
          ideas: analysis.ideas.map(i => ({ text: i.text.substring(0, 100), category: i.category })),
          mentions: analysis.mentions,
          questions: analysis.questions.length
        },
        messages: messages.slice(-20).map(m => ({
          sender: m.sender,
          text: m.text.substring(0, 150),
          time: m.time,
          date: m.date
        }))
      };

      this.memory.addCheckpoint(checkpoint);

      // PASSO 6: EXPORTAR PARA DASHBOARD
      this.memory.writeDashboardData(analysis, messages, checkpoint);
      this.memory.writeContextMD(analysis, messages);

      // PASSO 7: RELATÓRIO
      log(`\n${'='.repeat(70)}`, 'success');
      log(`✅ CICLO COMPLETO`, 'success');
      log(`   Mensagens: ${messages.length}`, 'info');
      log(`   Tarefas novas: ${newTasks.length}`, 'task');
      log(`   Tarefas resolvidas: ${resolved.length}`, 'success');
      log(`   Ideias novas: ${newIdeas.length}`, 'idea');
      log(`   Dashboard: ${CONFIG.DASHBOARD_DATA_FILE}`, 'info');
      log(`${'='.repeat(70)}\n`, 'success');

      return checkpoint;

    } catch (error) {
      log(`Erro no ciclo: ${error.message}`, 'error');
      console.error(error);
      return null;
    }
  }

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    log('🦀 NEXO INTELLIGENCE CORE v7.0 INICIADO', 'agent');
    log(`   Grupo: ${CONFIG.GROUP_NAME}`, 'info');
    log(`   Intervalo: ${CONFIG.CHECK_INTERVAL_MS / 60000} minutos`, 'info');
    log(`   Dashboard: ${CONFIG.DASHBOARD_DATA_FILE}`, 'info');
    log('   Pressione Ctrl+C para parar\n', 'warn');

    await this.connect();
    await this.runCycle();

    this.intervalId = setInterval(() => {
      this.runCycle().catch(err => log(`Erro: ${err.message}`, 'error'));
    }, CONFIG.CHECK_INTERVAL_MS);
  }

  async stop() {
    this.isRunning = false;
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.browser) await this.browser.close();
    log('NEXO INTELLIGENCE CORE parado', 'warn');
  }

  async runOnce() {
    await this.connect();
    const result = await this.runCycle();
    await this.stop();
    return result;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════════
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'daemon';

  const core = new NexoIntelligenceCore();

  if (mode === 'once') {
    await core.runOnce();
    process.exit(0);
  } else if (mode === 'daemon') {
    await core.start();
  } else {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════════╗
║                    NEXO INTELLIGENCE CORE v7.0                                   ║
╚══════════════════════════════════════════════════════════════════════════════════╝

Uso: node agents/nexo-intelligence-core.mjs [modo]

Modos:
  once    → Executa um ciclo único e sai
  daemon  → Inicia loop contínuo (padrão: a cada 30min)

Pipeline de Agentes:
  1. EXTRACTOR    → Extrai mensagens com scroll infinito otimizado
  2. UNDERSTANDER → Analisa contexto, tarefas, decisões, ideias, humor
  3. MEMORY KEEPER→ Persiste em JSON + Markdown + Dashboard Data

Arquivos gerados:
  data/whatsapp-checkpoints-v7.json        → Checkpoints históricos
  data/tasks-board.json                    → Tarefas pendentes/concluídas
  data/ideas-bank.json                     → Banco de ideias
  data/conversation-context.md             → Contexto em Markdown
  apps/admin/public/whatsapp-data.json     → Dados para o Dashboard
`);
  }
}

process.on('SIGINT', async () => {
  log('\nEncerrando...', 'warn');
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    log(`Erro fatal: ${err.message}`, 'error');
    process.exit(1);
  });
}
