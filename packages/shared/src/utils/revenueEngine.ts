import type { Complementar, Produto, Bundle, CartItem } from '../types';

/**
 * Encontra complementares sugeridos para um produto.
 * Busca por produtosAlvo (match direto) ou categoriasAlvo.
 */
export function findComplementaresForProduct(
  produto: Produto,
  complementares: Complementar[],
  maxResults = 3
): Complementar[] {
  const matches = complementares.filter((comp) => {
    // Match direto por produtoId
    if (comp.produtosAlvo.includes(produto.id)) return true;
    // Match por categoria
    if (comp.categoriasAlvo?.includes(produto.categoria)) return true;
    return false;
  });

  // Ordena: topping primeiro, depois bebida, extra, acompanhamento
  const tipoOrder: Record<string, number> = { topping: 0, bebida: 1, extra: 2, acompanhamento: 3 };
  return matches
    .sort((a, b) => (tipoOrder[a.tipo] ?? 99) - (tipoOrder[b.tipo] ?? 99))
    .slice(0, maxResults);
}

/**
 * Encontra complementares sugeridos para o carrinho inteiro.
 * Evita duplicados e prioriza itens mais relevantes.
 */
export function findComplementaresForCart(
  carrinho: CartItem[],
  complementares: Complementar[],
  maxResults = 3
): Complementar[] {
  const produtoIds = new Set(carrinho.map((item) => item.product.id));
  const categorias = new Set(carrinho.map((item) => item.product.categoriaId));

  const scored = complementares.map((comp) => {
    let score = 0;
    // Pontua por match de produto
    for (const pid of comp.produtosAlvo) {
      if (produtoIds.has(pid)) score += 2;
    }
    // Pontua por match de categoria
    for (const cat of comp.categoriasAlvo ?? []) {
      if (categorias.has(cat)) score += 1;
    }
    return { comp, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.comp);
}

/**
 * Calcula o total de um bundle baseado nas escolhas do usuário.
 * Retorna o preço promocional (fixo do bundle).
 */
export function calculateBundleTotal(bundle: Bundle): number {
  return bundle.precoPromocional;
}

/**
 * Calcula a economia de um bundle.
 */
export function calculateBundleSavings(bundle: Bundle): number {
  return bundle.precoOriginal - bundle.precoPromocional;
}

/**
 * Verifica se um bundle está completo (todas as escolhas feitas).
 */
export function isBundleComplete(bundle: Bundle): boolean {
  return bundle.itens.every((item) => {
    if (item.tipo === 'fixo') return true;
    return item.opcaoSelecionada != null && item.opcaoSelecionada !== '';
  });
}

/**
 * Converte um bundle com escolhas em CartItems para adicionar ao carrinho.
 */
export function bundleToCartItems(bundle: Bundle, getProdutoById: (id: string) => Produto | undefined): CartItem[] {
  const items: CartItem[] = [];
  for (const item of bundle.itens) {
    const produtoId = item.tipo === 'fixo' ? item.produtoId : item.opcaoSelecionada;
    if (!produtoId) continue;
    const produto = getProdutoById(produtoId);
    if (!produto) continue;

    const preco = 'preco' in produto ? produto.preco : produto.precoBase ?? 0;
    items.push({
      product: produto as unknown as import('../types').Product,
      quantity: item.quantidade,
      unitPrice: preco,
    });
  }
  return items;
}
