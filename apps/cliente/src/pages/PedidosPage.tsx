import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
import { Clock, CheckCircle2, Package, ChevronRight, Receipt } from 'lucide-react';
import type { Pedido, PedidoStatus } from '@tpv/shared/types';
import PedidoDetalhesPage from './PedidoDetalhesPage';

type PedidoTab = 'ativos' | 'historial';

const statusConfig: Record<
  PedidoStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  pendiente: {
    label: 'Pendiente',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: <Clock size={14} />,
  },
  preparando: {
    label: 'Preparando',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    icon: <Package size={14} />,
  },
  listo: {
    label: '¡Listo!',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    icon: <CheckCircle2 size={14} />,
  },
  entregado: {
    label: 'Entregado',
    color: 'text-gray-500',
    bg: 'bg-gray-50',
    icon: <CheckCircle2 size={14} />,
  },
  cancelado: {
    label: 'Cancelado',
    color: 'text-red-500',
    bg: 'bg-red-50',
    icon: <Receipt size={14} />,
  },
};

function PedidoCard({ pedido, onClick }: { pedido: Pedido; onClick: () => void }) {
  const status = statusConfig[pedido.status];
  const isActive = pedido.status !== 'entregado' && pedido.status !== 'cancelado';

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-white rounded-2xl p-4 shadow-sm border border-black/5 text-left flex items-center gap-4"
    >
      {/* Status icon */}
      <div className={`w-12 h-12 rounded-xl ${status.bg} flex items-center justify-center shrink-0`}>
        <span className={status.color}>{status.icon}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono font-bold text-gray-800">
            #{pedido.numeroSequencial.toString().padStart(3, '0')}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
            {status.label}
          </span>
          {isActive && (
            <span className="w-2 h-2 rounded-full bg-[#FF6B9D] animate-pulse" />
          )}
        </div>
        <p className="text-sm text-gray-500 truncate">
          {pedido.itens.length} productos · €{pedido.total.toFixed(2)}
        </p>
        <p className="text-xs text-gray-400">
          {new Date(pedido.timestampCriacao).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight size={18} className="text-gray-300 shrink-0" />
    </motion.button>
  );
}

export default function PedidosPage() {
  const { pedidos, locale, perfilUsuario } = useStore();
  const [tab, setTab] = useState<PedidoTab>('ativos');
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null);

  const meusPedidos = perfilUsuario?.telefone
    ? pedidos.filter((p) => p.clienteTelefone === perfilUsuario.telefone)
    : [];

  const pedidosAtivos = meusPedidos.filter(
    (p) => p.status !== 'entregado' && p.status !== 'cancelado'
  );

  const pedidosHistorial = meusPedidos.filter(
    (p) => p.status === 'entregado' || p.status === 'cancelado'
  );

  const pedidosExibidos = tab === 'ativos' ? pedidosAtivos : pedidosHistorial;

  // Se tem pedido selecionado, mostra detalhes
  if (pedidoSelecionado) {
    return (
      <PedidoDetalhesPage
        pedido={pedidoSelecionado}
        onBack={() => setPedidoSelecionado(null)}
      />
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="font-display font-bold text-2xl mb-4">{t('myOrders', locale)}</h2>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl p-1 mb-4 shadow-sm border border-black/5">
        {(['ativos', 'historial'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-[#FF6B9D] text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t === 'ativos' ? 'Activos' : 'Historial'}
            {t === 'ativos' && pedidosAtivos.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                {pedidosAtivos.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {pedidosExibidos.length === 0 ? (
          <motion.div
            key={`empty-${tab}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-16 text-gray-400"
          >
            <span className="text-6xl">{tab === 'ativos' ? '⏳' : '📜'}</span>
            <p className="text-lg font-medium mt-4">
              {tab === 'ativos' ? 'No tienes pedidos activos' : 'Sin historial de pedidos'}
            </p>
            <p className="text-sm mt-2 opacity-70">
              {tab === 'ativos'
                ? 'Haz tu primer pedido desde el menú'
                : 'Los pedidos completados aparecerán aquí'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`list-${tab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {pedidosExibidos
              .sort((a, b) => new Date(b.timestampCriacao).getTime() - new Date(a.timestampCriacao).getTime())
              .map((pedido) => (
                <PedidoCard
                  key={pedido.id}
                  pedido={pedido}
                  onClick={() => setPedidoSelecionado(pedido)}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
