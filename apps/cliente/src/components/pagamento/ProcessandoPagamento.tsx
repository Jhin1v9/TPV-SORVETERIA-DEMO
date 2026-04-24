import { motion } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
import type { MetodoPagamento } from './PagamentoModal';
import { CreditCard, Smartphone, Banknote, Wallet, Apple } from 'lucide-react';

interface ProcessandoPagamentoProps {
  metodo: MetodoPagamento;
  total: number;
  /** Mensagem extra (ex: "Conectando con Stripe...") */
  statusMessage?: string;
  /** Se está processando com gateway real vs simulando */
  isRealProcessing?: boolean;
}

export default function ProcessandoPagamento({
  metodo,
  total,
  statusMessage,
  isRealProcessing = false,
}: ProcessandoPagamentoProps) {
  const { locale } = useStore();

  const metodoConfig: Record<string, { icon: React.ReactNode; label: string; color: string; steps: string[] }> = {
    tarjeta: {
      icon: <CreditCard size={20} />,
      label: t('payCard', locale),
      color: 'from-blue-500 to-indigo-600',
      steps: [
        t('connectingGateway', locale),
        t('validatingPayment', locale),
        t('processing', locale),
        t('confirmingOrder', locale),
      ],
    },
    bizum: {
      icon: <Smartphone size={20} />,
      label: 'Bizum',
      color: 'from-emerald-500 to-teal-600',
      steps: [
        t('connectingBizum', locale),
        t('waitingConfirmation', locale),
        t('processing', locale),
        t('confirmingOrder', locale),
      ],
    },
    efectivo: {
      icon: <Banknote size={20} />,
      label: t('payCash', locale),
      color: 'from-amber-500 to-orange-600',
      steps: [
        t('registeringOrder', locale),
        t('generatingTicket', locale),
        t('confirmingOrder', locale),
      ],
    },
    apple_pay: {
      icon: <Apple size={20} />,
      label: 'Apple Pay',
      color: 'from-gray-800 to-black',
      steps: [
        t('connectingApplePay', locale),
        t('authenticating', locale),
        t('processing', locale),
        t('confirmingOrder', locale),
      ],
    },
    google_pay: {
      icon: <Wallet size={20} />,
      label: 'Google Pay',
      color: 'from-blue-600 to-cyan-500',
      steps: [
        t('connectingGooglePay', locale),
        t('authenticating', locale),
        t('processing', locale),
        t('confirmingOrder', locale),
      ],
    },
  };

  const config = metodoConfig[metodo] || metodoConfig.tarjeta;
  const steps = config.steps;

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

      {/* Hardware mock — adapta ao método de pagamento */}
      {metodo === 'tarjeta' || metodo === 'apple_pay' || metodo === 'google_pay' ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 mb-8"
        >
          <div className="w-40 h-52 bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl border border-gray-700 shadow-2xl flex flex-col items-center justify-center p-4">
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
                {isRealProcessing ? 'STRIPE-PROD' : 'TPV-SORV-001'}
              </motion.p>
            </div>
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
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-gray-700" />
        </motion.div>
      ) : metodo === 'bizum' ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 mb-8"
        >
          <div className="w-32 h-56 bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2rem] border border-gray-700 shadow-2xl flex flex-col items-center justify-center p-3">
            <div className="w-full h-36 bg-black rounded-xl mb-2 flex flex-col items-center justify-center overflow-hidden relative">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-emerald-400 text-2xl"
              >
                <Smartphone size={40} />
              </motion.div>
              <motion.p
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-emerald-400 text-[8px] font-mono mt-2"
              >
                BIZUM
              </motion.p>
            </div>
            <div className="w-8 h-1 rounded-full bg-gray-600" />
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 mb-8"
        >
          <div className="w-48 h-32 bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl border border-amber-500 shadow-2xl flex items-center justify-center p-4">
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-amber-100 text-center"
            >
              <Banknote size={48} className="mx-auto mb-1" />
              <p className="text-amber-100 text-[10px] font-mono">EFECTIVO</p>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Método info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-6 z-10"
      >
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.color} flex items-center justify-center text-white mx-auto mb-2 shadow-lg`}>
          {config.icon}
        </div>
        <p className="text-white font-bold text-lg">{config.label}</p>
        <p className="text-white/50 text-sm">€{total.toFixed(2)}</p>
        {statusMessage && (
          <p className="text-pink-400 text-xs mt-1 animate-pulse">{statusMessage}</p>
        )}
      </motion.div>

      {/* Progress steps */}
      <div className="w-full max-w-xs sm:max-w-sm space-y-3 z-10">
        {steps.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.6 }}
            className="flex items-center gap-3"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                backgroundColor: ['rgba(255,107,157,0.2)', 'rgba(255,107,157,0.8)', 'rgba(255,107,157,0.2)'],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              className="w-2 h-2 rounded-full bg-pink-500/30"
            />
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              className="text-white/70 text-sm"
            >
              {s}
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
        {isRealProcessing
          ? 'Procesado de forma segura via Stripe · PCI DSS Compliant'
          : t('hardwareMockNote', locale)}
      </motion.p>
    </div>
  );
}
