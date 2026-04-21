import { describe, it, expect } from 'vitest';
import {
  DEMO_PROMO_CODE,
  DEMO_PROMO_RATE,
  DEMO_COFFEE_PRICE,
  defaultCheckoutState,
  calculateCheckoutSummary,
  type CheckoutState,
} from './pricing';
import type { CartItem } from '../types';

function mockItem(unitPrice: number): CartItem {
  return {
    product: {
      id: 'test',
      nome: { ca: 'Test', es: 'Test', pt: 'Teste', en: 'Test' },
      imagem: '/assets/demo/categoria-copo300.jpg',
      categoriaId: 'copas',
      emEstoque: true,
      alergenos: [],
      isPersonalizavel: false,
      opcoes: {},
      active: true,
      displayOrder: 0,
    },
    quantity: 1,
    unitPrice,
  };
}

// ─── Constantes ──────────────────────────────────────────────────

describe('pricing constants', () => {
  it('promo code correto', () => {
    expect(DEMO_PROMO_CODE).toBe('SABADELL20');
  });

  it('promo rate é 20%', () => {
    expect(DEMO_PROMO_RATE).toBeCloseTo(0.2, 2);
  });

  it('coffee price é 1.50', () => {
    expect(DEMO_COFFEE_PRICE).toBeCloseTo(1.5, 2);
  });

  it('default state inicializa tudo zerado', () => {
    expect(defaultCheckoutState.promoApplied).toBe(false);
    expect(defaultCheckoutState.coffeeAdded).toBe(false);
    expect(defaultCheckoutState.promoDiscountRate).toBe(0);
    expect(defaultCheckoutState.notificationPhone).toBe('');
  });
});

// ─── calculateCheckoutSummary ────────────────────────────────────

describe('calculateCheckoutSummary', () => {
  it('carrinho vazio → tudo zero', () => {
    const result = calculateCheckoutSummary([], defaultCheckoutState);
    expect(result.itemsSubtotal).toBe(0);
    expect(result.extras).toBe(0);
    expect(result.descuento).toBe(0);
    expect(result.subtotal).toBe(0);
    expect(result.iva).toBe(0);
    expect(result.total).toBe(0);
  });

  it('sem promo, sem café → soma limpa + IVA 10%', () => {
    const carrinho = [mockItem(10)];
    const result = calculateCheckoutSummary(carrinho, defaultCheckoutState);
    expect(result.itemsSubtotal).toBe(10);
    expect(result.extras).toBe(0);
    expect(result.descuento).toBe(0);
    expect(result.subtotal).toBe(10);
    expect(result.iva).toBe(1);
    expect(result.total).toBe(11);
  });

  it('com promo 20% → desconto aplicado corretamente', () => {
    const carrinho = [mockItem(10)];
    const checkout: CheckoutState = {
      ...defaultCheckoutState,
      promoApplied: true,
      promoDiscountRate: 0.2,
    };
    const result = calculateCheckoutSummary(carrinho, checkout);
    expect(result.itemsSubtotal).toBeCloseTo(10, 2);
    expect(result.descuento).toBeCloseTo(2, 2);
    expect(result.subtotal).toBeCloseTo(8, 2);
    expect(result.iva).toBeCloseTo(0.8, 2);
    expect(result.total).toBeCloseTo(8.8, 2);
  });

  it('com café → extras adicionados', () => {
    const carrinho = [mockItem(10)];
    const checkout: CheckoutState = {
      ...defaultCheckoutState,
      coffeeAdded: true,
      coffeePrice: 1.5,
    };
    const result = calculateCheckoutSummary(carrinho, checkout);
    expect(result.itemsSubtotal).toBeCloseTo(10, 2);
    expect(result.extras).toBeCloseTo(1.5, 2);
    expect(result.subtotal).toBeCloseTo(11.5, 2);
    expect(result.iva).toBeCloseTo(1.15, 2);
    expect(result.total).toBeCloseTo(12.65, 2);
  });

  it('promo + café → desconto em itens, café como extra', () => {
    const carrinho = [mockItem(10)];
    const checkout: CheckoutState = {
      ...defaultCheckoutState,
      promoApplied: true,
      promoDiscountRate: 0.2,
      coffeeAdded: true,
      coffeePrice: 1.5,
    };
    const result = calculateCheckoutSummary(carrinho, checkout);
    expect(result.itemsSubtotal).toBeCloseTo(10, 2);
    expect(result.descuento).toBeCloseTo(2, 2);
    expect(result.extras).toBeCloseTo(1.5, 2);
    expect(result.subtotal).toBeCloseTo(9.5, 2);
    expect(result.iva).toBeCloseTo(0.95, 2);
    expect(result.total).toBeCloseTo(10.45, 2);
  });

  it('arredonda para 2 decimais', () => {
    const carrinho = [mockItem(3.33)];
    const result = calculateCheckoutSummary(carrinho, defaultCheckoutState);
    expect(result.itemsSubtotal).toBeCloseTo(3.33, 2);
    expect(result.iva).toBeCloseTo(0.33, 2);
    expect(result.total).toBeCloseTo(3.66, 2);
  });

  it('múltiplos itens somam corretamente', () => {
    const carrinho = [mockItem(3.5), mockItem(4.8)];
    const result = calculateCheckoutSummary(carrinho, defaultCheckoutState);
    expect(result.itemsSubtotal).toBeCloseTo(8.3, 2);
    expect(result.iva).toBeCloseTo(0.83, 2);
    expect(result.total).toBeCloseTo(9.13, 2);
  });
});
