import type { Pedido, PedidoStatus } from '../types';

const CHANNEL_NAME = 'tpv_sorveteria_sabadell_v1';

class TPVBroadcast {
  private channel: BroadcastChannel | null = null;
  private listeners: ((data: unknown) => void)[] = [];

  initialize() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        this.listeners.forEach((fn) => fn(event.data));
      };
    }
  }

  onMessage(fn: (data: unknown) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  enviarPedido(pedido: Pedido) {
    this.post({
      tipo: 'novo_pedido',
      timestamp: new Date().toISOString(),
      dados: pedido,
    });
  }

  atualizarStatus(pedidoId: string, status: PedidoStatus) {
    this.post({
      tipo: 'status_update',
      timestamp: new Date().toISOString(),
      pedidoId,
      status,
    });
  }

  atualizarEstoque(saborId: string, stockBaldes: number) {
    this.post({
      tipo: 'estoque_update',
      timestamp: new Date().toISOString(),
      saborId,
      stockBaldes,
    });
  }

  private post(data: unknown) {
    if (this.channel) {
      this.channel.postMessage(data);
    }
    // Also try cross-tab communication via localStorage fallback
    try {
      localStorage.setItem('tpv_broadcast', JSON.stringify({ ...data as Record<string, unknown>, _ts: Date.now() }));
    } catch {
      // ignore
    }
  }

  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
  }
}

export const broadcast = new TPVBroadcast();

// LocalStorage fallback for cross-tab sync
export function listenLocalStorage(callback: (data: unknown) => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === 'tpv_broadcast' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        callback(data);
      } catch {
        // ignore
      }
    }
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}
