import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import TropicaleLogo from '@tpv/shared/components/TropicaleLogo';

interface WelcomeScreenProps {
  onStart: () => void;
  onSkip: () => void;
}

export default function WelcomeScreen({ onStart, onSkip }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] overflow-hidden"
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -20, 20],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        onClick={onSkip}
        className="absolute top-6 right-6 text-white/50 text-sm flex items-center gap-1 hover:text-white transition-colors"
      >
        Ya sé usar <ArrowRight size={14} />
      </motion.button>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-md w-full">
        {/* Logo area */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#2D8A4E] to-[#4CAF50] flex items-center justify-center mb-8 shadow-2xl shadow-[#2D8A4E]/30"
        >
          <TropicaleLogo size={52} className="text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl font-bold text-white mb-3 tracking-tight"
        >
          Heladería{' '}
          <span className="bg-gradient-to-r from-[#4CAF50] to-[#FF8C42] bg-clip-text text-transparent">
            Tropicale
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-white/60 text-base mb-2"
        >
          Sabadell, Cataluña
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-white/40 text-sm mb-12 flex items-center gap-1"
        >
          <Sparkles size={14} /> Gelato artesanal desde 1987
        </motion.p>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="relative w-full py-4 rounded-2xl bg-gradient-to-r from-[#2D8A4E] to-[#4CAF50] text-white font-bold text-lg shadow-lg shadow-[#2D8A4E]/40 hover:shadow-xl hover:shadow-[#2D8A4E]/50 transition-shadow"
        >
          <motion.span
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            COMENZAR
          </motion.span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-white/30 text-xs mt-4"
        >
          Sin instalación. Escanea y disfruta.
        </motion.p>
      </div>
    </motion.div>
  );
}
