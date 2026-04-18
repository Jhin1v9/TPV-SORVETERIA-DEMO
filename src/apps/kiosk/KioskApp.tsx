import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../shared/stores/useStore';
import { broadcast } from '../../shared/utils/broadcast';
import { calcularPrecoItem, calcularTotalCarrinho, generateVeriFactuQR } from '../../shared/utils/calculos';
import type { Pedido } from '../../shared/types';
import HolaScreen from './screens/HolaScreen';
import CategoriasScreen from './screens/CategoriasScreen';
import SaboresScreen from './screens/SaboresScreen';
import ToppingsScreen from './screens/ToppingsScreen';
import CarrinhoScreen from './screens/CarrinhoScreen';
import PagamentoScreen from './screens/PagamentoScreen';
import ConfirmacaoScreen from './screens/ConfirmacaoScreen';

export default function KioskApp() {
  const { currentScreen, setScreen, addPedido, setCurrentPedido, clearCarrinho, resetKiosk } = useStore();
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inactivity timeout - 60s
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      if (currentScreen !== 'hola' && currentScreen !== 'confirmacao') {
        clearCarrinho();
        setScreen('hola');
      }
    }, 60000);
  }, [currentScreen, clearCarrinho, setScreen]);

  useEffect(() => {
    resetInactivityTimer();
    const events = ['click', 'touchstart', 'mousemove'];
    const handler = () => resetInactivityTimer();
    events.forEach((e) => window.addEventListener(e, handler));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivityTimer]);

  const handlePayment = (metodo: string) => {
    useStore.getState().setMetodoPago(metodo);

    // Simulate processing
    setTimeout(() => {
      const state = useStore.getState();
      const { iva, total } = calcularTotalCarrinho(state.carrinho);
      const novoNumero = state.pedidos.length + 1;

      const itensPedido = state.carrinho.map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        categoriaSku: item.categoria.id,
        categoriaNome: item.categoria.nome.es,
        sabores: item.sabores,
        toppings: item.toppings,
        precoUnitario: calcularPrecoItem(item.categoria, item.sabores, item.toppings),
        quantidade: 1,
      }));

      const pedido: Pedido = {
        id: `pedido-${Date.now()}`,
        numeroSequencial: novoNumero,
        status: 'pendiente',
        timestampCriacao: new Date().toISOString(),
        timestampListo: null,
        metodoPago: metodo as Pedido['metodoPago'],
        total,
        iva,
        verifactuQr: generateVeriFactuQR(`pedido-${Date.now()}`, total),
        clienteTelefone: null,
        itens: itensPedido,
      };

      addPedido(pedido);
      setCurrentPedido(pedido);

      // Broadcast to KDS
      broadcast.enviarPedido(pedido);

      // Decrement stock
      state.carrinho.forEach((item) => {
        item.sabores.forEach((sabor) => {
          const consumo = item.categoria.id === 'copo500' ? 0.1 : item.categoria.id === 'copo300' ? 0.052 : item.categoria.id === 'cone' ? 0.031 : 0.2;
          state.updateSaborStock(sabor.id, -consumo);
          broadcast.atualizarEstoque(sabor.id, Math.max(0, sabor.stockBaldes - consumo));
        });
      });

      setScreen('confirmacao');
    }, metodo === 'tarjeta' ? 3000 : 500);
  };

  const screenVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#FAFAFA] select-none">
      <AnimatePresence mode="wait">
        {currentScreen === 'hola' && (
          <motion.div key="hola" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <HolaScreen onSelectLang={() => setScreen('categorias')} />
          </motion.div>
        )}
        {currentScreen === 'categorias' && (
          <motion.div key="categorias" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <CategoriasScreen
              onBack={() => { clearCarrinho(); setScreen('hola'); }}
              onSelectCategoria={(cat) => { useStore.getState().setSelectedCategoria(cat); setScreen('sabores'); }}
            />
          </motion.div>
        )}
        {currentScreen === 'sabores' && (
          <motion.div key="sabores" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <SaboresScreen
              onBack={() => setScreen('categorias')}
              onContinue={() => setScreen('toppings')}
            />
          </motion.div>
        )}
        {currentScreen === 'toppings' && (
          <motion.div key="toppings" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <ToppingsScreen
              onBack={() => setScreen('sabores')}
              onContinue={() => setScreen('carrinho')}
            />
          </motion.div>
        )}
        {currentScreen === 'carrinho' && (
          <motion.div key="carrinho" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <CarrinhoScreen
              onBack={() => setScreen('toppings')}
              onPay={() => setScreen('pagamento')}
            />
          </motion.div>
        )}
        {currentScreen === 'pagamento' && (
          <motion.div key="pagamento" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <PagamentoScreen
              onBack={() => setScreen('carrinho')}
              onPay={handlePayment}
            />
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
