import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale, Categoria, Sabor, Topping, Pedido, CarrinhoItem, PedidoStatus } from '../types';
import { categorias as cats, sabores as sabs, toppings as tops, pedidosMock, diasVenda } from '../data/mockData';

interface AppState {
  // Locale
  locale: Locale;
  setLocale: (l: Locale) => void;

  // Kiosk flow
  currentScreen: 'hola' | 'categorias' | 'sabores' | 'toppings' | 'carrinho' | 'pagamento' | 'confirmacao';
  setScreen: (s: AppState['currentScreen']) => void;
  selectedCategoria: Categoria | null;
  setSelectedCategoria: (c: Categoria | null) => void;
  selectedSabores: Sabor[];
  toggleSabor: (s: Sabor) => void;
  selectedToppings: Topping[];
  toggleTopping: (t: Topping) => void;
  carrinho: CarrinhoItem[];
  addToCarrinho: (item: CarrinhoItem) => void;
  removeFromCarrinho: (index: number) => void;
  clearCarrinho: () => void;
  currentPedido: Pedido | null;
  setCurrentPedido: (p: Pedido | null) => void;
  metodoPago: string;
  setMetodoPago: (m: string) => void;
  resetKiosk: () => void;

  // Data
  categorias: Categoria[];
  sabores: Sabor[];
  toppings: Topping[];
  pedidos: Pedido[];
  vendasHistorico: typeof diasVenda;

  // Pedidos actions
  addPedido: (p: Pedido) => void;
  updatePedidoStatus: (id: string, status: PedidoStatus) => void;
  updateSaborStock: (id: string, baldes: number) => void;
  toggleSaborDisponivel: (id: string) => void;

  // Admin
  isAdminLogged: boolean;
  setAdminLogged: (v: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Locale
      locale: 'es',
      setLocale: (l) => set({ locale: l }),

      // Kiosk flow
      currentScreen: 'hola',
      setScreen: (s) => set({ currentScreen: s }),
      selectedCategoria: null,
      setSelectedCategoria: (c) => set({ selectedCategoria: c, selectedSabores: [], selectedToppings: [] }),
      selectedSabores: [],
      toggleSabor: (s) => {
        const state = get();
        const max = state.selectedCategoria?.maxSabores ?? 2;
        const exists = state.selectedSabores.find((x) => x.id === s.id);
        if (exists) {
          set({ selectedSabores: state.selectedSabores.filter((x) => x.id !== s.id) });
        } else if (state.selectedSabores.length < max) {
          set({ selectedSabores: [...state.selectedSabores, s] });
        }
      },
      selectedToppings: [],
      toggleTopping: (t) => {
        const state = get();
        const exists = state.selectedToppings.find((x) => x.id === t.id);
        if (exists) {
          set({ selectedToppings: state.selectedToppings.filter((x) => x.id !== t.id) });
        } else if (state.selectedToppings.length < 5) {
          set({ selectedToppings: [...state.selectedToppings, t] });
        }
      },
      carrinho: [],
      addToCarrinho: (item) => set({ carrinho: [...get().carrinho, item] }),
      removeFromCarrinho: (index) => {
        const c = [...get().carrinho];
        c.splice(index, 1);
        set({ carrinho: c });
      },
      clearCarrinho: () => set({ carrinho: [], selectedSabores: [], selectedToppings: [], selectedCategoria: null }),
      currentPedido: null,
      setCurrentPedido: (p) => set({ currentPedido: p }),
      metodoPago: 'efectivo',
      setMetodoPago: (m) => set({ metodoPago: m }),
      resetKiosk: () => set({
        currentScreen: 'hola',
        selectedCategoria: null,
        selectedSabores: [],
        selectedToppings: [],
        carrinho: [],
        currentPedido: null,
      }),

      // Data
      categorias: cats,
      sabores: sabs,
      toppings: tops,
      pedidos: pedidosMock,
      vendasHistorico: diasVenda,

      // Pedidos actions
      addPedido: (p) => set({ pedidos: [p, ...get().pedidos] }),
      updatePedidoStatus: (id, status) => {
        const pedidos = get().pedidos.map((ped) =>
          ped.id === id ? { ...ped, status, timestampListo: status === 'listo' ? new Date().toISOString() : ped.timestampListo } : ped
        );
        set({ pedidos });
      },
      updateSaborStock: (id, baldes) => {
        const sabores = get().sabores.map((s) =>
          s.id === id ? { ...s, stockBaldes: Math.max(0, s.stockBaldes + baldes) } : s
        );
        set({ sabores });
      },
      toggleSaborDisponivel: (id) => {
        const sabores = get().sabores.map((s) =>
          s.id === id ? { ...s, disponivel: !s.disponivel } : s
        );
        set({ sabores });
      },

      // Admin
      isAdminLogged: false,
      setAdminLogged: (v) => set({ isAdminLogged: v }),
    }),
    {
      name: 'tpv-sorveteria-storage',
      partialize: (state) => ({
        locale: state.locale,
        isAdminLogged: state.isAdminLogged,
        pedidos: state.pedidos,
        sabores: state.sabores,
      }),
    }
  )
);
