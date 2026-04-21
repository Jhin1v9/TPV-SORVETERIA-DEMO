import { motion } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
import type { MetodoPagamento } from './PagamentoModal';

interface ProcessandoPagamentoProps {
  metodo: MetodoPagamento;
  total: number;
}

export default function ProcessandoPagamento({ metodo, total }: ProcessandoPagamentoProps) {
  const { locale } = useStore();
  const steps = [
    { key: 'connecting', label: t('connecting', locale), duration: 0.8 },
    { key: 'validating', label: t('validatingPayment', locale), duration: 1.2 },
    { key: 'processing', label: t('processing', locale), duration: 1.5 },
    { key: 'confirming', label: t('confirmingOrder', locale), duration: 1.0 },
  ];

  const metodoIcon = {
    tarjeta: '💳',
    bizum: '📱',
    efectivo: '💶',
  };

  const metodoLabel = {
    tarjeta: t('payCard', locale),
    bizum: t('payBizum', locale),
    efectivo: t('payCash', locale),
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[#0a0a0f] flex flex-col items-center justify-center px-6">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Terminal/Hardware mock */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mb-8"
      >
        <div className="w-40 h-52 bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl border border-gray-700 shadow-2xl flex flex-col items-center justify-center p-4">
          {/* Screen */}
          <div className="w-full h-28 bg-black rounded-xl mb-3 flex flex-col items-center justify-center overflow-hidden relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full mb-2"
            />
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-pink-400 text-[8px] font-mono"
            >
              TPV-SORV-001
            </motion.p>
          </div>
          {/* Keypad dots */}
          <div className="grid grid-cols-3 gap-1.5">
            {[...Array(9)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                className="w-2 h-2 rounded-full bg-gray-600"
              />
            ))}
          </div>
          {/* NFC area */}
          <div className="mt-2 w-12 h-8 border border-gray-600 rounded-lg flex items-center justify-center">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-gray-500 text-[6px]"
            >
              NFC
            </motion.div>
          </div>
        </div>
        {/* Cable */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-gray-700" />
      </motion.div>

      {/* Método info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-6 z-10"
      >
        <p className="text-3xl mb-1">{metodoIcon[metodo]}</p>
        <p className="text-white font-bold text-lg">{metodoLabel[metodo]}</p>
        <p className="text-white/50 text-sm">€{total.toFixed(2)}</p>
      </motion.div>

      {/* Progress steps */}
      <div className="w-full max-w-xs sm:max-w-sm space-y-3 z-10">
        {steps.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * s.duration * 0.6 }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                backgroundColor: ['rgba(255,107,157,0.2)', 'rgba(255,107,157,0.8)', 'rgba(255,107,157,0.2)'],
              }}
              transition={{ duration: s.duration, repeat: Infinity, delay: i * 0.3 }}
              className="w-2 h-2 rounded-full bg-pink-500/30"
            />
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: s.duration, repeat: Infinity, delay: i * 0.3 }}
              className="text-white/70 text-sm"
            >
              {s.label}
            </motion.p>
          </motion.div>
        ))}
      </div>

      {/* Hardware integration note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 text-white/20 text-[10px] text-center z-10"
      >
        {t('hardwareMockNote', locale)}
      </motion.p>
    </div>
  );
}
