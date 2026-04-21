import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, IceCream, ShoppingCart, CreditCard, ClipboardCheck, PartyPopper, Sparkles, Plus, Check, Clock, Smartphone, Banknote } from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  tooltipPosition: 'top' | 'bottom';
}

const steps: TutorialStep[] = [
  {
    id: 1,
    title: 'Este es tu menú digital',
    description: 'Toca cualquier producto para ver detalles y añadir al carrito.',
    icon: <IceCream size={20} />,
    tooltipPosition: 'bottom',
  },
  {
    id: 2,
    title: 'Personaliza tu pedido',
    description: 'Elige tamaño, sabores y toppings. ¡Hazlo tuyo!',
    icon: <Sparkles size={20} />,
    tooltipPosition: 'top',
  },
  {
    id: 3,
    title: 'Revisa tu carrito',
    description: 'Aquí ves todo lo que pediste antes de confirmar.',
    icon: <ShoppingCart size={20} />,
    tooltipPosition: 'top',
  },
  {
    id: 4,
    title: 'Paga desde el móvil',
    description: 'Tarjeta, Bizum o paga al recoger. Tú eliges.',
    icon: <CreditCard size={20} />,
    tooltipPosition: 'bottom',
  },
  {
    id: 5,
    title: 'Sigue tu pedido en tiempo real',
    description: 'Recibido → Preparando → ¡Listo! Te avisamos.',
    icon: <ClipboardCheck size={20} />,
    tooltipPosition: 'top',
  },
  {
    id: 6,
    title: '¡Listo! Ven a recogerlo',
    description: 'Muestra tu número en el mostrador. ¡Buen provecho!',
    icon: <PartyPopper size={20} />,
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-[#0a0a0f]"
    >
      {/* Área Demo Central — cada step mostra um mockup visual real */}
      <div className="absolute inset-x-0 top-[8%] bottom-[42%] flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full max-w-[340px] sm:max-w-[400px]"
          >
            {currentStep === 0 && <DemoMenuGrid />}
            {currentStep === 1 && <DemoPersonalizacao />}
            {currentStep === 2 && <DemoCarrinho />}
            {currentStep === 3 && <DemoPagamento />}
            {currentStep === 4 && <DemoTracking status={demoStatus} />}
            {currentStep === 5 && <DemoConfirmacao />}
          </motion.div>
        </AnimatePresence>
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

      {/* Tooltip / Balão explicativo — fixo na parte inferior */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-6"
        >
          <div className="mx-auto max-w-[360px] sm:max-w-[420px] bg-white rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#FFA07A] flex items-center justify-center text-white shrink-0">
                {step.icon}
              </div>
              <h3 className="font-bold text-gray-800 text-lg">{step.title}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">{step.description}</p>

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

// ═══════════════════════════════════════════════════════════
// DEMOS VISUAIS — cada step mostra um mockup funcional real
// ═══════════════════════════════════════════════════════════

/** Step 1: Menu Grid mini */
function DemoMenuGrid() {
  const items = [
    { emoji: '🍦', nome: 'COPA 3', preco: '€5.90', cor: 'from-pink-400 to-rose-400' },
    { emoji: '🧇', nome: 'WAFFLE', preco: '€7.50', cor: 'from-amber-400 to-orange-400' },
    { emoji: '🥤', nome: 'BATIDO', preco: '€5.00', cor: 'from-emerald-400 to-teal-400' },
    { emoji: '🥞', nome: 'CREPE', preco: '€6.90', cor: 'from-violet-400 to-purple-400' },
  ];
  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        {['🍨', '🧇', '🥤', '🥞'].map((e, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`w-14 h-8 rounded-full flex items-center justify-center text-xs ${i === 0 ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/50'}`}
          >
            {e}
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-3 text-center"
          >
            <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${item.cor} flex items-center justify-center text-lg mb-1`}>
              {item.emoji}
            </div>
            <p className="text-white text-[10px] font-bold">{item.nome}</p>
            <p className="text-pink-300 text-[10px]">{item.preco}</p>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center"
      >
        <div className="bg-pink-500 text-white text-[10px] px-3 py-1 rounded-full flex items-center gap-1">
          <Plus size={10} /> Toca para añadir
        </div>
      </motion.div>
    </div>
  );
}

/** Step 2: Personalização mini */
function DemoPersonalizacao() {
  const [tamanho, setTamanho] = useState(1);
  const [sabores, setSabores] = useState([0, 1]);
  const saboresList = [
    { nome: 'Vainilla', cor: '#F5E6C8' },
    { nome: 'Chocolate', cor: '#5D4037' },
    { nome: 'Fresa', cor: '#FF6B9D' },
    { nome: 'Menta', cor: '#4CAF50' },
  ];
  return (
    <div className="space-y-3">
      <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-3">
        <p className="text-white/60 text-[10px] mb-2 uppercase tracking-wider">Tamaño</p>
        <div className="flex gap-2 justify-center">
          {['S', 'M', 'L'].map((s, i) => (
            <motion.button
              key={s}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTamanho(i)}
              className={`w-10 h-10 rounded-xl text-xs font-bold transition-colors ${
                tamanho === i ? 'bg-pink-500 text-white' : 'bg-white/10 text-white/50'
              }`}
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-3">
        <p className="text-white/60 text-[10px] mb-2 uppercase tracking-wider">Sabores (max 3)</p>
        <div className="grid grid-cols-2 gap-2">
          {saboresList.map((s, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSabores(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
              className={`flex items-center gap-2 p-2 rounded-lg text-[10px] transition-colors ${
                sabores.includes(i) ? 'bg-pink-500/30 border border-pink-400/50 text-white' : 'bg-white/5 text-white/50'
              }`}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.cor }} />
              {s.nome}
              {sabores.includes(i) && <Check size={10} className="ml-auto text-pink-400" />}
            </motion.button>
          ))}
        </div>
      </div>
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-center text-pink-300 text-[10px]"
      >
        ✨ ¡Interactivo! Toca los botones
      </motion.div>
    </div>
  );
}

/** Step 3: Carrinho mini */
function DemoCarrinho() {
  const items = [
    { nome: 'COPA 3 BOLAS', detalhes: 'Vainilla, Chocolate', preco: '€5.90' },
    { nome: '+ Topping Fresa', detalhes: '', preco: '€0.50' },
  ];
  return (
    <div className="space-y-3">
      <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-3 space-y-2">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.2 }}
            className="flex justify-between items-center"
          >
            <div>
              <p className="text-white text-[11px] font-semibold">{item.nome}</p>
              {item.detalhes && <p className="text-white/40 text-[9px]">{item.detalhes}</p>}
            </div>
            <p className="text-pink-300 text-[11px] font-bold">{item.preco}</p>
          </motion.div>
        ))}
        <div className="border-t border-white/10 pt-2 flex justify-between">
          <p className="text-white/60 text-[10px]">Total</p>
          <p className="text-white text-sm font-bold">€6.40</p>
        </div>
      </div>
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: [0.95, 1.02, 1] }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold py-2.5 rounded-xl text-center shadow-lg"
      >
        Pagar ahora →
      </motion.div>
    </div>
  );
}

/** Step 4: Pagamento mini */
function DemoPagamento() {
  const [metodo, setMetodo] = useState<'tarjeta' | 'bizum' | 'efectivo'>('tarjeta');
  const metodos = [
    { id: 'tarjeta' as const, icon: <CreditCard size={14} />, nome: 'Tarjeta', cor: 'from-blue-500 to-indigo-500' },
    { id: 'bizum' as const, icon: <Smartphone size={14} />, nome: 'Bizum', cor: 'from-emerald-500 to-teal-500' },
    { id: 'efectivo' as const, icon: <Banknote size={14} />, nome: 'Al recoger', cor: 'from-amber-500 to-orange-500' },
  ];
  return (
    <div className="space-y-3">
      <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-3 space-y-2">
        <p className="text-white/60 text-[10px] mb-1 uppercase tracking-wider">Método de pago</p>
        {metodos.map((m) => (
          <motion.button
            key={m.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setMetodo(m.id)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${
              metodo === m.id
                ? 'bg-white/20 border border-white/20'
                : 'bg-white/5 border border-transparent'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${m.cor} flex items-center justify-center text-white`}>
              {m.icon}
            </div>
            <span className="text-white text-[11px] font-medium">{m.nome}</span>
            {metodo === m.id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                <Check size={14} className="text-pink-400" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
      {metodo === 'tarjeta' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl p-3 text-white"
        >
          <p className="text-[8px] opacity-60">**** **** **** 4242</p>
          <div className="flex justify-between items-end mt-2">
            <p className="text-[10px] font-bold">HELADERÍA TROPICALE</p>
            <p className="text-[8px]">12/28</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

/** Step 5: Tracking mini */
function DemoTracking({ status }: { status: number }) {
  const stepsTrack = [
    { label: 'Recibido', icon: <ClipboardCheck size={12} /> },
    { label: 'Preparando', icon: <Clock size={12} /> },
    { label: '¡Listo!', icon: <Check size={12} /> },
  ];
  return (
    <div className="space-y-4">
      <div className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          {stepsTrack.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  i <= status
                    ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'
                    : 'bg-white/10 text-white/30'
                }`}
                animate={i === status ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.6 }}
              >
                {s.icon}
              </motion.div>
              <span className={`text-[9px] ${i <= status ? 'text-white font-medium' : 'text-white/30'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        {/* Progress bar */}
        <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"
            animate={{ width: `${((status + 1) / 3) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      <motion.div
        key={status}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-white/70 text-xs">
          {status === 0 && 'Tu pedido ha sido recibido 🎉'}
          {status === 1 && '¡Estamos preparando tu pedido! 👨‍🍳'}
          {status === 2 && '¡Tu pedido está listo! 🔔'}
        </p>
      </motion.div>
    </div>
  );
}

/** Step 6: Confirmação mini */
function DemoConfirmacao() {
  return (
    <div className="space-y-4 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30"
      >
        <PartyPopper size={36} className="text-white" />
      </motion.div>
      <div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white text-lg font-bold"
        >
          ¡Pedido #42 listo!
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/50 text-xs mt-1"
        >
          Muestra este número en el mostrador
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-3"
      >
        <p className="text-white/40 text-[9px] uppercase tracking-wider">Número de pedido</p>
        <p className="text-white text-3xl font-black tracking-widest">#42</p>
      </motion.div>
    </div>
  );
}
