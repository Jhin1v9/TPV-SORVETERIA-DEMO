import type { Sabor, Product } from '../types';

/**
 * Verifica se um sabor deve ser desativado automaticamente (stock <= 0).
 */
export function deveDesativarAuto(sabor: Sabor): boolean {
  return sabor.stockBaldes <= 0;
}

/**
 * Verifica se um sabor deve ser reativado automaticamente (stock > 0 e estava desativado).
 */
export function deveReativarAuto(sabor: Sabor): boolean {
  return sabor.stockBaldes > 0 && !sabor.disponivel;
}

/**
 * Verifica se um sabor está em stock baixo (<= alertaStock).
 */
export function estaEmStockBaixo(sabor: Sabor): boolean {
  return sabor.stockBaldes <= sabor.alertaStock && sabor.stockBaldes > 0;
}

/**
 * Encontra produtos que referenciam um sabor específico.
 * Usa heurística: produtos personalizáveis com opções de sabores.
 */
export function produtosAfetadosPorSabor(saborId: string, produtos: Product[]): Product[] {
  return produtos.filter((p) => {
    if (!p.isPersonalizavel) return false;
    return p.opcoes.sabores?.some((s) => s.flavorRef === saborId);
  });
}

/**
 * Toca um som de alerta curto usando Web Audio API.
 */
export function tocarAlertaSonoro(): void {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880; // A5
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Fallback silencioso se Web Audio não estiver disponível
  }
}

/**
 * Toca um som de notificação suave.
 */
export function tocarNotificacaoSuave(): void {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 523.25; // C5
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Fallback silencioso
  }
}
