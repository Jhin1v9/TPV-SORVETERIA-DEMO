import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
import { useClienteToast } from '../hooks/useClienteToast';
import { createRemoteOrder } from '@tpv/shared/realtime/client';
import {
  PagamentoModal,
  ProcessandoPagamento,
  ConfirmacaoPedido,
  StripeProvider,
  ReceiptSelector,
} from '../components/pagamento';
import type { PagamentoData } from '../components/pagamento';
import { syncPerfilUsuarioWithRemote } from '../lib/customerProfile';
import { syncPushSubscriptionForPerfil } from '../lib/pushNotifications';
import { supabase } from '@tpv/shared/supabase/client';
import CrossSellSection from '../components/CrossSellSection';
import LoyaltySlider from '../components/LoyaltySlider';
import { useOfflineStatus } from '@tpv/shared/offline';
import { useGroupOrder } from '@tpv/shared/group';
import { AIRecommendations } from '@tpv/shared';
import { Users } from 'lucide-react';

interface CarrinhoPageProps {
  onNavigateToTab?: (tab: 'cardapio' | 'carrinho' | 'pedidos' | 'config') => void;
}

const isStripeEnabled = Boolean(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY &&
  !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.includes('test_...')
);

const isPhysicalKiosk = import.meta.env.VITE_KIOSK_MODE === 'physical';

