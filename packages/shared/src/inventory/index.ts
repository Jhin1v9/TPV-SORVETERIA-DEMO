/**
 * ═══ FASE 10 — Ingredient-level Inventory ═══
 * Barrel export
 */

export type { InventoryStatus } from './useInventory';

export {
  ingredientes,
  receitas,
  saborExtras,
} from './ingredientData';

export {
  getReceita,
  calcularConsumo,
  calcularConsumoCarrinho,
  temIngredientesSuficientes,
  podeProduzirCarrinho,
  ingredientesFaltantes,
  debitarIngredientes,
  produtosQueUsamIngrediente,
} from './recipeEngine';

export {
  estaEmEstoqueBaixo,
  estaEsgotado,
  calcularStatusIngrediente,
  gerarAlertasInventory,
  formatarQuantidade,
  calcularCapacidadeProducao,
} from './ingredientOps';

export { useInventory } from './useInventory';
