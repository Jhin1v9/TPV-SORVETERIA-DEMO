import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '@tpv/shared/stores/useStore';
import { generateOrderNumber, getEstimadedTime } from '@tpv/shared/utils/calculos';
import { Clock, PartyPopper, RotateCcw } from 'lucide-react';

function Confetti() {
  const particles = useMemo(() => {
    const colors = ['#FF6B9D', '#4ECDC4', '#FFD700', '#FFA07A', '#4CAF50', '#2196F3'];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      left: (i * 7) % 100,
      delay: (i % 5) * 0.15,
      duration: 2.4 + (i % 4) * 0.35,
      size: 6 + (i % 6),
      rotation: 45 * i,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, ((p.id % 3) - 1) * 40, 0],
            rotate: [0, p.rotation, p.rotation * 2],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export default function ConfirmacaoScreen({ onDone }: { onDone: () => void }) {
  const { currentPedido, pedidos } = useStore();
  const pedidosPendientes = pedidos.filter((p) => p.status === 'pendiente' || p.status === 'preparando').length;
  const estimado = getEstimadedTime(pedidosPendientes);

  useEffect(() => {
    const timer = window.setTimeout(onDone, 15000);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  const numeroPedido = currentPedido ? generateOrderNumber(currentPedido.numeroSequencial) : '#000';
  const verifactuData = currentPedido?.verifactuQr || '{}';

  return (
    <div className="h-full w-full bg-[#0a0a0f] flex flex-col items-center justify-center relative overflow-hidden">
      <Confetti />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#4CAF50]/20 to-transparent blur-3xl"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center px-8 max-w-lg w-full">
        {/* Success icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-28 h-28 bg-gradient-to-br from-[#4CAF50] to-[#66BB6A] rounded-full flex items-center justify-center shadow-2xl shadow-[#4CAF50]/30 mb-6"
        >
          <PartyPopper size={48} className="text-white" />
        </motion.div>

        {/* Order number */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <p className="text-white/40 text-lg mb-2">¡Pedido confirmado!</p>
          <p className="font-mono text-8xl font-bold text-white tracking-wider">{numeroPedido}</p>
        </motion.div>

        {/* Estimado */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex items-center gap-4 mb-4"
        >
          <div className="w-12 h-12 bg-[#FFA07A]/10 rounded-xl flex items-center justify-center">
            <Clock size={24} className="text-[#FFA07A]" />
          </div>
          <div>
            <p className="text-white/40 text-sm">Tiempo estimado</p>
            <p className="font-semibold text-lg text-white">{estimado.min} - {estimado.max} min</p>
          </div>
        </motion.div>

        {/* QR */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 flex flex-col items-center mb-6"
        >
          <QRCodeSVG value={verifactuData} size={140} level="M" bgColor="transparent" fgColor="#ffffff" />
          <p className="text-white/30 text-sm mt-2">Escanea para verificar</p>
        </motion.div>

        {/* Reset CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <p className="text-white/20 text-base mb-3">La pantalla se reiniciará automáticamente</p>
          <motion.button
            onClick={onDone}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3 rounded-2xl bg-white/10 text-white font-semibold text-lg flex items-center gap-2 hover:bg-white/20 transition-colors"
          >
            <RotateCcw size={20} />
            Nuevo pedido
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
