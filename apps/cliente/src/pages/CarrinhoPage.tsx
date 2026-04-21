import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
import { useClienteToast } from '../hooks/useClienteToast';
import { createRemoteOrder } from '@tpv/shared/realtime/client';
import { PagamentoModal, ProcessandoPagamento, ConfirmacaoPedido } from '../components/pagamento';
import type { PagamentoData } from '../components/pagamento';

export default function CarrinhoPage() {
  const { carrinho, removeFromCarrinho, locale, clearCarrinho, hydrateRemoteState } = useStore();
  const toast = useClienteToast();

  // Estados do fluxo de pagamento
  const [showPagamento, setShowPagamento] = useState(false);
  const [showProcessando, setShowProcessando] = useState(false);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [ultimoPedido, setUltimoPedido] = useState<{ numero: number; total: number; metodo: string } | null>(null);

  const total = carrinho.reduce((sum, item) => {
    const base = item.categoria.precoBase;
    const extras = item.sabores.reduce((s, sabor) => s + sabor.precoExtra, 0) + item.toppings.reduce((s, t) => s + t.preco, 0);
    return sum + base + extras;
  }, 0);

  const handleRemove = (index: number) => {
    removeFromCarrinho(index);
    toast.removedFromCart();
  };

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
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="font-display font-bold text-2xl mb-4">{t('yourOrder', locale)}</h2>

      <AnimatePresence mode="wait">
        {carrinho.length === 0 && !showConfirmacao ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-16 text-gray-400"
          >
            <motion.span
              className="text-6xl block mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🛒
            </motion.span>
            <p className="text-lg font-medium">{t('cartEmpty', locale)}</p>
            <p className="text-sm mt-2 opacity-70">{t('startOrder', locale)}</p>
          </motion.div>
        ) : (
          <motion.div
            key="items"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="space-y-3 mb-6">
              <AnimatePresence>
                {carrinho.map((item, idx) => (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex justify-between items-start overflow-hidden"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">{item.categoria.nome[locale] || item.categoria.nome.es}</p>
                      <p className="text-sm text-gray-500 truncate">{item.sabores.map((s) => s.nome[locale] || s.nome.es).join(', ')}</p>
                      {item.toppings.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1 truncate">+ {item.toppings.map((t) => t.nome[locale] || t.nome.es).join(', ')}</p>
                      )}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.8 }}
                      onClick={() => handleRemove(idx)}
                      className="text-red-400 hover:text-red-600 p-1 ml-2 flex-shrink-0"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {carrinho.length > 0 && (
              <>
                <motion.div
                  layout
                  className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('subtotal', locale)}</span>
                    <span className="font-medium">€{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">{t('iva', locale)}</span>
                    <span className="font-medium">€{(total * 0.10).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-black/5 pt-2 flex justify-between text-lg font-bold">
                    <span>{t('total', locale)}</span>
                    <span>€{(total * 1.10).toFixed(2)}</span>
                  </div>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleIniciarPagamento}
                  className="w-full mt-4 py-4 bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  {t('orderNow', locale)}
                </motion.button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
}
