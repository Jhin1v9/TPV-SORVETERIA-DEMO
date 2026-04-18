import { createBootstrapSnapshot } from './bootstrap';
import { calculateCheckoutSummary, type CheckoutState } from '../utils/pricing';
import { calcularPrecoItem } from '../utils/calculos';
import { buildSnapshotFromSupabase } from '../supabase/mappers';
import { getSupabaseProjectLabel, hasSupabaseConfig, supabase } from '../supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  CarrinhoItem,
  DemoStateSnapshot,
  EstablishmentSettings,
  MetodoPago,
  Pedido,
  PedidoStatus,
} from '../types';

const STANDALONE_STORAGE_KEY = 'tpv-demo-standalone-state';
const RECONNECT_DELAY_MS = 2000;
const REFRESH_DEBOUNCE_MS = 150;
const FOREGROUND_HEALTHCHECK_MS = 12000;
const BACKGROUND_HEALTHCHECK_MS = 30000;

let runtimeMode: 'supabase' | 'standalone' = hasSupabaseConfig ? 'supabase' : 'standalone';
let snapshotRequest: Promise<DemoStateSnapshot> | null = null;

function setRuntimeMode(mode: 'supabase' | 'standalone') {
  runtimeMode = mode;
}

export function getRuntimeMode() {
  return runtimeMode;
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

      return usage === 0
        ? sabor
        : { ...sabor, stockBaldes: Number(Math.max(0, sabor.stockBaldes - usage).toFixed(3)) };
    });

    return {
      ...current,
      sabores,
      pedidos: [pedido, ...current.pedidos],
      lastOrderNumber: nextOrderNumber,
    };
  });

  return {
    pedido,
    snapshot: updatedSnapshot,
  };
}

async function fetchSupabaseSnapshot() {
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }

  const [categoriesResult, flavorsResult, toppingsResult, settingsResult, ordersResult] = await Promise.all([
    supabase.from('categories').select('*').order('display_order', { ascending: true }),
    supabase.from('flavors').select('*').order('id', { ascending: true }),
    supabase.from('toppings').select('*').order('id', { ascending: true }),
    supabase.from('store_settings').select('*').eq('store_key', 'main').maybeSingle(),
    supabase
      .from('orders')
      .select('id, numero_sequencial, status, created_at, ready_at, payment_method, subtotal, discount, extras, total, iva, verifactu_qr, customer_phone, order_items(id, category_sku, category_name, flavors, toppings, unit_price, quantity, notes, sort_order)')
      .order('numero_sequencial', { ascending: false }),
  ]);

  const possibleErrors = [
    categoriesResult.error,
    flavorsResult.error,
    toppingsResult.error,
    settingsResult.error,
    ordersResult.error,
  ].filter(Boolean);

  if (possibleErrors.length > 0) {
    throw possibleErrors[0]!;
  }

  return buildSnapshotFromSupabase({
    categories: categoriesResult.data ?? [],
    flavors: flavorsResult.data ?? [],
    toppings: toppingsResult.data ?? [],
    settings: settingsResult.data,
    orders: ordersResult.data ?? [],
  });
}

async function fetchSupabaseSnapshotDeduped(force = false) {
  if (!force && snapshotRequest) {
    return snapshotRequest;
  }

  snapshotRequest = fetchSupabaseSnapshot().finally(() => {
    snapshotRequest = null;
  });

  return snapshotRequest;
}

export async function ensureRemoteSnapshot() {
  if (!hasSupabaseConfig || !supabase) {
    setRuntimeMode('standalone');
    return getStandaloneSnapshot();
  }

  const snapshot = await fetchSupabaseSnapshotDeduped();
  setRuntimeMode('supabase');
  return snapshot;
}

type RealtimeStatus = 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR';
type ConnectionState = 'connecting' | 'connected' | 'offline' | 'standalone';
type SnapshotListener = (snapshot: DemoStateSnapshot) => void;
type ConnectionListener = (status: ConnectionState) => void;

class RealtimeManager {
  private channel: RealtimeChannel | null = null;
  private snapshotListeners = new Set<SnapshotListener>();
  private connectionListeners = new Set<ConnectionListener>();
  private started = false;
  private disposed = false;
  private reconnectTimer = 0;
  private healthcheckTimer = 0;
  private refreshTimer = 0;
  private refreshPending = false;
  private lastHealthyAt = 0;
  private connectionState: ConnectionState = hasSupabaseConfig ? 'connecting' : 'standalone';
  private latestSnapshot: DemoStateSnapshot | null = null;

