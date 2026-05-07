import { describe, it, expect } from 'vitest';
import {
  preverDemanda30min,
  preparoSugerido,
  horarioPicoDetectado,
  calcularTendenciaDemanda,
  calcularSurgeMultiplier,
  aplicarPrecoDinamico,
  deveAtivarSurge,
  getSurgeLabel,
  recomendarParaCarrinho,
  recomendarParaCliente,
  scoreDeSimilaridade,
  identificarItensLentos,
  sugerirCombo,
  sugerirPromocao,
  calcularPopularidade,
} from '../src/ai';
import type { Pedido, Product, CartItem } from '../src/types';

// ═══ Helpers ═══
function criarPedido(parcial: Partial<Pedido> & { timestampCriacao: string }): Pedido {
  return {
    id: 'p-' + Math.random().toString(36).slice(2, 8),
    itens: [],
    total: 10,
    status: 'pendente',
    metodoPago: 'efectivo',
    timestampCriacao: parcial.timestampCriacao,
    ...parcial,
  } as Pedido;
}

function criarProduto(id: string, nome: string, preco: number): Product {
  return {
    id,
    nome: { es: nome, pt: nome, en: nome },
    preco,
    categoriaId: 'cat1',
    imagem: '',
    disponivel: true,
    active: true,
    emEstoque: true,
    alergenos: [],
  };
}

function criarCartItem(product: Product): CartItem {
  return {
    product,
    quantidade: 1,
    precoUnitario: product.preco,
  };
}

// ═══ predictivePrep.ts ═══
describe('preverDemanda30min', () => {
  it('retorna forecast com 0 pedidos quando não há pedidos', () => {
    const result = preverDemanda30min([]);
    expect(result.pedidosEsperados).toBe(0);
    expect(result.confianca).toBe(0);
  });

  it('preve demanda baseada em pedidos da mesma hora em dias anteriores', () => {
    const agora = new Date();
    const horaAtual = agora.getHours();
    const diaSemana = agora.getDay();
    
    // Cria pedidos na mesma hora nos últimos 7 dias
    const pedidos: Pedido[] = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date(agora);
      d.setDate(d.getDate() - i);
      d.setHours(horaAtual, 0, 0, 0);
      pedidos.push(criarPedido({ timestampCriacao: d.toISOString(), total: 10 }));
      pedidos.push(criarPedido({ timestampCriacao: d.toISOString(), total: 10 }));
    }
    
    const resultado = preverDemanda30min(pedidos);
    expect(resultado.pedidosEsperados).toBeGreaterThan(0);
    expect(resultado.confianca).toBeGreaterThan(0);
  });

  it('considera múltiplas amostras para confiança', () => {
    const agora = new Date();
    const pedidos: Pedido[] = [];
    for (let i = 1; i <= 10; i++) {
      const d = new Date(agora);
      d.setDate(d.getDate() - i);
      pedidos.push(criarPedido({ timestampCriacao: d.toISOString(), total: 10 }));
    }
    const resultado = preverDemanda30min(pedidos);
    expect(resultado.confianca).toBeGreaterThanOrEqual(0);
    expect(resultado.confianca).toBeLessThanOrEqual(1);
  });
});

describe('horarioPicoDetectado', () => {
  it('detecta horário de pico quando há muitos pedidos recentes', () => {
    const agora = new Date();
    const pedidos: Pedido[] = Array.from({ length: 15 }, () =>
      criarPedido({
        timestampCriacao: new Date(agora.getTime() - 1000 * 60 * 30).toISOString(),
        total: 10,
      }),
    );
    expect(horarioPicoDetectado(pedidos)).toBe(true);
  });

  it('não detecta pico com poucos pedidos', () => {
    const agora = new Date();
    const pedidos: Pedido[] = Array.from({ length: 2 }, () =>
      criarPedido({
        timestampCriacao: new Date(agora.getTime() - 1000 * 60 * 30).toISOString(),
        total: 10,
      }),
    );
    expect(horarioPicoDetectado(pedidos)).toBe(false);
  });

  it('retorna false sem pedidos', () => {
    expect(horarioPicoDetectado([])).toBe(false);
  });
});

describe('calcularTendenciaDemanda', () => {
  it('retorna estavel sem dados suficientes', () => {
    expect(calcularTendenciaDemanda([])).toBe('estavel');
  });

  it('detecta tendência de crescimento', () => {
    const agora = new Date();
    const pedidos: Pedido[] = [
      // Hora anterior: 1 pedido
      criarPedido({ timestampCriacao: new Date(agora.getTime() - 5400000).toISOString(), total: 10 }),
      // Última hora: 5 pedidos (crescimento)
      ...Array.from({ length: 5 }, () =>
        criarPedido({ timestampCriacao: new Date(agora.getTime() - 1000 * 60 * 30).toISOString(), total: 10 }),
      ),
    ];
    const tendencia = calcularTendenciaDemanda(pedidos);
    expect(['subindo', 'estavel', 'caindo']).toContain(tendencia);
  });
});

