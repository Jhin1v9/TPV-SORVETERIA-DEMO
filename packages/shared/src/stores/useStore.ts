import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CartItem,
  Categoria,
  DemoStateSnapshot,
  EstablishmentSettings,
  Locale,
  Pedido,
  Sabor,
  Topping,
  Product,
  ProductCategory,
  PerfilUsuario,
  Alergeno,
  Ingrediente,
  LoyaltyProfile,
} from '../types';
import { categorias as cats, sabores as sabs, toppings as tops, diasVenda, clientes } from '../data/mockData';
import { complementares, bundles } from '../data/revenueEngineData';
import { DEMO_PROMO_CODE, DEMO_PROMO_RATE, defaultCheckoutState } from '../utils/pricing';
import { criarLoyaltyProfileInicial, acumularPontos, resgatarPontos } from '../utils/loyalty';
import { ingredientes as ingredientesIniciais } from '../inventory/ingredientData';

interface AppState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  connectionStatus: 'connecting' | 'connected' | 'offline' | 'standalone';
  setConnectionStatus: (status: AppState['connectionStatus']) => void;
  lastSyncAt: string | null;
  hydrateRemoteState: (snapshot: DemoStateSnapshot) => void;

  productCategories: ProductCategory[];
  products: Product[];

  currentScreen: 'hola' | 'categorias' | 'sabores' | 'toppings' | 'carrinho' | 'pagamento' | 'confirmacao';
  setScreen: (screen: AppState['currentScreen']) => void;
  selectedCategoria: Categoria | null;
  setSelectedCategoria: (categoria: Categoria | null) => void;
  selectedSabores: Sabor[];
  toggleSabor: (sabor: Sabor) => void;
  selectedToppings: Topping[];
  toggleTopping: (topping: Topping) => void;
  carrinho: CartItem[];
  addToCarrinho: (item: CartItem) => void;
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
  clientes: typeof clientes;

  isAdminLogged: boolean;
  setAdminLogged: (value: boolean) => void;

  // ═══ FASE 5 — Revenue Engine ═══
  complementares: typeof complementares;
  bundles: typeof bundles;
  /** Desconto aplicado por bundle ativo (em €) */
  bundleDiscount: number;
  /** ID do bundle ativo no carrinho */
  activeBundleId: string | null;
  setBundleDiscount: (discount: number, bundleId: string | null) => void;

  // ═══ FASE 6 — Loyalty Program ═══
  loyalty: LoyaltyProfile;
  acumularPontosPedido: (valorPedido: number, pedidoId: string) => void;
  resgatarPontosCheckout: (pontos: number) => number;

  // ═══ FASE 7 — Auto-Ops ═══
  auto86Enabled: boolean;
  setAuto86Enabled: (value: boolean) => void;

  // ═══ FASE 10 — Ingredient-level Inventory ═══
  ingredientes: Ingrediente[];
  setIngredientes: (ingredientes: Ingrediente[]) => void;
  atualizarIngredienteStock: (id: string, delta: number) => void;

  // ═══ FASE 12 — AI-Driven Ops ═══
  dynamicPricingEnabled: boolean;
  setDynamicPricingEnabled: (value: boolean) => void;
  surgeMultiplier: number;
  setSurgeMultiplier: (value: number) => void;

  // ═══ FASE 15 — Favoritos + One-Tap Reorder ═══
  favoritos: string[];
  toggleFavorito: (productId: string) => void;
  isFavorito: (productId: string) => boolean;

  // Perfil do usuário (alergias + auth)
  perfilUsuario: PerfilUsuario | null;
  setPerfilUsuario: (perfil: PerfilUsuario | null) => void;
  atualizarAlergias: (alergias: Alergeno[]) => void;
  temAlergiaA: (alergeno: Alergeno) => boolean;
  logout: () => void;
  loginByPhone: (telefone: string) => PerfilUsuario | null;
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
        productCategories: snapshot.productCategories,
        products: snapshot.products,
        sabores: snapshot.sabores,
        ingredientes: snapshot.ingredientes ?? ingredientesIniciais,
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
        bundleDiscount: 0,
        activeBundleId: null,
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
      productCategories: [],
      products: [],
      sabores: sabs,
      toppings: tops,
      pedidos: [],
      vendasHistorico: diasVenda,
      clientes,
      establishment: { name: 'Tropicale', nif: 'B12345678', address: 'Calle Mayor 123', summerHours: '10:00-22:00', winterHours: '11:00-21:00' },
      complementares,
      bundles,
      bundleDiscount: 0,
      activeBundleId: null,
      setBundleDiscount: (bundleDiscount, activeBundleId) => set({ bundleDiscount, activeBundleId }),

      isAdminLogged: false,
      setAdminLogged: (isAdminLogged) => set({ isAdminLogged }),

      // ═══ FASE 6 — Loyalty Program ═══
      loyalty: criarLoyaltyProfileInicial(),

      // ═══ FASE 7 — Auto-Ops ═══
      auto86Enabled: true,
      setAuto86Enabled: (auto86Enabled) => set({ auto86Enabled }),

      // ═══ FASE 10 — Ingredient-level Inventory ═══
      ingredientes: ingredientesIniciais,
      setIngredientes: (ingredientes) => set({ ingredientes }),
      atualizarIngredienteStock: (id, delta) => {
        const state = get();
        set({
          ingredientes: state.ingredientes.map((ing) =>
            ing.id === id
              ? { ...ing, stock: Math.max(0, Number((ing.stock + delta).toFixed(3))) }
              : ing,
          ),
        });
      },

      // ═══ FASE 12 — AI-Driven Ops ═══
      dynamicPricingEnabled: true,
      setDynamicPricingEnabled: (value) => set({ dynamicPricingEnabled: value }),
      surgeMultiplier: 1.0,
      setSurgeMultiplier: (value) => set({ surgeMultiplier: value }),

      // ═══ FASE 15 — Favoritos + One-Tap Reorder ═══
      favoritos: [],
      toggleFavorito: (productId) => {
        const state = get();
        const isFav = state.favoritos.includes(productId);
        set({
          favoritos: isFav
            ? state.favoritos.filter((id) => id !== productId)
            : [...state.favoritos, productId],
        });
      },
      isFavorito: (productId) => get().favoritos.includes(productId),

      acumularPontosPedido: (valorPedido, pedidoId) => {
        const state = get();
        const novo = acumularPontos(state.loyalty, valorPedido, pedidoId, `Pedido #${pedidoId}`);
        set({ loyalty: novo });
      },
      resgatarPontosCheckout: (pontos) => {
        const state = get();
        const { novoProfile, descontoEuros } = resgatarPontos(state.loyalty, pontos);
        set({ loyalty: novoProfile });
        return descontoEuros;
      },

      perfilUsuario: null,
      setPerfilUsuario: (perfilUsuario) => set({ perfilUsuario }),
      atualizarAlergias: (alergias) => {
        const perfil = get().perfilUsuario;
        if (perfil) {
          set({
            perfilUsuario: {
              ...perfil,
              temAlergias: alergias.length > 0,
              alergias,
            },
          });
        }
      },
      temAlergiaA: (alergeno) => {
        const perfil = get().perfilUsuario;
        return perfil?.temAlergias && perfil.alergias.includes(alergeno) || false;
      },
      logout: () => set({ perfilUsuario: null, carrinho: [], loyalty: criarLoyaltyProfileInicial() }),
      loginByPhone: (telefone: string) => {
        const { findUserByPhone } = require('../lib/authMock');
        const user = findUserByPhone(telefone);
        if (user) {
          set({ perfilUsuario: user });
        }
        return user;
      },
    }),
    {
      name: 'tpv-sorveteria-storage',
      partialize: (state) => ({
        locale: state.locale,
        perfilUsuario: state.perfilUsuario,
        loyalty: state.loyalty,
        auto86Enabled: state.auto86Enabled,
        favoritos: state.favoritos,
        // NOTA DE SEGURANÇA: isAdminLogged NÃO é persistido.
        // O admin deve fazer login novamente ao recarregar a página.
      }),
    },
  ),
);
