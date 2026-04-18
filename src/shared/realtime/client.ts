import { createBootstrapSnapshot } from './bootstrap';
import { calculateCheckoutSummary, type CheckoutState } from '../utils/pricing';
import { calcularPrecoItem } from '../utils/calculos';
import type {
  CarrinhoItem,
  DemoStateSnapshot,
  EstablishmentSettings,
  MetodoPago,
  Pedido,
  PedidoStatus,
} from '../types';

const DEFAULT_PORT = '8787';
const STANDALONE_STORAGE_KEY = 'tpv-demo-standalone-state';

let runtimeMode: 'realtime' | 'standalone' = 'realtime';

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

function setRuntimeMode(mode: 'realtime' | 'standalone') {
  runtimeMode = mode;
}

export function getRuntimeMode() {
  return runtimeMode;
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

function getStandaloneSnapshot() {
  if (typeof window === 'undefined') {
    return createBootstrapSnapshot();
  }

  const saved = window.localStorage.getItem(STANDALONE_STORAGE_KEY);
  if (!saved) {
    const bootstrap = createBootstrapSnapshot();
    saveStandaloneSnapshot(bootstrap);
    return bootstrap;
  }

  try {
    return JSON.parse(saved) as DemoStateSnapshot;
  } catch {
    const bootstrap = createBootstrapSnapshot();
    saveStandaloneSnapshot(bootstrap);
    return bootstrap;
  }
}

function saveStandaloneSnapshot(snapshot: DemoStateSnapshot) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STANDALONE_STORAGE_KEY, JSON.stringify(snapshot));
  }
}

function withUpdatedMeta(snapshot: DemoStateSnapshot): DemoStateSnapshot {
  return {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };
}

function applyStandaloneMutation(mutator: (snapshot: DemoStateSnapshot) => DemoStateSnapshot) {
  const current = getStandaloneSnapshot();
  const next = withUpdatedMeta(mutator(current));
  saveStandaloneSnapshot(next);
  return next;
}

function buildStandaloneOrder(snapshot: DemoStateSnapshot, payload: {
  cart: CarrinhoItem[];
  metodoPago: MetodoPago;
  checkout: CheckoutState;
}) {
  const nextOrderNumber = snapshot.lastOrderNumber + 1;
  const pricing = calculateCheckoutSummary(payload.cart, payload.checkout);
  const createdAt = new Date().toISOString();

  const itens = payload.cart.map((item, index) => ({
    id: `item-${nextOrderNumber}-${index + 1}`,
    categoriaSku: item.categoria.id,
    categoriaNome: item.categoria.nome.es,
    sabores: item.sabores,
    toppings: item.toppings,
    precoUnitario: calcularPrecoItem(item.categoria, item.sabores, item.toppings),
    quantidade: 1,
  }));

  const pedido: Pedido = {
    id: `pedido-${nextOrderNumber}-${Date.now()}`,
    numeroSequencial: nextOrderNumber,
    status: 'pendiente',
    timestampCriacao: createdAt,
    timestampListo: null,
    metodoPago: payload.metodoPago,
    subtotal: pricing.subtotal,
    descuento: pricing.descuento,
    extras: pricing.extras,
    total: pricing.total,
    iva: pricing.iva,
    verifactuQr: JSON.stringify({
      id: `pedido-${nextOrderNumber}`,
      fecha: createdAt.slice(0, 10),
      importe: pricing.total.toFixed(2),
      establecimiento: snapshot.establishment.name,
    }),
    clienteTelefone: payload.checkout.notificationPhone || null,
    itens,
  };

  const updatedSnapshot = applyStandaloneMutation((current) => {
    const sabores = current.sabores.map((sabor) => {
      const usage = payload.cart.reduce((consumption, item) => {
        if (!item.sabores.some((selected) => selected.id === sabor.id)) {
          return consumption;
        }

        const totalByContainer = item.categoria.id === 'copo500'
          ? 0.1
          : item.categoria.id === 'copo300'
            ? 0.052
            : item.categoria.id === 'cone'
              ? 0.031
              : 0.2;
        return consumption + totalByContainer / item.sabores.length;
      }, 0);

      if (usage === 0) {
        return sabor;
      }

      return {
        ...sabor,
        stockBaldes: Number(Math.max(0, sabor.stockBaldes - usage).toFixed(3)),
      };
    });

    const today = createdAt.slice(0, 10);
    const existingDay = current.vendasHistorico.find((entry) => entry.data === today);
    const vendasHistorico = existingDay
      ? current.vendasHistorico.map((entry) => entry.data === today
        ? {
            ...entry,
            total: Number((entry.total + pedido.total).toFixed(2)),
            pedidos: entry.pedidos + 1,
            ticketMedio: Number(((entry.total + pedido.total) / (entry.pedidos + 1)).toFixed(2)),
          }
        : entry)
      : [
          ...current.vendasHistorico,
          {
            data: today,
            total: pedido.total,
            pedidos: 1,
            ticketMedio: pedido.total,
          },
        ];

    return {
      ...current,
      sabores,
      pedidos: [pedido, ...current.pedidos],
      vendasHistorico,
      lastOrderNumber: nextOrderNumber,
    };
  });

  return {
    pedido,
    snapshot: updatedSnapshot,
  };
}