  subscribe(onSnapshot: SnapshotListener, onConnection?: ConnectionListener) {
    this.snapshotListeners.add(onSnapshot);
    if (onConnection) {
      this.connectionListeners.add(onConnection);
      onConnection(this.connectionState);
    }

    if (this.latestSnapshot) {
      onSnapshot(this.latestSnapshot);
    }

    if (!this.started) {
      this.start();
    }

    return {
      unsubscribe: () => {
        this.snapshotListeners.delete(onSnapshot);
        if (onConnection) {
          this.connectionListeners.delete(onConnection);
        }
      },
    };
  }

  private setConnectionState(state: ConnectionState) {
    this.connectionState = state;
    this.connectionListeners.forEach((listener) => listener(state));
  }

  private publishSnapshot(snapshot: DemoStateSnapshot) {
    this.latestSnapshot = snapshot;
    this.lastHealthyAt = Date.now();
    this.setConnectionState(getRuntimeMode() === 'standalone' ? 'standalone' : 'connected');
    this.snapshotListeners.forEach((listener) => listener(snapshot));
  }

  private scheduleReconnect() {
    if (this.disposed || getRuntimeMode() === 'standalone') {
      return;
    }

    window.clearTimeout(this.reconnectTimer);
    this.reconnectTimer = window.setTimeout(() => {
      void this.restartChannel();
    }, RECONNECT_DELAY_MS);
  }

  private scheduleRefresh(delay = REFRESH_DEBOUNCE_MS, force = false) {
    if (this.disposed) {
      return;
    }

    if (getRuntimeMode() === 'standalone') {
      const snapshot = getStandaloneSnapshot();
      this.publishSnapshot(snapshot);
      return;
    }

    this.refreshPending = true;
    window.clearTimeout(this.refreshTimer);
    this.refreshTimer = window.setTimeout(() => {
      void this.refreshSnapshot(force);
    }, delay);
  }

  private async refreshSnapshot(force = false) {
    if (this.disposed || !this.refreshPending) {
      return;
    }

    this.refreshPending = false;

    try {
      const snapshot = await fetchSupabaseSnapshotDeduped(force);
      if (this.disposed) {
        return;
      }
      setRuntimeMode('supabase');
      this.publishSnapshot(snapshot);
    } catch {
      if (this.disposed) {
        return;
      }

      if (getRuntimeMode() === 'standalone') {
        this.setConnectionState('standalone');
        return;
      }

      if (this.lastHealthyAt === 0 || Date.now() - this.lastHealthyAt > FOREGROUND_HEALTHCHECK_MS) {
        this.setConnectionState('offline');
      }
      this.scheduleReconnect();
    }
  }

  private startHealthcheck() {
    window.clearInterval(this.healthcheckTimer);
    this.healthcheckTimer = window.setInterval(() => {
      if (this.disposed) {
        return;
      }

      const isHidden = typeof document !== 'undefined' && document.hidden;
      const staleAfter = isHidden ? BACKGROUND_HEALTHCHECK_MS : FOREGROUND_HEALTHCHECK_MS;
      if (this.lastHealthyAt !== 0 && Date.now() - this.lastHealthyAt > staleAfter) {
        this.scheduleRefresh(0, true);
      }
    }, 5000);
  }

  private async restartChannel() {
    if (this.disposed || getRuntimeMode() === 'standalone' || !supabase) {
      return;
    }

    if (this.connectionState !== 'connected') {
      this.setConnectionState('connecting');
    }

    if (this.channel) {
      const previousChannel = this.channel;
      this.channel = null;
      await supabase.removeChannel(previousChannel);
    }

    this.createChannel();
    this.scheduleRefresh(0, true);
  }

  private createChannel() {
    if (!supabase || this.channel || getRuntimeMode() === 'standalone') {
      return;
    }

    const requestRefresh = () => {
      this.scheduleRefresh();
    };

    this.channel = supabase
      .channel('tpv-demo-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, requestRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flavors' }, requestRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'toppings' }, requestRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, requestRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, requestRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, requestRefresh)
      .subscribe((status) => {
        const realtimeStatus = status as RealtimeStatus;

        if (realtimeStatus === 'SUBSCRIBED') {
          this.scheduleRefresh(0, true);
          return;
        }

        if (realtimeStatus === 'CHANNEL_ERROR' || realtimeStatus === 'TIMED_OUT' || realtimeStatus === 'CLOSED') {
          if (Date.now() - this.lastHealthyAt > FOREGROUND_HEALTHCHECK_MS) {
            this.setConnectionState('offline');
          }
          this.scheduleReconnect();
        }
      });
  }

  private bindLifecycle() {
    const handleForegroundSync = () => {
      if (this.disposed || (typeof document !== 'undefined' && document.hidden)) {
        return;
      }
      this.scheduleRefresh(0, true);
    };

    window.addEventListener('focus', handleForegroundSync);
    window.addEventListener('online', handleForegroundSync);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        handleForegroundSync();
      }
    });
  }

  private async start() {
    this.started = true;

    if (!hasSupabaseConfig || !supabase) {
      setRuntimeMode('standalone');
      this.setConnectionState('standalone');
      this.publishSnapshot(getStandaloneSnapshot());
      return;
    }

    setRuntimeMode('supabase');
    this.setConnectionState('connecting');
    this.bindLifecycle();
    this.startHealthcheck();
    this.createChannel();
    this.scheduleRefresh(0, true);
  }
}

