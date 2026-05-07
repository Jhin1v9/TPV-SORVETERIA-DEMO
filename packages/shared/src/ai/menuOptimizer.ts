/**
 * ═══ FASE 12 — AI-Driven Ops ═══
 * Menu Optimizer — Sugestões de promoções baseadas em dados de vendas
 */

import type { Product, Pedido, AIRecommendation } from '../types';

/**
 * Identifica produtos com baixa rotação
 */
export function identificarItensLentos(
  produtos: Product[],
  pedidos: Pedido[],
  dias: number = 30,
  threshold: number = 0.5,
): { produto: Product; vendas: number; mediaEsperada: number }[] {
  const cutoff = Date.now() - dias * 24 * 60 * 60 * 1000;
  const pedidosRecentes = pedidos.filter((p) => new Date(p.timestampCriacao).getTime() >= cutoff);

  // Conta vendas por produto
  const vendas: Record<string, number> = {};
  for (const pedido of pedidosRecentes) {
    for (const item of pedido.itens) {
      const id = item.productId || item.productSnapshot?.id;
      if (id) {
        vendas[id] = (vendas[id] || 0) + item.quantidade;
      }
    }
  }

  // Média de vendas por produto ativo
  const produtosAtivos = produtos.filter((p) => p.active && p.emEstoque);
  const totalVendas = Object.values(vendas).reduce((a, b) => a + b, 0);
  const mediaEsperada = totalVendas / Math.max(1, produtosAtivos.length);

  return produtosAtivos
    .map((produto) => ({
      produto,
      vendas: vendas[produto.id] || 0,
      mediaEsperada,
    }))
    .filter((p) => p.vendas < mediaEsperada * threshold)
    .sort((a, b) => a.vendas - b.vendas);
}

/**
 * Market Basket Analysis simplificada — encontra pares frequentes
 */
export function sugerirCombo(
  _produtos: Product[],
  pedidos: Pedido[],
  minSupport: number = 0.05,
): { produtoA: string; produtoB: string; frequencia: number; confianca: number }[] {
  // Extrai cestas (conjuntos de produtos por pedido)
  const cestas: Set<string>[] = [];
  for (const pedido of pedidos) {
    const cesta = new Set<string>();
    for (const item of pedido.itens) {
      const id = item.productId || item.productSnapshot?.id;
      if (id) cesta.add(id);
    }
    if (cesta.size >= 2) cestas.push(cesta);
  }

  if (cestas.length === 0) return [];

  // Conta pares
  const pares: Record<string, { count: number; produtoA: string; produtoB: string }> = {};
  const produtoCount: Record<string, number> = {};

  for (const cesta of cestas) {
    const items = Array.from(cesta);
    for (const id of items) {
      produtoCount[id] = (produtoCount[id] || 0) + 1;
    }
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const key = [items[i], items[j]].sort().join('|');
        if (!pares[key]) {
          pares[key] = { count: 0, produtoA: items[i], produtoB: items[j] };
        }
        pares[key].count++;
      }
    }
  }

  // Filtra por suporte mínimo e calcula confiança
  return Object.values(pares)
    .filter((p) => p.count / cestas.length >= minSupport)
    .map((p) => ({
      produtoA: p.produtoA,
      produtoB: p.produtoB,
      frequencia: p.count,
      confianca: p.count / Math.max(1, produtoCount[p.produtoA] || 1),
    }))
    .sort((a, b) => b.confianca - a.confianca)
    .slice(0, 10);
}

/**
 * Sugere promoções para itens lentos
 */
export function sugerirPromocao(
  produtos: Product[],
  pedidos: Pedido[],
): AIRecommendation[] {
  const lentos = identificarItensLentos(produtos, pedidos, 30, 0.5);
  const combos = sugerirCombo(produtos, pedidos, 0.03);

  const recomendacoes: AIRecommendation[] = [];

  // Sugere desconto para itens lentos
  for (const { produto, vendas, mediaEsperada } of lentos.slice(0, 5)) {
    const descontoSugerido = vendas === 0 ? 0.3 : 0.15;
    recomendacoes.push({
      tipo: 'promocao',
      produtoId: produto.id,
      produtoNome: produto.nome.es,
      score: Math.min(1, 1 - vendas / Math.max(1, mediaEsperada)),
      razao: `Solo ${vendas} vendas (media: ${Math.round(mediaEsperada)}) — sugerido -${Math.round(descontoSugerido * 100)}%`,
    });
  }

  // Sugere combos
  for (const combo of combos.slice(0, 3)) {
    const prodA = produtos.find((p) => p.id === combo.produtoA);
    const prodB = produtos.find((p) => p.id === combo.produtoB);
    if (prodA && prodB) {
      recomendacoes.push({
        tipo: 'combo',
        produtoId: `${combo.produtoA}+${combo.produtoB}`,
        produtoNome: `${prodA.nome.es} + ${prodB.nome.es}`,
        score: combo.confianca,
        razao: `Comprados juntos en ${Math.round(combo.confianca * 100)}% de los pedidos`,
      });
    }
  }

  return recomendacoes.sort((a, b) => b.score - a.score);
}

/**
 * Calcula score de popularidade de cada produto (0-100)
 */
export function calcularPopularidade(
  produtos: Product[],
  pedidos: Pedido[],
): Map<string, number> {
  const vendas: Record<string, number> = {};
  let maxVendas = 0;

  for (const pedido of pedidos) {
    for (const item of pedido.itens) {
      const id = item.productId || item.productSnapshot?.id;
      if (!id) continue;
      vendas[id] = (vendas[id] || 0) + item.quantidade;
      maxVendas = Math.max(maxVendas, vendas[id]);
    }
  }

  const map = new Map<string, number>();
  for (const produto of produtos) {
    const v = vendas[produto.id] || 0;
    map.set(produto.id, maxVendas > 0 ? Math.round((v / maxVendas) * 100) : 0);
  }

  return map;
}
