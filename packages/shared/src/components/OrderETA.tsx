/**
 * ═══ FASE 17 — Order ETA ═══
 * Componente visual para exibir tempo estimado de preparo
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap } from 'lucide-react';
import { calcularETA, formatarETA } from '../utils/etaEngine';
import type { Pedido } from '../types';

interface OrderETAProps {
  pedido: Pedido;
  filaKDS: Pedido[];
  locale?: string;
  size?: 'sm' | 'md' | 'lg';
  showProgress?: boolean;
}

export default function OrderETA({
  pedido,
  filaKDS,
  locale = 'es',
  size = 'md',
  showProgress = true,
}: OrderETAProps) {
  const eta = useMemo(() => calcularETA(pedido, filaKDS), [pedido, filaKDS]);

  const statusProgress = {
    pendiente: 0.1,
    preparando: 0.5,
    listo: 1.0,
    entregado: 1.0,
    cancelado: 0,
  };

  const progress = statusProgress[pedido.status] ?? 0;
  const isReady = pedido.status === 'listo' || pedido.status === 'entregado';
  const isUrgent = eta <= 5 && !isReady && pedido.status !== 'cancelado';

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-3 py-1.5',
    lg: 'text-sm px-4 py-2',
  };

  const iconSizes = {
    sm: 10,
    md: 14,
    lg: 16,
  };

  const textos = {
    es: { ready: '¡Listo!', eta: 'ETA' },
    pt: { ready: 'Pronto!', eta: 'ETA' },
    en: { ready: 'Ready!', eta: 'ETA' },
    ca: { ready: 'Llest!', eta: 'ETA' },
  };

  const t = textos[locale as keyof typeof textos] || textos.es;

  if (isReady) {
    return (
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 font-bold ${sizeClasses[size]}`}
      >
        <Zap size={iconSizes[size]} className="fill-emerald-500" />
        {t.ready}
      </motion.div>
    );
  }

  if (pedido.status === 'cancelado') {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full bg-red-100 text-red-600 font-bold ${sizeClasses[size]}`}>
        ❌ Cancelado
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 rounded-full font-bold ${sizeClasses[size]} ${
          isUrgent
            ? 'bg-amber-100 text-amber-700'
            : 'bg-blue-100 text-blue-700'
        }`}
      >
        <Clock size={iconSizes[size]} />
        {t.eta}: {formatarETA(eta, locale)}
      </span>

      {showProgress && (
        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              progress >= 0.5 ? 'bg-emerald-500' : 'bg-blue-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </div>
  );
}
