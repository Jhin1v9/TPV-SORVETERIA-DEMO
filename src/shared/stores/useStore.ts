import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CarrinhoItem,
  Categoria,
  DemoStateSnapshot,
  EstablishmentSettings,
  Locale,
  Pedido,
  Sabor,
  Topping,
} from '../types';
import { categorias as cats, sabores as sabs, toppings as tops, pedidosMock, diasVenda, establishmentMock } from '../data/mockData';
import { DEMO_PROMO_CODE, DEMO_PROMO_RATE, defaultCheckoutState } from '../utils/pricing';

interface AppState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  connectionStatus: 'connecting' | 'connected' | 'offline';
  setConnectionStatus: (status: AppState['connectionStatus']) => void;
  lastSyncAt: string | null;
  hydrateRemoteState: (snapshot: DemoStateSnapshot) => void;

  currentScreen: 'hola' | 'categorias' | 'sabores' | 'toppings' | 'carrinho' | 'pagamento' | 'confirmacao';
  setScreen: (screen: AppState['currentScreen']) => void;
  selectedCategoria: Categoria | null;
  setSelectedCategoria: (categoria: Categoria | null) => void;
  selectedSabores: Sabor[];
  toggleSabor: (sabor: Sabor) => void;
  selectedToppings: Topping[];
  toggleTopping: (topping: Topping) => void;
  carrinho: CarrinhoItem[];
  addToCarrinho: (item: CarrinhoItem) => void;
  removeFromCarrinho: (index: number) => void;
  clearCarrinho: () => void;
  currentPedido: Pedido | null;
  setCurrentPedido: (pedido: Pedido | null) => void;
  metodoPago: string;
  setMetodoPago: (metodo: string) => void;
  promoCode: string;
  setPromoCode: (value: string) => void;
  promoApplied: boolean;
  promoDiscountRate: number;
  applyPromoCode: () => boolean;
  coffeeAdded: boolean;
  setCoffeeAdded: (value: boolean) => void;
  coffeePrice: number;
  notificationPhone: string;
  setNotificationPhone: (phone: string) => void;
  resetCheckout: () => void;
  resetKiosk: () => void;

  categorias: Categoria[];
  sabores: Sabor[];
  toppings: Topping[];
  pedidos: Pedido[];
  vendasHistorico: typeof diasVenda;
  establishment: EstablishmentSettings;

  isAdminLogged: boolean;
  setAdminLogged: (value: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      locale: 'es',
      setLocale: (locale) => set({ locale }),
      connectionStatus: 'connecting',
      setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
      lastSyncAt: null,
      hydrateRemoteState: (snapshot) => set({
        categorias: snapshot.categorias,
        sabores: snapshot.sabores,
        toppings: snapshot.toppings,
        pedidos: snapshot.pedidos,
        vendasHistorico: snapshot.vendasHistorico,
        establishment: snapshot.establishment,
        lastSyncAt: snapshot.updatedAt,
      }),

      currentScreen: 'hola',
      setScreen: (currentScreen) => set({ currentScreen }),
      selectedCategoria: null,
      setSelectedCategoria: (selectedCategoria) => set({
        selectedCategoria,
        selectedSabores: [],
        selectedToppings: [],
      }),
      selectedSabores: [],
      toggleSabor: (sabor) => {
        const state = get();
        const max = state.selectedCategoria?.maxSabores ?? 2;
        const exists = state.selectedSabores.find((item) => item.id === sabor.id);
        if (exists) {
          set({ selectedSabores: state.selectedSabores.filter((item) => item.id !== sabor.id) });
          return;
        }
        if (state.selectedSabores.length < max) {
          set({ selectedSabores: [...state.selectedSabores, sabor] });
        }
      },
      selectedToppings: [],
      toggleTopping: (topping) => {
        const state = get();
        const exists = state.selectedToppings.find((item) => item.id === topping.id);
        if (exists) {
          set({ selectedToppings: state.selectedToppings.filter((item) => item.id !== topping.id) });
          return;
        }
        if (state.selectedToppings.length < 5) {
          set({ selectedToppings: [...state.selectedToppings, topping] });
        }
      },
      carrinho: [],
      addToCarrinho: (item) => set({ carrinho: [...get().carrinho, item] }),
      removeFromCarrinho: (index) => {
        const carrinho = [...get().carrinho];
        carrinho.splice(index, 1);
        set({ carrinho });
      },
      clearCarrinho: () => set({
        carrinho: [],
        selectedSabores: [],
        selectedToppings: [],
        selectedCategoria: null,
      }),
      currentPedido: null,
      setCurrentPedido: (currentPedido) => set({ currentPedido }),
      metodoPago: 'efectivo',
      setMetodoPago: (metodoPago) => set({ metodoPago }),
      promoCode: '',
      setPromoCode: (promoCode) => set({ promoCode }),
      promoApplied: false,
      promoDiscountRate: 0,
      applyPromoCode: () => {
        const normalized = get().promoCode.trim().toUpperCase();
        const applied = normalized === DEMO_PROMO_CODE;
        set({
          promoApplied: applied,
          promoDiscountRate: applied ? DEMO_PROMO_RATE : 0,
        });
        return applied;
      },
      coffeeAdded: false,
      setCoffeeAdded: (coffeeAdded) => set({ coffeeAdded }),
      coffeePrice: defaultCheckoutState.coffeePrice,
      notificationPhone: '',
      setNotificationPhone: (notificationPhone) => set({ notificationPhone }),
      resetCheckout: () => set({
        promoCode: '',
        promoApplied: false,
        promoDiscountRate: 0,
        coffeeAdded: false,
        notificationPhone: '',
      }),
      resetKiosk: () => set({
        currentScreen: 'hola',
        selectedCategoria: null,
        selectedSabores: [],
        selectedToppings: [],
        carrinho: [],
        currentPedido: null,
        metodoPago: 'efectivo',
        promoCode: '',
        promoApplied: false,
        promoDiscountRate: 0,
        coffeeAdded: false,
        notificationPhone: '',
      }),

      categorias: cats,
      sabores: sabs,
      toppings: tops,
      pedidos: pedidosMock,
      vendasHistorico: diasVenda,
      establishment: establishmentMock,

      isAdminLogged: false,
      setAdminLogged: (isAdminLogged) => set({ isAdminLogged }),
    }),
    {
      name: 'tpv-sorveteria-storage',
      partialize: (state) => ({
        locale: state.locale,
        isAdminLogged: state.isAdminLogged,
      }),
    },
  ),
);
