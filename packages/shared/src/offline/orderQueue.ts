/**
 * ═══ FASE 9 — Offline Resilience ═══
 * Order Queue — Fila persistente de pedidos pendentes com retry automático
 */

import type { CartItem, MetodoPago, Pedido } from '../types';
import type { CheckoutState } from '../utils/pricing';
import { isOnline, onNetworkChange } from './networkMonitor';
import { createRemoteOrder } from '../realtime/client';

const QUEUE_KEY = 'tpv-offline-queue';
const MAX_RETRIES = 5;
const BACKOFF_MS = [5000, 10000, 20000, 40000, 60000];

export interface QueuedOrder {
  id: string;
  tipo: 'create_order';
  payload: {
    cart: CartItem[];
    metodoPago: MetodoPago;
    checkout: CheckoutState;
  };
  tentativas: number;
  criadoEm: string;
  ultimaTentativa: string | null;
  erro: string | null;
}

export interface QueueProcessResult {
  success: boolean;
  pedido?: Pedido;
  error?: string;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function getQueue(): QueuedOrder[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedOrder[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // localStorage cheio
  }
}

function generateQueueId(): string {
  return `queue-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ═══ API Pública ═══

export function getPendingOrders(): QueuedOrder[] {
  return getQueue();
}

export function getPendingCount(): number {
  return getQueue().length;
}

export function enqueueOrder(payload: {
  cart: CartItem[];
  metodoPago: MetodoPago;
  checkout: CheckoutState;
}): QueuedOrder {
  const order: QueuedOrder = {
    id: generateQueueId(),
    tipo: 'create_order',
    payload,
    tentativas: 0,
    criadoEm: new Date().toISOString(),
    ultimaTentativa: null,
    erro: null,
  };

  const queue = getQueue();
  queue.push(order);
  saveQueue(queue);

  // Dispara processamento se online
  if (isOnline()) {
    void processQueue();
  }

  return order;
}

export function removeFromQueue(orderId: string): void {
  const queue = getQueue().filter((o) => o.id !== orderId);
  saveQueue(queue);
}

export function clearQueue(): void {
  saveQueue([]);
}

/** Tempo de espera antes da próxima tentativa (ms) */
export function getRetryDelay(tentativas: number): number {
  return BACKOFF_MS[Math.min(tentativas, BACKOFF_MS.length - 1)];
}

/** Processa um item da fila */
export async function processSingleOrder(order: QueuedOrder): Promise<QueueProcessResult> {
  try {
    const result = await createRemoteOrder(order.payload);
    return { success: true, pedido: result.pedido };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return { success: false, error: errorMessage };
  }
}

/** Processa toda a fila — chamado automaticamente quando online */
export async function processQueue(): Promise<QueueProcessResult[]> {
  const queue = getQueue();
  if (queue.length === 0) return [];
  if (!isOnline()) return [];

  const results: QueueProcessResult[] = [];

  for (const order of queue) {
    // Verifica se deve tentar (backoff)
    if (order.ultimaTentativa) {
      const delay = getRetryDelay(order.tentativas);
      const sinceLastTry = Date.now() - new Date(order.ultimaTentativa).getTime();
      if (sinceLastTry < delay) {
        continue; // Ainda não passou o tempo de backoff
      }
    }

    const result = await processSingleOrder(order);
    results.push(result);

    if (result.success) {
      // Remove da fila
      removeFromQueue(order.id);
    } else {
      // Atualiza tentativas e erro
      const updatedQueue = getQueue().map((o) =>
        o.id === order.id
          ? {
              ...o,
              tentativas: o.tentativas + 1,
              ultimaTentativa: new Date().toISOString(),
              erro: result.error || 'Erro desconhecido',
            }
          : o,
      );
      saveQueue(updatedQueue);

      // Se excedeu max retries, remove (não queremos encher a fila)
      const updatedOrder = updatedQueue.find((o) => o.id === order.id);
      if (updatedOrder && updatedOrder.tentativas >= MAX_RETRIES) {
        removeFromQueue(order.id);
        results.push({ success: false, error: `Máximo de ${MAX_RETRIES} tentativas excedido` });
      }
    }
  }

  return results;
}

/** Retry manual de um pedido específico */
export async function retryOrder(orderId: string): Promise<QueueProcessResult> {
  const queue = getQueue();
  const order = queue.find((o) => o.id === orderId);
  if (!order) return { success: false, error: 'Pedido não encontrado na fila' };

  const result = await processSingleOrder(order);

  if (result.success) {
    removeFromQueue(orderId);
  } else {
    const updatedQueue = queue.map((o) =>
      o.id === orderId
        ? {
            ...o,
            tentativas: o.tentativas + 1,
            ultimaTentativa: new Date().toISOString(),
            erro: result.error || 'Erro desconhecido',
          }
        : o,
    );
    saveQueue(updatedQueue);
  }

  return result;
}

// ═══ Auto-processamento ═══

let autoProcessUnsubscribe: (() => void) | null = null;

export function startAutoProcessing(): void {
  if (autoProcessUnsubscribe) return; // Já iniciado

  autoProcessUnsubscribe = onNetworkChange((online) => {
    if (online && getPendingCount() > 0) {
      // Delay pequeno para estabilizar a conexão
      window.setTimeout(() => {
        void processQueue();
      }, 1500);
    }
  });
}

export function stopAutoProcessing(): void {
  if (autoProcessUnsubscribe) {
    autoProcessUnsubscribe();
    autoProcessUnsubscribe = null;
  }
}

// Inicia auto-processamento automaticamente no browser
if (isBrowser()) {
  startAutoProcessing();
}
