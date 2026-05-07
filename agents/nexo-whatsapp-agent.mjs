/**
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║           NEXO WHATSAPP AGENT — Integração Dashboard NEXO PRO                   ║
 * ║                                                                                  ║
 * ║  Lê grupos do WhatsApp, extrai tarefas/ideias/decisões, e gera dados para       ║
 * ║  o dashboard NEXO PRO em:                                                        ║
 * ║  C:\Users\Administrator\Documents\NEXO DIGITAL\01_ATIVOS\NEXO_DASHBOARD_PRO\    ║
 * ║                                                                                  ║
 * ║  GRUPOS MONITORADOS:                                                             ║
 * ║  - 🏆Production - 2026🙏 (Enoque, Elias, Abner)                                 ║
 * ║  - Paulo (web) (cliente Santafe)                                                ║
 * ║                                                                                  ║
 * ║  ATIVAÇÃO: A cada 30 minutos via Task Scheduler                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════════
const CONFIG = {
  CDP_URL: 'http://127.0.0.1:9222',
  GROUPS: ['🏆Production - 2026🙏', 'Paulo (web)'],
  GROUP_SHORT: ['Production - 2026', 'Paulo'],
  
  // Saída para o dashboard NEXO PRO
  NEXO_PRO_DIR: 'C:\\Users\\Administrator\\Documents\\NEXO DIGITAL\\01_ATIVOS\\NEXO_DASHBOARD_PRO',
  OUTPUT_FILE: 'C:\\Users\\Administrator\\Documents\\NEXO DIGITAL\\01_ATIVOS\\NEXO_DASHBOARD_PRO\\backend\\data\\whatsapp-agent-data.json',
  
  // Também salva localmente
  LOCAL_DATA_DIR: path.join(__dirname, '..', 'data'),
  
  SCROLL_MAX: 25,
  CHECK_INTERVAL_MS: 30 * 60 * 1000
};

const SELECTORS = {
  MSG_CONTAINER: '.message-in, .message-out',
  MSG_TEXT: 'span.selectable-text.copyable-text',
  MSG_TEXT_ALT: 'span[dir="ltr"].selectable-text',
  COPYABLE: '.copyable-text',
  CHAT_LIST: '[data-testid="chat-list"] > div[role="row"], #pane-side div[role="listitem"]'
};

// ═══════════════════════════════════════════════════════════════════════════════════
// UTILITÁRIOS
// ═══════════════════════════════════════════════════════════════════════════════════
function log(msg, icon = '•') {
  const time = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${time}] ${icon} ${msg}`);
}

function now() { return new Date().toISOString(); }

// ═══════════════════════════════════════════════════════════════════════════════════
// EXTRATOR DE MENSAGENS
// ═══════════════════════════════════════════════════════════════════════════════════
async function extractMessages(page, groupName) {
  log(`Extraindo mensagens do grupo: "${groupName}"...`, '📱');
  
  const messages = [];
  const seenIds = new Set();
  let scrollCount = 0;
  let noNewCount = 0;
  
  // Scroll para baixo primeiro
  await page.evaluate(() => {
    const c = document.querySelector('[data-testid="conversation-panel-messages"]') || 
              document.querySelector('div[role="application"]');
    if (c) c.scrollTop = c.scrollHeight;
  });
  await page.waitForTimeout(500);
  
  while (scrollCount < CONFIG.SCROLL_MAX && noNewCount < 3) {
    const batch = await page.evaluate((selectors) => {
      const results = [];
      const containers = document.querySelectorAll(selectors.MSG_CONTAINER);
      
      containers.forEach(container => {
        // Extrair texto
        let text = '';
        for (const sel of [selectors.MSG_TEXT, selectors.MSG_TEXT_ALT]) {
          const el = container.querySelector(sel);
          if (el) { text = el.textContent?.trim() || ''; if (text.length > 1) break; }
        }
        
        if (!text || text.length < 2) return;
        
        // Ignorar classes CSS
        if (['tail-in','tail-out','_3yg5l','_1VzZY'].includes(text)) return;
        
        // Extrair autor
        const copyable = container.querySelector(selectors.COPYABLE);
        const preText = copyable?.getAttribute('data-pre-plain-text') || '';
        const authorMatch = preText.match(/\]\s*(.*?):\s*/);
        let sender = authorMatch ? authorMatch[1].trim() : 'Unknown';
        
        if (sender === 'Unknown') {
          const titleEl = document.querySelector('[data-testid="conversation-info-header"] span[dir="auto"]');
          sender = titleEl?.textContent?.trim() || 'Unknown';
        }
        
        // Timestamp
        const timeMatch = container.textContent.match(/(\d{1,2}:\d{2})/);
        const time = timeMatch ? timeMatch[1] : '';
        
        // Data
        const dateMatch = preText.match(/\[(\d{2}\/\d{2}\/\d{4})/);
        const date = dateMatch ? dateMatch[1] : new Date().toLocaleDateString('pt-BR');
        
        const isOutgoing = container.classList.contains('message-out');
        const msgId = `${date}-${time}-${sender}-${text.substring(0,15)}`;
        
        results.push({ id: msgId, text, sender, time, date, isOutgoing });
      });
      return results;
    }, SELECTORS);
    
    const newBatch = batch.filter(m => !seenIds.has(m.id));
    newBatch.forEach(m => seenIds.add(m.id));
    
    if (newBatch.length > 0) {
      messages.push(...newBatch);
      noNewCount = 0;
    } else {
      noNewCount++;
    }
    
    // Scroll up
    const scrolled = await page.evaluate(() => {
      const c = document.querySelector('[data-testid="conversation-panel-messages"]') || 
                document.querySelector('div[role="application"]');
      if (c) { const b = c.scrollTop; c.scrollBy(0, -600); return c.scrollTop !== b; }
      return false;
    });
    
    if (!scrolled) noNewCount++;
    scrollCount++;
    await page.waitForTimeout(400 + Math.random() * 300);
  }
  
  log(`Extraídas ${messages.length} mensagens em ${scrollCount} scrolls`, '✅');
  return messages;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// ANALISADOR DE CONTEÚDO
