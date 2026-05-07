import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { calcularETA, formatarETA, progressoPedido } from '@tpv/shared';
import { Clock, CheckCircle2, Package, ChefHat, Truck } from 'lucide-react';
import type { Pedido, PedidoStatus } from '@tpv/shared/types';

interface OrderTrackerProps {
  pedido: Pedido;
}

const statusSteps: { status: PedidoStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'pendiente', label: 'Recibido', icon: <CheckCircle2 size={16} /> },
  { status: 'preparando', label: 'Preparando', icon: <ChefHat size={16} /> },
  { status: 'listo', label: 'Listo', icon: <Package size={16} /> },
  { status: 'entregado', label: 'Entregado', icon: <Truck size={16} /> },
];

export default function OrderTracker({ pedido }: OrderTrackerProps) {
  const { locale, pedidos } = useStore();
  const [eta, setEta] = useState(0);

  // Recalcula ETA a cada 30s
  useEffect(() => {
    const calc = () => {
      const fila = pedidos.filter((p) => p.status === 'pendiente' || p.status === 'preparando');
      setEta(calcularETA(pedido, fila));
    };
    calc();
    const interval = setInterval(calc, 30000);
    return () => clearInterval(interval);
  }, [pedido, pedidos]);

  const isActive = pedido.status !== 'entregado' && pedido.status !== 'cancelado';
  const progress = progressoPedido(pedido.status);
  const currentStepIndex = statusSteps.findIndex((s) => s.status === pedido.status);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 mb-4">
      {/* Header com ETA */}
      {isActive && eta > 0 && (
        <div className="flex items-center gap-2 mb-3 text-[#FF6B9D]">
          <Clock size={16} />
          <span className="text-sm font-bold">
            {locale === 'pt' ? 'Pronto em ~' : 'Listo en ~'}{formatarETA(eta, locale)}
          </span>
        </div>
      )}

      {/* Barra de progresso */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {statusSteps.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div key={step.status} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted
                    ? 'bg-emerald-500 text-white'
                    : isCurrent
                      ? 'bg-[#FF6B9D] text-white animate-pulse'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.icon}
              </div>
              <span
                className={`text-[10px] font-medium text-center ${
                  isCompleted || isCurrent ? 'text-gray-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