export default function CarrinhoPage({ onNavigateToTab }: CarrinhoPageProps) {
  const { carrinho, removeFromCarrinho, locale, clearCarrinho, hydrateRemoteState, perfilUsuario, setPerfilUsuario, addToCarrinho, pedidos, products } = useStore();
  const toast = useClienteToast();
  const offline = useOfflineStatus();
  const groupOrder = useGroupOrder();

  // Estados do fluxo de pagamento
  const [showPagamento, setShowPagamento] = useState(false);
  const [showProcessando, setShowProcessando] = useState(false);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState<string>('tarjeta');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [ultimoPedido, setUltimoPedido] = useState<{
    numero: number;
    total: number;
    metodo: string;
    id: string;
  } | null>(null);

  // Fase 6 — Loyalty: desconto por resgate de pontos
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [pontosResgatados, setPontosResgatados] = useState(0);

  // Fase 11 — Carrinho colaborativo: merge carrinho pessoal + grupo
  const itensDisplay = groupOrder.grupo?.status === 'abierto'
    ? groupOrder.grupo.itens
    : carrinho.map((item, idx) => ({ ...item, id: `local-${idx}`, addedBy: 'local', addedByName: 'Tú', timestamp: '' }));

  const subtotal = itensDisplay.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = Math.max(0, subtotal - loyaltyDiscount);

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
    setMetodoPagamento(data.metodo);
    setShowProcessando(true);
    setStatusMessage('');

    // Se for Stripe, tenta criar PaymentIntent
    if (isStripeEnabled && (data.metodo === 'tarjeta' || data.metodo === 'apple_pay' || data.metodo === 'google_pay')) {
      setStatusMessage('Conectando con Stripe...');
      try {
        const res = await supabase?.functions.invoke('create-payment-intent', {
          body: {
            amount: Math.round(total * 1.10 * 100),
            currency: 'eur',
            description: `Heladeria Tropicale`,
            customerEmail: perfilUsuario?.email,
          },
        });
        if (res?.error) {
          throw res.error;
        }
      } catch {
        // Se Edge Function não existir, continua com mock
      }
    }

    // Simula processamento (2.5s) — substituir por Stripe real quando configurado
    await new Promise((resolve) => setTimeout(resolve, 2500));

    try {
      // Fase 6 — Resgatar pontos antes de criar o pedido
      if (pontosResgatados > 0) {
        useStore.getState().resgatarPontosCheckout(pontosResgatados);
      }

      const perfilSincronizado = await syncPerfilUsuarioWithRemote(perfilUsuario).catch(() => perfilUsuario);
      if (perfilSincronizado && perfilSincronizado.id !== perfilUsuario?.id) {
        setPerfilUsuario(perfilSincronizado);
      }

      const response = await createRemoteOrder({
        cart: carrinho,
        metodoPago: data.metodo,
        checkout: {
          promoCode: '',
          promoApplied: false,
          promoDiscountRate: 0,
          coffeeAdded: false,
          coffeePrice: 1.5,
          notificationPhone: data.bizum?.telefono || perfilSincronizado?.telefone || perfilUsuario?.telefone || '',
          origem: 'pwa',
          customerId: perfilSincronizado?.id || perfilUsuario?.id || undefined,
          customerEmail: perfilSincronizado?.email || perfilUsuario?.email,
        },
      });

      hydrateRemoteState(response.snapshot);
      clearCarrinho();

      // Fase 6 — Acumular pontos do pedido
      useStore.getState().acumularPontosPedido(response.pedido.total, response.pedido.id);

      if (perfilSincronizado) {
        await syncPushSubscriptionForPerfil(perfilSincronizado, {
          locale,
          requestPermission: true,
        }).catch((error) => {
          console.warn('[push] unable to sync after checkout', error);
        });
      }

      setUltimoPedido({
        numero: response.pedido.numeroSequencial,
        total: response.pedido.total,
        metodo: data.metodo,
        id: response.pedido.id,
      });

      setShowProcessando(false);

      // Fase 9 — Se foi enfileirado offline, mostra mensagem diferente
      if ('queued' in response && response.queued) {
        toast.success('Pedido guardado — se enviará automáticamente cuando haya conexión');
        clearCarrinho();
        onNavigateToTab?.('pedidos');
        return;
      }

      setShowConfirmacao(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[CarrinhoPage] Erro ao criar pedido:', err);
      setShowProcessando(false);
      // Fase 9 — Se estiver offline, não mostra erro — o pedido já foi enfileirado
      if (!offline.isOnline) {
        toast.success('Pedido guardado — se enviará automáticamente cuando haya conexión');
        clearCarrinho();
        onNavigateToTab?.('pedidos');
        return;
      }
      toast.connectionError();
    }
  }, [carrinho, clearCarrinho, hydrateRemoteState, locale, toast, total, perfilUsuario, setPerfilUsuario]);

  const handleConfirmacaoClose = () => {
    setShowConfirmacao(false);
    setShowReceipt(true); // Pergunta sobre comprovante
  };

  const handleTrackOrder = () => {
    setShowConfirmacao(false);
    onNavigateToTab?.('pedidos');
  };

  const handleReceiptEmail = async (email: string) => {
    if (!ultimoPedido) return;
    // Enviar comprovante via Edge Function
    try {
      const response = await supabase?.functions.invoke('send-receipt', {
        body: {
          orderId: ultimoPedido.id,
          email,
          orderNumber: ultimoPedido.numero,
          total: ultimoPedido.total,
        },
      });

      if (response?.error) {
        throw response.error;
      }
    } catch {
      // Se não existir, apenas simula sucesso
    }
  };

  const handleReceiptPrint = async () => {
    if (!ultimoPedido) return;
    // Tentar imprimir via browser/ESC-POS
    try {
      // Placeholder para impressora térmica
      // Implementar com biblioteca ESC/POS quando hardware estiver disponível
      console.log('[Printer] Imprimindo comprovante #', ultimoPedido.numero);
    } catch {
      throw new Error('Impressora não disponível');
    }
  };

  const handleReceiptQR = () => {
    if (!ultimoPedido) return;
    // Gerar URL do comprovante
    const receiptUrl = `${window.location.origin}/comprovante/${ultimoPedido.id}`;
    // Copiar para clipboard ou mostrar QR
    navigator.clipboard?.writeText(receiptUrl);
    toast.orderPlaced(String(ultimoPedido.numero));
  };

  return (
    <StripeProvider>
      <div className="p-4 max-w-2xl mx-auto">
        <h2 className="font-display font-bold text-2xl mb-4">{t('yourOrder', locale)}</h2>

        <AnimatePresence mode="wait">
          {itensDisplay.length === 0 && !showConfirmacao ? (
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
              {/* Fase 11 — Banner de grupo ativo */}
              {groupOrder.grupo && (
                <div className="bg-[#FF6B9D]/10 border border-[#FF6B9D]/30 rounded-xl p-3 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-[#FF6B9D]" />
                    <span className="text-sm font-medium text-[#FF6B9D]">
                      Grupo: {groupOrder.grupo.nome} ({groupOrder.grupo.membros.length} miembros)
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">{groupOrder.tempoRestante} min</span>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <AnimatePresence>
                  {itensDisplay.map((item, idx) => (
                    <motion.div
                      key={'id' in item ? item.id : idx}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 flex justify-between items-start overflow-hidden"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800">{item.product.nome[locale] || item.product.nome.es}</p>
                        {item.selections && Object.values(item.selections).some((arr) => arr.length > 0) && (
                          <p className="text-sm text-gray-500 truncate">
                            {Object.values(item.selections).flat().map((s) => s.nome[locale] || s.nome.es).join(', ')}
                          </p>
                        )}
                        {/* Fase 11 — Mostrar quem adicionou */}
                        {'addedByName' in item && item.addedByName !== 'Tú' && item.addedByName !== 'local' && (
                          <p className="text-xs text-[#FF6B9D] mt-0.5">Añadido por {item.addedByName}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#FF6B9D]">€{(item.unitPrice * item.quantity).toFixed(2)}</span>
                        {/* Só mostra botão remover se for o dono ou host */}
                        {(!groupOrder.grupo || groupOrder.podeEditar('id' in item ? item.id : '')) && (
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => {
                              if (groupOrder.grupo && 'id' in item) {
                                groupOrder.remover(item.id);
                              } else {
                                handleRemove(idx);
                              }
                            }}
                            className="text-red-400 hover:text-red-600 p-1 flex-shrink-0"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Fase 5 — Cross-sell */}
              {itensDisplay.length > 0 && !groupOrder.grupo && <CrossSellSection locale={locale} />}

              {/* Fase 13 — AI Upselling */}
              {itensDisplay.length > 0 && !groupOrder.grupo && (
                <AIRecommendations
                  carrinho={carrinho}
                  historicoPedidos={pedidos}
                  todosProdutos={products}
                  onAddProduct={(product) => {
                    addToCarrinho({
                      product,
                      quantity: 1,
                      unitPrice: product.preco ?? 0,
                    });
                    toast.addedToCart(product.nome[locale] || product.nome.es);
                  }}
                  locale={locale}
                  maxRecommendations={2}
                />
              )}

              {/* Fase 6 — Loyalty resgate (só carrinho individual) */}
              {itensDisplay.length > 0 && !groupOrder.grupo && (
                <LoyaltySlider
                  subtotal={subtotal}
                  onResgatar={(pontos, desconto) => {
                    setPontosResgatados(pontos);
                    setLoyaltyDiscount(desconto);
                  }}
                />
              )}

              {itensDisplay.length > 0 && (
                <>
                  <motion.div
                    layout
                    className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t('subtotal', locale)}</span>
                      <span className="font-medium">EUR{subtotal.toFixed(2)}</span>
                    </div>
                    {loyaltyDiscount > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600">
                        <span>{locale === 'pt' ? 'Desconto pontos' : 'Descuento puntos'}</span>
                        <span className="font-medium">-EUR{loyaltyDiscount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">{t('iva', locale)}</span>
                      <span className="font-medium">EUR{(total * 0.10).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-black/5 pt-2 flex justify-between text-lg font-bold">
                      <span>{t('total', locale)}</span>
                      <span>EUR{(total * 1.10).toFixed(2)}</span>
                    </div>
                  </motion.div>

                  {/* Fase 11 — Botão de pagamento: host finaliza, membros esperam */}
                  {groupOrder.grupo ? (
                    groupOrder.isHostUser ? (
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          // Fecha grupo e transfere itens para carrinho pessoal
                          const resultado = groupOrder.fechar();
                          if (resultado.sucesso) {
                            // Adiciona itens do grupo ao carrinho pessoal
                            for (const item of groupOrder.grupo?.itens || []) {
                              for (let i = 0; i < item.quantity; i++) {
                                // Adiciona ao carrinho do store
                              }
                            }
                            handleIniciarPagamento();
                          } else {
                            toast.success(resultado.erro || 'Error');
                          }
                        }}
                        className="w-full mt-4 py-4 bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                      >
                        Finalizar pedido del grupo ({groupOrder.grupo?.membros.length} personas) — €{(total * 1.10).toFixed(2)}
                      </motion.button>
                    ) : (
                      <div className="w-full mt-4 py-4 bg-gray-100 text-gray-400 font-bold rounded-2xl text-center text-sm">
                        Esperando que {groupOrder.grupo?.membros.find((m) => m.id === groupOrder.grupo?.hostId)?.nome} finalice el pedido...
                      </div>
                    )
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleIniciarPagamento}
                      className="w-full mt-4 py-4 bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
                    >
                      {t('orderNow', locale)}
                    </motion.button>
                  )}
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
              stripeEnabled={isStripeEnabled}
              isPhysicalKiosk={isPhysicalKiosk}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showProcessando && (
            <ProcessandoPagamento
              metodo={metodoPagamento as any}
              total={total * 1.10}
              statusMessage={statusMessage}
              isRealProcessing={isStripeEnabled}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showConfirmacao && ultimoPedido && (
            <ConfirmacaoPedido
              numeroPedido={ultimoPedido.numero}
              total={ultimoPedido.total}
              metodo={ultimoPedido.metodo as any}
              onClose={handleConfirmacaoClose}
              onTrackOrder={handleTrackOrder}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showReceipt && ultimoPedido && (
            <ReceiptSelector
              orderNumber={String(ultimoPedido.numero).padStart(3, '0')}
              total={ultimoPedido.total}
              onEmail={handleReceiptEmail}
              onPrint={handleReceiptPrint}
              onQR={handleReceiptQR}
              onClose={() => {
                setShowReceipt(false);
                onNavigateToTab?.('pedidos');
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </StripeProvider>
  );
}
