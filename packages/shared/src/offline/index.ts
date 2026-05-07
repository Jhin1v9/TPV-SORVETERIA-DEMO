/**
 * ═══ FASE 9 — Offline Resilience ═══
 * Barrel export do módulo offline
 */

export {
  isOnline,
  isLieFi,
  getNetworkState,
  onNetworkChange,
  _setNetworkStateForTest,
  _resetNetworkMonitor,
} from './networkMonitor';

export {
  getCachedCatalog,
  setCachedCatalog,
  isCacheValid,
  clearCatalogCache,
  getOfflineCatalog,
  getCacheAgeMinutes,
} from './catalogCache';

export {
  getPendingOrders,
  getPendingCount,
  enqueueOrder,
  removeFromQueue,
  clearQueue,
  getRetryDelay,
  processSingleOrder,
  processQueue,
  retryOrder,
  startAutoProcessing,
  stopAutoProcessing,
} from './orderQueue';

export type { QueuedOrder, QueueProcessResult } from './orderQueue';

export { useOfflineStatus } from './useOfflineStatus';
export type { OfflineStatus } from './useOfflineStatus';
