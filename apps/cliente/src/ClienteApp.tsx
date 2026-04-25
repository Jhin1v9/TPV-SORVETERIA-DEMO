import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { useStore } from '@tpv/shared/stores/useStore';
import { useRealtimeSync } from '@tpv/shared';
import { t } from '@tpv/shared/i18n';
import { useIdleTimeout } from '@tpv/shared/hooks/useIdleTimeout';
import IdleTimeoutModal from '@tpv/shared/components/IdleTimeoutModal';
import CardapioPage from './pages/CardapioPage';
import CarrinhoPage from './pages/CarrinhoPage';
import PedidosPage from './pages/PedidosPage';
import ConfigPage from './pages/ConfigPage';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import { useOnboarding } from './hooks/useOnboarding';
import { syncPushSubscriptionForPerfil } from './lib/pushNotifications';

type ClienteTab = 'cardapio' | 'carrinho' | 'pedidos' | 'config';
const CLIENTE_LOGO_SRC = '/assets/logo/ChatGPT%20Image%2025%20abr%202026,%2008_46_42.png';

export default function ClienteApp({ onBack }: { onBack?: () => void } = {}) {
  useRealtimeSync();
  const { locale, perfilUsuario } = useStore();
  const [tab, setTab] = useState<ClienteTab>('cardapio');
  const onboarding = useOnboarding();
  const isOnboardingActive = onboarding.step !== 'complete';

  useEffect(() => {
    if (isOnboardingActive || !perfilUsuario) {
      return;
    }

    void syncPushSubscriptionForPerfil(perfilUsuario, {
      locale,
      requestPermission: false,
    }).catch((error) => {
      console.warn('[push] silent sync failed', error);
    });
  }, [isOnboardingActive, locale, perfilUsuario]);

  const tabs: { id: ClienteTab; label: string; icon: string }[] = [
    { id: 'cardapio', label: t('menu', locale), icon: '🍨' },
    { id: 'carrinho', label: t('cart', locale), icon: '🛒' },
    { id: 'pedidos', label: t('myOrders', locale), icon: '📋' },
    { id: 'config', label: t('settings', locale), icon: '⚙️' },
  ];

  // Idle timeout — só ativa quando onboarding está completo e usuário está no app
  const handleIdleTimeout = useCallback(() => {
    setTab('cardapio');
    // Não limpa carrinho no cliente — usuário pode querer retomar depois
  }, []);

  const { isWarningVisible, secondsRemaining, reset: resetIdle } = useIdleTimeout({
    idleTimeout: 30000,      // 30s de inatividade → mostra aviso
    warningTimeout: 10000,   // 10s para responder → reseta
    onTimeout: handleIdleTimeout,
    enabled: !isOnboardingActive,
  });

  return (
    <>
      {/* Modal de inatividade */}
      <IdleTimeoutModal
        visible={isWarningVisible}
        secondsRemaining={secondsRemaining}
        onContinue={resetIdle}
        onReset={handleIdleTimeout}
        appName="pedido"
      />

      {/* Onboarding fica por cima do app enquanto não estiver completo */}
      {isOnboardingActive && (
        <OnboardingFlow
          step={onboarding.step}
          returningUser={onboarding.returningUser}
          onGoToStep={onboarding.goToStep}
          onSkip={onboarding.skipOnboarding}
          onTutorialComplete={onboarding.skipOnboarding}
        />
      )}

      {/* App só renderiza quando onboarding está completo */}
      {!isOnboardingActive && (
        <div className="h-screen w-screen bg-[#F5F5F5] flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur border-b border-black/5 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
            {/* KIMI REVISAO OK TESTE EXAUSTIVO PRA PROCURAR BUGS — seta só aparece quando onBack existe; logo centralizada */}
            {onBack ? (
              <button onClick={onBack} className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center hover:bg-black/10 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <div className="w-10 h-10" aria-hidden="true" />
            )}
            <div className="flex flex-1 justify-center px-3">
              <img
                src={CLIENTE_LOGO_SRC}
                alt="Tropicale"
                className="h-12 w-auto max-w-[180px] object-contain"
              />
            </div>
            <div className="w-10" />
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto pb-20">
            <AnimatePresence mode="wait">
              {tab === 'cardapio' && (
                <motion.div key="cardapio" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <CardapioPage />
                </motion.div>
              )}
              {tab === 'carrinho' && (
                <motion.div key="carrinho" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <CarrinhoPage onNavigateToTab={setTab} />
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
                  <span id="cart-tab-btn" className="absolute inset-0" />
                )}
                {tItem.id === 'carrinho' && (
                  <CarrinhoBadge />
                )}
              </button>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

function CarrinhoBadge() {
  const { carrinho } = useStore();
  const total = carrinho.reduce((sum, item) => sum + item.quantity, 0);
  if (total === 0) return null;
  return (
    <motion.span
      key={total}
      initial={{ scale: 1.5 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 15 }}
      className="absolute -top-1 right-2 bg-[#FF6B9D] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
    >
      {total}
    </motion.span>
  );
}
