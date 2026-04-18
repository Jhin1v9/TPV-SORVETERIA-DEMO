import { createBootstrapSnapshot } from './bootstrap';
import type { CarrinhoItem, DemoStateSnapshot, EstablishmentSettings, MetodoPago, Pedido, PedidoStatus } from '../types';
import type { CheckoutState } from '../utils/pricing';

const DEFAULT_PORT = '8787';

function getBaseUrl() {
  const envUrl = import.meta.env.VITE_DEMO_SERVER_URL;
  if (envUrl) {
    return envUrl;
  }

  if (typeof window === 'undefined') {
    return `http://127.0.0.1:${DEFAULT_PORT}`;
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:${DEFAULT_PORT}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function ensureRemoteSnapshot() {
  const response = await fetch(`${getBaseUrl()}/api/state`);

  if (response.status === 503) {
    const snapshot = createBootstrapSnapshot();
    await request<{ snapshot: DemoStateSnapshot }>('/api/bootstrap', {
      method: 'POST',
      body: JSON.stringify({ snapshot }),
    });
    return snapshot;
  }

  if (!response.ok) {
    throw new Error(`Unable to fetch remote snapshot (${response.status})`);
  }

  const data = await response.json() as { snapshot: DemoStateSnapshot };
  return data.snapshot;
}

export function openRealtimeStream(onSnapshot: (snapshot: DemoStateSnapshot) => void, onBootstrapRequired: () => void) {
  const stream = new EventSource(`${getBaseUrl()}/api/events`);

  stream.addEventListener('snapshot', (event) => {
    const data = JSON.parse(event.data) as { snapshot: DemoStateSnapshot };
    onSnapshot(data.snapshot);
  });

  stream.addEventListener('bootstrap_required', () => {
    onBootstrapRequired();
  });

  return stream;
}

export async function createRemoteOrder(payload: {
  cart: CarrinhoItem[];
  metodoPago: MetodoPago;
  checkout: CheckoutState;
}) {
  return request<{ pedido: Pedido; snapshot: DemoStateSnapshot }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateRemoteOrderStatus(pedidoId: string, status: PedidoStatus) {
  return request<{ snapshot: DemoStateSnapshot }>(`/api/orders/${pedidoId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export async function updateRemoteFlavorStock(flavorId: string, delta: number) {
  return request<{ snapshot: DemoStateSnapshot }>(`/api/flavors/${flavorId}/stock`, {
    method: 'POST',
    body: JSON.stringify({ delta }),
  });
}

export async function updateRemoteFlavorAvailability(flavorId: string, disponivel: boolean) {
  return request<{ snapshot: DemoStateSnapshot }>(`/api/flavors/${flavorId}/availability`, {
    method: 'POST',
    body: JSON.stringify({ disponivel }),
  });
}

export async function updateRemoteSettings(establishment: EstablishmentSettings) {
  return request<{ snapshot: DemoStateSnapshot }>('/api/settings', {
    method: 'POST',
    body: JSON.stringify({ establishment }),
  });
}

export async function resetRemoteDemo() {
  const snapshot = createBootstrapSnapshot();
  return request<{ snapshot: DemoStateSnapshot }>('/api/reset', {
    method: 'POST',
    body: JSON.stringify({ snapshot }),
  });
}

export function getDemoServerUrl() {
  return getBaseUrl();
}
