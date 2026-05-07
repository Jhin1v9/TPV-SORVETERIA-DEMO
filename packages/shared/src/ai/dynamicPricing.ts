/**
 * ═══ FASE 12 — AI-Driven Ops ═══
 * Dynamic Pricing — Preços ajustados baseado em demanda
 */

import type { DynamicPriceConfig } from '../types';

export const DEFAULT_CONFIG: DynamicPriceConfig = {
  ativo: true,
  multiplicadorMin: 0.85,
  multiplicadorMax: 1.30,
  thresholdBaixaDemanda: 0.5,
  thresholdAltaDemanda: 0.8,
};

/**
 * Calcula a capacidade atual baseada em pedidos recentes
 */
function calcularUtilizacaoCapacidade(
  pedidosUltimaHora: number,
  capacidadeMaxima: number = 20,
): number {
  return Math.min(1, pedidosUltimaHora / capacidadeMaxima);
}

/**
 * Calcula o multiplicador de surge pricing
 */
export function calcularSurgeMultiplier(
  pedidosUltimaHora: number,
  tempoMedioPreparoMin: number = 5,
  capacidadeMaxima: number = 20,
  config: DynamicPriceConfig = DEFAULT_CONFIG,
): number {
  if (!config.ativo) return 1.0;

  const utilizacao = calcularUtilizacaoCapacidade(pedidosUltimaHora, capacidadeMaxima);

  // Fator de pressão: mais pedidos + tempo de preparo maior = mais surge
  const fatorPressao = Math.min(1, (pedidosUltimaHora * tempoMedioPreparoMin) / (capacidadeMaxima * 3));

  let multiplier: number;

  if (utilizacao < config.thresholdBaixaDemanda) {
    // Baixa demanda: desconto progressivo
    const progresso = 1 - utilizacao / config.thresholdBaixaDemanda;
    multiplier = 1.0 - progresso * (1 - config.multiplicadorMin);
  } else if (utilizacao < config.thresholdAltaDemanda) {
    // Demanda normal
    multiplier = 1.0;
  } else {
    // Alta demanda: surge progressivo
    const progresso = (utilizacao - config.thresholdAltaDemanda) / (1 - config.thresholdAltaDemanda);
    multiplier = 1.0 + progresso * (config.multiplicadorMax - 1) * (0.5 + fatorPressao * 0.5);
  }

  return Math.max(config.multiplicadorMin, Math.min(config.multiplicadorMax, multiplier));
}

/**
 * Aplica preço dinâmico a um preço base
 */
export function aplicarPrecoDinamico(
  precoBase: number,
  multiplier: number,
): number {
  return Math.round(precoBase * multiplier * 100) / 100;
}

/**
 * Determina se deve ativar surge pricing
 */
export function deveAtivarSurge(
  pedidosUltimaHora: number,
  tempoMedioPreparoMin: number = 5,
  capacidadeMaxima: number = 20,
): boolean {
  const multiplier = calcularSurgeMultiplier(pedidosUltimaHora, tempoMedioPreparoMin, capacidadeMaxima);
  return multiplier > 1.0;
}

/**
 * Retorna label e cor para o multiplicador
 */
export function getSurgeLabel(multiplier: number): { label: string; cor: string; emoji: string } {
  if (multiplier < 0.95) return { label: 'Oferta', cor: '#4CAF50', emoji: '💰' };
  if (multiplier < 1.05) return { label: 'Normal', cor: '#9E9E9E', emoji: '' };
  if (multiplier < 1.20) return { label: 'Popular', cor: '#FF9800', emoji: '🔥' };
  return { label: 'Alta demanda', cor: '#F44336', emoji: '⚡' };
}

/**
 * Calcula preço dinâmico para múltiplos produtos
 */
export function calcularPrecosDinamicos(
  produtos: { id: string; preco: number }[],
  pedidosUltimaHora: number,
  capacidadeMaxima: number = 20,
): { id: string; precoOriginal: number; precoFinal: number; multiplier: number }[] {
  const multiplier = calcularSurgeMultiplier(pedidosUltimaHora, 5, capacidadeMaxima);

  return produtos.map((p) => ({
    id: p.id,
    precoOriginal: p.preco,
    precoFinal: aplicarPrecoDinamico(p.preco, multiplier),
    multiplier,
  }));
}
