import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../../shared/stores/useStore';
import { t } from '../../../shared/i18n';
import { generateOrderNumber, getEstimadedTime } from '../../../shared/utils/calculos';

function Confetti() {
  const particles = useMemo(() => {
    const colors = ['#FF6B9D', '#4ECDC4', '#FFD700', '#FFA07A', '#4CAF50', '#2196F3'];
    return Array.from({ length: 40 }, (_, index) => ({
      id: index,
      color: colors[index % colors.length],
      left: (index * 7) % 100,
      delay: (index % 5) * 0.15,
      duration: 2.4 + (index % 4) * 0.35,
      size: 6 + (index % 6),
      rotation: 45 * index,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-sm"
          style={{
            left: `${particle.left}%`,
            top: -20,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, ((particle.id % 3) - 1) * 40, 0],
            rotate: [0, particle.rotation, particle.rotation * 2],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export default function ConfirmacaoScreen({ onDone }: { onDone: () => void }) {
  const { locale, currentPedido, pedidos, notificationPhone } = useStore();
  const pedidosPendientes = pedidos.filter((pedido) => pedido.status === 'pendiente' || pedido.status === 'preparando').length;
  const estimado = getEstimadedTime(pedidosPendientes);

  useEffect(() => {
    const timer = window.setTimeout(onDone, 12000);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  const numeroPedido = currentPedido ? generateOrderNumber(currentPedido.numeroSequencial) : '#000';
  const verifactuData = currentPedido?.verifactuQr || '{}';

  return (
    <div className="h-full w-full bg-gradient-to-br from-[#4CAF50]/10 via-[#FAFAFA] to-[#4ECDC4]/10 flex flex-col items-center justify-center relative overflow-hidden">
      <Confetti />

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-24 h-24 bg-[#4CAF50] rounded-full flex items-center justify-center shadow-lg mb-6">
        <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>

      <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="font-display text-3xl font-bold text-gray-800 mb-2">
        {t('orderReady', locale)}
      </motion.h1>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mb-6">
        <p className="text-gray-400 text-sm mb-1">{t('orderNumber', locale)}</p>
        <p className="font-mono text-7xl font-bold text-[#FF6B9D]">{numeroPedido}</p>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="bg-white rounded-2xl p-4 shadow-md flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#FFA07A]/20 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-[#FFA07A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-400">{t('estimatedTime', locale)}</p>
          <p className="font-semibold text-gray-800">{t('minutes', locale, { min: estimado.min, max: estimado.max })}</p>
        </div>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} className="bg-white rounded-2xl p-4 shadow-md flex flex-col items-center mb-6">
        <QRCodeSVG value={verifactuData} size={100} level="M" />
        <p className="text-xs text-gray-400 mt-2">{t('scanVerify', locale)}</p>
      </motion.div>

      {notificationPhone && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.1 }} className="bg-white rounded-2xl px-5 py-4 shadow-md mb-8">
          <p className="text-sm text-gray-500">Aviso registrado para {notificationPhone}</p>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }} className="text-center">
        <p className="text-gray-400 text-sm">La pantalla volvera al inicio automaticamente</p>
        <button onClick={onDone} className="text-[#FF6B9D] text-sm font-semibold mt-2 hover:underline">
          Hacer otro pedido
        </button>
      </motion.div>
    </div>
  );
}