const realtimeManager = new RealtimeManager();

export function subscribeRealtimeSession(
  onSnapshot: (snapshot: DemoStateSnapshot) => void,
  onConnection?: (status: ConnectionState) => void,
) {
  return realtimeManager.subscribe(onSnapshot, onConnection);
}

export async function createRemoteOrder(payload: {
  cart: CarrinhoItem[];
  metodoPago: MetodoPago;
  checkout: CheckoutState;
}) {
  if (getRuntimeMode() === 'standalone' || !supabase) {
    return buildStandaloneOrder(getStandaloneSnapshot(), payload);
  }

  const result = await supabase.rpc('create_demo_order', {
    cart_payload: payload.cart,
    payment_method_input: payload.metodoPago,
    checkout_payload: payload.checkout,
  });

  if (result.error || !result.data) {
    throw result.error ?? new Error('Unable to create order');
  }

  const snapshot = await fetchSupabaseSnapshot();
  const pedido = snapshot.pedidos.find((item) => item.id === result.data);
  if (!pedido) {
    throw new Error('Created order not found in snapshot');
  }

  setRuntimeMode('supabase');
  return { pedido, snapshot };
}

export async function updateRemoteOrderStatus(pedidoId: string, status: PedidoStatus) {
  if (getRuntimeMode() === 'standalone' || !supabase) {
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

  const result = await supabase.rpc('update_order_status', {
    order_id_input: pedidoId,
    status_input: status,
  });
  if (result.error) {
    throw result.error;
  }
  return { snapshot: await fetchSupabaseSnapshot() };
}

export async function updateRemoteFlavorStock(flavorId: string, delta: number) {
  if (getRuntimeMode() === 'standalone' || !supabase) {
    const snapshot = applyStandaloneMutation((current) => ({
      ...current,
      sabores: current.sabores.map((sabor) => sabor.id === flavorId
        ? { ...sabor, stockBaldes: Number(Math.max(0, sabor.stockBaldes + delta).toFixed(3)) }
        : sabor),
    }));
    return { snapshot };
  }

  const result = await supabase.rpc('adjust_flavor_stock', {
    flavor_id_input: flavorId,
    delta_input: delta,
  });
  if (result.error) {
    throw result.error;
  }
  return { snapshot: await fetchSupabaseSnapshot() };
}

export async function updateRemoteFlavorAvailability(flavorId: string, disponivel: boolean) {
  if (getRuntimeMode() === 'standalone' || !supabase) {
    const snapshot = applyStandaloneMutation((current) => ({
      ...current,
      sabores: current.sabores.map((sabor) => sabor.id === flavorId ? { ...sabor, disponivel } : sabor),
    }));
    return { snapshot };
  }

  const result = await supabase.rpc('set_flavor_availability', {
    flavor_id_input: flavorId,
    available_input: disponivel,
  });
  if (result.error) {
    throw result.error;
  }
  return { snapshot: await fetchSupabaseSnapshot() };
}

export async function updateRemoteSettings(establishment: EstablishmentSettings) {
  if (getRuntimeMode() === 'standalone' || !supabase) {
    const snapshot = applyStandaloneMutation((current) => ({
      ...current,
      establishment,
    }));
    return { snapshot };
  }

  const result = await supabase.rpc('upsert_store_settings', {
    setting_payload: establishment,
  });
  if (result.error) {
    throw result.error;
  }
  return { snapshot: await fetchSupabaseSnapshot() };
}

export async function resetRemoteDemo() {
  if (getRuntimeMode() === 'standalone' || !supabase) {
    const snapshot = withUpdatedMeta(createBootstrapSnapshot());
    saveStandaloneSnapshot(snapshot);
    return { snapshot };
  }

  const result = await supabase.rpc('reset_demo_data');
  if (result.error) {
    throw result.error;
  }
  return { snapshot: await fetchSupabaseSnapshot() };
}

export function getDemoServerUrl() {
  return hasSupabaseConfig ? getSupabaseProjectLabel() : 'Modo local';
}
