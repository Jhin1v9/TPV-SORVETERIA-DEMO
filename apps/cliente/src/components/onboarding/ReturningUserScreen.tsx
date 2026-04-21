import { motion } from 'framer-motion';
import { User, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useStore } from '@tpv/shared/stores/useStore';

interface ReturningUserScreenProps {
  userName: string;
  onContinue: () => void;
  onNewAccount: () => void;
}

export default function ReturningUserScreen({ userName, onContinue, onNewAccount }: ReturningUserScreenProps) {
  const { locale } = useStore();

  const texts = {
    ca: {
      welcomeBack: 'Hola de nou,',
      continueAs: 'Continuar com a',
      notYou: 'No soc jo',
      newAccount: 'Crear nou compte',
      subtitle: 'Tornem a on ho vas deixar.',
    },
    es: {
      welcomeBack: '¡Hola de nuevo,',
      continueAs: 'Continuar como',
      notYou: 'No soy yo',
      newAccount: 'Crear nueva cuenta',
      subtitle: 'Volvamos a donde lo dejaste.',
    },
    pt: {
      welcomeBack: 'Olá de novo,',
      continueAs: 'Continuar como',
      notYou: 'Não sou eu',
      newAccount: 'Criar nova conta',
      subtitle: 'Vamos retomar de onde paraste.',
    },
    en: {
      welcomeBack: 'Welcome back,',
      continueAs: 'Continue as',
      notYou: "It's not me",
      newAccount: 'Create new account',
      subtitle: "Let's pick up where you left off.",
    },
  }[locale || 'es'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ opacity: [0.1, 0.25, 0.1], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-md w-full">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-6 shadow-xl shadow-pink-500/30"
        >
          <User size={40} className="text-white" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/50 text-sm mb-1"
        >
          {texts.welcomeBack}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold text-white mb-2"
        >
          {userName}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white/40 text-sm mb-10"
        >
          {texts.subtitle}
        </motion.p>

        {/* Continue button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold text-lg shadow-lg shadow-[#FF6B9D]/30 flex items-center justify-center gap-2 mb-4"
        >
          <LogIn size={20} />
          {texts.continueAs} {userName}
          <ArrowRight size={18} />
        </motion.button>

        {/* Not me */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onNewAccount}
          className="text-white/40 text-sm hover:text-white transition-colors flex items-center gap-1.5 mb-6"
        >
          <UserPlus size={14} />
          {texts.notYou} · {texts.newAccount}
        </motion.button>
      </div>
    </motion.div>
  );
}
