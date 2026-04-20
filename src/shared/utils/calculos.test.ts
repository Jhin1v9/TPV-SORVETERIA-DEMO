import { describe, it, expect } from 'vitest';
import {
  calcularPorcoes,
  calcularPorcoesAll,
  calcularPrecoItem,
  calculateCartTotals,
  formatCurrency,
  formatDuration,
  generateOrderNumber,
  getEstimadedTime,
} from './calculos';
import type { Categoria, Sabor, Topping } from '../types';

// ─── Helpers de mock ─────────────────────────────────────────────

function mockCategoria(overrides: Partial<Categoria> = {}): Categoria {
  return {
    id: 'copo300',
    nome: { ca: 'Got 300ml', es: 'Vaso 300ml', pt: 'Copo 300ml', en: 'Cup 300ml' },
    precoBase: 3.5,
    maxSabores: 2,
    corHex: '#4ECDC4',
    ativo: true,
    ordem: 0,
    imagem: '/assets/demo/categoria-copo300.jpg',
    badge: undefined,
    ...overrides,
  };
}

function mockSabor(overrides: Partial<Sabor> = {}): Sabor {
  return {
    id: 'vainilla',
    nome: { ca: 'Vainilla', es: 'Vainilla', pt: 'Baunilha', en: 'Vanilla' },
    categoria: 'cremoso',
    corHex: '#F3E5AB',
    imagemUrl: '/assets/demo/sabor-vainilla.jpg',
    precoExtra: 0,
    stockBaldes: 3.0,
    alertaStock: 1.0,
    disponivel: true,
    badge: undefined,
    ...overrides,
  };
}

function mockTopping(overrides: Partial<Topping> = {}): Topping {
  return {
    id: 'nata',
    nome: { ca: 'Nata', es: 'Nata', pt: 'Chantilly', en: 'Cream' },
    preco: 0.6,
    categoria: 'crema',
    emoji: '🥛',
    ...overrides,
  };
}

// ─── calcularPorcoes ─────────────────────────────────────────────

describe('calcularPorcoes', () => {
  it('calcula porções para copo300 com 1 balde', () => {
    expect(calcularPorcoes(1, 'copo300')).toBe(16);
  });

  it('calcula porções para cone com 1 balde', () => {
    expect(calcularPorcoes(1, 'cone')).toBe(32);
  });

  it('retorna 0 com 0 baldes', () => {
    expect(calcularPorcoes(0, 'copo300')).toBe(0);
    expect(calcularPorcoes(0, 'cone')).toBe(0);
  });

  it('retorna 0 com tipo desconhecido (usa fallback 500ml)', () => {
    expect(calcularPorcoes(1, 'desconhecido')).toBe(10);
  });

  it('arredonda para baixo (floor) para pote1l', () => {
    expect(calcularPorcoes(1, 'pote1l')).toBe(5);
  });
});

// ─── calcularPorcoesAll ──────────────────────────────────────────

describe('calcularPorcoesAll', () => {
  it('retorna todas as categorias com 1 balde', () => {
    const result = calcularPorcoesAll(1);
    expect(result.copo300).toBe(16);
    expect(result.copo500).toBe(10);
    expect(result.cone).toBe(32);
    expect(result.pote1l).toBe(5);
  });

  it('retorna 0 para todas com 0 baldes', () => {
    const result = calcularPorcoesAll(0);
    Object.values(result).forEach((v) => expect(v).toBe(0));
  });

  it('multiplica proporcionalmente com 2 baldes', () => {
    const result = calcularPorcoesAll(2);
    expect(result.copo300).toBe(32);
    expect(result.copo500).toBe(20);
  });
});

// ─── calcularPrecoItem ───────────────────────────────────────────

describe('calcularPrecoItem', () => {
  it('preço base sem extras', () => {
    const cat = mockCategoria({ precoBase: 3.5 });
    expect(calcularPrecoItem(cat, [], [])).toBe(3.5);
  });

  it('preço com sabores premium', () => {
    const cat = mockCategoria({ precoBase: 3.5 });
    const sabores = [
      mockSabor({ precoExtra: 0.8 }),
      mockSabor({ precoExtra: 0.5 }),
    ];
    expect(calcularPrecoItem(cat, sabores, [])).toBeCloseTo(4.8, 2);
  });

  it('preço com toppings', () => {
    const cat = mockCategoria({ precoBase: 3.5 });
    const toppings = [
      mockTopping({ preco: 0.6 }),
      mockTopping({ preco: 0.4 }),
    ];
    expect(calcularPrecoItem(cat, [], toppings)).toBeCloseTo(4.5, 2);
  });

  it('preço com sabores + toppings (caso real pistacho + choco)', () => {
    const cat = mockCategoria({ precoBase: 3.5 });
    const sabores = [mockSabor({ precoExtra: 0.8 })];
    const toppings = [mockTopping({ preco: 0.5 })];
    expect(calcularPrecoItem(cat, sabores, toppings)).toBeCloseTo(4.8, 2);
  });
});

