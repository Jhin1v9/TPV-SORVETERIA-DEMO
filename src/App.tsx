import { useState } from 'react';
import KioskApp from './apps/kiosk/KioskApp';
import KDSApp from './apps/kds/KDSApp';
import AdminApp from './apps/admin/AdminApp';
import { getDemoServerUrl } from './shared/realtime/client';
import { useRealtimeSync } from './shared/realtime/useRealtimeSync';
import { useStore } from './shared/stores/useStore';
import './App.css';

type AppMode = 'selector' | 'kiosk' | 'kds' | 'admin';

function ConnectionBadge() {
  const { connectionStatus, lastSyncAt } = useStore();

  const palette = {
    connected: 'bg-emerald-500 text-white',
    connecting: 'bg-amber-400 text-slate-900',
    offline: 'bg-red-500 text-white',
  } as const;

  const label = {
    connected: 'Realtime conectado',
    connecting: 'Conectando...',
    offline: 'Sin conexion',
  } as const;

  return (
    <div className="fixed right-4 top-4 z-[100] flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 shadow-lg backdrop-blur">
      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${palette[connectionStatus].split(' ')[0]}`} />
      <div className="text-right">
        <p className="text-xs font-semibold text-slate-700">{label[connectionStatus]}</p>
        <p className="text-[11px] text-slate-500">
          {lastSyncAt ? `Sync ${new Date(lastSyncAt).toLocaleTimeString('es-ES')}` : getDemoServerUrl()}
        </p>
      </div>
    </div>
  );
}

function AppSelector({ onSelect }: { onSelect: (mode: AppMode) => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B9D] via-[#FFA07A] to-[#FFD700] flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
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
          <p className="text-white/80 text-lg">Demo conectada em tempo real para tablet, notebook e telefone</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: 'kiosk' as const,
              title: 'Kiosk Cliente',
              description: 'Terminal touch para criar pedidos e enviar a sessao compartilhada em tempo real.',
              gradient: 'from-[#FF6B9D] to-[#FFA07A]',
            },
            {
              id: 'kds' as const,
              title: 'Cocina KDS',
              description: 'Fila operacional conectada ao backend local, com atualizacao imediata de status.',
              gradient: 'from-[#121212] to-[#2D3436]',
            },
            {
              id: 'admin' as const,
              title: 'Admin Dashboard',
              description: 'Operacao, estoque e reset de demo sobre a mesma fonte de verdade compartilhada.',
              gradient: 'from-[#4ECDC4] to-[#2196F3]',
            },
          ].map((card) => (
            <button
              key={card.id}
              onClick={() => onSelect(card.id)}
              className="group bg-white/95 backdrop-blur rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 text-left"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <span className="text-white font-display text-lg">{card.title.split(' ')[0]}</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-gray-800 mb-2">{card.title}</h2>
              <p className="text-gray-500 text-sm leading-relaxed">{card.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState<AppMode>('selector');
  useRealtimeSync();

  return (
    <>
      <ConnectionBadge />
      {mode === 'selector' && <AppSelector onSelect={setMode} />}
      {mode === 'kiosk' && <KioskApp />}
      {mode === 'kds' && <KDSApp onBack={() => setMode('selector')} />}
      {mode === 'admin' && <AdminApp onBack={() => setMode('selector')} />}
    </>
  );
}

export default App;
