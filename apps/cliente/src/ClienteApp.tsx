import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
import CardapioPage from './pages/CardapioPage';
import CarrinhoPage from './pages/CarrinhoPage';
import PedidosPage from './pages/PedidosPage';
import ConfigPage from './pages/ConfigPage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';

type ClienteTab = 'cardapio' | 'carrinho' | 'pedidos' | 'config';

export default function ClienteApp({ onBack }: { onBack?: () => void } = {}) {
  const { locale } = useStore();
  const [tab, setTab] = useState<ClienteTab>('cardapio');
  const [showCarrinho, setShowCarrinho] = useState(false);

  const tabs: { id: ClienteTab; label: string; icon: string }[] = [
    { id: 'cardapio', label: t('menu', locale), icon: '🍨' },
    { id: 'carrinho', label: t('cart', locale), icon: '🛒' },
    { id: 'pedidos', label: t('myOrders', locale), icon: '📋' },
    { id: 'config', label: t('settings', locale), icon: '⚙️' },
  ];

  return (
    <>
      <OnboardingFlow />
      <div className="h-screen w-screen bg-[#F5F5F5] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-black/5 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-lg">Sabadell Nord</h1>
        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          {tab === 'cardapio' && (
            <motion.div key="cardapio" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <CardapioPage onOpenCarrinho={() => setShowCarrinho(true)} />
            </motion.div>
          )}
          {tab === 'carrinho' && (
            <motion.div key="carrinho" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <CarrinhoPage />
            </motion.div>
          )}
          {tab === 'pedidos' && (
            <motion.div key="pedidos" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <PedidosPage />
            </motion.div>
          )}
          {tab === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <ConfigPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Carrinho Drawer */}
      <AnimatePresence>
        {showCarrinho && (
          <CarrinhoDrawer
            onClose={() => setShowCarrinho(false)}
            onGoToPedidos={() => setTab('pedidos')}
          />
        )}
      </AnimatePresence>

      {/* Toast Provider */}
      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          style: {
            borderRadius: '16px',
            fontSize: '14px',
          },
        }}
      />

      {/* Bottom Nav com indicador animado */}
      <nav className="bg-white border-t border-black/5 px-2 py-2 flex justify-around items-center sticky bottom-0 z-30">
        {tabs.map((tItem) => (
          <button
            key={tItem.id}
            onClick={() => setTab(tItem.id)}
            className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${tab === tItem.id ? 'text-[#FF6B9D]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {tab === tItem.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute inset-0 bg-[#FF6B9D]/10 rounded-xl"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <motion.span
              className="text-lg relative z-10"
              animate={tab === tItem.id ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {tItem.icon}
            </motion.span>
            <span className="text-[10px] font-medium relative z-10">{tItem.label}</span>
            {tItem.id === 'carrinho' && (
              <CarrinhoBadge />
            )}
          </button>
        ))}
      </nav>
    </div>
    </>
  );
}

function CarrinhoBadge() {
  const { carrinho } = useStore();
  const total = carrinho.reduce((sum, item) => sum + item.sabores.length + item.toppings.length, 0);
  if (total === 0) return null;
  return (
    <span className="absolute -top-1 right-2 bg-[#FF6B9D] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
      {total}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// CarrinhoDrawer com fluxo completo de pagamento
// ═══════════════════════════════════════════════════════════

import { useCallback } from 'react';
import { PagamentoModal, ProcessandoPagamento, ConfirmacaoPedido } from './components/pagamento';
import type { PagamentoData } from './components/pagamento';
import { createRemoteOrder } from '@tpv/shared/realtime/client';
import { useClienteToast } from './hooks/useClienteToast';

function CarrinhoDrawer({ onClose, onGoToPedidos }: { onClose: () => void; onGoToPedidos: () => void }) {
  const { carrinho, removeFromCarrinho, locale, clearCarrinho, hydrateRemoteState } = useStore();
  const toast = useClienteToast();

  // Estados do fluxo de pagamento
  const [showPagamento, setShowPagamento] = useState(false);
  const [showProcessando, setShowProcessando] = useState(false);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [ultimoPedido, setUltimoPedido] = useState<{ numero: number; total: number; metodo: string } | null>(null);
  const [busy] = useState(false);

  const total = carrinho.reduce((sum, item) => {
    const base = item.categoria.precoBase;
    const extras = item.sabores.reduce((s, sabor) => s + sabor.precoExtra, 0) + item.toppings.reduce((s, t) => s + t.preco, 0);
    return sum + base + extras;
  }, 0);

  const handleIniciarPagamento = () => {
    if (carrinho.length === 0) return;
    setShowPagamento(true);
  };

  const handlePagamentoSubmit = useCallback(async (data: PagamentoData) => {
    setShowPagamento(false);
    setShowProcessando(true);

    // Simula processamento do TPV (2.5s de animação)
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      const response = await createRemoteOrder({
        cart: carrinho,
        metodoPago: data.metodo,
        checkout: {
          promoCode: '',
          promoApplied: false,
          promoDiscountRate: 0,
          coffeeAdded: false,
          coffeePrice: 1.5,
          notificationPhone: data.bizum?.telefono || '',
        },
      });

      hydrateRemoteState(response.snapshot);
      clearCarrinho();

      setUltimoPedido({
        numero: response.pedido.numeroSequencial,
        total: response.pedido.total,
        metodo: data.metodo,
      });

      setShowProcessando(false);
      setShowConfirmacao(true);
    } catch {
      setShowProcessando(false);
      toast.connectionError();
    }
  }, [carrinho, clearCarrinho, hydrateRemoteState, toast]);

  const handleConfirmacaoClose = () => {
    setShowConfirmacao(false);
    onClose();
    onGoToPedidos();
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
            <h2 className="font-display font-bold text-xl">{t('yourOrder', locale)}</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {carrinho.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <span className="text-6xl mb-4">🛒</span>
                <p className="text-lg font-medium">{t('cartEmpty', locale)}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {carrinho.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{item.categoria.nome[locale] || item.categoria.nome.es}</p>
                        <p className="text-sm text-gray-500">{item.sabores.map((s) => s.nome[locale] || s.nome.es).join(', ')}</p>
                        {item.toppings.length > 0 && (
                          <p className="text-xs text-gray-400 mt-1">+ {item.toppings.map((t) => t.nome[locale] || t.nome.es).join(', ')}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCarrinho(idx)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {carrinho.length > 0 && (
            <div className="border-t border-black/5 p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('subtotal', locale)}</span>
                <span className="font-medium">€{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('iva', locale)}</span>
                <span className="font-medium">€{(total * 0.10).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>{t('total', locale)}</span>
                <span>€{(total * 1.10).toFixed(2)}</span>
              </div>
              <button
                onClick={handleIniciarPagamento}
                disabled={busy}
                className="w-full py-4 bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
              >
                {t('orderNow', locale)}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Fluxo de pagamento overlay */}
      <AnimatePresence>
        {showPagamento && (
          <PagamentoModal
            total={total}
            onClose={() => setShowPagamento(false)}
            onSubmit={handlePagamentoSubmit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProcessando && (
          <ProcessandoPagamento metodo="tarjeta" total={total * 1.10} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmacao && ultimoPedido && (
          <ConfirmacaoPedido
            numeroPedido={ultimoPedido.numero}
            total={ultimoPedido.total}
            metodo={ultimoPedido.metodo as any}
            onClose={handleConfirmacaoClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}
