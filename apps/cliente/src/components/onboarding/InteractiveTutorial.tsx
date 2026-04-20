import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, IceCream, ShoppingCart, CreditCard, ClipboardCheck, PartyPopper, Sparkles } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlightArea?: { top: string; left: string; width: string; height: string };
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
}

const steps: TutorialStep[] = [
  {
    id: 1,
    title: 'Este es tu menú digital',
    description: 'Toca cualquier producto para ver detalles y añadir al carrito.',
    icon: <IceCream size={20} />,
    highlightArea: { top: '20%', left: '5%', width: '90%', height: '50%' },
    tooltipPosition: 'bottom',
  },
  {
    id: 2,
    title: 'Personaliza tu pedido',
    description: 'Elige tamaño, sabores y toppings. ¡Hazlo tuyo!',
    icon: <Sparkles size={20} />,
    highlightArea: { top: '30%', left: '10%', width: '80%', height: '40%' },
    tooltipPosition: 'top',
  },
  {
    id: 3,
    title: 'Revisa tu carrito',
    description: 'Aquí ves todo lo que pediste antes de confirmar.',
    icon: <ShoppingCart size={20} />,
    highlightArea: { top: '85%', left: '25%', width: '50%', height: '10%' },
    tooltipPosition: 'top',
  },
  {
    id: 4,
    title: 'Paga desde el móvil',
    description: 'Tarjeta, Bizum o paga al recoger. Tú eliges.',
    icon: <CreditCard size={20} />,
    highlightArea: { top: '60%', left: '10%', width: '80%', height: '25%' },
    tooltipPosition: 'top',
  },
  {
    id: 5,
    title: 'Sigue tu pedido en tiempo real',
    description: 'Recibido → Preparando → ¡Listo! Te avisamos.',
    icon: <ClipboardCheck size={20} />,
    highlightArea: { top: '40%', left: '15%', width: '70%', height: '30%' },
    tooltipPosition: 'bottom',
  },
  {
    id: 6,
    title: '¡Listo! Ven a recogerlo',
    description: 'Muestra tu número en el mostrador. ¡Buen provecho!',
    icon: <PartyPopper size={20} />,
    highlightArea: { top: '35%', left: '20%', width: '60%', height: '35%' },
    tooltipPosition: 'bottom',
  },
];

interface InteractiveTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
  locale: 'ca' | 'es' | 'pt' | 'en';
}

export default function InteractiveTutorial({ onComplete, onSkip, locale }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const t = {
    ca: { skip: 'Ometre tutorial', back: 'Enrere', next: 'Següent', finish: 'Començar', step: 'Pas' },
    es: { skip: 'Omitir tutorial', back: 'Atrás', next: 'Siguiente', finish: 'Comenzar', step: 'Paso' },
    pt: { skip: 'Pular tutorial', back: 'Voltar', next: 'Próximo', finish: 'Começar', step: 'Passo' },
    en: { skip: 'Skip tutorial', back: 'Back', next: 'Next', finish: 'Start', step: 'Step' },
  }[locale];

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      setShowConfetti(true);
      setTimeout(() => onComplete(), 1500);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  }, [isLast, onComplete]);

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  // Simulação: no passo 5, mostra animação de status mudando
  const [demoStatus, setDemoStatus] = useState(0);
  const demoStatuses = ['Recibido', 'Preparando', '¡Listo!'];
  useEffect(() => {
    if (currentStep === 4) {
      const timers = [
        setTimeout(() => setDemoStatus(1), 1500),
        setTimeout(() => setDemoStatus(2), 3500),
      ];
      return () => timers.forEach(clearTimeout);
    }
    setDemoStatus(0);
  }, [currentStep]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60]"
    >
      {/* Overlay escuro com spotlight */}
      <div className="absolute inset-0 bg-black/80">
        {step.highlightArea && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute rounded-2xl"
            style={{
              top: step.highlightArea.top,
              left: step.highlightArea.left,
              width: step.highlightArea.width,
              height: step.highlightArea.height,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.8), 0 0 30px rgba(255,107,157,0.3)',
              border: '2px solid rgba(255,107,157,0.5)',
            }}
          >
            {/* Pulse animation no highlight */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-[#FF6B9D]/50"
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="h-1 bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A]"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>
        <div className="flex justify-between items-center px-4 py-2">
          <span className="text-white/50 text-xs">
            {t.step} {currentStep + 1} / {steps.length}
          </span>
          <button
            onClick={onSkip}
            className="text-white/40 text-xs hover:text-white/70 transition-colors"
          >
            {t.skip}
          </button>
        </div>
      </div>

      {/* Tooltip / Balão explicativo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute z-10"
          style={{
            top: step.tooltipPosition === 'bottom' ? '65%' : '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '85%',
            maxWidth: '360px',
          }}
        >
          <div className="bg-white rounded-2xl p-5 shadow-2xl">
            {/* Arrow */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 ${
                step.tooltipPosition === 'bottom' ? '-top-2' : '-bottom-2'
              }`}
            />

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#FFA07A] flex items-center justify-center text-white">
                {step.icon}
              </div>
              <h3 className="font-bold text-gray-800 text-lg">{step.title}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">{step.description}</p>

            {/* Demo do passo 5: status animado */}
            {currentStep === 4 && (
              <div className="mb-5 p-3 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center">
                  {demoStatuses.map((status, i) => (
                    <div key={status} className="flex flex-col items-center gap-1">
                      <motion.div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          i <= demoStatus
                            ? 'bg-gradient-to-br from-[#FF6B9D] to-[#FFA07A] text-white'
                            : 'bg-gray-200 text-gray-400'
                        }`}
                        animate={i === demoStatus ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.5 }}
                      >
                        {i + 1}
                      </motion.div>
                      <span className={`text-[10px] ${i <= demoStatus ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                  <ChevronLeft size={16} /> {t.back}
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-1"
              >
                {isLast ? (
                  <>{t.finish} <PartyPopper size={16} /></>
                ) : (
                  <>{t.next} <ChevronRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Confetti no último passo */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
          >
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#FF6B9D', '#FFA07A', '#FFD700', '#2ed573', '#3742fa'][i % 5],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ scale: 0, y: 0 }}
                animate={{
                  scale: [0, 1.5, 0],
                  y: [0, -200 - Math.random() * 300],
                  x: [0, (Math.random() - 0.5) * 200],
                  rotate: [0, Math.random() * 720],
                }}
                transition={{ duration: 1.5, delay: Math.random() * 0.3 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
