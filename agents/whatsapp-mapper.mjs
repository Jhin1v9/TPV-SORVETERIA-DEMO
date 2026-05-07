/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                    WHATSAPP WEB - MAPA COMPLETO DA INTERFACE                  ║
 * ║                         v1.0 - Sistema de Coordenadas                        ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 * 
 * MAPEAMENTO COMPLETO do WhatsApp Web para navegação por:
 * - Coordenadas absolutas (X,Y) baseadas no tamanho da janela
 * - Seletores CSS confiáveis
 * - Atributos data-testid
 * - Texto/aria-label
 * 
 * Uso: Importe este mapa e use as funções de navegação
 */

import { chromium } from "playwright";
import fs from "fs";
import path from "path";

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════
const CONFIG = {
  CDP_PORT: 9222,
  MAP_FILE: path.join(__dirname, '..', 'data', 'whatsapp-map.json'),
  SCREENSHOT_DIR: path.join(__dirname, '..', 'data', 'screenshots'),
  DEFAULT_WINDOW_SIZE: { width: 1400, height: 900 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAPA DE REGIÕES DO WHATSAPP WEB (coordenadas relativas 0-1, depois convertidas)
// ═══════════════════════════════════════════════════════════════════════════════
const REGION_MAP = {
  // Barra lateral esquerda (lista de chats)
  sidebar: {
    x: 0, y: 0, w: 0.30, h: 1.0,
    desc: 'Barra lateral com lista de chats'
  },
  
  // Área principal de chat
  mainChat: {
    x: 0.30, y: 0, w: 0.70, h: 1.0,
    desc: 'Área principal de conversa'
  },
  
  // Header do chat (nome do grupo/contato)
  chatHeader: {
    x: 0.30, y: 0, w: 0.70, h: 0.08,
    desc: 'Cabeçalho do chat - nome, foto, info'
  },
  
  // Área de mensagens (scrollável)
  messagesArea: {
    x: 0.30, y: 0.08, w: 0.70, h: 0.84,
    desc: 'Área de mensagens do chat'
  },
  
  // Input de mensagem
  inputArea: {
    x: 0.30, y: 0.92, w: 0.70, h: 0.08,
    desc: 'Área de digitação de mensagem'
  },
  
  // Barra de pesquisa no topo da sidebar
  searchBar: {
    x: 0, y: 0, w: 0.30, h: 0.07,
    desc: 'Barra de pesquisa de chats'
  },
  
  // Lista de chats (abaixo da pesquisa)
  chatList: {
    x: 0, y: 0.07, w: 0.30, h: 0.93,
    desc: 'Lista de conversas'
  },
  
  // Botões do header da sidebar
  sidebarHeader: {
    x: 0, y: 0, w: 0.30, h: 0.07,
    desc: 'Header da sidebar - foto perfil, status, nova conversa'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ELEMENTOS MAPEADOS COM MÚLTIPLAS ESTRATÉGIAS DE LOCALIZAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════
const ELEMENT_MAP = {
  // ─── BARRA LATERAL ───
  
  /** Botão de menu (3 pontinhos) na sidebar */
  menuButton: {
    strategies: [
      { type: 'aria', value: 'Menu' },
      { type: 'selector', value: '[data-testid="menu"] button, [data-icon="menu"]'},
      { type: 'coords', rel: { x: 0.27, y: 0.035 } }
    ],
    desc: 'Menu principal (3 pontinhos)'
  },
  
  /** Foto do perfil do usuário logado */
  userProfilePic: {
    strategies: [
      { type: 'aria', value: 'Perfil' },
      { type: 'selector', value: '[data-testid="wa-avatar"]'},
      { type: 'coords', rel: { x: 0.03, y: 0.035 } }
    ],
    desc: 'Foto de perfil do usuário'
  },
  
  /** Barra de pesquisa */
  searchInput: {
    strategies: [
      { type: 'selector', value: '[data-testid="chat-list-search"], [title="Pesquisar ou começar uma nova conversa"]' },
      { type: 'selector', value: 'div[contenteditable="true"][data-tab="3"]' },
      { type: 'coords', rel: { x: 0.15, y: 0.055 } }
    ],
    desc: 'Campo de pesquisa de chats'
  },
  
  /** Botão de nova conversa/chat */
  newChatButton: {
    strategies: [
      { type: 'aria', value: 'Nova conversa' },
      { type: 'selector', value: '[data-testid="chat-list-search"], [data-icon="new-chat"]' },
      { type: 'coords', rel: { x: 0.25, y: 0.035 } }
    ],
    desc: 'Botão de nova conversa'
  },
  
  /** Botão de filtros de chat */
  filterButton: {
    strategies: [
      { type: 'selector', value: '[data-testid="filter-chats"], [data-icon="filter"]' },
      { type: 'coords', rel: { x: 0.27, y: 0.055 } }
    ],
    desc: 'Filtros de chat (todos, não lidos, grupos)'
  },
  
  // ─── CHAT LIST (itens individuais) ───
  
  /** Container da lista de chats */
  chatListContainer: {
    strategies: [
      { type: 'selector', value: '[data-testid="chat-list"]'},
      { type: 'selector', value: 'div[role="grid"]'},
      { type: 'coords', rel: { x: 0.15, y: 0.50 } }
    ],
    desc: 'Container da lista de chats'
  },
  
  /** Primeiro chat da lista */
  firstChat: {
    strategies: [
      { type: 'selector', value: '[data-testid="chat-list"] > div:first-child'},
      { type: 'coords', rel: { x: 0.15, y: 0.12 } }
    ],
    desc: 'Primeiro chat na lista'
  },
  
  /** Segundo chat da lista */
  secondChat: {
    strategies: [
      { type: 'selector', value: '[data-testid="chat-list"] > div:nth-child(2)'},
      { type: 'coords', rel: { x: 0.15, y: 0.20 } }
    ],
    desc: 'Segundo chat na lista'
  },
  
  /** Terceiro chat da lista */
  thirdChat: {
    strategies: [
      { type: 'selector', value: '[data-testid="chat-list"] > div:nth-child(3)'},
      { type: 'coords', rel: { x: 0.15, y: 0.28 } }
    ],
    desc: 'Terceiro chat na lista'
  },
  
  /** Chat por nome (dinâmico - usar função findChatByName) */
  chatByName: {
    strategies: [
      { type: 'function', value: 'findChatByName' },
      { type: 'selector', value: '[data-testid="chat-list"] div[role="row"]'},
    ],
    desc: 'Chat específico por nome (dinâmico)'
  },
  
  // ─── HEADER DO CHAT ───
  
  /** Nome do chat/grupo atual */
  chatTitle: {
    strategies: [
      { type: 'selector', value: '[data-testid="conversation-info-header"] span[dir="auto"], [data-testid="conversation-info-header"] span[title]' },
      { type: 'selector', value: 'header span[dir="auto"]' },
      { type: 'coords', rel: { x: 0.50, y: 0.04 } }
    ],
    desc: 'Nome do chat/grupo atual'
  },
  
  /** Botão de voltar (mobile) */
  backButton: {
    strategies: [
      { type: 'aria', value: 'Voltar' },
      { type: 'selector', value: '[data-testid="back"]'},
      { type: 'coords', rel: { x: 0.32, y: 0.04 } }
    ],
    desc: 'Botão de voltar'
  },
  
  /** Botão de pesquisar no chat */
  searchInChatButton: {
    strategies: [
      { type: 'aria', value: 'Pesquisar' },
      { type: 'selector', value: '[data-testid="search-in-chat"], [data-icon="search-alt"]' },
      { type: 'coords', rel: { x: 0.85, y: 0.04 } }
    ],
    desc: 'Pesquisar dentro do chat atual'
  },
  
  /** Botão de menu do chat (3 pontinhos no header) */
  chatMenuButton: {
    strategies: [
      { type: 'aria', value: 'Menu do chat' },
      { type: 'selector', value: '[data-testid="menu"]'},
      { type: 'coords', rel: { x: 0.93, y: 0.04 } }
    ],
    desc: 'Menu do chat (info do grupo, silenciar, etc)'
  },
  
  /** Botão de anexar/arquivos */
  attachButton: {
    strategies: [
      { type: 'aria', value: 'Anexar' },
      { type: 'selector', value: '[data-testid="attach-menu-plus"], [data-icon="attach-menu-plus"]' },
      { type: 'coords', rel: { x: 0.34, y: 0.96 } }
    ],
    desc: 'Botão de anexar arquivo/foto/documento'
  },
  
  /** Botão de emoji */
  emojiButton: {
    strategies: [
      { type: 'aria', value: 'Emoji' },
      { type: 'selector', value: '[data-testid="emoji"], [data-icon="emoji"]' },
      { type: 'coords', rel: { x: 0.34, y: 0.96 } }
    ],
    desc: 'Botão de emoji'
  },
  
  // ─── ÁREA DE INPUT ───
  
  /** Campo de digitação de mensagem */
  messageInput: {
    strategies: [
      { type: 'selector', value: '[data-testid="conversation-compose-box-input"], div[contenteditable="true"][data-tab="1"]' },
      { type: 'selector', value: 'footer div[contenteditable="true"]' },
      { type: 'coords', rel: { x: 0.60, y: 0.96 } }
    ],
    desc: 'Campo de digitação de mensagem'
  },
  
  /** Botão de enviar mensagem */
  sendButton: {
    strategies: [
      { type: 'aria', value: 'Enviar' },
      { type: 'selector', value: '[data-testid="send"], [data-icon="send"]' },
      { type: 'coords', rel: { x: 0.95, y: 0.96 } }
    ],
    desc: 'Botão de enviar mensagem'
  },
  
  /** Botão de gravar áudio */
  voiceButton: {
    strategies: [
      { type: 'aria', value: 'Gravar áudio' },
      { type: 'selector', value: '[data-testid="ptt"], [data-icon="audio"]' },
      { type: 'coords', rel: { x: 0.95, y: 0.96 } }
    ],
    desc: 'Botão de gravar mensagem de voz'
  },
  
  // ─── ÁREA DE MENSAGENS ───
  
  /** Container de mensagens */
  messagesContainer: {
    strategies: [
      { type: 'selector', value: '[data-testid="conversation-panel-messages"], div[role="application"]' },
      { type: 'coords', rel: { x: 0.65, y: 0.50 } }
    ],
    desc: 'Container scrollável de mensagens'
  },
  
  /** Última mensagem do chat */
  lastMessage: {
    strategies: [
      { type: 'function', value: 'getLastMessage' },
      { type: 'selector', value: '.message-in:last-child, .message-out:last-child' },
    ],
    desc: 'Última mensagem no chat'
  },
  
  /** Botão de scroll para baixo (quando tem mensagens novas) */
  scrollToBottomButton: {
    strategies: [
      { type: 'selector', value: '[data-testid="scroll-to-bottom"], [data-icon="down"]' },
      { type: 'coords', rel: { x: 0.92, y: 0.85 } }
    ],
    desc: 'Botão de scroll para mensagens mais recentes'
  },
  
  // ─── BOTÕES DO BROWSER / JANELA ───
  
  /** Botão de fullscreen do Chrome (F11 não funciona via CDP, precisa de outra abordagem) */
  fullscreen: {
    strategies: [
      { type: 'key', value: 'F11' },
      { type: 'js', value: 'document.documentElement.requestFullscreen()' }
    ],
    desc: 'Ativar/desativar tela cheia'
  },
  
  /** Maximizar janela */
  maximizeWindow: {
    strategies: [
      { type: 'cdp', value: 'Browser.setWindowBounds' }
    ],
    desc: 'Maximizar janela do browser'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CLASSE PRINCIPAL DO MAPEADOR
// ═══════════════════════════════════════════════════════════════════════════════
class WhatsAppMapper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.viewport = { width: 0, height: 0 };
    this.mapData = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      viewport: this.viewport,
      elements: {},
      regions: {},
      chats: [],
      screenshots: []
    };
  }

  /**
   * Conecta ao Chrome via CDP
   */
  async connect() {
    console.log('[MAPPER] Conectando ao Chrome CDP na porta', CONFIG.CDP_PORT);
    
    this.browser = await chromium.connectOverCDP(`http://localhost:${CONFIG.CDP_PORT}`);
    const contexts = this.browser.contexts();
    
    if (contexts.length === 0) {
      throw new Error('Nenhum contexto encontrado no Chrome CDP');
    }
    
    // Pega a primeira página (deve ser o WhatsApp)
    const pages = contexts[0].pages();
    this.page = pages[0] || await contexts[0].newPage();
    
    // Obtém tamanho da viewport
    this.viewport = await this.page.viewportSize();
    this.mapData.viewport = this.viewport;
    
    console.log(`[MAPPER] Conectado! Viewport: ${this.viewport.width}x${this.viewport.height}`);
    return this;
  }

  /**
   * Converte coordenadas relativas (0-1) para absolutas (pixels)
   */
  relToAbs(relX, relY) {
    return {
      x: Math.round(relX * this.viewport.width),
      y: Math.round(relY * this.viewport.height)
    };
  }

  /**
   * Converte coordenadas absolutas para relativas
   */
  absToRel(absX, absY) {
    return {
      x: absX / this.viewport.width,
      y: absY / this.viewport.height
    };
  }

  /**
   * Tenta localizar um elemento usando múltiplas estratégias
   */
  async findElement(elementKey, customName = null) {
    const elementDef = ELEMENT_MAP[elementKey];
    if (!elementDef) {
      throw new Error(`Elemento "${elementKey}" não encontrado no mapa`);
    }

    const searchName = customName || elementDef.desc;
    console.log(`[MAPPER] Procurando: ${searchName}`);

    for (const strategy of elementDef.strategies) {
      try {
        let locator = null;
        
        switch (strategy.type) {
          case 'selector':
            locator = this.page.locator(strategy.value).first();
            if (await locator.count() > 0) {
              const box = await locator.boundingBox();
              if (box) {
                console.log(`  ✓ Encontrado via selector: ${strategy.value}`);
                return { locator, box, strategy, found: true };
              }
            }
            break;
            
          case 'aria':
            locator = this.page.getByRole('button', { name: strategy.value });
            if (await locator.count() > 0) {
              const box = await locator.boundingBox();
              if (box) {
                console.log(`  ✓ Encontrado via ARIA: ${strategy.value}`);
                return { locator, box, strategy, found: true };
              }
            }
            break;
            
          case 'coords':
            const abs = this.relToAbs(strategy.rel.x, strategy.rel.y);
            console.log(`  → Coordenada estimada: (${abs.x}, ${abs.y})`);
            return { 
              coords: abs, 
              strategy, 
              found: 'estimated',
              note: 'Coordenada estimada - pode precisar de ajuste'
            };
            
          case 'function':
            // Funções dinâmicas são tratadas separadamente
            return { 
              function: strategy.value, 
              strategy, 
              found: 'dynamic',
              note: 'Requer execução de função dinâmica'
            };
            
          case 'key':
            return {
              key: strategy.value,
              strategy,
              found: 'key',
              note: 'Use keyboard.press()'
            };
            
          case 'js':
            return {
              js: strategy.value,
              strategy,
              found: 'js',
              note: 'Use page.evaluate()'
            };
        }
      } catch (e) {
        console.log(`  ✗ Falhou: ${strategy.type} - ${e.message}`);
      }
    }
    
    console.log(`  ⚠ Elemento não encontrado: ${searchName}`);
    return { found: false, key: elementKey };
  }

  /**
   * Mapeia um elemento específico e salva suas coordenadas reais
   */
  async mapElement(elementKey, customName = null) {
    const result = await this.findElement(elementKey, customName);
    
    if (result.found === true && result.box) {
      const center = {
        x: Math.round(result.box.x + result.box.width / 2),
        y: Math.round(result.box.y + result.box.height / 2)
      };
      
      const rel = this.absToRel(center.x, center.y);
      
      this.mapData.elements[elementKey] = {
        name: customName || ELEMENT_MAP[elementKey]?.desc || elementKey,
        absolute: center,
        relative: rel,
        boundingBox: result.box,
        strategy: result.strategy.type,
        selector: result.strategy.value,
        timestamp: new Date().toISOString()
      };
      
      console.log(`  📍 Mapeado: (${center.x}, ${center.y}) rel: (${rel.x.toFixed(3)}, ${rel.y.toFixed(3)})`);
      return this.mapData.elements[elementKey];
    }
    
    return null;
  }

  /**
   * Mapeia TODOS os elementos definidos no ELEMENT_MAP
   */
  async mapAllElements() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║           MAPEANDO TODOS OS ELEMENTOS                        ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');
    
    for (const [key, def] of Object.entries(ELEMENT_MAP)) {
      console.log(`\n[${key}] ${def.desc}`);
      await this.mapElement(key);
      await this.page.waitForTimeout(200); // Pequena pausa entre mapeamentos
    }
    
    console.log('\n✅ Mapeamento completo!');
    return this.mapData;
  }

  /**
   * Mapeia a lista de chats visíveis
   */
  async mapChatList() {
    console.log('\n[MAPPER] Mapeando lista de chats...');
    
    const chats = await this.page.evaluate(() => {
      const chatElements = document.querySelectorAll('[data-testid="chat-list"] > div[role="row"], #pane-side div[role="listitem"]');
      const results = [];
      
      chatElements.forEach((el, index) => {
        const titleEl = el.querySelector('span[dir="auto"], span[title]');
        const msgEl = el.querySelector('span[dir="ltr"], .selectable-text');
        const timeEl = el.querySelector('div[data-testid="meta"] span, .l7jjieqr');
        const unreadEl = el.querySelector('span[aria-label*="não lida"], .aumms1qt');
        
        const rect = el.getBoundingClientRect();
        
        results.push({
          index,
          title: titleEl?.textContent?.trim() || titleEl?.getAttribute('title') || 'Unknown',
          lastMessage: msgEl?.textContent?.trim() || '',
          time: timeEl?.textContent?.trim() || '',
          unread: !!unreadEl,
          position: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2
          }
        });
      });
      
      return results;
    });
    
    this.mapData.chats = chats;
    console.log(`  ✓ ${chats.length} chats mapeados`);
    
    chats.forEach((chat, i) => {
      const rel = this.absToRel(chat.position.centerX, chat.position.centerY);
      console.log(`    ${i + 1}. "${chat.title}" - rel: (${rel.x.toFixed(3)}, ${rel.y.toFixed(3)})`);
    });
    
    return chats;
  }

  /**
   * Encontra um chat pelo nome (busca parcial)
   */
  async findChatByName(name) {
    console.log(`[MAPPER] Buscando chat: "${name}"`);
    
    const chat = await this.page.evaluate((searchName) => {
      const chatElements = document.querySelectorAll('[data-testid="chat-list"] > div[role="row"], #pane-side div[role="listitem"]');
      
      for (const el of chatElements) {
        const titleEl = el.querySelector('span[dir="auto"], span[title]');
        const title = titleEl?.textContent?.trim() || titleEl?.getAttribute('title') || '';
        
        if (title.toLowerCase().includes(searchName.toLowerCase())) {
          const rect = el.getBoundingClientRect();
          return {
            title,
            found: true,
            position: {
              centerX: rect.left + rect.width / 2,
              centerY: rect.top + rect.height / 2,
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          };
        }
      }
      
      return { found: false };
    }, name);
    
    if (chat.found) {
      const rel = this.absToRel(chat.position.centerX, chat.position.centerY);
      console.log(`  ✓ Chat encontrado: "${chat.title}" em rel: (${rel.x.toFixed(3)}, ${rel.y.toFixed(3)})`);
      
      // Salva no mapa
      this.mapData.elements[`chat_${name}`] = {
        name: `Chat: ${chat.title}`,
        absolute: { x: chat.position.centerX, y: chat.position.centerY },
        relative: rel,
        boundingBox: {
          x: chat.position.left,
          y: chat.position.top,
          width: chat.position.width,
          height: chat.position.height
        },
        strategy: 'dynamic-search',
        timestamp: new Date().toISOString()
      };
    } else {
      console.log(`  ✗ Chat não encontrado: "${name}"`);
    }
    
    return chat;
  }

  /**
   * Clica em um elemento mapeado
   */
  async click(elementKey, customName = null) {
    const mapped = this.mapData.elements[elementKey];
    
    if (mapped && mapped.absolute) {
      console.log(`[CLICK] ${mapped.name} em (${mapped.absolute.x}, ${mapped.absolute.y})`);
      await this.page.mouse.click(mapped.absolute.x, mapped.absolute.y);
      return true;
    }
    
    // Tenta encontrar dinamicamente
    const result = await this.findElement(elementKey, customName);
    
    if (result.found === true && result.locator) {
      await result.locator.click();
      return true;
    } else if (result.coords) {
      await this.page.mouse.click(result.coords.x, result.coords.y);
      return true;
    } else if (result.key) {
      await this.page.keyboard.press(result.key);
      return true;
    } else if (result.js) {
      await this.page.evaluate(result.js);
      return true;
    }
    
    return false;
  }

  /**
   * Clica em coordenadas relativas (0-1)
   */
  async clickRel(relX, relY) {
    const abs = this.relToAbs(relX, relY);
    console.log(`[CLICK] Coordenada relativa (${relX.toFixed(3)}, ${relY.toFixed(3)}) → absoluta (${abs.x}, ${abs.y})`);
    await this.page.mouse.click(abs.x, abs.y);
    return abs;
  }

  /**
   * Clica em coordenadas absolutas
   */
  async clickAbs(x, y) {
    console.log(`[CLICK] Coordenada absoluta (${x}, ${y})`);
    await this.page.mouse.click(x, y);
    return { x, y };
  }

  /**
   * Tira screenshot e salva
   */
  async screenshot(name = 'screenshot') {
    const filename = `${name}_${Date.now()}.png`;
    const filepath = path.join(CONFIG.SCREENSHOT_DIR, filename);
    
    // Cria diretório se não existir
    if (!fs.existsSync(CONFIG.SCREENSHOT_DIR)) {
      fs.mkdirSync(CONFIG.SCREENSHOT_DIR, { recursive: true });
    }
    
    await this.page.screenshot({ path: filepath, fullPage: false });
    console.log(`[SCREENSHOT] Salvo: ${filepath}`);
    
    this.mapData.screenshots.push({
      name,
      filename,
      path: filepath,
      timestamp: new Date().toISOString()
    });
    
    return filepath;
  }

  /**
   * Maximiza a janela do browser
   */
  async maximizeWindow() {
    console.log('[MAPPER] Maximizando janela...');
    
    // Usa CDP para maximizar
    const session = await this.page.context().newCDPSession(this.page);
    
    // Obtém o window ID
    const { windowId } = await session.send('Browser.getWindowForTarget');
    
    // Define bounds maximizados
    await session.send('Browser.setWindowBounds', {
      windowId,
      bounds: { windowState: 'maximized' }
    });
    
    await session.detach();
    
    // Atualiza viewport
    await this.page.waitForTimeout(500);
    this.viewport = await this.page.viewportSize();
    this.mapData.viewport = this.viewport;
    
    console.log(`  ✓ Janela maximizada: ${this.viewport.width}x${this.viewport.height}`);
    return this.viewport;
  }

  /**
   * Define tamanho específico da janela
   */
  async setWindowSize(width, height) {
    console.log(`[MAPPER] Redimensionando para ${width}x${height}...`);
    
    const session = await this.page.context().newCDPSession(this.page);
    const { windowId } = await session.send('Browser.getWindowForTarget');
    
    await session.send('Browser.setWindowBounds', {
      windowId,
      bounds: { width, height, windowState: 'normal' }
    });
    
    await session.detach();
    
    await this.page.waitForTimeout(500);
    this.viewport = await this.page.viewportSize();
    this.mapData.viewport = this.viewport;
    
    console.log(`  ✓ Tamanho definido: ${this.viewport.width}x${this.viewport.height}`);
    return this.viewport;
  }

  /**
   * Ativa fullscreen via JavaScript (F11 não funciona via CDP)
   */
  async toggleFullscreen() {
    console.log('[MAPPER] Toggle fullscreen...');
    await this.page.evaluate(() => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    });
    
    await this.page.waitForTimeout(500);
    this.viewport = await this.page.viewportSize();
    this.mapData.viewport = this.viewport;
    
    console.log(`  ✓ Fullscreen toggled: ${this.viewport.width}x${this.viewport.height}`);
    return this.viewport;
  }

  /**
   * Salva o mapa em arquivo JSON
   */
  saveMap() {
    this.mapData.savedAt = new Date().toISOString();
    fs.writeFileSync(CONFIG.MAP_FILE, JSON.stringify(this.mapData, null, 2));
    console.log(`\n[MAPPER] Mapa salvo em: ${CONFIG.MAP_FILE}`);
    return CONFIG.MAP_FILE;
  }

  /**
   * Carrega um mapa salvo
   */
  loadMap() {
    if (fs.existsSync(CONFIG.MAP_FILE)) {
      this.mapData = JSON.parse(fs.readFileSync(CONFIG.MAP_FILE, 'utf8'));
      console.log(`[MAPPER] Mapa carregado: ${CONFIG.MAP_FILE}`);
      console.log(`  Versão: ${this.mapData.version}`);
      console.log(`  Criado em: ${this.mapData.createdAt}`);
      console.log(`  Viewport: ${this.mapData.viewport?.width}x${this.mapData.viewport?.height}`);
      console.log(`  Elementos mapeados: ${Object.keys(this.mapData.elements).length}`);
      console.log(`  Chats mapeados: ${this.mapData.chats?.length || 0}`);
      return true;
    }
    console.log('[MAPPER] Nenhum mapa salvo encontrado');
    return false;
  }

  /**
   * Mostra o mapa atual no console
   */
  printMap() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    MAPA ATUAL                                ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`Viewport: ${this.viewport.width}x${this.viewport.height}`);
    console.log(`\nElementos mapeados (${Object.keys(this.mapData.elements).length}):`);
    
    for (const [key, data] of Object.entries(this.mapData.elements)) {
      console.log(`\n  [${key}] ${data.name}`);
      console.log(`    Abs: (${data.absolute?.x}, ${data.absolute?.y})`);
      console.log(`    Rel: (${data.relative?.x?.toFixed(3)}, ${data.relative?.y?.toFixed(3)})`);
      console.log(`    Strategy: ${data.strategy}`);
    }
    
    if (this.mapData.chats?.length > 0) {
      console.log(`\nChats mapeados (${this.mapData.chats.length}):`);
      this.mapData.chats.forEach((chat, i) => {
        const rel = this.absToRel(chat.position.centerX, chat.position.centerY);
        console.log(`  ${i + 1}. "${chat.title}" - rel: (${rel.x.toFixed(3)}, ${rel.y.toFixed(3)})`);
      });
    }
  }

  /**
   * Fecha a conexão
   */
  async disconnect() {
    if (this.browser) {
      await this.browser.disconnect();
      console.log('[MAPPER] Desconectado do Chrome CDP');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNÇÃO PRINCIPAL DE MAPEAMENTO COMPLETO
// ═══════════════════════════════════════════════════════════════════════════════
async function runFullMapping() {
  const mapper = new WhatsAppMapper();
  
  try {
    // 1. Conecta
    await mapper.connect();
    
    // 2. Maximiza a janela para mapeamento consistente
    await mapper.maximizeWindow();
    
    // 3. Tira screenshot inicial
    await mapper.screenshot('01_initial');
    
    // 4. Mapeia todos os elementos estáticos
    await mapper.mapAllElements();
    
    // 5. Mapeia a lista de chats
    await mapper.mapChatList();
    
    // 6. Tenta encontrar chats específicos
    const targetChats = [
      '🏆Production - 2026🙏',
      'Paulo (web)',
      'NEXO'
    ];
    
    for (const chatName of targetChats) {
      await mapper.findChatByName(chatName);
    }
    
    // 7. Tira screenshot final
    await mapper.screenshot('02_mapped');
    
    // 8. Salva o mapa
    mapper.saveMap();
    
    // 9. Mostra o resultado
    mapper.printMap();
    
    console.log('\n✅ Mapeamento completo salvo!');
    console.log(`Arquivo: ${CONFIG.MAP_FILE}`);
    
    return mapper;
    
  } catch (error) {
    console.error('❌ Erro no mapeamento:', error);
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTAÇÕES
// ═══════════════════════════════════════════════════════════════════════════════
export {
  WhatsAppMapper,
  ELEMENT_MAP,
  REGION_MAP,
  CONFIG,
  runFullMapping
};

// Se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runFullMapping().then(mapper => {
    console.log('\nPressione Ctrl+C para sair ou aguarde...');
    setTimeout(() => mapper.disconnect(), 5000);
  }).catch(err => {
    console.error('Falha:', err);
    process.exit(1);
  });
}