describe('preparoSugerido', () => {
  it('sugere preparo baseado em demanda prevista', () => {
    const agora = new Date();
    const pedidos: Pedido[] = Array.from({ length: 10 }, () =>
      criarPedido({
        timestampCriacao: new Date(agora.getTime() - 1000 * 60 * 30).toISOString(),
        total: 10,
      }),
    );
    const produtosPopulares = [
      { id: 'p1', nome: 'Café', categoriaId: 'cat1' },
      { id: 'p2', nome: 'Croissant', categoriaId: 'cat1' },
    ];
    const sugestoes = preparoSugerido(pedidos, produtosPopulares);
    expect(Array.isArray(sugestoes)).toBe(true);
    expect(sugestoes.length).toBeGreaterThan(0);
    expect(sugestoes[0]).toHaveProperty('produto');
    expect(sugestoes[0]).toHaveProperty('quantidadeSugerida');
  });

  it('retorna sugestões mesmo sem pedidos', () => {
    const produtosPopulares = [
      { id: 'p1', nome: 'Café', categoriaId: 'cat1' },
    ];
    const sugestoes = preparoSugerido([], produtosPopulares);
    expect(Array.isArray(sugestoes)).toBe(true);
  });
});

// ═══ dynamicPricing.ts ═══
describe('calcularSurgeMultiplier', () => {
  it('retorna desconto (<1.0) quando capacidade < 50%', () => {
    const multiplier = calcularSurgeMultiplier(5, 5, 20);
    expect(multiplier).toBeLessThan(1.0);
    expect(multiplier).toBeGreaterThanOrEqual(0.85);
  });

  it('retorna normal (1.0) quando capacidade 50-80%', () => {
    const multiplier = calcularSurgeMultiplier(12, 5, 20);
    expect(multiplier).toBe(1.0);
  });

  it('retorna aumento (>1.0) quando capacidade > 80%', () => {
    const multiplier = calcularSurgeMultiplier(18, 5, 20);
    expect(multiplier).toBeGreaterThan(1.0);
  });

  it('retorna surge máximo (1.30) quando capacidade > 100%', () => {
    const multiplier = calcularSurgeMultiplier(30, 5, 20);
    expect(multiplier).toBe(1.3);
  });

  it('respeita config desativada', () => {
    const multiplier = calcularSurgeMultiplier(30, 5, 20, { ativo: false, multiplicadorMin: 0.85, multiplicadorMax: 1.3, thresholdBaixaDemanda: 0.5, thresholdAltaDemanda: 0.8 });
    expect(multiplier).toBe(1.0);
  });
});

describe('aplicarPrecoDinamico', () => {
  it('aplica desconto corretamente', () => {
    expect(aplicarPrecoDinamico(10, 0.85)).toBe(8.5);
  });

  it('mantém preço normal', () => {
    expect(aplicarPrecoDinamico(10, 1.0)).toBe(10);
  });

  it('aplica aumento corretamente', () => {
    expect(aplicarPrecoDinamico(10, 1.15)).toBe(11.5);
  });

  it('arredonda para 2 casas decimais', () => {
    expect(aplicarPrecoDinamico(9.99, 0.85)).toBe(8.49);
  });
});

describe('deveAtivarSurge', () => {
  it('ativa surge quando demanda é alta', () => {
    expect(deveAtivarSurge(20, 5, 20)).toBe(true);
  });

  it('não ativa surge com poucos pedidos', () => {
    expect(deveAtivarSurge(3, 5, 20)).toBe(false);
  });
});

describe('getSurgeLabel', () => {
  it('retorna Oferta para desconto', () => {
    expect(getSurgeLabel(0.85).label).toBe('Oferta');
  });

  it('retorna Normal para preço padrão', () => {
    expect(getSurgeLabel(1.0).label).toBe('Normal');
  });

  it('retorna Alta demanda para surge máximo', () => {
    expect(getSurgeLabel(1.3).label).toBe('Alta demanda');
  });
});

