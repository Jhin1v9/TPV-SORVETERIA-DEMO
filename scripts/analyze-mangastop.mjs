import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'artifacts', `mangastop-analysis-${new Date().toISOString().replace(/[:.]/g, '-')}`);
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const allConsoleMessages = [];
const allNetworkRequests = [];
let currentPage = 'home';

async function analyzePage(page, pageName) {
  currentPage = pageName;
  console.log(`\n========== ANALISANDO: ${pageName} ==========`);

  // 1. Console messages são coletados via event listeners abaixo

  // 2. Network requests são coletados via route/requests abaixo

  // 3. Extrair localStorage
  const localStorage = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    return data;
  });

  // 4. Extrair sessionStorage
  const sessionStorage = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      data[key] = sessionStorage.getItem(key);
    }
    return data;
  });

  // 5. Extrair cookies
  const cookies = await page.evaluate(() => document.cookie);

  // 6. Service workers
  const serviceWorkers = await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      return regs.map(r => ({
        scope: r.scope,
        scriptURL: r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL,
        state: r.active?.state || r.installing?.state || r.waiting?.state
      }));
    }
    return [];
  });

  // 7. IndexedDB databases
  const indexedDBs = await page.evaluate(async () => {
    if ('databases' in indexedDB) {
      try {
        return await indexedDB.databases();
      } catch (e) {
        return [{ error: e.message }];
      }
    }
    return [{ note: 'indexedDB.databases() not supported in this browser' }];
  });

  // 8. Window globals
  const windowGlobals = await page.evaluate(() => {
    return Object.keys(window).filter(k => typeof window[k] === 'function' || typeof window[k] === 'object').sort();
  });

  // 9. Funções suspeitas
  const suspiciousFunctions = await page.evaluate(() => {
    const suspicious = ['eval', 'Function', 'atob', 'btoa', 'escape', 'unescape', 'document.write'];
    const result = {};
    for (const fn of suspicious) {
      try {
        const val = eval(fn); // eslint-disable-line no-eval
        result[fn] = {
          exists: typeof val === 'function',
          native: val?.toString?.().includes('[native code]') || false,
          toString: typeof val === 'function' ? val.toString().substring(0, 200) : String(val)
        };
      } catch (e) {
        result[fn] = { exists: false, error: e.message };
      }
    }
    return result;
  });

  // 10. Canvas/WebGL fingerprinting
  const fingerprinting = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    return {
      canvasSupported: !!canvas.getContext('2d'),
      webglSupported: !!gl,
      webglVendor: gl ? gl.getParameter(gl.VENDOR) : null,
      webglRenderer: gl ? gl.getParameter(gl.RENDERER) : null,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height
    };
  });

  // 11. Meta tags
  const metaTags = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('meta')).map(m => ({
      name: m.getAttribute('name'),
      property: m.getAttribute('property'),
      content: m.getAttribute('content'),
      charset: m.getAttribute('charset'),
      httpEquiv: m.getAttribute('http-equiv')
    }));
  });

  // 12. Emails, telefones, IDs no HTML
  const htmlLeak = await page.evaluate(() => {
    const html = document.documentElement.innerHTML;
    const emails = [...html.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)].map(m => m[0]);
    const phones = [...html.matchAll(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g)].map(m => m[0]);
    const comments = [...html.matchAll(/<!--([\s\S]*?)-->/g)].map(m => m[1].trim().substring(0, 500));
    return { emails: [...new Set(emails)], phones: [...new Set(phones)], comments: comments.slice(0, 20) };
  });

  // 13. Scripts carregados
  const scripts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('script')).map(s => ({
      src: s.src,
      type: s.type,
      async: s.async,
      defer: s.defer,
      innerHTML: s.innerHTML ? s.innerHTML.substring(0, 1000) : null,
      dataAttrs: Object.fromEntries([...s.attributes].filter(a => a.name.startsWith('data-')).map(a => [a.name, a.value]))
    }));
  });

  // 14. Verificar se canvas/WebGL foram chamados (sobrescrever métodos antes do load)
  // Já verificamos capacidade acima

  return {
    pageName,
    localStorage,
    sessionStorage,
    cookies,
    serviceWorkers,
    indexedDBs,
    windowGlobals,
    suspiciousFunctions,
    fingerprinting,
    metaTags,
    htmlLeak,
    scripts
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  // Interceptar requests
  await context.route('**/*', async (route, request) => {
    const req = {
      page: currentPage,
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postData(),
      resourceType: request.resourceType(),
      timestamp: new Date().toISOString()
    };
    allNetworkRequests.push(req);
    route.continue();
  });

  const page = await context.newPage();

  // Interceptar console
  page.on('console', msg => {
    allConsoleMessages.push({
      page: currentPage,
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
      timestamp: new Date().toISOString()
    });
  });

  // Interceptar page errors
  page.on('pageerror', err => {
    allConsoleMessages.push({
      page: currentPage,
      type: 'pageerror',
      text: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });
  });

  // Interceptar requests falhos
  page.on('requestfailed', request => {
    allNetworkRequests.push({
      page: currentPage,
      url: request.url(),
      method: request.method(),
      failure: request.failure(),
      resourceType: request.resourceType(),
      timestamp: new Date().toISOString(),
      failed: true
    });
  });

  // ======= PÁGINA INICIAL =======
  console.log('Navegando para home...');
  await page.goto('https://mangastop.net/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  console.log('Home carregada, tirando screenshot...');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'home.png'), fullPage: true });

  const homeData = await analyzePage(page, 'home');

  // ======= PÁGINA DE MANGÁ =======
  console.log('Navegando para manga...');
  await page.goto('https://mangastop.net/manga/martial-peak/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  console.log('Manga carregada, tirando screenshot...');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'manga-martial-peak.png'), fullPage: true });

  const mangaData = await analyzePage(page, 'manga-martial-peak');

  // ======= PÁGINA DE CAPÍTULO (se existir) =======
  try {
    const chapterLink = await page.locator('.chapter-item a, .wp-manga-chapter a, a[href*="chapter"]').first();
    if (await chapterLink.count() > 0) {
      const href = await chapterLink.getAttribute('href');
      console.log(`Navegando para capítulo: ${href}`);
      await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(OUTPUT_DIR, 'chapter.png'), fullPage: true });
      var chapterData = await analyzePage(page, 'chapter');
    }
  } catch (e) {
    console.log('Não foi possível navegar para capítulo:', e.message);
  }

  await browser.close();

  // ======= SALVAR RESULTADOS =======
  const result = {
    timestamp: new Date().toISOString(),
    url: 'https://mangastop.net/',
    home: homeData,
    manga: mangaData,
    chapter: chapterData || null,
    allConsoleMessages,
    allNetworkRequests
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'full-analysis.json'), JSON.stringify(result, null, 2));

  // Relatório resumido em Markdown
  const md = generateReport(result);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'REPORT.md'), md);

  console.log(`\n✅ Análise completa salva em: ${OUTPUT_DIR}`);
})();

