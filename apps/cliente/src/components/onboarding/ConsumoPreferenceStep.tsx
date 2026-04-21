import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';

interface ConsumoPreferenceStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function ConsumoPreferenceStep({ onComplete, onBack }: ConsumoPreferenceStepProps) {
  const { locale } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] overflow-y-auto"
    >
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full flex flex-col justify-center">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="text-white/40 text-sm hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} /> {t('back', locale)}
          </button>
          <button
            onClick={onComplete}
            className="text-white/40 text-sm hover:text-white transition-colors"
          >
            {t('skip', locale)} →
          </button>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white mb-2"
        >
          {t('consumoTitle', locale)}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white/50 text-sm mb-8"
        >
          {t('consumoSubtitle', locale)}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <button
            onClick={onComplete}
            className="w-full group relative overflow-hidden rounded-2xl border-2 border-white/10 bg-white/5 p-6 text-left transition-all hover:border-[#FF6B9D]/50 hover:bg-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg">
                <UtensilsCrossed size={24} />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{t('consumoLocal', locale)}</p>
                <p className="text-sm text-white/50">{t('consumoLocalDesc', locale)}</p>
              </div>
              <ArrowRight
                size={20}
                className="ml-auto text-white/30 transition-colors group-hover:text-[#FF6B9D]"
              />
            </div>
          </button>

          <button
            onClick={onComplete}
            className="w-full group relative overflow-hidden rounded-2xl border-2 border-white/10 bg-white/5 p-6 text-left transition-all hover:border-[#FFA07A]/50 hover:bg-white/10"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{t('consumoViagem', locale)}</p>
                <p className="text-sm text-white/50">{t('consumoViagemDesc', locale)}</p>
              </div>
              <ArrowRight
                size={20}
                className="ml-auto text-white/30 transition-colors group-hover:text-[#FFA07A]"
              />
            </div>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
