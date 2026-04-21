import { ML_POR_BALDE, RENDIMENTO_PORCOES, IVA_RATE } from '../types';
import type { Categoria, Sabor, Topping } from '../types';

export function calcularPorcoes(baldes: number, tipoId: string): number {
  const mlPorcao = RENDIMENTO_PORCOES[tipoId] || 500;
  return Math.floor((baldes * ML_POR_BALDE) / mlPorcao);
}

export function calcularPorcoesAll(baldes: number): Record<string, number> {
  return {
    copo300: Math.floor((baldes * ML_POR_BALDE) / RENDIMENTO_PORCOES.copo300),
    copo500: Math.floor((baldes * ML_POR_BALDE) / RENDIMENTO_PORCOES.copo500),
    cone: Math.floor((baldes * ML_POR_BALDE) / RENDIMENTO_PORCOES.cone),
    pote1l: Math.floor((baldes * ML_POR_BALDE) / RENDIMENTO_PORCOES.pote1l),
  };
}

export function calcularPrecoItem(categoria: Categoria, sabores: Sabor[], toppings: Topping[]): number {
  const extrasSabores = sabores.reduce((sum, sabor) => sum + sabor.precoExtra, 0);
  const extrasToppings = toppings.reduce((sum, topping) => sum + topping.preco, 0);
  return categoria.precoBase + extrasSabores + extrasToppings;
}

export function calculateCartTotals(carrinho: { categoria: Categoria; sabores: Sabor[]; toppings: Topping[] }[]): { subtotal: number; iva: number; total: number } {
  const subtotal = carrinho.reduce((sum, item) => {
    return sum + calcularPrecoItem(item.categoria, item.sabores, item.toppings);
  }, 0);
  const iva = subtotal * IVA_RATE;
  return { subtotal, iva, total: subtotal + iva };
}

export const calcularTotalCarrinho = calculateCartTotals;

export function formatCurrency(value: number): string {
  return `EUR ${value.toFixed(2)}`;
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function generateOrderNumber(sequencial: number): string {
  return `#${sequencial.toString().padStart(3, '0')}`;
}

export function generateVeriFactuQR(pedidoId: string, total: number): string {
  const data = {
    id: pedidoId,
    nif: 'B12345678',
    fecha: new Date().toISOString().split('T')[0],
    importe: total.toFixed(2),
    establecimiento: 'Heladeria Tropicale',
  };
  return JSON.stringify(data);
}

export function getEstimadedTime(pedidosPendentes: number): { min: number; max: number } {
  if (pedidosPendentes > 5) return { min: 5, max: 8 };
  if (pedidosPendentes > 3) return { min: 4, max: 6 };
  if (pedidosPendentes > 1) return { min: 3, max: 5 };
  return { min: 2, max: 4 };
}