// ═══════════════════════════════════════════════════════════════════════════════════
function analyzeMessages(messages, groupName) {
  const analysis = {
    tasks: [], decisions: [], ideas: [], mentions: [],
    questions: [], completed: [], participants: new Set(),
    urgency: 'normal', mood: 'neutral'
  };
  
  for (const msg of messages) {
    const text = msg.text;
    const lower = text.toLowerCase();
    analysis.participants.add(msg.sender);
    
    // TAREFAS
    const taskPatterns = [
      /\b(precisamos|precisa|tem que|temos que|falta|devemos|vamos)\s+(.+)/i,
      /\b(tarefa|fazer|resolver|terminar|enviar|criar|atualizar|implementar)\b/i,
      /\b(prazo|deadline|até (segunda|terça|quarta|quinta|sexta|sábado|domingo|\d+\/\d+))\b/i
    ];
    for (const p of taskPatterns) {
      const m = text.match(p);
      if (m) {
        analysis.tasks.push({
          text: (m[2] || m[0]).substring(0, 200),
          sender: msg.sender, time: msg.time, date: msg.date,
          priority: /urgente|rápido|hj|hoje|imediato/i.test(text) ? 'high' : 'medium',
          status: 'pending', group: groupName
        });
        break;
      }
    }
    
    // DECISÕES
    if (/\b(ok|feito|pronto|entregue|aprovado|confirmado|resolvido|finalizado|concluído|vamos|decidimos|combinado)\b/i.test(text)) {
      analysis.decisions.push({ text: text.substring(0,200), sender: msg.sender, time: msg.time, type: 'decided' });
    }
    
    // IDEIAS
    if (/\b(ideia|que tal|e se|podemos|poderíamos|seria bom|inovação|melhorar|otimizar|automatizar)\b/i.test(text)) {
      analysis.ideas.push({ text: text.substring(0,300), sender: msg.sender, time: msg.time, group: groupName });
    }
    
    // CONCLUSÕES (tarefas feitas)
    if (/\b(já (fiz|fizemos|terminamos|enviamos|resolvemos)|pronto|feito|entregue|concluído|check|✓|✅)\b/i.test(text)) {
      analysis.completed.push({ text: text.substring(0,200), sender: msg.sender, time: msg.time });
    }
    
    // MENÇÕES
    const mentions = [];
    if (/\b(abner|ábner|685093192)\b/i.test(text)) mentions.push('abner');
    if (/\b(enoque|superclim|pai)\b/i.test(text)) mentions.push('enoque');
    if (/\b(nonoke)\b/i.test(text)) mentions.push('nonoke');
    if (/\b(elias)\b/i.test(text)) mentions.push('elias');
    if (/\b(@todos|todos|equipe|galera)\b/i.test(text)) mentions.push('todos');
    mentions.forEach(m => analysis.mentions.push({ to: m, from: msg.sender, text: text.substring(0,100) }));
    
    // PERGUNTAS
    if (text.includes('?')) {
      analysis.questions.push({ text: text.substring(0,200), sender: msg.sender, time: msg.time });
    }
    
    // URGÊNCIA E HUMOR
    if (/\b(urgente|urgência|crítico|emergência|agora|imediato)\b/i.test(text)) analysis.urgency = 'high';
    if (/\b(obrigado|valeu|show|excelente|perfeito|top)\b/i.test(text)) analysis.mood = 'positive';
    if (/\b(problema|erro|bug|falha|quebrou|deu ruim)\b/i.test(text)) analysis.mood = 'negative';
  }
  
  analysis.participants = Array.from(analysis.participants);
  return analysis;
}

