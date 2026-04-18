import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../shared/stores/useStore';
import { broadcast } from '../../shared/utils/broadcast';
import { generateOrderNumber } from '../../shared/utils/calculos';
import type { Pedido, PedidoStatus } from '../../shared/types';

const statusColors: Record<PedidoStatus, string> = {
  pendiente: '#2196F3',
  preparando: '#FFC107',
  listo: '#4CAF50',
  entregado: '#9E9E9E',
  cancelado: '#F44336',
};

const statusLabels: Record<PedidoStatus, string> = {
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

function OrderTimer({ startTime }: { startTime: string }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
      setElapsed(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const isOverdue = elapsed > 300; // 5 minutes
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <span className={`font-mono font-bold text-3xl ${isOverdue ? 'text-red-400 animate-timer-blink' : 'text-white'}`}>
      {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
    </span>
  );
}

function OrderCard({ pedido, onStatusChange }: { pedido: Pedido; onStatusChange: (id: string, s: PedidoStatus) => void }) {
  const bgColor = statusColors[pedido.status];
  const isNew = pedido.status === 'pendiente';

  const nextStatus: Record<PedidoStatus, PedidoStatus | null> = {
    pendiente: 'preparando',
    preparando: 'listo',
    listo: 'entregado',
    entregado: null,
    cancelado: null,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, height: 0 }}
      className={`rounded-2xl p-5 relative overflow-hidden ${isNew ? 'animate-pulse-glow' : ''}`}
      style={{ backgroundColor: bgColor + '18', border: `2px solid ${bgColor}40` }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="font-mono text-4xl font-bold text-white">{generateOrderNumber(pedido.numeroSequencial)}</span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: bgColor }}
            />
            <span className="text-white/60 text-xs font-medium">{statusLabels[pedido.status]}</span>
          </div>
        </div>
        <OrderTimer startTime={pedido.timestampCriacao} />
      </div>

      {/* Items */}
      <div className="space-y-1.5 mb-4">
        {pedido.itens.map((item, idx) => (
          <div key={idx} className="text-white/80 text-sm">
            <span className="font-semibold">{item.quantidade}x</span>{' '}
            {item.categoriaNome}
            <span className="text-white/50"> — {item.sabores.map((s) => s.nome.es).join(', ')}</span>
            {item.toppings && item.toppings.length > 0 && (
              <span className="text-[#FFD700]/70 text-xs block ml-4">
                + {item.toppings.map((t) => t.nome).join(', ')}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      {nextStatus[pedido.status] && (
        <motion.button
          onClick={() => onStatusChange(pedido.id, nextStatus[pedido.status]!)}
          className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110"
          style={{ backgroundColor: bgColor }}
          whileTap={{ scale: 0.97 }}
        >
          {pedido.status === 'pendiente' && (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Preparar
            </>
          )}
          {pedido.status === 'preparando' && (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Listo
            </>
          )}
          {pedido.status === 'listo' && (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Entregar
            </>
          )}
        </motion.button>
      )}

      {/* Total */}
      <div className="mt-3 flex justify-between items-center">
        <span className="text-white/40 text-xs">{new Date(pedido.timestampCriacao).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
        <span className="font-mono font-bold text-white">€{pedido.total.toFixed(2)}</span>
      </div>
    </motion.div>
  );
}

export default function KDSApp({ onBack }: { onBack: () => void }) {
  const { pedidos, updatePedidoStatus } = useStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const prevPedidosRef = useRef(pedidos.length);

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for new orders
  useEffect(() => {
    const unsub = broadcast.onMessage((data: unknown) => {
      const msg = data as { tipo: string; dados?: Pedido };
      if (msg.tipo === 'novo_pedido' && soundEnabled) {
        playBeep();
      }
    });
    return unsub;
  }, [soundEnabled]);

  // Check for new pedidos
  useEffect(() => {
    if (pedidos.length > prevPedidosRef.current && soundEnabled) {
      playBeep();
    }
    prevPedidosRef.current = pedidos.length;
  }, [pedidos.length, soundEnabled]);

  const playBeep = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      setTimeout(() => {
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        setTimeout(() => osc.stop(), 200);
      }, 150);
    } catch {
      // Audio not supported
    }
  }, []);

  const handleStatusChange = (id: string, status: PedidoStatus) => {
    updatePedidoStatus(id, status);
    broadcast.atualizarStatus(id, status);
    if (status === 'listo' && soundEnabled) {
      // Double beep for ready
      playBeep();
      setTimeout(playBeep, 200);
    }
  };

  // Filter active orders (not delivered/cancelled)
  const activeOrders = pedidos.filter((p) => p.status !== 'entregado' && p.status !== 'cancelado');
  const queueCount = activeOrders.filter((p) => p.status === 'pendiente').length;

  return (
    <div className="h-screen w-screen bg-[#121212] flex flex-col kds-dark overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Cocina KDS</h1>
            <p className="text-white/40 text-xs">Sabadell Nord</p>
          </div>
        </div>

        {/* Digital clock */}
        <div className="font-mono text-3xl font-bold text-white">
          {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>

        <div className="flex items-center gap-4">
          {/* Queue indicator */}
          <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-xl">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-bold text-sm">{queueCount} en cola</span>
          </div>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              soundEnabled ? 'bg-[#4ECDC4]/20 text-[#4ECDC4]' : 'bg-white/10 text-white/40'
            }`}
          >
            {soundEnabled ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Orders grid */}
      <div className="flex-1 p-6 overflow-auto">
        {activeOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/20">
            <svg className="w-24 h-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="font-display text-2xl">Sin pedidos activos</p>
            <p className="text-sm mt-2">Los pedidos aparecerán aquí automáticamente</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {activeOrders
                .sort((a, b) => new Date(b.timestampCriacao).getTime() - new Date(a.timestampCriacao).getTime())
                .map((pedido) => (
                  <OrderCard
                    key={pedido.id}
                    pedido={pedido}
                    onStatusChange={handleStatusChange}
                  />
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom stats bar */}
      <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between text-white/40 text-xs">
        <div className="flex gap-6">
          <span>Pendientes: {pedidos.filter((p) => p.status === 'pendiente').length}</span>
          <span>Preparando: {pedidos.filter((p) => p.status === 'preparando').length}</span>
          <span>Listos: {pedidos.filter((p) => p.status === 'listo').length}</span>
        </div>
        <span>Total hoy: {pedidos.length} pedidos</span>
      </div>
    </div>
  );
}