export async function ensureRemoteSnapshot() {
  try {
    const response = await fetch(`${getBaseUrl()}/api/state`, { method: 'GET' });

    if (response.status === 503) {
      const snapshot = createBootstrapSnapshot();
      await request<{ snapshot: DemoStateSnapshot }>('/api/bootstrap', {
        method: 'POST',
        body: JSON.stringify({ snapshot }),
      });
      setRuntimeMode('realtime');
      return snapshot;
    }

    if (!response.ok) {
      throw new Error(`Unable to fetch remote snapshot (${response.status})`);
    }

    const data = await response.json() as { snapshot: DemoStateSnapshot };
    setRuntimeMode('realtime');
    return data.snapshot;
  } catch {
    setRuntimeMode('standalone');
    return getStandaloneSnapshot();
  }
}

export function openRealtimeStream(onSnapshot: (snapshot: DemoStateSnapshot) => void, onBootstrapRequired: () => void) {
  if (getRuntimeMode() === 'standalone') {
    return null;
  }

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
  if (getRuntimeMode() === 'standalone') {
    return buildStandaloneOrder(getStandaloneSnapshot(), payload);
  }

  try {
    return await request<{ pedido: Pedido; snapshot: DemoStateSnapshot }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    setRuntimeMode('standalone');
    return buildStandaloneOrder(getStandaloneSnapshot(), payload);
  }
}

export async function updateRemoteOrderStatus(pedidoId: string, status: PedidoStatus) {
  if (getRuntimeMode() === 'standalone') {
    const snapshot = applyStandaloneMutation((current) => ({
      ...current,
      pedidos: current.pedidos.map((pedido) => pedido.id === pedidoId
        ? {
            ...pedido,
            status,
            timestampListo: status === 'listo' ? new Date().toISOString() : pedido.timestampListo,
          }
        : pedido),
    }));
    return { snapshot };
  }

  return request<{ snapshot: DemoStateSnapshot }>(`/api/orders/${pedidoId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}

export async function updateRemoteFlavorStock(flavorId: string, delta: number) {
  if (getRuntimeMode() === 'standalone') {
    const snapshot = applyStandaloneMutation((current) => ({
      ...current,
      sabores: current.sabores.map((sabor) => sabor.id === flavorId
        ? { ...sabor, stockBaldes: Number(Math.max(0, sabor.stockBaldes + delta).toFixed(3)) }
        : sabor),
    }));
    return { snapshot };
  }

  return request<{ snapshot: DemoStateSnapshot }>(`/api/flavors/${flavorId}/stock`, {
    method: 'POST',
    body: JSON.stringify({ delta }),
  });
}

export async function updateRemoteFlavorAvailability(flavorId: string, disponivel: boolean) {
  if (getRuntimeMode() === 'standalone') {
    const snapshot = applyStandaloneMutation((current) => ({
      ...current,
      sabores: current.sabores.map((sabor) => sabor.id === flavorId ? { ...sabor, disponivel } : sabor),
    }));
    return { snapshot };
  }

  return request<{ snapshot: DemoStateSnapshot }>(`/api/flavors/${flavorId}/availability`, {
    method: 'POST',
    body: JSON.stringify({ disponivel }),
  });
}

export async function updateRemoteSettings(establishment: EstablishmentSettings) {
  if (getRuntimeMode() === 'standalone') {
    const snapshot = applyStandaloneMutation((current) => ({
      ...current,
      establishment,
    }));
    return { snapshot };
  }

  return request<{ snapshot: DemoStateSnapshot }>('/api/settings', {
    method: 'POST',
    body: JSON.stringify({ establishment }),
  });
}

export async function resetRemoteDemo() {
  if (getRuntimeMode() === 'standalone') {
    const snapshot = withUpdatedMeta(createBootstrapSnapshot());
    saveStandaloneSnapshot(snapshot);
    return { snapshot };
  }

  const snapshot = createBootstrapSnapshot();
  return request<{ snapshot: DemoStateSnapshot }>('/api/reset', {
    method: 'POST',
    body: JSON.stringify({ snapshot }),
  });
}

export function getDemoServerUrl() {
  return getBaseUrl();
}
