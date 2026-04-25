import { motion, AnimatePresence } from 'framer-motion';
import { Timer, RotateCcw, Hand } from 'lucide-react';

interface IdleTimeoutModalProps {
  visible: boolean;
  secondsRemaining: number;
  onContinue: () => void;
  onReset: () => void;
  appName?: string;
}

/**
 * Modal de aviso de inatividade — baseado em padrões QSR (McDonald's, IdealPOS, etc.)
 * - Mostra countdown visual
  * - Botão grande "Sí, continuar" para resetar
  * - Botão secundário "Reiniciar" para voltar ao início
  * - Se não responder em tempo, reseta automaticamente
  */
export default function IdleTimeoutModal({
  visible,
  secondsRemaining,
  onContinue,
  onReset,
  appName = 'pedido',
}: IdleTimeoutModalProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mx-4 w-full max-w-md rounded-3xl bg-gradient-to-b from-[#1a1a2e] to-[#0a0a0f] border border-white/10 p-8 shadow-2xl"
          >
            {/* Ícone animado */}
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5"
            >
              <Hand size={40} className="text-[#FF8C42]" />
            </motion.div>

            {/* Título */}
            <h2 className="text-center text-2xl font-bold text-white mb-2">
              ¿Sigues aquí?
            </h2>
            <p className="text-center text-white/50 text-sm mb-8">
              Tu {appName} se reiniciará si no respondes
            </p>

            {/* Countdown circular */}
            <div className="flex justify-center mb-8">
              <div className="relative flex items-center justify-center">
                {/* Círculo de fundo */}
                <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#FF8C42"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={264}
                    animate={{
                      strokeDashoffset: 264 * (1 - secondsRemaining / 10),
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
                {/* Número */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold text-white">
                    {secondsRemaining}
                  </span>
                  <span className="text-xs text-white/40">seg</span>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onContinue}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2D8A4E] to-[#4CAF50] text-white font-bold text-lg shadow-lg shadow-[#2D8A4E]/30 flex items-center justify-center gap-2"
              >
                <Hand size={20} />
                Sí, continuar
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="w-full py-3 rounded-2xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <RotateCcw size={18} />
                Reiniciar
              </motion.button>
            </div>

            {/* Hint */}
            <p className="text-center text-white/30 text-xs mt-6 flex items-center justify-center gap-1">
              <Timer size={12} />
              Toca cualquier botón para continuar
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
