import { motion } from 'framer-motion';
import { PartyPopper, ClipboardCheck, Clock, MapPin } from 'lucide-react';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
import type { MetodoPagamento } from './PagamentoModal';

interface ConfirmacaoPedidoProps {
  numeroPedido: number;
  total: number;
  metodo: MetodoPagamento;
  onClose: () => void;
  onTrackOrder?: () => void;
}

export default function ConfirmacaoPedido({ numeroPedido, total, metodo, onClose, onTrackOrder }: ConfirmacaoPedidoProps) {
  const { locale } = useStore();

  const metodoInfo = {
    tarjeta: { icon: '💳', label: t('payCard', locale), color: 'from-blue-500 to-indigo-600' },
    bizum: { icon: '📱', label: t('payBizum', locale), color: 'from-emerald-500 to-teal-600' },
    efectivo: { icon: '💶', label: t('payCash', locale), color: 'from-amber-500 to-orange-600' },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-gradient-to-b from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] flex flex-col items-center justify-center px-6"
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-pink-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100 - Math.random() * 200],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Success animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="relative mb-6"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-xl shadow-pink-500/30"
        >
          <PartyPopper size={40} className="text-white" />
        </motion.div>
        {/* Ring */}
        <motion.div
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full border-2 border-pink-500/50"
        />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-white text-2xl font-bold text-center mb-2"
      >
        {t('orderConfirmed', locale)}! 🎉
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-white/50 text-sm text-center mb-8"
      >
        {t('orderConfirmedDesc', locale)}
      </motion.p>

      {/* Order number card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm sm:max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 mb-4"
      >
        <div className="text-center mb-4">
          <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">{t('yourOrderNumber', locale)}</p>
          <motion.p
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, delay: 0.9 }}
            className="text-white text-5xl font-black tracking-wider"
          >
            #{numeroPedido}
          </motion.p>
        </div>

        <div className="space-y-2 border-t border-white/10 pt-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <ClipboardCheck size={14} />
              {t('paymentMethod', locale)}
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${metodoInfo[metodo].color} flex items-center justify-center text-[10px]`}>
                {metodoInfo[metodo].icon}
              </div>
              <span className="text-white text-xs font-medium">{metodoInfo[metodo].label}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Clock size={14} />
              {t('estimatedTime', locale)}
            </div>
            <span className="text-white text-xs font-medium">10-15 min</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <MapPin size={14} />
              {t('pickupAt', locale)}
            </div>
            <span className="text-white text-xs font-medium">Heladería Tropicale</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <span className="text-white/50 text-xs">{t('total', locale)}</span>
            <span className="text-pink-400 font-bold">€{total.toFixed(2)}</span>
          </div>
        </div>
      </motion.div>

      {/* QR placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="w-full max-w-sm sm:max-w-md bg-white rounded-xl p-3 flex items-center gap-3 mb-6"
      >
        <div className="w-14 h-14 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
          <div className="grid grid-cols-5 gap-0.5">
            {[...Array(25)].map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-[1px] ${Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'}`} />
            ))}
          </div>
        </div>
        <div>
          <p className="text-gray-800 text-xs font-semibold">{t('showAtCounter', locale)}</p>
          <p className="text-gray-400 text-[10px]">{t('qrCodeDesc', locale)}</p>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (onTrackOrder) onTrackOrder();
          else onClose();
        }}
        className="w-full max-w-sm sm:max-w-md py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
      >
        {t('trackMyOrder', locale)}
      </motion.button>
    </motion.div>
  );
}
