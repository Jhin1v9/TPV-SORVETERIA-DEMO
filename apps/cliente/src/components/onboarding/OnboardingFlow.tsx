import { AnimatePresence } from 'framer-motion';
import { useOnboarding } from '../../hooks/useOnboarding';
import WelcomeScreen from './WelcomeScreen';
import QuickRegister from './QuickRegister';
import InteractiveTutorial from './InteractiveTutorial';
import AlergenoSelector from '@tpv/shared/components/AlergenoSelector';
import { useStore } from '@tpv/shared/stores/useStore';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function OnboardingFlow() {
  const { step, goToStep, skipOnboarding, nextTutorialStep } = useOnboarding();
  const { locale, perfilUsuario, setPerfilUsuario } = useStore();
  const [alergias, setAlergias] = useState(perfilUsuario?.alergias || []);

  const t = {
    ca: { title: 'Al·lèrgies alimentàries', skip: 'Ometre', next: 'Continuar', back: 'Enrere', required: 'Selecciona una opció' },
    es: { title: 'Alergias alimentarias', skip: 'Omitir', next: 'Continuar', back: 'Atrás', required: 'Selecciona una opción' },
    pt: { title: 'Alergias alimentares', skip: 'Pular', next: 'Continuar', back: 'Voltar', required: 'Selecione uma opção' },
    en: { title: 'Food Allergies', skip: 'Skip', next: 'Continue', back: 'Back', required: 'Select an option' },
  }[locale || 'es'];

  const handleAllergyComplete = () => {
    if (perfilUsuario) {
      setPerfilUsuario({
        ...perfilUsuario,
        temAlergias: alergias.length > 0,
        alergias,
      });
    }
    goToStep('tutorial');
    nextTutorialStep();
  };

  return (
    <AnimatePresence mode="wait">
      {step === 'welcome' && (
        <WelcomeScreen
          key="welcome"
          onStart={() => goToStep('register')}
          onSkip={skipOnboarding}
        />
      )}

      {step === 'register' && (
        <QuickRegister
          key="register"
          onComplete={() => goToStep('allergy')}
          onBack={() => goToStep('welcome')}
        />
      )}

      {step === 'tutorial' && (
        <InteractiveTutorial
          key="tutorial"
          locale={locale}
          onComplete={skipOnboarding}
          onSkip={skipOnboarding}
        />
      )}

      {step === 'allergy' && (
        <motion.div
          key="allergy"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] overflow-y-auto"
        >
          <div className="flex-1 px-6 py-8 max-w-sm mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => goToStep('register')}
                className="text-white/40 text-sm hover:text-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft size={14} /> {t.back}
              </button>
              <button
                onClick={handleAllergyComplete}
                className="text-white/40 text-sm hover:text-white transition-colors"
              >
                {t.skip} →
              </button>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white mb-2"
            >
              {t.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/50 text-sm mb-6"
            >
              {locale === 'ca' ? 'Aquesta informació és important per a la teva seguretat.' :
               locale === 'pt' ? 'Esta informação é importante para sua segurança.' :
               locale === 'en' ? 'This information is important for your safety.' :
               'Esta información es importante para tu seguridad.'}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <AlergenoSelector
                locale={locale}
                selecionados={alergias}
                onChange={setAlergias}
                obrigatorio
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6"
            >
              <button
                onClick={handleAllergyComplete}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold text-lg shadow-lg shadow-[#FF6B9D]/30 flex items-center justify-center gap-2"
              >
                {t.next} <ArrowRight size={18} />
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/30 text-xs mt-4 flex items-center justify-center gap-1"
            >
              <ShieldCheck size={12} />
              {locale === 'ca' ? 'Informació confidencial' :
               locale === 'pt' ? 'Informação confidencial' :
               locale === 'en' ? 'Confidential information' :
               'Información confidencial'}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
