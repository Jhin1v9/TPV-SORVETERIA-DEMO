/**
 * ═══ FASE 9 — Offline Resilience ═══
 * Network Monitor — Detecta online/offline/lie-fi com precisão
 *
 * Combina navigator.onLine + heartbeat HTTP para detectar
 * "lie-fi" (online=true mas sem conectividade real).
 */

const HEARTBEAT_INTERVAL_MS = 5000;
const HEARTBEAT_TIMEOUT_MS = 3000;
const STABLE_AFTER_MS = 2000;

let isCurrentlyOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
let isCurrentlyLieFi = false;
let heartbeatTimer = 0;
let stableTimer = 0;
let listeners = new Set<(online: boolean, lieFi: boolean) => void>();

function getHeartbeatUrl(): string {
  // Usa o favicon como ping leve — sempre existe e é pequeno
  return `${window.location.origin}/favicon.ico?_=${Date.now()}`;
}

async function doHeartbeat(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), HEARTBEAT_TIMEOUT_MS);
    await fetch(getHeartbeatUrl(), {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal,
    });
    window.clearTimeout(timeout);
    return true;
  } catch {
    return false;
  }
}

async function checkConnectivity() {
  const browserOnline = navigator.onLine;

  if (!browserOnline) {
    setState(false, false);
    return;
  }

  // Browser diz online — vamos verificar se é lie-fi
  const heartbeatOk = await doHeartbeat();

  if (heartbeatOk) {
    setState(true, false);
  } else {
    // Browser diz online mas heartbeat falhou = lie-fi
    setState(false, true);
  }
}

function setState(online: boolean, lieFi: boolean) {
  const changed = online !== isCurrentlyOnline || lieFi !== isCurrentlyLieFi;
  isCurrentlyOnline = online;
  isCurrentlyLieFi = lieFi;

  if (changed) {
    // Debounce: só notifica após STABLE_AFTER_MS para evitar flicker
    window.clearTimeout(stableTimer);
    stableTimer = window.setTimeout(() => {
      listeners.forEach((cb) => cb(isCurrentlyOnline, isCurrentlyLieFi));
    }, STABLE_AFTER_MS);
  }
}

function startHeartbeat() {
  window.clearInterval(heartbeatTimer);
  // Check imediato
  void checkConnectivity();
  heartbeatTimer = window.setInterval(() => {
    void checkConnectivity();
  }, HEARTBEAT_INTERVAL_MS);
}

function stopHeartbeat() {
  window.clearInterval(heartbeatTimer);
  window.clearTimeout(stableTimer);
}

function bindBrowserEvents() {
  window.addEventListener('online', () => {
    // Quando browser dispara 'online', verificamos imediatamente
    void checkConnectivity();
  });
  window.addEventListener('offline', () => {
    setState(false, false);
  });
}

// Inicialização
if (typeof window !== 'undefined') {
  bindBrowserEvents();
  startHeartbeat();
}

// ═══ API Pública ═══

export function isOnline(): boolean {
  return isCurrentlyOnline;
}

export function isLieFi(): boolean {
  return isCurrentlyLieFi;
}

export function getNetworkState(): { online: boolean; lieFi: boolean } {
  return { online: isCurrentlyOnline, lieFi: isCurrentlyLieFi };
}

export function onNetworkChange(callback: (online: boolean, lieFi: boolean) => void): () => void {
  listeners.add(callback);
  // Notifica estado atual imediatamente
  callback(isCurrentlyOnline, isCurrentlyLieFi);
  return () => {
    listeners.delete(callback);
  };
}

/** Para testes — permite mockar o estado */
export function _setNetworkStateForTest(online: boolean, lieFi: boolean): void {
  isCurrentlyOnline = online;
  isCurrentlyLieFi = lieFi;
  listeners.forEach((cb) => cb(online, lieFi));
}

/** Para testes — limpa listeners */
export function _resetNetworkMonitor(): void {
  listeners.clear();
  stopHeartbeat();
}
