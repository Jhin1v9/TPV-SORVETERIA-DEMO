import { categorias, sabores, toppings, pedidosMock, diasVenda, establishmentMock } from '../data/mockData';
import type { DemoStateSnapshot } from '../types';

export function createBootstrapSnapshot(): DemoStateSnapshot {
  return {
    categorias,
    sabores,
    toppings,
    pedidos: pedidosMock,
    vendasHistorico: diasVenda,
    establishment: establishmentMock,
    lastOrderNumber: Math.max(0, ...pedidosMock.map((pedido) => pedido.numeroSequencial)),
    updatedAt: new Date().toISOString(),
  };
}
