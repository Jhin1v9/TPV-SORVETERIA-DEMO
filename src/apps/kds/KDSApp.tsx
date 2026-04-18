import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../shared/stores/useStore';
import { updateRemoteOrderStatus } from '../../shared/realtime/client';
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
    const interval = window.setInterval(() => {
      const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
      setElapsed(diff);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [startTime]);

  const isOverdue = elapsed > 300;
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  return (
    <span className={`font-mono font-bold text-3xl ${isOverdue ? 'text-red-400 animate-timer-blink' : 'text-white'}`}>
      {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
    </span>
  );
}

function OrderCard({ pedido, onStatusChange }: { pedido: Pedido; onStatusChange: (id: string, status: PedidoStatus) => void }) {
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
      style={{ backgroundColor: `${bgColor}18`, border: `2px solid ${bgColor}40` }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="font-mono text-4xl font-bold text-white">{generateOrderNumber(pedido.numeroSequencial)}</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bgColor }} />
            <span className="text-white/60 text-xs font-medium">{statusLabels[pedido.status]}</span>
          </div>
        </div>
        <OrderTimer startTime={pedido.timestampCriacao} />
      </div>

      <div className="space-y-1.5 mb-4">
        {pedido.itens.map((item) => (
          <div key={item.id} className="text-white/80 text-sm">
            <span className="font-semibold">{item.quantidade}x</span>{' '}
            {item.categoriaNome}
            <span className="text-white/50"> - {item.sabores.map((sabor) => sabor.nome.es).join(', ')}</span>
            {item.toppings.length > 0 && (
              <span className="text-[#FFD700]/70 text-xs block ml-4">
                + {item.toppings.map((topping) => topping.nome).join(', ')}
              </span>
            )}
          </div>
        ))}
      </div>

      {nextStatus[pedido.status] && (
        <motion.button
          onClick={() => onStatusChange(pedido.id, nextStatus[pedido.status]!)}
          className="w-full py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:brightness-110"
          style={{ backgroundColor: bgColor }}
          whileTap={{ scale: 0.97 }}
        >
          {pedido.status === 'pendiente' && 'Preparar'}
          {pedido.status === 'preparando' && 'Listo'}
          {pedido.status === 'listo' && 'Entregar'}
        </motion.button>
      )}

      <div className="mt-3 flex justify-between items-center">
        <span className="text-white/40 text-xs">{new Date(pedido.timestampCriacao).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
        <span className="font-mono font-bold text-white">EUR {pedido.total.toFixed(2)}</span>
      </div>
    </motion.div>
  );
}

export default function KDSApp({ onBack }: { onBack: () => void }) {
  const { pedidos, hydrateRemoteState } = useStore();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const prevPedidosRef = useRef(pedidos.length);

  useEffect(() => {
    const interval = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

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
      window.setTimeout(() => {
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        window.setTimeout(() => osc.stop(), 200);
      }, 150);
    } catch {
      // Audio not supported.
    }
  }, []);

  const handleStatusChange = async (id: string, status: PedidoStatus) => {
    const response = await updateRemoteOrderStatus(id, status);
    hydrateRemoteState(response.snapshot);
    if (status === 'listo' && soundEnabled) {
      playBeep();
      window.setTimeout(playBeep, 200);
    }
  };

  const activeOrders = pedidos.filter((pedido) => pedido.status !== 'entregado' && pedido.status !== 'cancelado');
  const queueCount = activeOrders.filter((pedido) => pedido.status === 'pendiente').length;

  return (
    <div className="h-screen w-screen bg-[#121212] flex flex-col kds-dark overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-white">Cocina KDS</h1>
            <p className="text-white/40 text-xs">Sabadell Nord</p>
          </div>
        </div>

        <div className="font-mono text-3xl font-bold text-white">
          {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-xl">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-bold text-sm">{queueCount} en cola</span>
          </div>

          <button
            onClick={() => setSoundEnabled((current) => !current)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              soundEnabled ? 'bg-[#4ECDC4]/20 text-[#4ECDC4]' : 'bg-white/10 text-white/40'
            }`}
          >
            <span className="text-xs font-bold">{soundEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {activeOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/20">
            <svg className="w-24 h-24 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="font-display text-2xl">Sin pedidos activos</p>
            <p className="text-sm mt-2">Los pedidos llegaran aqui en tiempo real</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {activeOrders
                .sort((left, right) => new Date(right.timestampCriacao).getTime() - new Date(left.timestampCriacao).getTime())
                .map((pedido) => (
                  <OrderCard key={pedido.id} pedido={pedido} onStatusChange={handleStatusChange} />
                ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="px-6 py-3 border-t border-white/10 flex items-center justify-between text-white/40 text-xs">
        <div className="flex gap-6">
          <span>Pendientes: {pedidos.filter((pedido) => pedido.status === 'pendiente').length}</span>
          <span>Preparando: {pedidos.filter((pedido) => pedido.status === 'preparando').length}</span>
          <span>Listos: {pedidos.filter((pedido) => pedido.status === 'listo').length}</span>
        </div>
        <span>Total sesion: {pedidos.length} pedidos</span>
      </div>
    </div>
  );
}
