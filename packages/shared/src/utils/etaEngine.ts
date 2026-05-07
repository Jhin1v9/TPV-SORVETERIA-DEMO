import type { Pedido, ItemPedido } from '../types';

/** Tempo base de preparo por tipo de item (em minutos) */
export const TEMPO_PREPARO_BASE: Record<string, number> = {
  copo300: 2,
  copo500: 2,
  cone: 2,
  pote1l: 1,
  sundae: 4,
  combo: 4,
  bebida: 1,
  cafe: 1,
  default: 3,
};

/** Tempo adicional por pedido à frente na fila (em minutos) */
export const TEMPO_FILA_POR_PEDIDO = 2;

/** Tempo mínimo de ETA (em minutos) */
export const ETA_MINIMO = 3;

/** Tempo máximo de ETA (em minutos) */
export const ETA_MAXIMO = 45;

/**
 * Calcula o tempo médio de preparo de um item baseado no tipo.
 */
export function tempoMedioPreparoItem(item: ItemPedido): number {
  const categoria = item.categoriaSku || 'default';
  // Busca match parcial nas chaves
  const key = Object.keys(TEMPO_PREPARO_BASE).find((k) => categoria.includes(k)) || 'default';
  return TEMPO_PREPARO_BASE[key] ?? TEMPO_PREPARO_BASE.default;
}

/**
 * Calcula o tempo total de preparo de todos os itens de um pedido.
 */
export function tempoMedioPreparo(itens: ItemPedido[]): number {
  if (itens.length === 0) return ETA_MINIMO;
  const total = itens.reduce((sum, item) => sum + tempoMedioPreparoItem(item) * item.quantidade, 0);
  return Math.max(ETA_MINIMO, total);
}

/**
 * Conta quantos pedidos estão à frente na fila (pendiente ou preparando).
 */
export function pedidosAFrente(pedidoId: string, fila: Pedido[]): number {
  const idx = fila.findIndex((p) => p.id === pedidoId);
  if (idx === -1) return 0;
  return idx;
}

/**
 * Calcula o ETA estimado de um pedido em minutos.
 */
export function calcularETA(pedido: Pedido, filaKDS: Pedido[]): number {
  const tempoItens = tempoMedioPreparo(pedido.itens);
  const aFrente = pedidosAFrente(pedido.id, filaKDS);
  const tempoFila = aFrente * TEMPO_FILA_POR_PEDIDO;

  const eta = tempoItens + tempoFila;
  return Math.min(ETA_MAXIMO, Math.max(ETA_MINIMO, Math.round(eta)));
}

/**
 * Formata minutos em string legível.
 */
export function formatarETA(minutos: number, locale: string): string {
  if (minutos < 1) return locale === 'pt' ? '< 1 min' : '< 1 min';
  if (minutos === 1) return locale === 'pt' ? '1 min' : '1 min';
  return `${minutos} min`;
}

/**
 * Calcula o progresso de um pedido baseado no status (0-1).
 */
export function progressoPedido(status: Pedido['status']): number {
  const map: Record<string, number> = {
    pendiente: 0.1,
    preparando: 0.5,
    listo: 0.9,
    entregado: 1,
    cancelado: 0,
  };
  return map[status] ?? 0;
}

/**
 * Calcula o tempo real de preparo de um pedido (em minutos).
 * Retorna null se o pedido ainda não está pronto.
 */
export function tempoRealPreparo(pedido: Pedido): number | null {
  if (!pedido.timestampListo || !pedido.timestampCriacao) return null;
  const criacao = new Date(pedido.timestampCriacao).getTime();
  const listo = new Date(pedido.timestampListo).getTime();
  return Math.round((listo - criacao) / 60000);
}

/**
 * Calcula a acurácia do ETA (% de erro).
 * Positivo = ETA subestimou (demorou mais).
 * Negativo = ETA superestimou (demorou menos).
 */
export function acuraciaETA(etaEstimado: number, tempoReal: number): number {
  if (tempoReal === 0) return 0;
  return Math.round(((etaEstimado - tempoReal) / tempoReal) * 100);
}
