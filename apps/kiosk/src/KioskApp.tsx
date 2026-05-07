import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { useRealtimeSync } from '@tpv/shared';
import { createRemoteOrder } from '@tpv/shared/realtime/client';
import { useOfflineStatus } from '@tpv/shared/offline';
import { useIdleTimeout } from '@tpv/shared/hooks/useIdleTimeout';
import IdleTimeoutModal from '@tpv/shared/components/IdleTimeoutModal';
import type { Produto, ProdutoPersonalizavel, Complementar } from '@tpv/shared/types';
import { isProdutoPersonalizavel, normalizeProdutoToProduct } from '@tpv/shared/types';
import { findComplementaresForProduct } from '@tpv/shared';
import UpsellModal from './components/UpsellModal';
import BundleScreen from './components/BundleScreen';
import AttractScreen from './screens/AttractScreen';
import HolaScreen from './screens/HolaScreen';
import LoginKioskScreen from './screens/LoginKioskScreen';
import CardapioScreen from './screens/CardapioScreen';
import PersonalizacaoScreen from './screens/PersonalizacaoScreen';
import CarrinhoScreen from './screens/CarrinhoScreen';
import PagamentoScreen from './screens/PagamentoScreen';
import ConfirmacaoScreen from './screens/ConfirmacaoScreen';
import CodigoAppScreen from './screens/CodigoAppScreen';

type KioskScreen = 'attract' | 'hola' | 'login' | 'cardapio' | 'personalizacao' | 'carrinho' | 'codigo' | 'pagamento' | 'confirmacao' | 'bundles';

