/**
 * ═══ FASE 12 — AI-Driven Ops ═══
 * AI Upselling — Recomendações baseadas em similaridade de padrões
 */

import type { CartItem, Pedido, Product, AIRecommendation } from '../types';

/**
 * Extrai conjunto de IDs de produtos de um pedido
 */
function extrairProdutoIds(pedido: Pedido): Set<string> {
  const ids = new Set<string>();
  for (const item of pedido.itens) {
    if (item.productId) ids.add(item.productId);
    if (item.productSnapshot?.id) {
      ids.add(item.productSnapshot.id);
    }
  }
  return ids;
}

/**
 * Extrai conjunto de IDs de produtos do carrinho
 */
function extrairCartIds(carrinho: CartItem[]): Set<string> {
  const ids = new Set<string>();
  for (const item of carrinho) {
    ids.add(item.product.id);
  }
  return ids;
}

/**
 * Calcula similaridade de Jaccard entre dois conjuntos
 * J(A,B) = |A ∩ B| / |A ∪ B|
 */
export function scoreDeSimilaridade(setA: Set<string>, setB: Set<string>): number {
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Encontra pedidos similares ao carrinho atual
 */
function encontrarPedidosSimilares(
  carrinho: CartItem[],
  historicoPedidos: Pedido[],
  limite: number = 10,
): { pedido: Pedido; score: number }[] {
  const cartIds = extrairCartIds(carrinho);

  const scored = historicoPedidos.map((pedido) => ({
    pedido,
    score: scoreDeSimilaridade(cartIds, extrairProdutoIds(pedido)),
  }));

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limite);
}

/**
 * Recomenda produtos baseado em pedidos similares
 */
export function recomendarParaCarrinho(
  carrinho: CartItem[],
  historicoPedidos: Pedido[],
  todosProdutos: Product[],
  limite: number = 3,
): AIRecommendation[] {
  if (carrinho.length === 0 || historicoPedidos.length === 0) return [];

  const cartIds = extrairCartIds(carrinho);
  const similares = encontrarPedidosSimilares(carrinho, historicoPedidos, 10);

  // Conta frequência de produtos nos pedidos similares que NÃO estão no carrinho
  const frequencia: Record<string, { count: number; scoreTotal: number; nome: string }> = {};

  for (const { pedido, score } of similares) {
    const pedidoIds = extrairProdutoIds(pedido);
    for (const id of pedidoIds) {
      if (cartIds.has(id)) continue; // já no carrinho

      const produto = todosProdutos.find((p) => p.id === id);
      if (!produto) continue;

      if (!frequencia[id]) {
        frequencia[id] = { count: 0, scoreTotal: 0, nome: produto.nome.es };
      }
      frequencia[id].count++;
      frequencia[id].scoreTotal += score;
    }
  }

  // Converte para recomendações ordenadas por score
  const recomendacoes = Object.entries(frequencia)
    .map(([produtoId, data]) => ({
      tipo: 'upsell' as const,
      produtoId,
      produtoNome: data.nome,
      score: Math.min(1, data.scoreTotal / Math.max(1, similares.length)),
      razao: `Clientes similares también compraron esto`,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limite);

  return recomendacoes;
}

/**
 * Recomenda produtos baseado no histórico do cliente
 */
export function recomendarParaCliente(
  customerId: string,
  todosPedidos: Pedido[],
  todosProdutos: Product[],
  limite: number = 3,
): AIRecommendation[] {
  const pedidosCliente = todosPedidos.filter((p) => p.customerId === customerId);
  if (pedidosCliente.length === 0) return [];

  // Produtos mais comprados pelo cliente
  const frequencia: Record<string, { count: number; nome: string }> = {};
  for (const pedido of pedidosCliente) {
    for (const item of pedido.itens) {
      const id = item.productId || item.productSnapshot?.id;
      if (!id) continue;
      const produto = todosProdutos.find((p) => p.id === id);
      if (!produto) continue;
      if (!frequencia[id]) {
        frequencia[id] = { count: 0, nome: produto.nome.es };
      }
      frequencia[id].count++;
    }
  }

  // Produtos favoritos
  const favoritos = Object.entries(frequencia)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 3)
    .map(([id, _data]) => id);

  // Encontra pedidos similares (clientes que compraram os mesmos favoritos)
  const favoritosSet = new Set(favoritos);
  const pedidosSimilares = todosPedidos
    .filter((p) => p.customerId !== customerId)
    .map((p) => ({
      pedido: p,
      score: scoreDeSimilaridade(favoritosSet, extrairProdutoIds(p)),
    }))
    .filter((s) => s.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Produtos que esses clientes compraram mas o cliente atual não
  const jaComprados = new Set(Object.keys(frequencia));
  const novasFrequencias: Record<string, { count: number; scoreTotal: number; nome: string }> = {};

  for (const { pedido, score } of pedidosSimilares) {
    for (const id of extrairProdutoIds(pedido)) {
      if (jaComprados.has(id)) continue;
      const produto = todosProdutos.find((p) => p.id === id);
      if (!produto) continue;
      if (!novasFrequencias[id]) {
        novasFrequencias[id] = { count: 0, scoreTotal: 0, nome: produto.nome.es };
      }
      novasFrequencias[id].count++;
      novasFrequencias[id].scoreTotal += score;
    }
  }

  return Object.entries(novasFrequencias)
    .map(([produtoId, data]) => ({
      tipo: 'upsell' as const,
      produtoId,
      produtoNome: data.nome,
      score: Math.min(1, data.scoreTotal / Math.max(1, pedidosSimilares.length)),
      razao: `Basado en tus favoritos: ${favoritos.map((f) => frequencia[f]?.nome).join(', ')}`,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limite);
}