// ═══════════════════════════════════════════════════════════════════════════════════
// GERAR DADOS DO DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════════
function generateDashboardData(allGroupsData) {
  const allTasks = [];
  const allIdeas = [];
  const allDecisions = [];
  const allMessages = [];
  const allParticipants = new Set();
  
  for (const group of allGroupsData) {
    allTasks.push(...group.analysis.tasks.map(t => ({ ...t, group: group.groupName })));
    allIdeas.push(...group.analysis.ideas);
    allDecisions.push(...group.analysis.decisions);
    allMessages.push(...group.messages.slice(-10).map(m => ({ ...m, group: group.groupName })));
    group.analysis.participants.forEach(p => allParticipants.add(p));
  }
  
  // Calcular progresso dos projetos
  const projectProgress = [
    { name: 'Santafe (Paulo)', status: 'Contrato fechado, aguardando pagamento', progress: 65, health: 'good' },
    { name: 'Superclim (Enoque)', status: 'Docs em aprovação', progress: 40, health: 'warning' },
    { name: 'Mangá Stop', status: 'Em desenvolvimento', progress: 25, health: 'good' },
    { name: 'SpeakEasily', status: 'Planejamento', progress: 10, health: 'neutral' }
  ];
  
  // Tarefas por prioridade
  const highPriority = allTasks.filter(t => t.priority === 'high');
  const mediumPriority = allTasks.filter(t => t.priority === 'medium');
  
  return {
    version: '7.0',
    updatedAt: now(),
    stats: {
      totalMessages: allGroupsData.reduce((a, g) => a + g.messages.length, 0),
      totalTasks: allTasks.length,
      highPriorityTasks: highPriority.length,
      totalIdeas: allIdeas.length,
      totalDecisions: allDecisions.length,
      activeGroups: allGroupsData.length,
      participants: Array.from(allParticipants)
    },
    tasks: {
      high: highPriority,
      medium: mediumPriority,
      all: allTasks
    },
    ideas: allIdeas.slice(-20),
    decisions: allDecisions.slice(-20),
    recentMessages: allMessages.slice(-30),
    projectProgress,
    groups: allGroupsData.map(g => ({
      name: g.groupName,
      messageCount: g.messages.length,
      taskCount: g.analysis.tasks.length,
      urgency: g.analysis.urgency,
      mood: g.analysis.mood,
      participants: g.analysis.participants
    }))
  };
}

