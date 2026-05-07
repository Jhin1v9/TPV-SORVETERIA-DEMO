/**
 * ═══ FASE 12 — AI-Driven Ops ═══
 * Predictive Prep — Previsão de demanda baseada em histórico
 */

import type { Pedido, DemandForecast } from '../types';

const DIAS_HISTORICO = 14;
const HORAS_JANELA = 1; // janela de ±1 hora para média

/**
 * Extrai a hora (0-23) de um timestamp ISO
 */
function getHora(timestamp: string): number {
  return new Date(timestamp).getHours();
}

/**
 * Extrai o dia da semana (0=domingo, 6=sábado) de um timestamp ISO
 */
function getDiaSemana(timestamp: string): number {
  return new Date(timestamp).getDay();
}

/**
 * Filtra pedidos dos últimos N dias
 */
function filtrarPedidosRecentes(pedidos: Pedido[], dias: number): Pedido[] {
  const cutoff = Date.now() - dias * 24 * 60 * 60 * 1000;
  return pedidos.filter((p) => new Date(p.timestampCriacao).getTime() >= cutoff);
}

/**
 * Calcula média de pedidos por hora/dia da semana
 */
function calcularMediaPorHora(
  pedidos: Pedido[],
  horaAlvo: number,
  diaSemanaAlvo: number,
): { media: number; amostras: number } {
  const recentes = filtrarPedidosRecentes(pedidos, DIAS_HISTORICO);

  // Agrupa por hora e dia da semana
  const buckets: Record<string, number> = {};

  for (const pedido of recentes) {
    const hora = getHora(pedido.timestampCriacao);
    const dia = getDiaSemana(pedido.timestampCriacao);
    const key = `${hora}-${dia}`;
    buckets[key] = (buckets[key] || 0) + 1;
  }

  // Coleta amostras na janela de hora (±HORAS_JANELA) e mesmo dia da semana
  let total = 0;
  let count = 0;

  for (let h = horaAlvo - HORAS_JANELA; h <= horaAlvo + HORAS_JANELA; h++) {
    const horaNormalizada = ((h % 24) + 24) % 24;
    const key = `${horaNormalizada}-${diaSemanaAlvo}`;
    if (buckets[key]) {
      total += buckets[key];
      count++;
    }
  }

  // Também considera o mesmo horário em outros dias da semana (com peso menor)
  for (let d = 0; d < 7; d++) {
    if (d === diaSemanaAlvo) continue;
    const key = `${horaAlvo}-${d}`;
    if (buckets[key]) {
      total += buckets[key] * 0.3; // peso reduzido
      count += 0.3;
    }
  }

  return {
    media: count > 0 ? total / count : 0,
    amostras: count,
  };
}

// ═══ API Pública ═══

/**
 * Prever demanda nos próximos 30 minutos
 */
export function preverDemanda30min(pedidos: Pedido[]): DemandForecast {
  const agora = new Date();
  const horaAtual = agora.getHours();
  const diaSemana = agora.getDay();

  const { media, amostras } = calcularMediaPorHora(pedidos, horaAtual, diaSemana);

  // Ajusta para 30min (metade da média horária)
  const pedidosEsperados = media / 2;

  // Confiança baseada na quantidade de amostras
  const confianca = Math.min(1, amostras / 7);

  return {
    hora: horaAtual,
    diaSemana,
    pedidosEsperados: Math.round(pedidosEsperados * 10) / 10,
    confianca,
  };
}

/**
 * Prever demanda para as próximas N horas
 */
export function preverDemandaHoras(pedidos: Pedido[], horas: number): DemandForecast[] {
  const agora = new Date();
  const resultados: DemandForecast[] = [];

  for (let i = 0; i < horas; i++) {
    const horaFutura = new Date(agora.getTime() + i * 60 * 60 * 1000);
    const hora = horaFutura.getHours();
    const diaSemana = horaFutura.getDay();

    const { media, amostras } = calcularMediaPorHora(pedidos, hora, diaSemana);

    resultados.push({
      hora,
      diaSemana,
      pedidosEsperados: Math.round(media * 10) / 10,
      confianca: Math.min(1, amostras / 7),
    });
  }

  return resultados;
}

/**
 * Detecta se estamos em horário de pico
 */
export function horarioPicoDetectado(pedidos: Pedido[]): boolean {
  const previsao = preverDemanda30min(pedidos);
  return previsao.pedidosEsperados >= 5; // 5+ pedidos/30min = pico
}

/**
 * Sugere quais ingredientes preparar baseado na previsão
 */
export function preparoSugerido(
  pedidos: Pedido[],
  produtosPopulares: { id: string; nome: string; categoriaId: string }[],
): { produto: string; quantidadeSugerida: number; razao: string }[] {
  const previsao = preverDemanda30min(pedidos);
  const fator = Math.max(1, Math.ceil(previsao.pedidosEsperados));

  return produtosPopulares.slice(0, 5).map((p) => ({
    produto: p.nome,
    quantidadeSugerida: fator * 2,
    razao: `Demanda prevista: ${previsao.pedidosEsperados} pedidos/30min`,
  }));
}

/**
 * Calcula tendência de demanda (↑ ↓ →)
 */
export function calcularTendenciaDemanda(pedidos: Pedido[]): 'subindo' | 'estavel' | 'caindo' {
  const agora = Date.now();
  const ultimaHora = pedidos.filter((p) => agora - new Date(p.timestampCriacao).getTime() < 3600000).length;
  const horaAnterior = pedidos.filter((p) => {
    const t = new Date(p.timestampCriacao).getTime();
    return t >= agora - 7200000 && t < agora - 3600000;
  }).length;

  if (ultimaHora > horaAnterior * 1.3) return 'subindo';
  if (ultimaHora < horaAnterior * 0.7) return 'caindo';
  return 'estavel';
}
