/**
 * ═══ FASE 10 — Ingredient-level Inventory ═══
 * Ingredient Ops — Alertas, verificações e operações de estoque
 */

import type { Ingrediente, InventoryAlert, ProductRecipe } from '../types';

export function estaEmEstoqueBaixo(ingrediente: Ingrediente): boolean {
  return ingrediente.stock <= ingrediente.alertaStock && ingrediente.stock > 0;
}

export function estaEsgotado(ingrediente: Ingrediente): boolean {
  return ingrediente.stock <= 0 || !ingrediente.ativo;
}

export function calcularStatusIngrediente(ingrediente: Ingrediente): 'ok' | 'aviso' | 'critico' {
  if (estaEsgotado(ingrediente)) return 'critico';
  if (estaEmEstoqueBaixo(ingrediente)) return 'aviso';
  return 'ok';
}

/**
 * Gera alertas de inventário combinando ingredientes e sabores
 */
export function gerarAlertasInventory(
  ingredientes: Ingrediente[],
  sabores: { id: string; nome: { es: string }; stockBaldes: number; alertaStock: number; disponivel: boolean }[],
): InventoryAlert[] {
  const alerts: InventoryAlert[] = [];

  // Alertas de ingredientes
  for (const ing of ingredientes) {
    const status = calcularStatusIngrediente(ing);
    if (status !== 'ok') {
      alerts.push({
        tipo: 'ingrediente',
        id: ing.id,
        nome: ing.nome.es,
        stockAtual: ing.stock,
        alertaStock: ing.alertaStock,
        severidade: status === 'critico' ? 'critico' : 'aviso',
      });
    }
  }

  // Alertas de sabores (mantém compatibilidade com Fase 7)
  for (const sabor of sabores) {
    if (sabor.stockBaldes <= sabor.alertaStock && sabor.stockBaldes > 0) {
      alerts.push({
        tipo: 'sabor',
        id: sabor.id,
        nome: sabor.nome.es,
        stockAtual: sabor.stockBaldes,
        alertaStock: sabor.alertaStock,
        severidade: 'aviso',
      });
    } else if (sabor.stockBaldes <= 0) {
      alerts.push({
        tipo: 'sabor',
        id: sabor.id,
        nome: sabor.nome.es,
        stockAtual: 0,
        alertaStock: sabor.alertaStock,
        severidade: 'critico',
      });
    }
  }

  return alerts;
}

/**
 * Formata quantidade com unidade para exibição
 */
export function formatarQuantidade(quantidade: number, unidade: string): string {
  if (unidade === 'ml' && quantidade >= 1000) {
    return `${(quantidade / 1000).toFixed(1)} L`;
  }
  if (unidade === 'g' && quantidade >= 1000) {
    return `${(quantidade / 1000).toFixed(1)} kg`;
  }
  return `${Math.round(quantidade)} ${unidade}`;
}

/**
 * Calcula quantas unidades de um produto ainda podem ser feitas
 * com o estoque atual de ingredientes
 */
export function calcularCapacidadeProducao(
  productId: string,
  receitas: ProductRecipe[],
  ingredientes: Ingrediente[],
): number {
  const receita = receitas.find((r) => r.productId === productId);
  if (!receita) return Infinity; // Sem receita = sem limitação por ingrediente

  let minCapacidade = Infinity;

  for (const item of receita.ingredientes) {
    const ing = ingredientes.find((i) => i.id === item.ingredienteId);
    if (!ing || !ing.ativo) return 0;
    const capacidade = Math.floor(ing.stock / item.quantidade);
    minCapacidade = Math.min(minCapacidade, capacidade);
  }

  return minCapacidade;
}