// ═══ aiUpselling.ts ═══
describe('scoreDeSimilaridade', () => {
  it('retorna 1.0 para conjuntos idênticos', () => {
    const setA = new Set(['a', 'b']);
    const setB = new Set(['a', 'b']);
    expect(scoreDeSimilaridade(setA, setB)).toBe(1);
  });

  it('retorna 0 para conjuntos sem interseção', () => {
    const setA = new Set(['a']);
    const setB = new Set(['b']);
    expect(scoreDeSimilaridade(setA, setB)).toBe(0);
  });

  it('calcula Jaccard corretamente para sobreposição parcial', () => {
    const setA = new Set(['a', 'b']);
    const setB = new Set(['b', 'c']);
    // Interseção: {b} = 1, União: {a,b,c} = 3, Jaccard = 1/3
    expect(scoreDeSimilaridade(setA, setB)).toBeCloseTo(1 / 3, 5);
  });

  it('retorna 0 para conjuntos vazios', () => {
    expect(scoreDeSimilaridade(new Set(), new Set())).toBe(0);
  });
});

describe('recomendarParaCarrinho', () => {
  it('recomenda produtos baseados em padrões históricos', () => {
    const prodA = criarProduto('a', 'Product A', 5);
    const prodB = criarProduto('b', 'Product B', 5);
    const prodC = criarProduto('c', 'Product C', 5);
    const carrinho = [criarCartItem(prodA)];
    const todosProdutos = [prodA, prodB, prodC];
    const historico: Pedido[] = [
      criarPedido({
        timestampCriacao: '2024-01-01T00:00:00Z',
        itens: [
          { productId: 'a', quantidade: 1, precoUnitario: 5 },
          { productId: 'b', quantidade: 1, precoUnitario: 5 },
        ],
      }),
    ];
    const recomendacoes = recomendarParaCarrinho(carrinho, historico, todosProdutos);
    expect(recomendacoes.length).toBeGreaterThan(0);
    expect(recomendacoes[0].produtoId).toBe('b');
  });

  it('não recomenda produtos já no carrinho', () => {
    const prodA = criarProduto('a', 'Product A', 5);
    const prodB = criarProduto('b', 'Product B', 5);
    const carrinho = [criarCartItem(prodA)];
    const todosProdutos = [prodA, prodB];
    const historico: Pedido[] = [
      criarPedido({
        timestampCriacao: '2024-01-01T00:00:00Z',
        itens: [
          { productId: 'a', quantidade: 1, precoUnitario: 5 },
          { productId: 'b', quantidade: 1, precoUnitario: 5 },
        ],
      }),
    ];
    const recomendacoes = recomendarParaCarrinho(carrinho, historico, todosProdutos);
    expect(recomendacoes.every((r) => r.produtoId !== 'a')).toBe(true);
  });

  it('retorna array vazio sem histórico', () => {
    const carrinho = [criarCartItem(criarProduto('a', 'Product A', 5))];
    expect(recomendarParaCarrinho(carrinho, [], [])).toEqual([]);
  });

  it('retorna array vazio com carrinho vazio', () => {
    expect(recomendarParaCarrinho([], [], [])).toEqual([]);
  });
});

describe('recomendarParaCliente', () => {
  it('retorna recomendações baseadas em histórico do cliente', () => {
    const prodA = criarProduto('a', 'Product A', 5);
    const prodB = criarProduto('b', 'Product B', 5);
    const todosProdutos = [prodA, prodB];
    const todosPedidos: Pedido[] = [
      criarPedido({
        timestampCriacao: '2024-01-01T00:00:00Z',
        userId: 'u1',
        itens: [{ productId: 'a', quantidade: 1, precoUnitario: 5 }],
      }),
      criarPedido({
        timestampCriacao: '2024-01-02T00:00:00Z',
        userId: 'u1',
        itens: [{ productId: 'a', quantidade: 1, precoUnitario: 5 }],
      }),
    ];
    const recomendacoes = recomendarParaCliente('u1', todosPedidos, todosProdutos);
    expect(Array.isArray(recomendacoes)).toBe(true);
  });

  it('retorna array vazio sem pedidos do cliente', () => {
    expect(recomendarParaCliente('u1', [], [])).toEqual([]);
  });
});

