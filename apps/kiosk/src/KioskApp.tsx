import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { createRemoteOrder } from '@tpv/shared/realtime/client';
import type { Produto, ProdutoPersonalizavel, ProdutoFixo } from '@tpv/shared/types';
import { isProdutoPersonalizavel } from '@tpv/shared/types';
import HolaScreen from './screens/HolaScreen';
import CardapioScreen from './screens/CardapioScreen';
import PersonalizacaoScreen from './screens/PersonalizacaoScreen';
import CarrinhoScreen from './screens/CarrinhoScreen';
import PagamentoScreen from './screens/PagamentoScreen';
import ConfirmacaoScreen from './screens/ConfirmacaoScreen';

type KioskScreen = 'hola' | 'cardapio' | 'personalizacao' | 'carrinho' | 'pagamento' | 'confirmacao';

interface CartItem {
  produto: Produto;
  quantidade: number;
  selecoes?: Record<string, unknown>;
  precoUnitario: number;
}

export default function KioskApp() {
  const { setScreen: _setScreen, setCurrentPedido, clearCarrinho, resetKiosk, connectionStatus, locale } = useStore();
  const [screen, setScreen] = useState<KioskScreen>('hola');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [produtoPersonalizando, setProdutoPersonalizando] = useState<ProdutoPersonalizavel | null>(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inactivity timeout
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      if (screen !== 'hola' && screen !== 'confirmacao') {
        setCart([]);
        setScreen('hola');
      }
    }, 60000);
  }, [screen]);

  useEffect(() => {
    resetInactivityTimer();
    const events = ['click', 'touchstart'];
    const handler = () => resetInactivityTimer();
    events.forEach((e) => window.addEventListener(e, handler));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivityTimer]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantidade, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.precoUnitario * item.quantidade, 0);

  const handleAddToCart = (produto: Produto, quantidade: number, selecoes?: Record<string, unknown>) => {
    const preco = 'preco' in produto ? produto.preco : produto.precoBase;
    setCart((prev) => {
      // Se já existe o mesmo produto, incrementa quantidade
      const existe = prev.find((item) => item.produto.id === produto.id);
      if (existe) {
        return prev.map((item) =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + quantidade }
            : item
        );
      }
      return [...prev, { produto, quantidade, selecoes, precoUnitario: preco }];
    });
  };

  const handlePersonalizar = (produto: Produto) => {
    if (isProdutoPersonalizavel(produto)) {
      setProdutoPersonalizando(produto);
      setScreen('personalizacao');
    }
  };

  const handleAddPersonalizado = (produto: ProdutoPersonalizavel, selecoes: Record<string, unknown>) => {
    let preco = produto.precoBase;
    Object.values(selecoes).forEach((lista: unknown) => {
      if (Array.isArray(lista)) {
        lista.forEach((o: { preco?: number; tipo?: string }) => {
          if (o.tipo === 'tamanho' && o.preco !== undefined) {
            preco = o.preco;
          } else if (o.preco) {
            preco += o.preco;
          }
        });
      }
    });

    setCart((prev) => {
      const existe = prev.find((item) => item.produto.id === produto.id);
      if (existe) {
        return prev.map((item) =>
          item.produto.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      return [...prev, { produto, quantidade: 1, selecoes, precoUnitario: preco }];
    });
    setProdutoPersonalizando(null);
    setScreen('cardapio');
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePayment = async (metodo: string) => {
    setPaymentError('');
    setPaymentBusy(true);

    try {
      // Convert cart to legacy format for createRemoteOrder
      const legacyCart = cart.map((item) => ({
        categoria: {
          id: item.produto.id,
          nome: item.produto.nome,
          precoBase: item.precoUnitario,
          maxSabores: 0,
          corHex: '#FF6B9D',
          ativo: true,
          ordem: 0,
          imagem: item.produto.imagem,
        },
        sabores: [],
        toppings: [],
      }));

      const response = await createRemoteOrder({
        cart: legacyCart as any,
        metodoPago: metodo as 'tarjeta' | 'efectivo' | 'bizum',
        checkout: {
          promoCode: '',
          promoApplied: false,
          promoDiscountRate: 0,
          coffeeAdded: false,
          coffeePrice: 1.5,
          notificationPhone: '',
        },
      });

      useStore.getState().hydrateRemoteState(response.snapshot);
      setCurrentPedido(response.pedido);
      setCart([]);
      setScreen('confirmacao');
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'No se pudo registrar el pedido');
    } finally {
      setPaymentBusy(false);
    }
  };

  const handleReset = () => {
    setCart([]);
    setProdutoPersonalizando(null);
    resetKiosk();
    setScreen('hola');
  };

  const variants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0a0a0f] select-none">
      {connectionStatus === 'connecting' && (
        <div className="absolute inset-x-0 top-0 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-slate-900">
          Conectando ao servidor...
        </div>
      )}
      {connectionStatus === 'offline' && (
        <div className="absolute inset-x-0 top-0 z-50 bg-red-500 px-4 py-2 text-center text-sm font-semibold text-white">
          Sin conexión — usando modo local
        </div>
      )}

      <AnimatePresence mode="wait">
        {screen === 'hola' && (
          <motion.div key="hola" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <HolaScreen onSelectLang={() => setScreen('cardapio')} />
          </motion.div>
        )}
        {screen === 'cardapio' && (
          <motion.div key="cardapio" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <CardapioScreen
              onBack={handleReset}
              onAddToCart={handleAddToCart}
              onPersonalizar={handlePersonalizar}
              onGoToCart={() => setScreen('carrinho')}
              cartCount={cartCount}
              cartTotal={cartTotal}
            />
          </motion.div>
        )}
        {screen === 'personalizacao' && produtoPersonalizando && (
          <motion.div key="personalizacao" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <PersonalizacaoScreen
              produto={produtoPersonalizando}
              locale={locale}
              onBack={() => { setProdutoPersonalizando(null); setScreen('cardapio'); }}
              onAddToCart={handleAddPersonalizado}
            />
          </motion.div>
        )}
        {screen === 'carrinho' && (
          <motion.div key="carrinho" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <CarrinhoScreen
              cart={cart}
              onBack={() => setScreen('cardapio')}
              onPay={() => setScreen('pagamento')}
              onRemove={handleRemoveFromCart}
              total={cartTotal}
            />
          </motion.div>
        )}
        {screen === 'pagamento' && (
          <motion.div key="pagamento" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <PagamentoScreen
              onBack={() => setScreen('carrinho')}
              onPay={handlePayment}
              busy={paymentBusy}
              errorMessage={paymentError}
            />
          </motion.div>
        )}
        {screen === 'confirmacao' && (
          <motion.div key="confirmacao" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <ConfirmacaoScreen onDone={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
