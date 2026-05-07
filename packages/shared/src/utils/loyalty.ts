import type { CustomerTier, LoyaltyProfile, LoyaltyTransaction } from '../types';

/** Pontos ganhos por €1 gasto */
export const PONTOS_POR_EURO = 10;

/** Taxa de resgate: 100 pontos = €1.00 */
export const RESGATE_TAXA = 100; // pontos por €1

/** Máximo de desconto via pontos (% do subtotal) */
export const RESGATE_MAX_PERCENT = 0.5; // 50%

/** Thresholds de tier */
export const TIER_THRESHOLDS: Record<CustomerTier, number> = {
  bronze: 0,
  silver: 500,
  gold: 1500,
};

/** Desconto automático por tier */
export const TIER_DISCOUNT: Record<CustomerTier, number> = {
  bronze: 0,
  silver: 0.05, // 5%
  gold: 0.10,   // 10%
};

/**
 * Calcula pontos ganhos por um valor de pedido.
 * 10 pontos por cada €1 (arredondado para baixo).
 */
export function calcularPontosGanhos(valorPedido: number): number {
  return Math.floor(valorPedido * PONTOS_POR_EURO);
}

/**
 * Calcula o tier baseado nos pontos lifetime.
 */
export function calcularTier(pontosLifetime: number): CustomerTier {
  if (pontosLifetime >= TIER_THRESHOLDS.gold) return 'gold';
  if (pontosLifetime >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

/**
 * Calcula o valor em € que um número de pontos representa.
 */
export function pontosParaEuros(pontos: number): number {
  return Math.floor(pontos / RESGATE_TAXA);
}

/**
 * Calcula o máximo de pontos que podem ser resgatados para um subtotal.
 */
export function maximoPontosResgataveis(subtotal: number): number {
  const maxDesconto = subtotal * RESGATE_MAX_PERCENT;
  const maxPontos = maxDesconto * RESGATE_TAXA;
  return Math.floor(maxPontos / RESGATE_TAXA) * RESGATE_TAXA; // arredonda para múltiplo de 100
}

/**
 * Cria uma transação de ganho de pontos.
 */
export function criarTransacaoGanho(
  pontos: number,
  pedidoId: string,
  descricao: string
): LoyaltyTransaction {
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    tipo: 'ganho',
    pontos,
    pedidoId,
    descricao,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Cria uma transação de resgate de pontos.
 */
export function criarTransacaoResgate(
  pontos: number,
  descricao: string
): LoyaltyTransaction {
  return {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    tipo: 'resgate',
    pontos: -pontos, // negativo porque sai do saldo
    descricao,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Perfil de loyalty inicial (novo usuário).
 */
export function criarLoyaltyProfileInicial(): LoyaltyProfile {
  return {
    pontosDisponiveis: 0,
    pontosLifetime: 0,
    tier: 'bronze',
    historico: [],
  };
}

/**
 * Aplica acúmulo de pontos a um perfil existente.
 */
export function acumularPontos(
  profile: LoyaltyProfile,
  valorPedido: number,
  pedidoId: string,
  descricao: string
): LoyaltyProfile {
  const pontos = calcularPontosGanhos(valorPedido);
  if (pontos <= 0) return profile;

  const transacao = criarTransacaoGanho(pontos, pedidoId, descricao);
  const novoLifetime = profile.pontosLifetime + pontos;

  return {
    pontosDisponiveis: profile.pontosDisponiveis + pontos,
    pontosLifetime: novoLifetime,
    tier: calcularTier(novoLifetime),
    historico: [transacao, ...profile.historico].slice(0, 50), // mantém últimas 50
  };
}

/**
 * Resgata pontos de um perfil.
 * Retorna o valor em € do desconto, ou 0 se não for possível.
 */
export function resgatarPontos(
  profile: LoyaltyProfile,
  pontos: number
): { novoProfile: LoyaltyProfile; descontoEuros: number } {
  if (pontos <= 0 || pontos > profile.pontosDisponiveis) {
    return { novoProfile: profile, descontoEuros: 0 };
  }

  const descontoEuros = pontosParaEuros(pontos);
  const transacao = criarTransacaoResgate(pontos, `Resgate de ${pontos} pontos`);

  return {
    novoProfile: {
      ...profile,
      pontosDisponiveis: profile.pontosDisponiveis - pontos,
      historico: [transacao, ...profile.historico].slice(0, 50),
    },
    descontoEuros,
  };
}

/**
 * Label localizado para o tier.
 */
export function nomeTier(tier: CustomerTier, locale: string): string {
  const labels: Record<string, Record<CustomerTier, string>> = {
    es: { bronze: 'Bronce', silver: 'Plata', gold: 'Oro' },
    ca: { bronze: 'Bronze', silver: 'Plata', gold: 'Or' },
    pt: { bronze: 'Bronze', silver: 'Prata', gold: 'Ouro' },
    en: { bronze: 'Bronze', silver: 'Silver', gold: 'Gold' },
  };
  return labels[locale]?.[tier] || labels.en[tier];
}

/**
 * Cor do tier para UI.
 */
export function corTier(tier: CustomerTier): string {
  return {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
  }[tier];
}

/**
 * Progresso para o próximo tier (0-1).
 */
export function progressoProximoTier(pontosLifetime: number, tier: CustomerTier): number {
  if (tier === 'gold') return 1;
  const nextThreshold = tier === 'bronze' ? TIER_THRESHOLDS.silver : TIER_THRESHOLDS.gold;
  const prevThreshold = TIER_THRESHOLDS[tier];
  return Math.min(1, (pontosLifetime - prevThreshold) / (nextThreshold - prevThreshold));
}
