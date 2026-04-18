import { createBootstrapSnapshot } from './bootstrap';
import { calculateCheckoutSummary, type CheckoutState } from '../utils/pricing';
import { calcularPrecoItem } from '../utils/calculos';
import { buildSnapshotFromSupabase } from '../supabase/mappers';
import { getSupabaseProjectLabel, hasSupabaseConfig, supabase } from '../supabase/client';
import type {
  CarrinhoItem,
  DemoStateSnapshot,
  EstablishmentSettings,
  MetodoPago,
  Pedido,
  PedidoStatus,
} from '../types';

const STANDALONE_STORAGE_KEY = 'tpv-demo-standalone-state';

let runtimeMode: 'supabase' | 'standalone' = hasSupabaseConfig ? 'supabase' : 'standalone';

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

export async function ensureRemoteSnapshot() {
  if (!hasSupabaseConfig || !supabase) {
    setRuntimeMode('standalone');
    return getStandaloneSnapshot();
  }

  const snapshot = await fetchSupabaseSnapshot();
  setRuntimeMode('supabase');
  return snapshot;
}

type RealtimeStatus = 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR';

export function openRealtimeStream(
  onSnapshot: (snapshot: DemoStateSnapshot) => void,
  onStatusChange?: (status: RealtimeStatus) => void,
) {
  if (getRuntimeMode() === 'standalone' || !supabase) {
    return null;
  }

  const channel = supabase
    .channel('tpv-demo-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, async () => onSnapshot(await fetchSupabaseSnapshot()))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'flavors' }, async () => onSnapshot(await fetchSupabaseSnapshot()))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'toppings' }, async () => onSnapshot(await fetchSupabaseSnapshot()))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, async () => onSnapshot(await fetchSupabaseSnapshot()))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => onSnapshot(await fetchSupabaseSnapshot()))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, async () => onSnapshot(await fetchSupabaseSnapshot()))
    .subscribe((status) => {
      onStatusChange?.(status as RealtimeStatus);
    });

  return {
    close() {
      void supabase!.removeChannel(channel);
    },
  };
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
