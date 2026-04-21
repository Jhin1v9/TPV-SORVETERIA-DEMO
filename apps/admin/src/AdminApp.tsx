import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { useRealtimeSync } from '@tpv/shared';
import { t } from '@tpv/shared/i18n';
import type { Locale } from '@tpv/shared/types';
import LoginScreen from './pages/LoginScreen';
import EstoquePage from './pages/EstoquePage';
import PedidosPage from './pages/PedidosPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ConfigPage from './pages/ConfigPage';

type AdminPage = 'estoque' | 'pedidos' | 'analytics' | 'config';

function useNavItems(locale: Locale) {
  return [
    {
      id: 'estoque' as const,
      label: t('stock', locale),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'pedidos' as const,
      label: t('orders', locale),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'analytics' as const,
      label: t('analytics', locale),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'config' as const,
      label: t('config', locale),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];
}

export default function AdminApp({ onBack }: { onBack?: () => void } = {}) {
  useRealtimeSync();
  const { isAdminLogged, setAdminLogged, locale } = useStore();
  const [currentPage, setCurrentPage] = useState<AdminPage>('analytics');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navItems = useNavItems(locale);

  if (!isAdminLogged) {
    return <LoginScreen />;
  }

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="h-screen w-screen bg-[#F5F5F5] flex overflow-hidden">
      {/* Sidebar */}
      <div
        className={`bg-[#FF6B9D] flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/20">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
              <circle cx="16" cy="10" r="8" fill="#FF6B9D" opacity="0.9" />
              <path d="M8 14 Q16 36 24 14" fill="#D2691E" />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display text-lg font-bold text-white whitespace-nowrap">Tropicale</h1>
              <p className="text-white/60 text-xs whitespace-nowrap">Admin</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-all ${
                currentPage === item.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.icon}
              {!sidebarCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="py-4 border-t border-white/20 space-y-1">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {sidebarCollapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
            {!sidebarCollapsed && <span className="text-sm">{t('close', locale)}</span>}
          </button>

          <button
            onClick={() => { setAdminLogged(false); onBack?.(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!sidebarCollapsed && <span className="text-sm">{t('logout', locale)}</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <AnimatePresence mode="wait">
            {currentPage === 'estoque' && (
              <motion.div key="estoque" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <EstoquePage />
              </motion.div>
            )}
            {currentPage === 'pedidos' && (
              <motion.div key="pedidos" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <PedidosPage />
              </motion.div>
            )}
            {currentPage === 'analytics' && (
              <motion.div key="analytics" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <AnalyticsPage />
              </motion.div>
            )}
            {currentPage === 'config' && (
              <motion.div key="config" variants={pageVariants} initial="initial" animate="animate" exit="exit">
                <ConfigPage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