function generateReport(data) {
  let md = `# Relatório de Análise de Segurança - mangastop.net\n\n`;
  md += `**Data:** ${data.timestamp}\n\n`;

  // Console
  md += `## Console Messages (${data.allConsoleMessages.length})\n\n`;
  const errors = data.allConsoleMessages.filter(m => m.type === 'error' || m.type === 'pageerror');
  const warnings = data.allConsoleMessages.filter(m => m.type === 'warning');
  md += `- Erros: ${errors.length}\n`;
  md += `- Warnings: ${warnings.length}\n`;
  if (errors.length > 0) {
    md += `\n### Erros\n\n`;
    errors.forEach(e => { md += `- [${e.page}] ${e.text}\n`; });
  }

  // Network
  md += `\n## Network Requests (${data.allNetworkRequests.length})\n\n`;
  const thirdParty = data.allNetworkRequests.filter(r => {
    try {
      const url = new URL(r.url);
      return !url.hostname.includes('mangastop.net');
    } catch { return false; }
  });
  md += `- Terceiros: ${thirdParty.length}\n`;
  const thirdPartyHosts = [...new Set(thirdParty.map(r => { try { return new URL(r.url).hostname; } catch { return r.url; } }))];
  md += `- Hosts de terceiros: ${thirdPartyHosts.join(', ')}\n`;

  // POSTs
  const posts = data.allNetworkRequests.filter(r => r.method === 'POST' && r.postData);
  md += `\n### POST Requests com Body (${posts.length})\n\n`;
  posts.forEach(p => { md += `- **${p.url}**\n  \`\`\`json\n${JSON.stringify(p.postData).substring(0, 500)}\n  \`\`\`\n`; });

  // Scripts suspeitos
  md += `\n## Scripts de Terceiros\n\n`;
  const allScripts = [...data.home.scripts, ...data.manga.scripts];
  const thirdPartyScripts = allScripts.filter(s => s.src && !s.src.includes('mangastop.net'));
  [...new Set(thirdPartyScripts.map(s => s.src))].forEach(src => {
    md += `- \`${src}\`\n`;
  });

  // Storage Home
  md += `\n## Storage - Página Inicial\n\n`;
  md += `### localStorage (${Object.keys(data.home.localStorage).length})\n\n`;
  md += `\`\`\`json\n${JSON.stringify(data.home.localStorage, null, 2)}\n\`\`\`\n`;
  md += `### sessionStorage (${Object.keys(data.home.sessionStorage).length})\n\n`;
  md += `\`\`\`json\n${JSON.stringify(data.home.sessionStorage, null, 2)}\n\`\`\`\n`;
  md += `### Cookies\n\n`;
  md += `\`\`\`\n${data.home.cookies}\n\`\`\`\n`;

  // Fingerprinting
  md += `\n## Fingerprinting\n\n`;
  md += `\`\`\`json\n${JSON.stringify(data.home.fingerprinting, null, 2)}\n\`\`\`\n`;

  // Funções suspeitas
  md += `\n## Funções Suspeitas\n\n`;
  md += `\`\`\`json\n${JSON.stringify(data.home.suspiciousFunctions, null, 2)}\n\`\`\`\n`;

  // Vazamento de dados
  md += `\n## Vazamento de Dados no HTML\n\n`;
  md += `- Emails encontrados: ${data.home.htmlLeak.emails.length > 0 ? data.home.htmlLeak.emails.join(', ') : 'Nenhum'}\n`;
  md += `- Telefones encontrados: ${data.home.htmlLeak.phones.length > 0 ? data.home.htmlLeak.phones.join(', ') : 'Nenhum'}\n`;
  md += `- Comentários HTML: ${data.home.htmlLeak.comments.length}\n`;
  if (data.home.htmlLeak.comments.length > 0) {
    md += `\n\`\`\`\n${data.home.htmlLeak.comments.slice(0, 5).join('\n---\n')}\n\`\`\`\n`;
  }

  // Service Workers
  md += `\n## Service Workers\n\n`;
  md += `\`\`\`json\n${JSON.stringify(data.home.serviceWorkers, null, 2)}\n\`\`\`\n`;

  // IndexedDB
  md += `\n## IndexedDB\n\n`;
  md += `\`\`\`json\n${JSON.stringify(data.home.indexedDBs, null, 2)}\n\`\`\`\n`;

  // Window globals count
  md += `\n## Window Globals\n\n`;
  md += `Total de objetos/funções no window: ${data.home.windowGlobals.length}\n`;
  const suspiciousGlobals = data.home.windowGlobals.filter(k => /track|pixel|ad|ga|fb|gtm|analytics|fingerprint/i.test(k));
  if (suspiciousGlobals.length > 0) {
    md += `\nGlobais suspeitos: ${suspiciousGlobals.join(', ')}\n`;
  }

  return md;
}
