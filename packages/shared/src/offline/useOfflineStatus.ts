/**
 * ═══ FASE 9 — Offline Resilience ═══
 * useOfflineStatus — Hook React para status de conectividade e fila
 */

import { useState, useEffect, useCallback } from 'react';
import { onNetworkChange } from './networkMonitor';
import { getPendingCount, getPendingOrders, retryOrder, type QueuedOrder } from './orderQueue';

export interface OfflineStatus {
  /** Está online agora */
  isOnline: boolean;
  /** Está em lie-fi (browser diz online mas sem conectividade real) */
  isLieFi: boolean;
  /** Quantidade de pedidos na fila */
  pendingCount: number;
  /** Lista de pedidos pendentes */
  pendingOrders: QueuedOrder[];
  /** Está processando a fila no momento */
  isProcessing: boolean;
  /** Força refresh do estado da fila */
  refresh: () => void;
  /** Retry manual de um pedido */
  retry: (orderId: string) => Promise<boolean>;
}

export function useOfflineStatus(): OfflineStatus {
  const [networkState, setNetworkState] = useState({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isLieFi: false,
  });
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState<QueuedOrder[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const refresh = useCallback(() => {
    setPendingCount(getPendingCount());
    setPendingOrders(getPendingOrders());
  }, []);

  const retry = useCallback(async (orderId: string): Promise<boolean> => {
    setIsProcessing(true);
    try {
      const result = await retryOrder(orderId);
      refresh();
      return result.success;
    } finally {
      setIsProcessing(false);
    }
  }, [refresh]);

  // Monitora mudanças de rede
  useEffect(() => {
    const unsubscribe = onNetworkChange((online, lieFi) => {
      setNetworkState({ isOnline: online, isLieFi: lieFi });
      refresh();
    });
    return unsubscribe;
  }, [refresh]);

  // Atualiza contagem periodicamente (outras tabs podem enfileirar)
  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, 3000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  // Escuta storage events (outras tabs)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'tpv-offline-queue') {
        refresh();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refresh]);

  return {
    isOnline: networkState.isOnline,
    isLieFi: networkState.isLieFi,
    pendingCount,
    pendingOrders,
    isProcessing,
    refresh,
    retry,
  };
}
