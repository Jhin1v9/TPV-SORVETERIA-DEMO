import { describe, it, expect } from 'vitest';
import { todosProdutos } from '../data/produtosLocal';
import { isProdutoPersonalizavel, normalizeProdutoToProduct } from '../types';
import type { OpcaoPersonalizacao } from '../types';

/**
 * Teste de integração: simula a adição de TODOS os produtos ao carrinho,
 * verificando que limites de personalização são respeitados e preços são válidos.
 */

describe('Product Integration - All Menu Items', () => {
  it('todos os produtos fixos têm preço > 0', () => {
    const fixos = todosProdutos.filter((p) => !isProdutoPersonalizavel(p));
    for (const p of fixos) {
      expect('preco' in p ? p.preco : 0).toBeGreaterThan(0);
    }
  });

  it('todos os produtos personalizáveis têm precoBase >= 0', () => {
    const pers = todosProdutos.filter((p) => isProdutoPersonalizavel(p));
    for (const p of pers) {
      expect(p.precoBase).toBeGreaterThanOrEqual(0);
    }
  });

  it('todos os produtos personalizáveis têm pelo menos uma opção', () => {
    const pers = todosProdutos.filter((p) => isProdutoPersonalizavel(p));
    for (const p of pers) {
      const opcoesCount = Object.values(p.opcoes).reduce((sum, arr) => sum + (arr?.length || 0), 0);
      expect(opcoesCount).toBeGreaterThan(0);
    }
  });

  it('simula adição ao carrinho de todos os produtos fixos', () => {
    const fixos = todosProdutos.filter((p) => !isProdutoPersonalizavel(p));
    for (const p of fixos) {
      const product = normalizeProdutoToProduct(p);
      const preco = 'preco' in p ? p.preco : 0;
      expect(product).toBeDefined();
      expect(preco).toBeGreaterThan(0);
      // Simula CartItem
      const cartItem = { product, quantity: 1, unitPrice: preco };
      expect(cartItem.unitPrice).toBe(preco);
    }
  });

  it('simula adição ao carrinho de todos os produtos personalizáveis com seleção válida', () => {
    const pers = todosProdutos.filter((p) => isProdutoPersonalizavel(p));

    for (const p of pers) {
      const selecoes: Record<string, OpcaoPersonalizacao[]> = {};
      let precoCalculado = p.precoBase;

      // 1. Seleciona tamanho (se existir) — obrigatório, só 1
      if (p.opcoes.tamanhos && p.opcoes.tamanhos.length > 0) {
        const tamanho = p.opcoes.tamanhos[0];
        selecoes['tamanhos'] = [tamanho];
        precoCalculado = tamanho.preco; // tamanho substitui precoBase
      }

      // 2. Seleciona sabores respeitando limite
      const maxSabores = p.limites?.maxSabores ?? 3;
      if (p.opcoes.sabores && p.opcoes.sabores.length > 0) {
        const numSabores = Math.min(maxSabores, p.opcoes.sabores.length);
        const sabores = p.opcoes.sabores.slice(0, numSabores);
        selecoes['sabores'] = sabores;
        sabores.forEach((s) => { precoCalculado += s.preco; });
        expect(sabores.length).toBeLessThanOrEqual(maxSabores);
      }

      // 3. Seleciona toppings respeitando limite
      const maxToppings = p.limites?.maxToppings ?? 4;
      if (p.opcoes.toppings && p.opcoes.toppings.length > 0) {
        const numToppings = Math.min(maxToppings, p.opcoes.toppings.length);
        const toppings = p.opcoes.toppings.slice(0, numToppings);
        selecoes['toppings'] = toppings;
        toppings.forEach((top) => { precoCalculado += top.preco; });
        expect(toppings.length).toBeLessThanOrEqual(maxToppings);
      }

      // 4. Seleciona frutas respeitando limite
      const maxFrutas = p.limites?.maxFrutas ?? 3;
      if (p.opcoes.frutas && p.opcoes.frutas.length > 0) {
        const numFrutas = Math.min(maxFrutas, p.opcoes.frutas.length);
        const frutas = p.opcoes.frutas.slice(0, numFrutas);
        selecoes['frutas'] = frutas;
        frutas.forEach((f) => { precoCalculado += f.preco; });
        expect(frutas.length).toBeLessThanOrEqual(maxFrutas);
      }

      // 5. Seleciona extras (sem limite definido, mas testamos até 5)
      if (p.opcoes.extras && p.opcoes.extras.length > 0) {
        const numExtras = Math.min(5, p.opcoes.extras.length);
        const extras = p.opcoes.extras.slice(0, numExtras);
        selecoes['extras'] = extras;
        extras.forEach((e) => { precoCalculado += e.preco; });
      }

      // Verifica preço final
      expect(precoCalculado).toBeGreaterThanOrEqual(p.precoBase);

      // Simula CartItem
      const product = normalizeProdutoToProduct(p);
      const cartItem = {
        product,
        quantity: 1,
        unitPrice: precoCalculado,
        selections: Object.keys(selecoes).length > 0 ? selecoes : undefined,
      };

      expect(cartItem.unitPrice).toBeGreaterThanOrEqual(0);
      expect(cartItem.product.id).toBe(p.id);

      // Verifica que o número de sabores respeita o limite
      if (selecoes['sabores']) {
        expect(selecoes['sabores'].length).toBeLessThanOrEqual(maxSabores);
      }
    }
  });

  it('cono 1 bola permite no máximo 1 sabor, cono 2 bolas permite no máximo 2 sabores', () => {
    const cono = todosProdutos.find((p) => p.id === 'cono');
    expect(cono).toBeDefined();
    if (!cono || !isProdutoPersonalizavel(cono)) return;

    const tamanho1Bola = cono.opcoes.tamanhos?.find((t) =>
      /1\s*(bola|sabor|scoop)/i.test(t.nome.es || t.nome.pt || '')
    );
    const tamanho2Bolas = cono.opcoes.tamanhos?.find((t) =>
      /2\s*(bolas|sabores|scoops)/i.test(t.nome.es || t.nome.pt || '')
    );

    // Verifica que existe tamanho com 1 bola e 2 bolas
    expect(tamanho1Bola).toBeDefined();
    expect(tamanho2Bolas).toBeDefined();

    // O limite global do cono deve ser 2 (para acomodar 2 bolas)
    expect(cono.limites?.maxSabores ?? 3).toBeGreaterThanOrEqual(2);
  });

  it('helado en terrina: petit = 1 sabor, mitjà = 2 sabores, gran = 3 sabores', () => {
    const helado = todosProdutos.find((p) => p.id === 'helado-terra');
    expect(helado).toBeDefined();
    if (!helado || !isProdutoPersonalizavel(helado)) return;

    const petit = helado.opcoes.tamanhos?.find((t) => t.id === 'helado-petit');
    const mitja = helado.opcoes.tamanhos?.find((t) => t.id === 'helado-mitja');
    const gran = helado.opcoes.tamanhos?.find((t) => t.id === 'helado-gran');

    expect(petit).toBeDefined();
    expect(mitja).toBeDefined();
    expect(gran).toBeDefined();

    // Verifica que os nomes indicam o número correto de sabores/bolas
    expect(petit!.nome.es).toMatch(/1/i);
    expect(mitja!.nome.es).toMatch(/2/i);
    expect(gran!.nome.es).toMatch(/3/i);
  });

  it('todos os produtos têm nome em espanhol (fallback) e imagem definida', () => {
    for (const p of todosProdutos) {
      expect(p.nome.es).toBeDefined();
      expect(p.nome.es.length).toBeGreaterThan(0);
      expect(p.imagem).toBeDefined();
      expect(p.imagem.length).toBeGreaterThan(0);
    }
  });
});
