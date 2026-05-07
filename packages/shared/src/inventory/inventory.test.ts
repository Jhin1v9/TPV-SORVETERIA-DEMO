/**
 * ═══ FASE 10 — Ingredient-level Inventory Tests ═══
 */

import { describe, it, expect } from 'vitest';
import {
  getReceita,
  calcularConsumo,
  calcularConsumoCarrinho,
  temIngredientesSuficientes,
  ingredientesFaltantes,
  debitarIngredientes,
  produtosQueUsamIngrediente,
} from './recipeEngine';

import {
  estaEmEstoqueBaixo,
  estaEsgotado,
  calcularStatusIngrediente,
  formatarQuantidade,
  calcularCapacidadeProducao,
} from './ingredientOps';

import { ingredientes, receitas } from './ingredientData';
import type { CartItem, Ingrediente, Product } from '../types';

describe('Fase 10 — Ingredient-level Inventory', () => {
  const mockProduct: Product = {
    id: 'copo_300',
    nome: { es: 'Copo 300ml', ca: 'Got 300ml', pt: 'Copo 300ml', en: 'Cup 300ml' },
    imagem: '',
    categoriaId: 'copas',
    emEstoque: true,
    alergenos: [],
    isPersonalizavel: false,
    preco: 3.5,
    descricao: { es: '', ca: '', pt: '', en: '' },
    opcoes: {},
    active: true,
    displayOrder: 0,
  };

  const mockCartItem: CartItem = {
    product: mockProduct,
    quantity: 2,
    unitPrice: 3.5,
  };

  // ═══ recipeEngine.ts ═══
  describe('recipeEngine', () => {
    it('deve encontrar receita por productId', () => {
      const receita = getReceita('copo_300');
      expect(receita).toBeDefined();
      expect(receita?.productId).toBe('copo_300');
      expect(receita?.ingredientes.length).toBeGreaterThan(0);
    });

    it('deve retornar undefined para produto sem receita', () => {
      const receita = getReceita('produto_inexistente');
      expect(receita).toBeUndefined();
    });

    it('deve calcular consumo para um item', () => {
      const consumo = calcularConsumo(mockCartItem);
      expect(consumo.length).toBeGreaterThan(0);
      // Copa 300ml: leite 150ml, crema 50ml, acucar 30g, copo_300 1un
      // × 2 unidades
      const leite = consumo.find((c) => c.ingredienteId === 'leite');
      expect(leite).toBeDefined();
      expect(leite?.quantidade).toBe(300); // 150 × 2
    });

    it('deve calcular consumo total do carrinho', () => {
      const carrinho = [mockCartItem, { ...mockCartItem, quantity: 1 }];
      const consumo = calcularConsumoCarrinho(carrinho);
      const leite = consumo.find((c) => c.ingredienteId === 'leite');
      // 2 + 1 = 3 copos × 150ml = 450ml
      expect(leite?.quantidade).toBe(450);
    });

    it('deve verificar se há ingredientes suficientes', () => {
      const tem = temIngredientesSuficientes(mockCartItem, ingredientes);
      expect(tem).toBe(true);
    });

    it('deve detectar ingredientes insuficientes', () => {
      const ingredientesBaixos = ingredientes.map((i) =>
        i.id === 'leite' ? { ...i, stock: 10 } : i,
      );
      const tem = temIngredientesSuficientes(mockCartItem, ingredientesBaixos);
      expect(tem).toBe(false);
    });

    it('deve retornar ingredientes faltantes', () => {
      const ingredientesBaixos = ingredientes.map((i) =>
        i.id === 'leite' ? { ...i, stock: 10 } : i,
      );
      const faltantes = ingredientesFaltantes(mockCartItem, ingredientesBaixos);
      expect(faltantes.length).toBeGreaterThan(0);
      expect(faltantes.some((f) => f.ingredienteId === 'leite')).toBe(true);
    });

    it('deve debitar ingredientes do estoque', () => {
      const estoqueInicial = ingredientes.find((i) => i.id === 'leite')!.stock;
      const atualizados = debitarIngredientes([mockCartItem], ingredientes);
      const leiteAtualizado = atualizados.find((i) => i.id === 'leite');
      expect(leiteAtualizado!.stock).toBe(estoqueInicial - 300);
    });

    it('deve encontrar produtos que usam um ingrediente', () => {
      const produtos = produtosQueUsamIngrediente('leite', [mockProduct]);
      expect(produtos.length).toBeGreaterThan(0);
      expect(produtos[0].id).toBe('copo_300');
    });
  });

  // ═══ ingredientOps.ts ═══
  describe('ingredientOps', () => {
    it('deve detectar estoque baixo', () => {
      const ing: Ingrediente = { id: 'test', nome: { es: 'Test', ca: 'Test', pt: 'Test', en: 'Test' }, unidade: 'ml', stock: 5, alertaStock: 10, ativo: true };
      expect(estaEmEstoqueBaixo(ing)).toBe(true);
      expect(estaEsgotado(ing)).toBe(false);
    });

    it('deve detectar esgotado', () => {
      const ing: Ingrediente = { id: 'test', nome: { es: 'Test', ca: 'Test', pt: 'Test', en: 'Test' }, unidade: 'ml', stock: 0, alertaStock: 10, ativo: true };
      expect(estaEsgotado(ing)).toBe(true);
      expect(estaEmEstoqueBaixo(ing)).toBe(false); // 0 não é "baixo", é esgotado
    });

    it('deve calcular status correto', () => {
      const ok: Ingrediente = { id: 'ok', nome: { es: 'OK', ca: 'OK', pt: 'OK', en: 'OK' }, unidade: 'ml', stock: 100, alertaStock: 10, ativo: true };
      const aviso: Ingrediente = { id: 'aviso', nome: { es: 'Aviso', ca: 'Aviso', pt: 'Aviso', en: 'Aviso' }, unidade: 'ml', stock: 5, alertaStock: 10, ativo: true };
      const critico: Ingrediente = { id: 'critico', nome: { es: 'Critico', ca: 'Critico', pt: 'Critico', en: 'Critico' }, unidade: 'ml', stock: 0, alertaStock: 10, ativo: true };

      expect(calcularStatusIngrediente(ok)).toBe('ok');
      expect(calcularStatusIngrediente(aviso)).toBe('aviso');
      expect(calcularStatusIngrediente(critico)).toBe('critico');
    });

    it('deve formatar quantidade corretamente', () => {
      expect(formatarQuantidade(150, 'ml')).toBe('150 ml');
      expect(formatarQuantidade(1500, 'ml')).toBe('1.5 L');
      expect(formatarQuantidade(500, 'g')).toBe('500 g');
      expect(formatarQuantidade(1500, 'g')).toBe('1.5 kg');
      expect(formatarQuantidade(5, 'un')).toBe('5 un');
    });

    it('deve calcular capacidade de produção', () => {
      const capacidade = calcularCapacidadeProducao('copo_300', receitas, ingredientes);
      expect(capacidade).toBeGreaterThan(0);
      // Com 50000ml de leite e 150ml por copo = ~333 copos
      expect(capacidade).toBeGreaterThanOrEqual(100);
    });

    it('deve retornar 0 capacidade quando ingrediente esgotado', () => {
      const semLeite = ingredientes.map((i) =>
        i.id === 'leite' ? { ...i, stock: 0 } : i,
      );
      const capacidade = calcularCapacidadeProducao('copo_300', receitas, semLeite);
      expect(capacidade).toBe(0);
    });
  });
});
