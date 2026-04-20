import { motion } from 'framer-motion';
import { useStore } from '../stores/useStore';
import { t } from '../i18n';

export default function LoadingApp() {
  const { locale } = useStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#FF6B9D] via-[#FFA07A] to-[#FFD700]">
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Ícone de sorvete pulsando */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center"
        >
          <svg viewBox="0 0 64 64" className="w-14 h-14" fill="none">
            <circle cx="32" cy="20" r="14" fill="#FF6B9D" opacity="0.8" />
            <path d="M18 24 Q32 52 46 24" fill="#D2691E" />
            <rect x="20" y="20" width="24" height="6" rx="3" fill="#8B4513" opacity="0.3" />
          </svg>
        </motion.div>

        {/* Anéis de loading */}
        <motion.div
          className="absolute inset-0 rounded-3xl border-2 border-white/40"
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-white font-medium text-lg drop-shadow"
      >
        {t('loading', locale)}
      </motion.p>

      {/* Barras de progresso animadas */}
      <div className="mt-4 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-white"
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}
