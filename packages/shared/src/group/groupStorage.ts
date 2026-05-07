/**
 * ═══ FASE 11 — Group Ordering ═══
 * Group Storage — Persistência em localStorage + sync entre tabs
 */

import type { GroupOrder } from '../types';
import { broadcastMessage } from '../utils/broadcast';

const STORAGE_KEY = 'tpv-group-order';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getStoredGroup(): GroupOrder | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GroupOrder;
    // Verifica se expirou
    const criado = new Date(parsed.criadoEm).getTime();
    const limiteMs = parsed.limiteMinutos * 60 * 1000;
    if (Date.now() - criado > limiteMs) {
      clearStoredGroup();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredGroup(grupo: GroupOrder): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(grupo));
  } catch {
    // localStorage cheio
  }
}

export function clearStoredGroup(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Broadcast de atualização do grupo para outras tabs
 */
export function broadcastGroupUpdate(grupo: GroupOrder): void {
  broadcastMessage({
    tipo: 'group_order_update',
    timestamp: new Date().toISOString(),
    dados: { grupo },
  });
}

/**
 * Escuta atualizações do grupo de outras tabs
 */
export function listenGroupUpdates(callback: (grupo: GroupOrder) => void): () => void {
  if (!isBrowser()) return () => {};

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        const grupo = JSON.parse(e.newValue) as GroupOrder;
        callback(grupo);
      } catch {
        // ignora
      }
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}
