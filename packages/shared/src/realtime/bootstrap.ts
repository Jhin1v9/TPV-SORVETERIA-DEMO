import { categorias, sabores, toppings, pedidosMock, diasVenda, establishmentMock } from '../data/mockData';
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
    pedidos: pedidosMock,
    vendasHistorico: diasVenda,
    establishment: establishmentMock,
    lastOrderNumber: Math.max(0, ...pedidosMock.map((pedido) => pedido.numeroSequencial)),
    updatedAt: new Date().toISOString(),
  };
}
