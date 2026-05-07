#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    WHATSAPP AGENT - LAUNCHER SIMPLES                         ║
 * ║                                                                              ║
 * ║  Comandos:                                                                   ║
 * ║    node agents/launcher.mjs map       → Mapeia toda a interface               ║
 * ║    node agents/launcher.mjs daemon    → Inicia agente em loop (padrão)        ║
 * ║    node agents/launcher.mjs once      → Executa uma verificação               ║
 * ║    node agents/launcher.mjs interactive → Modo interativo com teclas          ║
 * ║    node agents/launcher.mjs test      → Testa extração de mensagens           ║
 * ║    node agents/launcher.mjs chat "Nome" → Abre chat específico                ║
 * ║                                                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
  CDP_PORT: 9222,
  MAP_FILE: path.join(__dirname, '..', 'data', 'whatsapp-map.json')
};

// ─── UTILITÁRIOS ───
function log(msg) {
  const time = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${time}] ${msg}`);
}

async function connect() {
  log('Conectando ao Chrome CDP...');
  const browser = await chromium.connectOverCDP(`http://localhost:${CONFIG.CDP_PORT}`);
  const contexts = browser.contexts();
  const page = contexts[0]?.pages()?.[0];
  if (!page) throw new Error('Página não encontrada');
  
  const viewport = await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }));
  log(`Conectado! Viewport: ${viewport.width}x${viewport.height}`);
  
  return { browser, page, viewport };
}

// ─── COMANDOS ───

/** Mapeia a interface completa */
async function cmdMap() {
  const { runFullMapping } = await import('./whatsapp-mapper.mjs');
  await runFullMapping();
}

/** Testa extração de mensagens */
async function cmdTest() {
  const { page, browser } = await connect();
  
  log('Testando extração de mensagens...');
  
  const messages = await page.evaluate(() => {
    const results = [];
    const containers = document.querySelectorAll('.message-in, .message-out');
    
    containers.forEach((container, idx) => {
      // Seletores confirmados por múltiplas fontes
      const textSelectors = [
        'span.selectable-text.copyable-text',     // HARPA AI
        'span[dir="ltr"].selectable-text',        // wwebjs
        'span.selectable-text.invisible-space.copyable-text'  // GitHub #521
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
      
      // Fallback: busca mais ampla
      if (!text) {
        const spans = container.querySelectorAll('span[dir="ltr"], span[dir="auto"]');
        for (const span of spans) {
          const t = span.textContent?.trim() || '';
          if (t.length > 2 && !t.match(/^(tail-|_)/)) {
            text = t;
            break;
          }
        }
      }
      
      if (!text || text.length < 2) return;
      
      // Ignora classes CSS
      if (['tail-in', 'tail-out', '_3yg5l', '_1VzZY'].includes(text)) return;
      
      // Extrai autor do data-pre-plain-text
      const copyable = container.querySelector('.copyable-text');
      const preText = copyable?.getAttribute('data-pre-plain-text') || '';
      const authorMatch = preText.match(/\]\s*(.*?):\s*/);
      // O data-pre-plain-text tem formato: "[HH:MM] Nome do Remetente: "
      // Se não achou, tenta extrair de outras formas
      let sender = authorMatch ? authorMatch[1].trim() : 'Unknown';
      
      // Se sender é igual ao texto, provavelmente é mensagem de sistema ou o regex falhou
      if (sender === text || sender === 'Unknown') {
        // Tenta pegar o nome do grupo/remetente de outra forma
        const titleEl = document.querySelector('[data-testid="conversation-info-header"] span[dir="auto"]');
        const chatTitle = titleEl?.textContent?.trim() || '';
        sender = chatTitle || 'Unknown';
      }
      
      // Timestamp
      const timeMatch = container.textContent.match(/(\d{1,2}:\d{2})/);
      const time = timeMatch ? timeMatch[1] : '';
      
      results.push({ index: idx, sender, text: text.substring(0, 100), time, fullLength: text.length });
    });
    
    return results;
  });
  
  log(`${messages.length} mensagens extraídas:`);
  messages.slice(-10).forEach((m, i) => {
    const preview = m.text.substring(0, 50).replace(/\n/g, ' ');
    log(`  ${i+1}. [${m.time}] ${m.sender}: ${preview}${m.fullLength > 50 ? '...' : ''}`);
  });
  
  await browser.close();
}

/** Abre um chat específico */
async function cmdChat(chatName) {
  const { page, browser } = await connect();
  
  log(`Abrindo chat: "${chatName}"`);
  
  // Busca o chat
  const found = await page.evaluate((searchName) => {
    const els = document.querySelectorAll('[data-testid="chat-list"] > div[role="row"], #pane-side div[role="listitem"]');
    
    for (const el of els) {
      const titleEl = el.querySelector('span[dir="auto"], span[title]');
      const title = titleEl?.textContent?.trim() || titleEl?.getAttribute('title') || '';
      
      if (title.toLowerCase().includes(searchName.toLowerCase())) {
        const rect = el.getBoundingClientRect();
        return { found: true, title, x: rect.left + rect.width/2, y: rect.top + rect.height/2 };
      }
    }
    return { found: false };
  }, chatName);
  
  if (found.found) {
    await page.mouse.click(found.x, found.y);
    log(`✓ Chat aberto: "${found.title}"`);
    await page.waitForTimeout(2000);
    
    // Tira screenshot
    const ssPath = path.join(__dirname, '..', 'data', `chat_${Date.now()}.png`);
    await page.screenshot({ path: ssPath });
    log(`✓ Screenshot: ${ssPath}`);
  } else {
    log(`✗ Chat não encontrado: "${chatName}"`);
  }
  
  await browser.close();
}