// ═══════════════════════════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════
async function runAgent() {
  log('═══════════════════════════════════════════════════════════════', '');
  log('NEXO WHATSAPP AGENT v7.0 — Iniciando ciclo', '🦀');
  log('═══════════════════════════════════════════════════════════════', '');
  
  let browser;
  try {
    // Conectar ao Chrome
    log('Conectando ao Chrome CDP...', '🔌');
    browser = await chromium.connectOverCDP(CONFIG.CDP_URL);
    const contexts = browser.contexts();
    if (contexts.length === 0) throw new Error('Sem contextos CDP');
    
    const page = contexts[0].pages()[0];
    if (!page) throw new Error('Sem páginas');
    
    log('Conectado!', '✅');
    
    const allGroupsData = [];
    
    // Processar cada grupo
    for (let i = 0; i < CONFIG.GROUPS.length; i++) {
      const groupName = CONFIG.GROUPS[i];
      const groupShort = CONFIG.GROUP_SHORT[i];
      
      log(`\nProcessando grupo ${i+1}/${CONFIG.GROUPS.length}: "${groupName}"`, '💬');
      
      // Abrir grupo
      const found = await page.evaluate((searchName) => {
        const selectors = [
          '[data-testid="chat-list"] > div[role="row"]',
          '#pane-side div[role="listitem"]',
          '#pane-side [role="grid"] > div'
        ];
        let els = [];
        for (const sel of selectors) {
          els = document.querySelectorAll(sel);
          if (els.length > 0) break;
        }
        
        for (const el of els) {
          const titleEl = el.querySelector('span[dir="auto"], span[title]');
          const title = titleEl?.textContent?.trim() || titleEl?.getAttribute('title') || '';
          if (title.toLowerCase().includes(searchName.toLowerCase())) {
            const rect = el.getBoundingClientRect();
            return { found: true, x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
          }
        }
        return { found: false };
      }, groupShort);
      
      if (!found.found) {
        log(`Grupo "${groupName}" não encontrado`, '⚠️');
        continue;
      }
      
      await page.mouse.click(found.x, found.y);
      await page.waitForTimeout(1500);
      
      // Extrair mensagens
      const messages = await extractMessages(page, groupName);
      
      // Analisar
      const analysis = analyzeMessages(messages, groupName);
      
      log(`  Tarefas: ${analysis.tasks.length} | Decisões: ${analysis.decisions.length} | Ideias: ${analysis.ideas.length}`, '📊');
      
      allGroupsData.push({ groupName, messages, analysis });
      
      await page.waitForTimeout(1000);
    }
    
    // Gerar dados do dashboard
    const dashboardData = generateDashboardData(allGroupsData);
    
    // Salvar no NEXO PRO
    const outputDir = path.dirname(CONFIG.OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(dashboardData, null, 2));
    
    // Também salvar localmente
    if (!fs.existsSync(CONFIG.LOCAL_DATA_DIR)) fs.mkdirSync(CONFIG.LOCAL_DATA_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(CONFIG.LOCAL_DATA_DIR, 'whatsapp-agent-data.json'),
      JSON.stringify(dashboardData, null, 2)
    );
    
    log(`\nDados salvos em: ${CONFIG.OUTPUT_FILE}`, '💾');
    log(`Mensagens: ${dashboardData.stats.totalMessages}`, '📱');
    log(`Tarefas: ${dashboardData.stats.totalTasks} (Alta: ${dashboardData.stats.highPriorityTasks})`, '📋');
    log(`Ideias: ${dashboardData.stats.totalIdeas}`, '💡');
    log(`Decisões: ${dashboardData.stats.totalDecisions}`, '✅');
    log(`Projetos: ${dashboardData.projectProgress.length}`, '🚀');
    
    await browser.close();
    
    log('\n✅ CICLO COMPLETO', '');
    log('═══════════════════════════════════════════════════════════════\n', '');
    
    return dashboardData;
    
  } catch (error) {
    log(`ERRO: ${error.message}`, '❌');
    console.error(error);
    if (browser) await browser.close();
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════
// EXPORTAÇÕES
// ═══════════════════════════════════════════════════════════════════════════════════
export { runAgent };

// ═══════════════════════════════════════════════════════════════════════════════════
// CLI
// ═══════════════════════════════════════════════════════════════════════════════════
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'once';
  
  if (mode === 'once') {
    await runAgent();
    process.exit(0);
  } else if (mode === 'daemon') {
    log('MODO DAEMON — Rodando a cada 30 minutos', '🦀');
    await runAgent();
    setInterval(runAgent, CONFIG.CHECK_INTERVAL_MS);
  } else {
    console.log('\nNEXO WHATSAPP AGENT v7.0\nUso: node nexo-whatsapp-agent.mjs [once|daemon]\n');
  }
}

process.on('SIGINT', () => { log('Encerrando...', '👋'); process.exit(0); });

// Executa diretamente
main().catch(err => { log(`Fatal: ${err.message}`, '❌'); process.exit(1); });