// ─── calculateCartTotals ─────────────────────────────────────────

describe('calculateCartTotals', () => {
  it('carrinho vazio retorna zeros', () => {
    const result = calculateCartTotals([]);
    expect(result.subtotal).toBe(0);
    expect(result.iva).toBe(0);
    expect(result.total).toBe(0);
  });

  it('1 item: subtotal correto, IVA 10%', () => {
    const cat = mockCategoria({ precoBase: 3.5 });
    const result = calculateCartTotals([{ categoria: cat, sabores: [], toppings: [] }]);
    expect(result.subtotal).toBeCloseTo(3.5, 2);
    expect(result.iva).toBeCloseTo(0.35, 2);
    expect(result.total).toBeCloseTo(3.85, 2);
  });

  it('2 itens: soma correta com IVA', () => {
    const cat1 = mockCategoria({ precoBase: 3.5 });
    const cat2 = mockCategoria({ precoBase: 4.8 });
    const result = calculateCartTotals([
      { categoria: cat1, sabores: [], toppings: [] },
      { categoria: cat2, sabores: [], toppings: [] },
    ]);
    expect(result.subtotal).toBeCloseTo(8.3, 2);
    expect(result.iva).toBeCloseTo(0.83, 2);
    expect(result.total).toBeCloseTo(9.13, 2);
  });

  it('item com extras calcula tudo', () => {
    const cat = mockCategoria({ precoBase: 3.5 });
    const sabores = [mockSabor({ precoExtra: 0.8 })];
    const toppings = [mockTopping({ preco: 0.5 })];
    const result = calculateCartTotals([{ categoria: cat, sabores, toppings }]);
    expect(result.subtotal).toBeCloseTo(4.8, 2);
    expect(result.iva).toBeCloseTo(0.48, 2);
    expect(result.total).toBeCloseTo(5.28, 2);
  });
});

// ─── formatCurrency ──────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formata inteiro', () => {
    expect(formatCurrency(10)).toBe('EUR 10.00');
  });

  it('formata decimal', () => {
    expect(formatCurrency(5.5)).toBe('EUR 5.50');
  });

  it('formata 0', () => {
    expect(formatCurrency(0)).toBe('EUR 0.00');
  });

  it('formata com muitas casas', () => {
    expect(formatCurrency(3.14159)).toBe('EUR 3.14');
  });
});

// ─── formatDuration ──────────────────────────────────────────────

describe('formatDuration', () => {
  it('125 segundos → 02:05', () => {
    expect(formatDuration(125)).toBe('02:05');
  });

  it('0 segundos → 00:00', () => {
    expect(formatDuration(0)).toBe('00:00');
  });

  it('59 segundos → 00:59', () => {
    expect(formatDuration(59)).toBe('00:59');
  });

  it('3600 segundos → 60:00', () => {
    expect(formatDuration(3600)).toBe('60:00');
  });
});

// ─── generateOrderNumber ─────────────────────────────────────────

describe('generateOrderNumber', () => {
  it('1 → #001', () => {
    expect(generateOrderNumber(1)).toBe('#001');
  });

  it('42 → #042', () => {
    expect(generateOrderNumber(42)).toBe('#042');
  });

  it('1000 → #1000', () => {
    expect(generateOrderNumber(1000)).toBe('#1000');
  });

  it('999 → #999', () => {
    expect(generateOrderNumber(999)).toBe('#999');
  });
});

// ─── getEstimadedTime ────────────────────────────────────────────

describe('getEstimadedTime', () => {
  it('0 pendentes → 2-4 min', () => {
    expect(getEstimadedTime(0)).toEqual({ min: 2, max: 4 });
  });

  it('1 pendente → 2-4 min', () => {
    expect(getEstimadedTime(1)).toEqual({ min: 2, max: 4 });
  });

  it('2 pendentes → 3-5 min', () => {
    expect(getEstimadedTime(2)).toEqual({ min: 3, max: 5 });
  });

  it('4 pendentes → 4-6 min', () => {
    expect(getEstimadedTime(4)).toEqual({ min: 4, max: 6 });
  });

  it('6 pendentes → 5-8 min', () => {
    expect(getEstimadedTime(6)).toEqual({ min: 5, max: 8 });
  });

  it('10 pendentes → 5-8 min', () => {
    expect(getEstimadedTime(10)).toEqual({ min: 5, max: 8 });
  });
});
