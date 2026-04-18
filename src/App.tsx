import { useEffect, useState } from 'react';
import { broadcast, listenLocalStorage } from './shared/utils/broadcast';
import KioskApp from './apps/kiosk/KioskApp';
import KDSApp from './apps/kds/KDSApp';
import AdminApp from './apps/admin/AdminApp';
import './App.css';

type AppMode = 'selector' | 'kiosk' | 'kds' | 'admin';

function AppSelector({ onSelect }: { onSelect: (mode: AppMode) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B9D] via-[#FFA07A] to-[#FFD700] flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-3xl shadow-lg flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-12 h-12" fill="none">
              <circle cx="32" cy="20" r="14" fill="#FF6B9D" opacity="0.8" />
              <path d="M18 24 Q32 52 46 24" fill="#D2691E" />
              <rect x="20" y="20" width="24" height="6" rx="3" fill="#8B4513" opacity="0.3" />
            </svg>
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-2 drop-shadow-lg">
            Sabadell Nord
          </h1>
          <p className="text-white/80 text-lg">Sistema TPV - Demo Offline</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => onSelect('kiosk')}
            className="group bg-white/95 backdrop-blur rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B9D] to-[#FFA07A] flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Kiosk Cliente</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Terminal touch para clientes fazerem pedidos. Interface intuitiva com seleção de sabores e pagamento.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[#FF6B9D] font-semibold text-sm">
              Abrir app
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => onSelect('kds')}
            className="group bg-white/95 backdrop-blur rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#121212] to-[#2D3436] flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-[#4ECDC4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Cozinha KDS</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Kitchen Display System para gerenciar pedidos em tempo real. Timer, status e notificações.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[#2D3436] font-semibold text-sm">
              Abrir app
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </button>

          <button
            onClick={() => onSelect('admin')}
            className="group bg-white/95 backdrop-blur rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-left"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4ECDC4] to-[#2196F3] flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Painel administrativo com estoque, analytics, pedidos e configurações da sorveteria.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[#4ECDC4] font-semibold text-sm">
              Abrir app
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/60 text-sm">
            Sorveteria Sabadell Nord &copy; 2026 · Demo Offline First
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState<AppMode>('selector');

  useEffect(() => {
    broadcast.initialize();
    const unlisten = listenLocalStorage((data) => {
      // Cross-tab sync handled by individual apps
      console.log('[TPV] Cross-tab message:', data);
    });
    return () => {
      broadcast.destroy();
      unlisten();
    };
  }, []);

  if (mode === 'selector') {
    return <AppSelector onSelect={setMode} />;
  }

  if (mode === 'kiosk') return <KioskApp />;
  if (mode === 'kds') return <KDSApp onBack={() => setMode('selector')} />;
  if (mode === 'admin') return <AdminApp onBack={() => setMode('selector')} />;

  return null;
}

export default App;