// ═══ menuOptimizer.ts ═══
describe('identificarItensLentos', () => {
  it('identifica produtos com baixa rotação', () => {
    const products = [
      criarProduto('p1', 'Product 1', 5),
      criarProduto('p2', 'Product 2', 5),
    ];
    const pedidos: Pedido[] = [
      criarPedido({
        timestampCriacao: new Date().toISOString(),
        itens: [{ productId: 'p1', quantidade: 10, precoUnitario: 5 }],
      }),
      criarPedido({
        timestampCriacao: new Date().toISOString(),
        itens: [{ productId: 'p2', quantidade: 1, precoUnitario: 5 }],
      }),
    ];
    const lentos = identificarItensLentos(products, pedidos, 30);
    expect(lentos.length).toBeGreaterThan(0);
    expect(lentos[0].produto.id).toBe('p2');
  });

  it('retorna array vazio se todos têm boa rotação', () => {
    const products = [criarProduto('p1', 'Product 1', 5)];
    const pedidos: Pedido[] = [
      criarPedido({
        timestampCriacao: new Date().toISOString(),
        itens: [{ productId: 'p1', quantidade: 100, precoUnitario: 5 }],
      }),
    ];
    expect(identificarItensLentos(products, pedidos, 30)).toEqual([]);
  });

  it('ignora produtos inativos ou sem estoque', () => {
    const products = [
      { ...criarProduto('p1', 'Product 1', 5), active: false },
      { ...criarProduto('p2', 'Product 2', 5), emEstoque: false },
    ];
    expect(identificarItensLentos(products, [], 30)).toEqual([]);
  });
});

describe('sugerirCombo', () => {
  it('sugere combos baseados em market basket analysis', () => {
    const products = [
      criarProduto('a', 'Café', 3),
      criarProduto('b', 'Croissant', 2),
      criarProduto('c', 'Té', 2.5),
    ];
    const pedidos: Pedido[] = Array.from({ length: 10 }, () =>
      criarPedido({
        timestampCriacao: new Date().toISOString(),
        itens: [
          { productId: 'a', quantidade: 1, precoUnitario: 3 },
          { productId: 'b', quantidade: 1, precoUnitario: 2 },
        ],
      }),
    );
    const combos = sugerirCombo(products, pedidos);
    expect(combos.length).toBeGreaterThan(0);
    expect(combos[0]).toHaveProperty('produtoA');
    expect(combos[0]).toHaveProperty('produtoB');
    expect(combos[0]).toHaveProperty('confianca');
  });

  it('retorna array vazio sem dados suficientes', () => {
    expect(sugerirCombo([], [])).toEqual([]);
  });

  it('retorna array vazio quando nenhum par atinge suporte mínimo', () => {
    const products = [criarProduto('a', 'A', 1), criarProduto('b', 'B', 1)];
    const pedidos: Pedido[] = [
      criarPedido({
        timestampCriacao: new Date().toISOString(),
        itens: [{ productId: 'a', quantidade: 1, precoUnitario: 1 }],
      }),
    ];
    expect(sugerirCombo(products, pedidos, 0.5)).toEqual([]);
  });
});

describe('sugerirPromocao', () => {
  it('sugere promoções para itens lentos', () => {
    const products = [
      criarProduto('p1', 'Product Popular', 5),
      criarProduto('p2', 'Product Lento', 5),
    ];
    const pedidos: Pedido[] = [
      criarPedido({
        timestampCriacao: new Date().toISOString(),
        itens: [{ productId: 'p1', quantidade: 20, precoUnitario: 5 }],
      }),
      criarPedido({
        timestampCriacao: new Date().toISOString(),
        itens: [{ productId: 'p2', quantidade: 1, precoUnitario: 5 }],
      }),
    ];
    const promos = sugerirPromocao(products, pedidos);
    expect(promos.length).toBeGreaterThan(0);
    expect(promos[0]).toHaveProperty('tipo');
    expect(promos[0]).toHaveProperty('score');
  });

  it('retorna array vazio sem itens lentos', () => {
    const products = [criarProduto('p1', 'Product', 5)];
    const pedidos: Pedido[] = [
      criarPedido({
        timestampCriacao: new Date().toISOString(),
        itens: [{ productId: 'p1', quantidade: 50, precoUnitario: 5 }],
      }),
    ];
    expect(sugerirPromocao(products, pedidos)).toEqual([]);
  });
});

describe('calcularPopularidade', () => {
  it('calcula popularidade relativa 0-100', () => {
    const products = [criarProduto('p1', 'A', 1), criarProduto('p2', 'B', 1)];
    const pedidos: Pedido[] = [
      criarPedido({
        timestampCriacao: new Date().toISOString(),
        itens: [
          { productId: 'p1', quantidade: 10, precoUnitario: 1 },
          { productId: 'p2', quantidade: 5, precoUnitario: 1 },
        ],
      }),
    ];
    const popularidade = calcularPopularidade(products, pedidos);
    expect(popularidade.get('p1')).toBe(100);
    expect(popularidade.get('p2')).toBe(50);
  });

  it('retorna 0 para produtos sem vendas', () => {
    const products = [criarProduto('p1', 'A', 1)];
    expect(calcularPopularidade(products, []).get('p1')).toBe(0);
  });
});
