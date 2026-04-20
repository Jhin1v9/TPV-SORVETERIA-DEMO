import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './useStore';
import type { Sabor, Topping, CarrinhoItem } from '../types';

function createMockSabor(id: string, precoExtra = 0): Sabor {
  return {
    id,
    nome: { ca: 'Test', es: 'Test', pt: 'Teste', en: 'Test' },
    categoria: 'cremoso',
    corHex: '#FFF',
    imagemUrl: '/test.jpg',
    precoExtra,
    stockBaldes: 2,
    alertaStock: 1,
    disponivel: true,
    badge: undefined,
  };
}

function createMockTopping(id: string): Topping {
  return {
    id,
    nome: { ca: 'Test', es: 'Test', pt: 'Teste', en: 'Test' },
    preco: 0.5,
    categoria: 'cobertura',
    emoji: '🧪',
  };
}

function createMockItem(): CarrinhoItem {
  return {
    categoria: {
      id: 'copo300',
      nome: { ca: 'Got', es: 'Vaso', pt: 'Copo', en: 'Cup' },
      precoBase: 3.5,
      maxSabores: 2,
      corHex: '#4ECDC4',
      ativo: true,
      ordem: 0,
      imagem: '/test.jpg',
    },
    sabores: [],
    toppings: [],
  };
}

describe('useStore — toggleSabor', () => {
  beforeEach(() => {
    useStore.setState({
      selectedSabores: [],
      selectedCategoria: createMockItem().categoria,
    });
  });

  it('adiciona sabor quando não existe', () => {
    const sabor = createMockSabor('vainilla');
    useStore.getState().toggleSabor(sabor);
    expect(useStore.getState().selectedSabores).toHaveLength(1);
    expect(useStore.getState().selectedSabores[0].id).toBe('vainilla');
  });

  it('remove sabor quando já existe', () => {
    const sabor = createMockSabor('vainilla');
    useStore.getState().toggleSabor(sabor);
    useStore.getState().toggleSabor(sabor);
    expect(useStore.getState().selectedSabores).toHaveLength(0);
  });

  it('respeita maxSabores da categoria', () => {
    const cat = { ...createMockItem().categoria, maxSabores: 1 };
    useStore.setState({ selectedCategoria: cat });
    const s1 = createMockSabor('vainilla');
    const s2 = createMockSabor('choco');
    useStore.getState().toggleSabor(s1);
    useStore.getState().toggleSabor(s2);
    expect(useStore.getState().selectedSabores).toHaveLength(1);
  });

  it('permite trocar sabor quando atinge limite', () => {
    const cat = { ...createMockItem().categoria, maxSabores: 1 };
    useStore.setState({ selectedCategoria: cat });
    const s1 = createMockSabor('vainilla');
    useStore.getState().toggleSabor(s1);
    // remover e adicionar outro
    useStore.getState().toggleSabor(s1);
    const s2 = createMockSabor('choco');
    useStore.getState().toggleSabor(s2);
    expect(useStore.getState().selectedSabores[0].id).toBe('choco');
  });
});

describe('useStore — toggleTopping', () => {
  beforeEach(() => {
    useStore.setState({ selectedToppings: [] });
  });

  it('adiciona topping', () => {
    const t = createMockTopping('nata');
    useStore.getState().toggleTopping(t);
    expect(useStore.getState().selectedToppings).toHaveLength(1);
  });

  it('remove topping quando já existe', () => {
    const t = createMockTopping('nata');
    useStore.getState().toggleTopping(t);
    useStore.getState().toggleTopping(t);
    expect(useStore.getState().selectedToppings).toHaveLength(0);
  });

  it('limita a 5 toppings', () => {
    for (let i = 0; i < 6; i++) {
      useStore.getState().toggleTopping(createMockTopping(`t${i}`));
    }
    expect(useStore.getState().selectedToppings).toHaveLength(5);
  });
});

