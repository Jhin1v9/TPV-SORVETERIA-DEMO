/**
 * ═══ FASE 10 — Ingredient-level Inventory ═══
 * useInventory — Hook React para status de ingredientes
 */

import { useMemo } from 'react';
import type { Ingrediente, CartItem, InventoryAlert } from '../types';
import {
  calcularStatusIngrediente,
  gerarAlertasInventory,
  formatarQuantidade,
  calcularCapacidadeProducao,
} from './ingredientOps';
import {
  temIngredientesSuficientes,
  podeProduzirCarrinho,
  ingredientesFaltantes,
  calcularConsumoCarrinho,
} from './recipeEngine';
import { receitas } from './ingredientData';

export interface InventoryStatus {
  /** Lista de alertas ativos (ingredientes + sabores) */
  alertas: InventoryAlert[];
  /** Quantidade de alertas críticos */
  alertasCriticos: number;
  /** Quantidade de alertas de aviso */
  alertasAviso: number;
  /** Verifica se um produto específico pode ser produzido */
  podeProduzir: (item: CartItem) => boolean;
  /** Verifica se todo o carrinho pode ser produzido */
  podeProduzirCart: (carrinho: CartItem[]) => boolean;
  /** Lista de ingredientes faltantes para um item */
  faltantes: (item: CartItem) => { ingredienteId: string; nome: string; necessario: number; disponivel: number }[];
  /** Consumo total de ingredientes para um carrinho */
  consumo: (carrinho: CartItem[]) => { ingredienteId: string; quantidade: number }[];
  /** Capacidade de produção de um produto */
  capacidade: (productId: string) => number;
  /** Formata quantidade com unidade */
  formatar: (quantidade: number, unidade: string) => string;
  /** Status de um ingrediente específico */
  status: (ingredienteId: string) => 'ok' | 'aviso' | 'critico';
}

export function useInventory(
  ingredientes: Ingrediente[],
  sabores: { id: string; nome: { es: string }; stockBaldes: number; alertaStock: number; disponivel: boolean }[],
): InventoryStatus {
  const alertas = useMemo(
    () => gerarAlertasInventory(ingredientes, sabores),
    [ingredientes, sabores],
  );

  const alertasCriticos = useMemo(
    () => alertas.filter((a) => a.severidade === 'critico').length,
    [alertas],
  );

  const alertasAviso = useMemo(
    () => alertas.filter((a) => a.severidade === 'aviso').length,
    [alertas],
  );

  return {
    alertas,
    alertasCriticos,
    alertasAviso,
    podeProduzir: (item) => temIngredientesSuficientes(item, ingredientes),
    podeProduzirCart: (carrinho) => podeProduzirCarrinho(carrinho, ingredientes),
    faltantes: (item) => ingredientesFaltantes(item, ingredientes),
    consumo: (carrinho) => calcularConsumoCarrinho(carrinho),
    capacidade: (productId) => calcularCapacidadeProducao(productId, receitas, ingredientes),
    formatar: formatarQuantidade,
    status: (ingredienteId) => {
      const ing = ingredientes.find((i) => i.id === ingredienteId);
      if (!ing) return 'critico';
      return calcularStatusIngrediente(ing);
    },
  };
}
