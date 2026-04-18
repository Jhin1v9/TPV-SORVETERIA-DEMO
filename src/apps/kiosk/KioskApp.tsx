import { useEffect, useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../shared/stores/useStore';
import { createRemoteOrder } from '../../shared/realtime/client';
import HolaScreen from './screens/HolaScreen';
import CategoriasScreen from './screens/CategoriasScreen';
import SaboresScreen from './screens/SaboresScreen';
import ToppingsScreen from './screens/ToppingsScreen';
import CarrinhoScreen from './screens/CarrinhoScreen';
import PagamentoScreen from './screens/PagamentoScreen';
import ConfirmacaoScreen from './screens/ConfirmacaoScreen';

export default function KioskApp() {
  const {
    currentScreen,
    setScreen,
    setCurrentPedido,
    clearCarrinho,
    resetKiosk,
    connectionStatus,
  } = useStore();
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      if (useStore.getState().currentScreen !== 'hola' && useStore.getState().currentScreen !== 'confirmacao') {
        useStore.getState().clearCarrinho();
        useStore.getState().resetCheckout();
        useStore.getState().setScreen('hola');
      }
    }, 60000);
  }, []);

  useEffect(() => {
    resetInactivityTimer();
    const events = ['click', 'touchstart', 'mousemove'];
    const handler = () => resetInactivityTimer();
    events.forEach((eventName) => window.addEventListener(eventName, handler));
    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, handler));
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [resetInactivityTimer]);

  const handlePayment = async (metodo: string) => {
    const state = useStore.getState();
    state.setMetodoPago(metodo);
    setPaymentError('');
    setPaymentBusy(true);

    try {
      const response = await createRemoteOrder({
        cart: state.carrinho,
        metodoPago: metodo as 'tarjeta' | 'efectivo' | 'bizum',
        checkout: {
          promoCode: state.promoCode,
          promoApplied: state.promoApplied,
          promoDiscountRate: state.promoDiscountRate,
          coffeeAdded: state.coffeeAdded,
          coffeePrice: state.coffeePrice,
          notificationPhone: state.notificationPhone,
        },
      });

      useStore.getState().hydrateRemoteState(response.snapshot);
      setCurrentPedido(response.pedido);
      setScreen('confirmacao');
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'No se pudo registrar el pedido');
    } finally {
      setPaymentBusy(false);
    }
  };

  const screenVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAFAFA] select-none">
      {connectionStatus === 'connecting' && (
        <div className="absolute inset-x-0 top-0 z-50 bg-amber-400 px-4 py-2 text-center text-sm font-semibold text-slate-900">
          Esperando conexao com o servidor da demo...
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentScreen === 'hola' && (
          <motion.div key="hola" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <HolaScreen onSelectLang={() => setScreen('categorias')} />
          </motion.div>
        )}
        {currentScreen === 'categorias' && (
          <motion.div key="categorias" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <CategoriasScreen
              onBack={() => {
                clearCarrinho();
                useStore.getState().resetCheckout();
                setScreen('hola');
              }}
              onSelectCategoria={(cat) => {
                useStore.getState().setSelectedCategoria(cat);
                setScreen('sabores');
              }}
            />
          </motion.div>
        )}
        {currentScreen === 'sabores' && (
          <motion.div key="sabores" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <SaboresScreen onBack={() => setScreen('categorias')} onContinue={() => setScreen('toppings')} />
          </motion.div>
        )}
        {currentScreen === 'toppings' && (
          <motion.div key="toppings" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <ToppingsScreen
              onBack={() => setScreen('sabores')}
              onContinue={() => {
                const state = useStore.getState();
                if (!state.selectedCategoria || state.selectedSabores.length === 0) {
                  setScreen('sabores');
                  return;
                }

                state.addToCarrinho({
                  categoria: state.selectedCategoria,
                  sabores: state.selectedSabores,
                  toppings: state.selectedToppings,
                });
                state.setSelectedCategoria(null);
                state.resetCheckout();
                setScreen('carrinho');
              }}
            />
          </motion.div>
        )}
        {currentScreen === 'carrinho' && (
          <motion.div key="carrinho" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <CarrinhoScreen onBack={() => setScreen('toppings')} onPay={() => setScreen('pagamento')} />
          </motion.div>
        )}
        {currentScreen === 'pagamento' && (
          <motion.div key="pagamento" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <PagamentoScreen onBack={() => setScreen('carrinho')} onPay={handlePayment} busy={paymentBusy} errorMessage={paymentError} />
          </motion.div>
        )}
        {currentScreen === 'confirmacao' && (
          <motion.div key="confirmacao" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <ConfirmacaoScreen onDone={resetKiosk} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
