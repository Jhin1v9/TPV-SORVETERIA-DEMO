/**
 * ═══ FASE 14 — Dynamic Pricing Hook ═══
 * Calcula preço dinâmico baseado em demanda atual
 */

import { useMemo } from 'react';
import { calcularSurgeMultiplier, aplicarPrecoDinamico, getSurgeLabel } from '../ai/dynamicPricing';
import type { Pedido } from '../types';

interface DynamicPriceResult {
  precoOriginal: number;
  precoFinal: number;
  multiplier: number;
  label: string;
  cor: string;
  emoji: string;
  isDiscount: boolean;
  isSurge: boolean;
}

export function useDynamicPrice(
  precoBase: number,
  pedidos: Pedido[],
  enabled: boolean = true,
  capacidadeMaxima: number = 20,
): DynamicPriceResult {
  return useMemo(() => {
    if (!enabled || !precoBase) {
      return {
        precoOriginal: precoBase,
        precoFinal: precoBase,
        multiplier: 1.0,
        label: 'Normal',
        cor: '#9E9E9E',
        emoji: '',
        isDiscount: false,
        isSurge: false,
      };
    }

    const pedidosUltimaHora = pedidos.filter((p) => {
      const t = new Date(p.timestampCriacao).getTime();
      return Date.now() - t < 3600000;
    }).length;

    const multiplier = calcularSurgeMultiplier(pedidosUltimaHora, 5, capacidadeMaxima);
    const precoFinal = aplicarPrecoDinamico(precoBase, multiplier);
    const { label, cor, emoji } = getSurgeLabel(multiplier);

    return {
      precoOriginal: precoBase,
      precoFinal,
      multiplier,
      label,
      cor,
      emoji,
      isDiscount: multiplier < 1.0,
      isSurge: multiplier > 1.0,
    };
  }, [precoBase, pedidos, enabled, capacidadeMaxima]);
}
