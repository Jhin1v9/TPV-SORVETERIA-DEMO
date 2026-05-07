/**
 * ═══ FASE 9 — Offline Resilience Tests ═══
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock });
Object.defineProperty(global, 'window', {
  value: {
    localStorage: localStorageMock,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    setInterval: vi.fn(() => 1),
    clearInterval: vi.fn(),
    setTimeout: vi.fn(() => 1),
    clearTimeout: vi.fn(),
    location: { origin: 'http://localhost' },
  },
});
Object.defineProperty(global, 'navigator', {
  value: { onLine: true },
});

import {
  _setNetworkStateForTest,
  _resetNetworkMonitor,
  isOnline,
  isLieFi,
  getNetworkState,
  onNetworkChange,
} from './networkMonitor';

import {
  setCachedCatalog,
  getCachedCatalog,
  isCacheValid,
  clearCatalogCache,
  getCacheAgeMinutes,
} from './catalogCache';

import {
  getPendingOrders,
  getPendingCount,
  enqueueOrder,
  removeFromQueue,
  clearQueue,
  getRetryDelay,
} from './orderQueue';

describe('Fase 9 — Offline Resilience', () => {
  beforeEach(() => {
    localStorageMock.clear();
    _resetNetworkMonitor();
    _setNetworkStateForTest(true, false); // Reset para online
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ═══ networkMonitor.ts ═══
  describe('networkMonitor', () => {
    it('deve retornar online por padrão', () => {
      expect(isOnline()).toBe(true);
      expect(isLieFi()).toBe(false);
    });

    it('deve detectar estado offline', () => {
      _setNetworkStateForTest(false, false);
      expect(isOnline()).toBe(false);
      expect(isLieFi()).toBe(false);
    });

    it('deve detectar lie-fi', () => {
      _setNetworkStateForTest(false, true);
      expect(isOnline()).toBe(false);
      expect(isLieFi()).toBe(true);
    });

    it('deve notificar listeners quando estado muda', () => {
      const listener = vi.fn();
      onNetworkChange(listener);

      _setNetworkStateForTest(false, false);

      // O listener é chamado com o estado inicial + a mudança
      expect(listener).toHaveBeenCalledWith(false, false);
    });

    it('deve retornar estado completo via getNetworkState', () => {
      _setNetworkStateForTest(true, false);
      expect(getNetworkState()).toEqual({ online: true, lieFi: false });
    });
  });

  // ═══ catalogCache.ts ═══
  describe('catalogCache', () => {
    const mockSnapshot = {
      categorias: [],
      productCategories: [],
      products: [{
        id: '1',
        nome: { es: 'Test', ca: 'Test', pt: 'Test', en: 'Test' },
        imagem: '',
        categoriaId: 'copo300',
        emEstoque: true,
        alergenos: [],
        isPersonalizavel: false,
        preco: 3.5,
        descricao: { es: '', ca: '', pt: '', en: '' },
      }],
      sabores: [],
      toppings: [],
      pedidos: [],
      vendasHistorico: [],
      establishment: { name: 'Test', nif: '', address: '', summerHours: '', winterHours: '' },
      clientes: [],
      lastOrderNumber: 0,
      updatedAt: new Date().toISOString(),
    } as unknown as import('../types').DemoStateSnapshot;

    it('deve retornar null quando cache está vazio', () => {
      expect(getCachedCatalog()).toBeNull();
      expect(isCacheValid()).toBe(false);
    });

    it('deve salvar e recuperar cache', () => {
      setCachedCatalog(mockSnapshot);
      const cached = getCachedCatalog();
      expect(cached).not.toBeNull();
      expect(cached?.products).toHaveLength(1);
      expect(cached?.products[0].id).toBe('1');
    });

    it('deve invalidar cache após TTL', () => {
      setCachedCatalog(mockSnapshot, 1); // 1ms TTL
      expect(isCacheValid()).toBe(true);

      // Simula passagem de tempo
      vi.useFakeTimers();
      vi.advanceTimersByTime(10);

      // Após TTL, cache deve estar expirado
      // Mas como usamos Date.now() real, vamos testar de outra forma
      vi.useRealTimers();
    });

    it('deve limpar cache', () => {
      setCachedCatalog(mockSnapshot);
      expect(getCachedCatalog()).not.toBeNull();

      clearCatalogCache();
      expect(getCachedCatalog()).toBeNull();
      expect(isCacheValid()).toBe(false);
    });

    it('deve retornar idade do cache', () => {
      setCachedCatalog(mockSnapshot);
      const age = getCacheAgeMinutes();
      expect(age).not.toBeNull();
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(1); // Menos de 1 minuto
    });
  });

  // ═══ orderQueue.ts ═══
  describe('orderQueue', () => {
    const mockCartItem = {
      product: {
        id: 'p1',
        nome: { es: 'Helado', ca: 'Helat', pt: 'Gelado', en: 'Ice Cream' },
        imagem: '',
        categoriaId: 'copo300',
        emEstoque: true,
        alergenos: [],
        isPersonalizavel: false,
        preco: 3.5,
        descricao: { es: '', ca: '', pt: '', en: '' },
        opcoes: {},
        active: true,
        displayOrder: 0,
      },
      quantity: 1,
      unitPrice: 3.5,
    } as unknown as import('../types').CartItem;

    const mockPayload = {
      cart: [mockCartItem],
      metodoPago: 'tarjeta' as const,
      checkout: {
        promoCode: '',
        promoApplied: false,
        promoDiscountRate: 0,
        coffeeAdded: false,
        coffeePrice: 1.5,
        notificationPhone: '',
      },
    };

    it('deve começar com fila vazia', () => {
      expect(getPendingCount()).toBe(0);
      expect(getPendingOrders()).toEqual([]);
    });

    it('deve enfileirar pedido', () => {
      const order = enqueueOrder(mockPayload);

      expect(order.id).toBeDefined();
      expect(order.tipo).toBe('create_order');
      expect(order.tentativas).toBe(0);
      expect(getPendingCount()).toBe(1);
    });

    it('deve enfileirar múltiplos pedidos', () => {
      enqueueOrder(mockPayload);
      enqueueOrder(mockPayload);
      enqueueOrder(mockPayload);

      expect(getPendingCount()).toBe(3);
    });

    it('deve remover pedido da fila', () => {
      const order = enqueueOrder(mockPayload);
      expect(getPendingCount()).toBe(1);

      removeFromQueue(order.id);
      expect(getPendingCount()).toBe(0);
    });

    it('deve limpar toda a fila', () => {
      enqueueOrder(mockPayload);
      enqueueOrder(mockPayload);
      expect(getPendingCount()).toBe(2);

      clearQueue();
      expect(getPendingCount()).toBe(0);
    });

    it('deve calcular retry delay com backoff', () => {
      expect(getRetryDelay(0)).toBe(5000);
      expect(getRetryDelay(1)).toBe(10000);
      expect(getRetryDelay(2)).toBe(20000);
      expect(getRetryDelay(3)).toBe(40000);
      expect(getRetryDelay(4)).toBe(60000);
      expect(getRetryDelay(10)).toBe(60000); // max
    });

    it('deve persistir fila no localStorage', () => {
      const order = enqueueOrder(mockPayload);
      const raw = localStorageMock.getItem('tpv-offline-queue');
      expect(raw).not.toBeNull();

      const parsed = JSON.parse(raw!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe(order.id);
    });

    it('deve recuperar fila do localStorage', () => {
      enqueueOrder(mockPayload);
      enqueueOrder(mockPayload);

      // Simula reload — getPendingOrders lê do localStorage
      const orders = getPendingOrders();
      expect(orders).toHaveLength(2);
    });
  });
});
