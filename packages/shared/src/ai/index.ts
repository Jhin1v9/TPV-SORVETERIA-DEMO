/**
 * ═══ FASE 12 — AI-Driven Ops ═══
 * Barrel export
 */

export {
  preverDemanda30min,
  preverDemandaHoras,
  horarioPicoDetectado,
  preparoSugerido,
  calcularTendenciaDemanda,
} from './predictivePrep';

export {
  DEFAULT_CONFIG,
  calcularSurgeMultiplier,
  aplicarPrecoDinamico,
  deveAtivarSurge,
  getSurgeLabel,
  calcularPrecosDinamicos,
} from './dynamicPricing';

export {
  scoreDeSimilaridade,
  recomendarParaCarrinho,
  recomendarParaCliente,
} from './aiUpselling';

export {
  identificarItensLentos,
  sugerirCombo,
  sugerirPromocao,
  calcularPopularidade,
} from './menuOptimizer';