export default function KioskApp() {
  useRealtimeSync();
  const offline = useOfflineStatus();
  const { setScreen: _setScreen, setCurrentPedido, clearCarrinho, resetKiosk, connectionStatus, locale } = useStore();
  const [screen, setScreen] = useState<KioskScreen>('attract');
  const [produtoPersonalizando, setProdutoPersonalizando] = useState<ProdutoPersonalizavel | null>(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [linkedCustomerId, setLinkedCustomerId] = useState<string | null>(null);
  const [linkedCustomerName, setLinkedCustomerName] = useState<string | null>(null);
  // Fase 5 — Upsell
  const [showUpsell, setShowUpsell] = useState(false);
  const [upsellComplementares, setUpsellComplementares] = useState<Complementar[]>([]);
  const pendingUpsellCallbackRef = useRef<(() => void) | null>(null);
  // Idle timeout com modal "¿Sigues aquí?"
  // Só ativa em telas interativas (não no attract nem confirmação)
  const idleEnabled = screen !== 'attract' && screen !== 'confirmacao';

  const handleIdleTimeout = useCallback(() => {
    clearCarrinho();
    setLinkedCustomerId(null);
    setLinkedCustomerName(null);
    setProdutoPersonalizando(null);
    setScreen('attract');
  }, [clearCarrinho]);

  const { isWarningVisible, secondsRemaining, reset: resetIdle } = useIdleTimeout({
    idleTimeout: 30000,      // 30s de inatividade → mostra aviso
    warningTimeout: 10000,   // 10s para responder → reseta
    onTimeout: handleIdleTimeout,
    enabled: idleEnabled,
  });

  const { carrinho, addToCarrinho, removeFromCarrinho } = useStore();
  const cartCount = carrinho.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = carrinho.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const { complementares } = useStore();

  const showUpsellForProduct = (produto: Produto, onDone: () => void) => {
    const comps = findComplementaresForProduct(produto, complementares, 3);
    if (comps.length === 0) {
      onDone();
      return;
    }
    setUpsellComplementares(comps);
    pendingUpsellCallbackRef.current = onDone;
    setShowUpsell(true);
  };

  const finishUpsell = useCallback(() => {
    const callback = pendingUpsellCallbackRef.current;
    pendingUpsellCallbackRef.current = null;
    setShowUpsell(false);
    setUpsellComplementares([]);
    callback?.();
  }, []);

  const handleAddToCart = (produto: Produto, quantidade: number) => {
    const preco = 'preco' in produto ? produto.preco : produto.precoBase;
    const product = normalizeProdutoToProduct(produto);

    showUpsellForProduct(produto, () => {
      addToCarrinho({
        product,
        quantity: quantidade,
        unitPrice: preco,
      });
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

    showUpsellForProduct(produto, () => {
      addToCarrinho({
        product,
        quantity: 1,
        selections,
        unitPrice: preco,
      });
      setProdutoPersonalizando(null);
      setScreen('cardapio');
    });
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
          customerId: linkedCustomerId || undefined,
        },
      });

      useStore.getState().hydrateRemoteState(response.snapshot);
      setCurrentPedido(response.pedido);

      // Fase 6 — Acumular pontos do pedido (se cliente vinculado)
      useStore.getState().acumularPontosPedido(response.pedido.total, response.pedido.id);

      clearCarrinho();
      setScreen('confirmacao');
    } catch (error) {
      setPaymentError(error instanceof Error ? error.message : 'No se pudo registrar el pedido');
    } finally {
      setPaymentBusy(false);
    }
  };

  const handleAddComplementar = (comp: Complementar) => {
    // Adiciona complementar como um produto fixo no carrinho
    const product = normalizeProdutoToProduct({
      id: comp.id,
      nome: comp.nome,
      preco: comp.preco,
      imagem: comp.imagem,
      categoria: 'para-llevar' as import('@tpv/shared/types').ProdutoCategoria,
      emEstoque: true,
      alergenos: [],
    } as import('@tpv/shared/types').ProdutoFixo);
    addToCarrinho({
      product,
      quantity: 1,
      unitPrice: comp.preco,
    });
  };

  const handleAddBundle = (bundle: import('@tpv/shared/types').Bundle) => {
    // Converte itens do bundle em CartItems
    for (const item of bundle.itens) {
      const produtoId = item.tipo === 'fixo' ? item.produtoId : item.opcaoSelecionada;
      if (!produtoId) continue;
      // Busca o produto nos dados locais
      const { todosProdutos } = require('@tpv/shared/data/produtosLocal');
      const produto = todosProdutos.find((p: Produto) => p.id === produtoId);
      if (!produto) continue;
      const preco = 'preco' in produto ? produto.preco : produto.precoBase ?? 0;
      const product = normalizeProdutoToProduct(produto);
      addToCarrinho({
        product,
        quantity: item.quantidade,
        unitPrice: preco,
      });
    }
    setScreen('carrinho');
  };

  const handleReset = () => {
    clearCarrinho();
    setProdutoPersonalizando(null);
    setLinkedCustomerId(null);
    setLinkedCustomerName(null);
    setShowUpsell(false);
    setUpsellComplementares([]);
    pendingUpsellCallbackRef.current = null;
    resetKiosk();
    setScreen('attract');
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
      {/* Fase 9 — Indicador offline do network monitor */}
      {!offline.isOnline && connectionStatus !== 'offline' && (
        <div className="absolute inset-x-0 top-0 z-50 bg-[#ffa502] px-4 py-2 text-center text-sm font-semibold text-white">
          {offline.isLieFi ? 'Conexión inestable' : 'Sin conexión — pedidos se guardarán automáticamente'}
        </div>
      )}
      {/* Fase 9 — Badge de pedidos pendentes */}
      {offline.pendingCount > 0 && (
        <div className="absolute top-10 right-4 z-50 bg-[#ffa502] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
          {offline.pendingCount} pedido{offline.pendingCount > 1 ? 's' : ''} pendiente{offline.pendingCount > 1 ? 's' : ''}
        </div>
      )}

      {/* Modal de inatividade */}
      <IdleTimeoutModal
        visible={isWarningVisible}
        secondsRemaining={secondsRemaining}
        onContinue={resetIdle}
        onReset={handleIdleTimeout}
        appName="pedido"
      />

      <AnimatePresence mode="wait">
        {screen === 'attract' && (
          <motion.div key="attract" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.5 }} className="h-full">
            <AttractScreen onTap={() => setScreen('hola')} />
          </motion.div>
        )}
        {screen === 'hola' && (
          <motion.div key="hola" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <HolaScreen
              onSelectLang={() => setScreen('cardapio')}
              onLogin={() => setScreen('login')}
            />
          </motion.div>
        )}
        {screen === 'login' && (
          <motion.div key="login" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <LoginKioskScreen
              onLogin={(id, nome) => {
                setLinkedCustomerId(id);
                setLinkedCustomerName(nome);
                setScreen('cardapio');
              }}
              onSkip={() => setScreen('cardapio')}
            />
          </motion.div>
        )}
        {screen === 'cardapio' && (
          <motion.div key="cardapio" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <CardapioScreen
              onBack={handleReset}
              onAddToCart={handleAddToCart}
              onPersonalizar={handlePersonalizar}
              onGoToCart={() => setScreen('carrinho')}
              onGoToBundles={() => setScreen('bundles')}
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
              onCodigo={() => setScreen('codigo')}
              onRemove={handleRemoveFromCart}
              total={cartTotal}
              linkedCustomerName={linkedCustomerName}
            />
          </motion.div>
        )}
        {screen === 'codigo' && (
          <motion.div key="codigo" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <CodigoAppScreen
              onBack={() => setScreen('carrinho')}
              onVinculado={(id, nome) => {
                setLinkedCustomerId(id);
                setLinkedCustomerName(nome);
                setScreen('carrinho');
              }}
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
        {screen === 'bundles' && (
          <motion.div key="bundles" variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.3 }} className="h-full">
            <BundleScreen
              bundles={useStore.getState().bundles}
              locale={locale}
              getProdutoById={(id) => {
                const { todosProdutos } = require('@tpv/shared/data/produtosLocal');
                return todosProdutos.find((p: Produto) => p.id === id);
              }}
              onBack={() => setScreen('cardapio')}
              onAddBundle={handleAddBundle}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fase 5 — Upsell Modal (overlay) */}
      <UpsellModal
        visible={showUpsell}
        complementares={upsellComplementares}
        locale={locale}
        onAdd={(comp) => {
          handleAddComplementar(comp);
          finishUpsell();
        }}
        onSkip={finishUpsell}
      />
    </div>
  );
}
