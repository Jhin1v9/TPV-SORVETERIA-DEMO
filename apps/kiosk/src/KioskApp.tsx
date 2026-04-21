import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { useRealtimeSync } from '@tpv/shared';
import { createRemoteOrder } from '@tpv/shared/realtime/client';
import type { Produto, ProdutoPersonalizavel } from '@tpv/shared/types';
import { isProdutoPersonalizavel, normalizeProdutoToProduct } from '@tpv/shared/types';
import HolaScreen from './screens/HolaScreen';
import CardapioScreen from './screens/CardapioScreen';
import PersonalizacaoScreen from './screens/PersonalizacaoScreen';
import CarrinhoScreen from './screens/CarrinhoScreen';
import PagamentoScreen from './screens/PagamentoScreen';
import ConfirmacaoScreen from './screens/ConfirmacaoScreen';

type KioskScreen = 'hola' | 'cardapio' | 'personalizacao' | 'carrinho' | 'pagamento' | 'confirmacao';

export default function KioskApp() {
  useRealtimeSync();
  const { setScreen: _setScreen, setCurrentPedido, clearCarrinho, resetKiosk, connectionStatus, locale } = useStore();
  const [screen, setScreen] = useState<KioskScreen>('hola');
  const [produtoPersonalizando, setProdutoPersonalizando] = useState<ProdutoPersonalizavel | null>(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inactivity timeout
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      if (screen !== 'hola' && screen !== 'confirmacao') {
        clearCarrinho();
        setScreen('hola');
      }
    }, 60000);
  }, [screen, clearCarrinho]);

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

  const { carrinho, addToCarrinho, removeFromCarrinho } = useStore();
  const cartCount = carrinho.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = carrinho.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const handleAddToCart = (produto: Produto, quantidade: number) => {
    const preco = 'preco' in produto ? produto.preco : produto.precoBase;
    const product = normalizeProdutoToProduct(produto);
    addToCarrinho({
      product,
      quantity: quantidade,
      unitPrice: preco,
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
    const selections: Record<string, import('@tpv/shared/types').OpcaoPersonalizacao[]> = {};

    Object.entries(selecoes).forEach(([key, lista]) => {
      if (Array.isArray(lista)) {
        selections[key] = lista.map((o: { id?: string; nome?: Record<string, string>; preco?: number; tipo?: string; emoji?: string }) => ({
          id: o.id ?? '',
          nome: (o.nome ?? { ca: '', es: '', pt: '', en: '' }) as unknown as import('@tpv/shared/types').LocalizedText,
          preco: o.preco ?? 0,
          tipo: (o.tipo ?? key) as import('@tpv/shared/types').OpcaoPersonalizacao['tipo'],
          emoji: o.emoji,
        }));
        lista.forEach((o: { tipo?: string; preco?: number }) => {
          if (o.tipo === 'tamanho' && o.preco !== undefined) {
            preco = o.preco;
          } else if (o.preco) {
            preco += o.preco;
          }
        });
      }
    });

    const product = normalizeProdutoToProduct(produto);
    addToCarrinho({
      product,
      quantity: 1,
      selections,
      unitPrice: preco,
    });
    setProdutoPersonalizando(null);
    setScreen('cardapio');
  };

  const handleRemoveFromCart = (index: number) => {
    removeFromCarrinho(index);
  };

  const handlePayment = async (metodo: string) => {
    setPaymentError('');
    setPaymentBusy(true);

    try {
      const response = await createRemoteOrder({
        cart: carrinho,
        metodoPago: metodo as 'tarjeta' | 'efectivo' | 'bizum',
        checkout: {
          promoCode: '',
          promoApplied: false,
          promoDiscountRate: 0,
          coffeeAdded: false,
          coffeePrice: 1.5,
          notificationPhone: '',
          origem: 'kiosk',
        },
      });

      useStore.getState().hydrateRemoteState(response.snapshot);
      setCurrentPedido(response.pedido);
      clearCarrinho();
      setScreen('confirmacao');
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'No se pudo registrar el pedido');
    } finally {
      setPaymentBusy(false);
    }
  };

  const handleReset = () => {
    clearCarrinho();
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
