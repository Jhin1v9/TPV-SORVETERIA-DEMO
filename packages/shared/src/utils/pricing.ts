import type { CartItem } from '../types';

export const DEMO_PROMO_CODE = 'SABADELL20';
export const DEMO_PROMO_RATE = 0.2;
export const DEMO_COFFEE_PRICE = 1.5;

export interface CheckoutState {
  promoCode: string;
  promoApplied: boolean;
  promoDiscountRate: number;
  coffeeAdded: boolean;
  coffeePrice: number;
  notificationPhone: string;
  origem?: 'tpv' | 'kiosk' | 'pwa';
  nomeUsuario?: string;
}

export interface CheckoutSummary {
  itemsSubtotal: number;
  extras: number;
  descuento: number;
  subtotal: number;
  iva: number;
  total: number;
}

export const defaultCheckoutState: CheckoutState = {
  promoCode: '',
  promoApplied: false,
  promoDiscountRate: 0,
  coffeeAdded: false,
  coffeePrice: DEMO_COFFEE_PRICE,
  notificationPhone: '',
};

export function calculateCheckoutSummary(carrinho: CartItem[], checkout: CheckoutState): CheckoutSummary {
  const itemsSubtotal = carrinho.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const extras = checkout.coffeeAdded ? checkout.coffeePrice : 0;
  const descuento = checkout.promoApplied ? Number((itemsSubtotal * checkout.promoDiscountRate).toFixed(2)) : 0;
  const subtotal = Number((itemsSubtotal + extras - descuento).toFixed(2));
  const iva = Number((subtotal * 0.1).toFixed(2));
  const total = Number((subtotal + iva).toFixed(2));

  return {
    itemsSubtotal: Number(itemsSubtotal.toFixed(2)),
    extras: Number(extras.toFixed(2)),
    descuento,
    subtotal,
    iva,
    total,
  };
}