describe('useStore — carrinho', () => {
  beforeEach(() => {
    useStore.setState({ carrinho: [] });
  });

  it('addToCarrinho adiciona item', () => {
    const item = createMockItem();
    useStore.getState().addToCarrinho(item);
    expect(useStore.getState().carrinho).toHaveLength(1);
  });

  it('removeFromCarrinho remove pelo índice', () => {
    const item1 = createMockItem();
    const item2 = createMockItem();
    useStore.getState().addToCarrinho(item1);
    useStore.getState().addToCarrinho(item2);
    useStore.getState().removeFromCarrinho(0);
    expect(useStore.getState().carrinho).toHaveLength(1);
  });

  it('clearCarrinho esvazia', () => {
    useStore.getState().addToCarrinho(createMockItem());
    useStore.getState().clearCarrinho();
    expect(useStore.getState().carrinho).toHaveLength(0);
    expect(useStore.getState().selectedSabores).toHaveLength(0);
    expect(useStore.getState().selectedToppings).toHaveLength(0);
    expect(useStore.getState().selectedCategoria).toBeNull();
  });
});

describe('useStore — applyPromoCode', () => {
  beforeEach(() => {
    useStore.setState({
      promoCode: '',
      promoApplied: false,
      promoDiscountRate: 0,
    });
  });

  it('aceita SABADELL20', () => {
    useStore.setState({ promoCode: 'SABADELL20' });
    const result = useStore.getState().applyPromoCode();
    expect(result).toBe(true);
    expect(useStore.getState().promoApplied).toBe(true);
    expect(useStore.getState().promoDiscountRate).toBe(0.2);
  });

  it('rejeita código inválido', () => {
    useStore.setState({ promoCode: 'INVALIDO' });
    const result = useStore.getState().applyPromoCode();
    expect(result).toBe(false);
    expect(useStore.getState().promoApplied).toBe(false);
    expect(useStore.getState().promoDiscountRate).toBe(0);
  });

  it('aceita em minúsculas (normaliza)', () => {
    useStore.setState({ promoCode: 'sabadell20' });
    const result = useStore.getState().applyPromoCode();
    expect(result).toBe(true);
  });

  it('aceita com espaços (trim)', () => {
    useStore.setState({ promoCode: '  SABADELL20  ' });
    const result = useStore.getState().applyPromoCode();
    expect(result).toBe(true);
  });
});

describe('useStore — resetCheckout', () => {
  it('limpa estado de checkout', () => {
    useStore.setState({
      promoCode: 'TEST',
      promoApplied: true,
      promoDiscountRate: 0.2,
      coffeeAdded: true,
      notificationPhone: '123',
    });
    useStore.getState().resetCheckout();
    const state = useStore.getState();
    expect(state.promoCode).toBe('');
    expect(state.promoApplied).toBe(false);
    expect(state.promoDiscountRate).toBe(0);
    expect(state.coffeeAdded).toBe(false);
    expect(state.notificationPhone).toBe('');
  });
});

describe('useStore — resetKiosk', () => {
  it('reseta todo o estado do kiosk', () => {
    useStore.setState({
      currentScreen: 'carrinho',
      carrinho: [createMockItem()],
      selectedSabores: [createMockSabor('test')],
      selectedToppings: [createMockTopping('test')],
      selectedCategoria: createMockItem().categoria,
      currentPedido: { id: '1', numeroSequencial: 1, status: 'pendiente', timestampCriacao: new Date().toISOString(), timestampListo: null, metodoPago: 'efectivo', total: 0, iva: 0, verifactuQr: null, clienteTelefone: null, itens: [], origem: 'tpv' } as unknown as import('../types').Pedido,
      metodoPago: 'tarjeta',
      promoCode: 'TEST',
      promoApplied: true,
    });
    useStore.getState().resetKiosk();
    const state = useStore.getState();
    expect(state.currentScreen).toBe('hola');
    expect(state.carrinho).toHaveLength(0);
    expect(state.selectedSabores).toHaveLength(0);
    expect(state.selectedToppings).toHaveLength(0);
    expect(state.selectedCategoria).toBeNull();
    expect(state.currentPedido).toBeNull();
    expect(state.metodoPago).toBe('efectivo');
  });
});
