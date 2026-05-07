/**
 * ═══ FASE 10 — Ingredient-level Inventory ═══
 * Recipe Engine — Cálculo de consumo de ingredientes por produto
 */

import type { Product, CartItem, Ingrediente, ReceitaItem, ProductRecipe } from '../types';
import { receitas, saborExtras } from './ingredientData';

/**
 * Encontra a receita de um produto pelo ID
 */
export function getReceita(productId: string): ProductRecipe | undefined {
  return receitas.find((r) => r.productId === productId);
}

/**
 * Calcula o consumo total de ingredientes para um item do carrinho
 * Inclui ingredientes base da receita + extras por sabor selecionado
 */
export function calcularConsumo(item: CartItem): ReceitaItem[] {
  const receita = getReceita(item.product.id);
  if (!receita) return [];

  const consumo: Map<string, number> = new Map();

  // Ingredientes base da receita × quantidade
  for (const ri of receita.ingredientes) {
    const atual = consumo.get(ri.ingredienteId) || 0;
    consumo.set(ri.ingredienteId, atual + ri.quantidade * item.quantity);
  }

  // Ingredientes extras por sabor selecionado
  if (item.selections?.sabores) {
    for (const sabor of item.selections.sabores) {
      const extras = saborExtras[sabor.id] || saborExtras[sabor.flavorRef || ''];
      if (extras) {
        for (const extra of extras) {
          const atual = consumo.get(extra.ingredienteId) || 0;
          consumo.set(extra.ingredienteId, atual + extra.quantidade * item.quantity);
        }
      }
    }
  }

  return Array.from(consumo.entries()).map(([ingredienteId, quantidade]) => ({
    ingredienteId,
    quantidade,
  }));
}

/**
 * Calcula consumo total para um carrinho completo
 */
export function calcularConsumoCarrinho(carrinho: CartItem[]): ReceitaItem[] {
  const consumoTotal: Map<string, number> = new Map();

  for (const item of carrinho) {
    const itemConsumo = calcularConsumo(item);
    for (const { ingredienteId, quantidade } of itemConsumo) {
      const atual = consumoTotal.get(ingredienteId) || 0;
      consumoTotal.set(ingredienteId, atual + quantidade);
    }
  }

  return Array.from(consumoTotal.entries()).map(([ingredienteId, quantidade]) => ({
    ingredienteId,
    quantidade,
  }));
}

/**
 * Verifica se há ingredientes suficientes para produzir um item
 */
export function temIngredientesSuficientes(
  item: CartItem,
  ingredientes: Ingrediente[],
): boolean {
  const consumo = calcularConsumo(item);
  for (const { ingredienteId, quantidade } of consumo) {
    const ing = ingredientes.find((i) => i.id === ingredienteId);
    if (!ing || !ing.ativo) return false;
    if (ing.stock < quantidade) return false;
  }
  return true;
}

/**
 * Verifica se há ingredientes suficientes para todo o carrinho
 */
export function podeProduzirCarrinho(
  carrinho: CartItem[],
  ingredientes: Ingrediente[],
): boolean {
  const consumo = calcularConsumoCarrinho(carrinho);
  for (const { ingredienteId, quantidade } of consumo) {
    const ing = ingredientes.find((i) => i.id === ingredienteId);
    if (!ing || !ing.ativo) return false;
    if (ing.stock < quantidade) return false;
  }
  return true;
}

/**
 * Retorna lista de ingredientes faltantes para um item
 */
export function ingredientesFaltantes(
  item: CartItem,
  ingredientes: Ingrediente[],
): { ingredienteId: string; nome: string; necessario: number; disponivel: number }[] {
  const consumo = calcularConsumo(item);
  const faltantes: { ingredienteId: string; nome: string; necessario: number; disponivel: number }[] = [];

  for (const { ingredienteId, quantidade } of consumo) {
    const ing = ingredientes.find((i) => i.id === ingredienteId);
    if (!ing || !ing.ativo || ing.stock < quantidade) {
      faltantes.push({
        ingredienteId,
        nome: ing?.nome.es || ingredienteId,
        necessario: quantidade,
        disponivel: ing?.stock || 0,
      });
    }
  }

  return faltantes;
}

/**
 * Debita ingredientes do estoque e retorna o estoque atualizado
 */
export function debitarIngredientes(
  carrinho: CartItem[],
  ingredientes: Ingrediente[],
): Ingrediente[] {
  const consumo = calcularConsumoCarrinho(carrinho);

  return ingredientes.map((ing) => {
    const itemConsumo = consumo.find((c) => c.ingredienteId === ing.id);
    if (!itemConsumo) return ing;

    return {
      ...ing,
      stock: Math.max(0, Number((ing.stock - itemConsumo.quantidade).toFixed(3))),
    };
  });
}

/**
 * Encontra produtos que usam um determinado ingrediente
 */
export function produtosQueUsamIngrediente(
  ingredienteId: string,
  produtos: Product[],
): Product[] {
  return produtos.filter((p) => {
    const receita = getReceita(p.id);
    if (!receita) return false;
    return receita.ingredientes.some((ri) => ri.ingredienteId === ingredienteId);
  });
}