/** Lista chats visíveis */
async function cmdList() {
  const { page, browser } = await connect();
  
  log('Listando chats...');
  
  const chats = await page.evaluate(() => {
    // Múltiplos seletores para encontrar a lista de chats
    let els = document.querySelectorAll('[data-testid="chat-list"] > div[role="row"]');
    if (els.length === 0) els = document.querySelectorAll('#pane-side div[role="listitem"]');
    if (els.length === 0) els = document.querySelectorAll('#pane-side [role="grid"] > div');
    if (els.length === 0) els = document.querySelectorAll('div[data-testid="cell-frame"]');
    return Array.from(els).map((el, i) => {
      const titleEl = el.querySelector('span[dir="auto"], span[title]');
      const msgEl = el.querySelector('span[dir="ltr"], .selectable-text');
      const timeEl = el.querySelector('div[data-testid="meta"] span');
      const unreadEl = el.querySelector('span[aria-label*="não lida"]');
      
      return {
        index: i + 1,
        title: titleEl?.textContent?.trim() || titleEl?.getAttribute('title') || 'Unknown',
        lastMessage: msgEl?.textContent?.trim()?.substring(0, 50) || '',
        time: timeEl?.textContent?.trim() || '',
        unread: !!unreadEl
      };
    });
  });
  
  log(`${chats.length} chats encontrados:`);
  chats.forEach(c => {
    const unread = c.unread ? ' [NÃO LIDO]' : '';
    log(`  ${c.index}. "${c.title}" ${c.time}${unread}`);
    if (c.lastMessage) log(`     └─ ${c.lastMessage}`);
  });
  
  await browser.close();
}

/** Mostra info do mapa */
async function cmdInfo() {
  if (!fs.existsSync(CONFIG.MAP_FILE)) {
    log('Mapa não encontrado. Execute: node agents/launcher.mjs map');
    return;
  }
  
  const map = JSON.parse(fs.readFileSync(CONFIG.MAP_FILE, 'utf8'));
  
  log('Mapa carregado:');
  log(`  Versão: ${map.version}`);
  log(`  Criado: ${map.createdAt}`);
  log(`  Viewport: ${map.viewport?.width}x${map.viewport?.height}`);
  log(`  Elementos: ${Object.keys(map.elements).length}`);
  log(`  Chats: ${map.chats?.length || 0}`);
  
  log('\nElementos mapeados:');
  for (const [key, data] of Object.entries(map.elements)) {
    log(`  ${key}: (${data.absolute?.x}, ${data.absolute?.y}) - ${data.name}`);
  }
}

// ─── MAIN ───
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  
  switch (command) {
    case 'map':
      await cmdMap();
      break;
      
    case 'test':
      await cmdTest();
      break;
      
    case 'chat':
      if (!args[1]) {
        log('Uso: node agents/launcher.mjs chat "Nome do Grupo"');
        process.exit(1);
      }
      await cmdChat(args[1]);
      break;
      
    case 'list':
      await cmdList();
      break;
      
    case 'info':
      await cmdInfo();
      break;
      
    case 'daemon':
      await import('./whatsapp-checkpoint-agent.mjs');
      break;
      
    case 'once': {
      const { WhatsAppCheckpointAgent } = await import('./whatsapp-checkpoint-agent.mjs');
      const agent = new WhatsAppCheckpointAgent();
      await agent.runOnce();
      break;
    }
      
    case 'interactive': {
      process.argv = ['node', 'agents/whatsapp-checkpoint-agent.mjs', 'interactive'];
      await import('./whatsapp-checkpoint-agent.mjs');
      break;
    }
      
    case 'help':
    default:
      console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                    WHATSAPP AGENT - LAUNCHER                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝

Comandos:
  map         → Mapeia toda a interface do WhatsApp Web
  test        → Testa extração de mensagens (debug)
  chat "Nome" → Abre um chat específico pelo nome
  list        → Lista todos os chats visíveis
  info        → Mostra informações do mapa salvo
  daemon      → Inicia agente em loop (padrão: a cada 30min)
  once        → Executa uma verificação única
  interactive → Modo interativo com comandos por tecla
  help        → Mostra esta ajuda

Exemplos:
  node agents/launcher.mjs map
  node agents/launcher.mjs test
  node agents/launcher.mjs chat "🏆Production - 2026🙏"
  node agents/launcher.mjs list
  node agents/launcher.mjs once
`);
  }
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
