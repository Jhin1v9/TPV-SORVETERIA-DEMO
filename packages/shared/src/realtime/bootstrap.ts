import { categorias, sabores, toppings, diasVenda, establishmentMock } from '../data/mockData';
import { categoriasCardapio, todosProdutos } from '../data/produtosLocal';
import { normalizeProdutoToProduct } from '../types';
import type { DemoStateSnapshot } from '../types';

export function createBootstrapSnapshot(): DemoStateSnapshot {
  return {
    categorias,
    productCategories: categoriasCardapio.map((c) => ({
      id: c.id,
      nome: c.nome,
      emoji: c.emoji,
      displayOrder: c.ordem,
      active: true,
    })),
    products: todosProdutos.map(normalizeProdutoToProduct),
    sabores,
    toppings,
    pedidos: [],
    vendasHistorico: diasVenda,
    establishment: establishmentMock,
    lastOrderNumber: 0,
    updatedAt: new Date().toISOString(),
  };
}
