/**
 * ═══ FASE 9 — Offline Resilience ═══
 * Catalog Cache — Cache de catálogo com TTL para bootstrap rápido offline
 */

import type { DemoStateSnapshot } from '../types';
import { createBootstrapSnapshot } from '../realtime/bootstrap';

const CACHE_KEY = 'tpv-catalog-cache';
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hora

interface CachedCatalog {
  snapshot: DemoStateSnapshot;
  cachedAt: string;
  ttlMs: number;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getCachedCatalog(): DemoStateSnapshot | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed: CachedCatalog = JSON.parse(raw);
    const cachedAt = new Date(parsed.cachedAt).getTime();
    const now = Date.now();

    if (now - cachedAt > parsed.ttlMs) {
      // Cache expirado — remove
      window.localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed.snapshot;
  } catch {
    return null;
  }
}

export function setCachedCatalog(snapshot: DemoStateSnapshot, ttlMs = DEFAULT_TTL_MS): void {
  if (!isBrowser()) return;

  try {
    const entry: CachedCatalog = {
      snapshot,
      cachedAt: new Date().toISOString(),
      ttlMs,
    };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage pode estar cheio — ignora silenciosamente
  }
}

export function isCacheValid(): boolean {
  if (!isBrowser()) return false;

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return false;

    const parsed: CachedCatalog = JSON.parse(raw);
    const cachedAt = new Date(parsed.cachedAt).getTime();
    return Date.now() - cachedAt <= parsed.ttlMs;
  } catch {
    return false;
  }
}

export function clearCatalogCache(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(CACHE_KEY);
}

/**
 * Retorna catálogo disponível offline:
 * 1. Cache válido → usa cache
 * 2. Cache inválido/expirado → usa bootstrap (dados locais)
 */
export function getOfflineCatalog(): DemoStateSnapshot {
  const cached = getCachedCatalog();
  if (cached) return cached;

  // Fallback para dados locais
  return createBootstrapSnapshot();
}

/** Idade do cache em minutos (para UI) */
export function getCacheAgeMinutes(): number | null {
  if (!isBrowser()) return null;

  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed: CachedCatalog = JSON.parse(raw);
    const cachedAt = new Date(parsed.cachedAt).getTime();
    return Math.floor((Date.now() - cachedAt) / 60000);
  } catch {
    return null;
  }
}
