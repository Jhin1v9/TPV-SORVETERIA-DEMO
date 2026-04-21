import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import type { Locale } from '@tpv/shared/types';

const languages: { locale: Locale; greeting: string; subtext: string; colors: [string, string, string?]; flag: string }[] = [
  {
    locale: 'ca',
    greeting: 'Hola!',
    subtext: 'Benvinguts a la nostra gelateria',
    colors: ['#FFCD00', '#E3000F'],
    flag: '/assets/flags/ca.svg',
  },
  {
    locale: 'es',
    greeting: '¡Hola!',
    subtext: 'Bienvenidos a nuestra heladería',
    colors: ['#FF0000', '#FFD700'],
    flag: '/assets/flags/es.png',
  },
  {
    locale: 'en',
    greeting: 'Hello!',
    subtext: 'Welcome to our ice cream shop',
    colors: ['#012169', '#FFFFFF', '#C8102E'],
    flag: '/assets/flags/en.png',
  },
  {
    locale: 'pt',
    greeting: 'Olá!',
    subtext: 'Bem-vindos à nossa sorveteria',
    colors: ['#006600', '#FF0000', '#FFD700'],
    flag: '/assets/flags/pt.png',
  },
];

// Floating particles component
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: 20 + Math.random() * 40,
    left: Math.random() * 100,
    delay: Math.random() * 6,
    duration: 4 + Math.random() * 4,
    opacity: 0.05 + Math.random() * 0.08,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: -60,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -window.innerHeight - 100],
            x: [0, Math.sin(p.id) * 50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

export default function HolaScreen({ onSelectLang }: { onSelectLang: () => void }) {
  const { setLocale } = useStore();
  const [currentIndex, setCurrentIndex] = useState(1); // Start with Spanish
  const [direction, setDirection] = useState(0);

  const handleSelect = (idx: number) => {
    setLocale(languages[idx].locale);
    onSelectLang();
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.9 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.9 }),
  };

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-[#FF6B9D] via-[#FFA07A] to-[#FFD700] flex flex-col items-center justify-center overflow-hidden">
      <FloatingParticles />

      {/* Logo */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 z-10"
      >
        <div className="flex items-center gap-3">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none">
              <circle cx="32" cy="20" r="14" fill="#FF6B9D" opacity="0.8" />
              <path d="M18 24 Q32 52 46 24" fill="#D2691E" />
              <circle cx="24" cy="16" r="3" fill="#FFF8E7" opacity="0.6" />
              <circle cx="36" cy="14" r="2.5" fill="#3C1414" opacity="0.4" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-white leading-tight">Sabadell Nord</h1>
            <p className="text-white/70 text-base">Gelats Artesans</p>
          </div>
        </div>
      </motion.div>

      {/* Carousel */}
      <div className="relative w-full max-w-2xl h-[520px] z-10">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.button
              onClick={() => handleSelect(currentIndex)}
              className="w-[400px] h-[520px] rounded-3xl shadow-2xl overflow-hidden relative group cursor-pointer"
              style={{
                background: languages[currentIndex].colors.length === 3
                  ? `linear-gradient(135deg, ${languages[currentIndex].colors[0]} 0%, ${languages[currentIndex].colors[1]} 50%, ${languages[currentIndex].colors[2]} 100%)`
                  : `linear-gradient(135deg, ${languages[currentIndex].colors[0]} 0%, ${languages[currentIndex].colors[1]} 100%)`,
              }}
              whileHover={{ scale: 0.98 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                {/* Flag */}
                <motion.div
                  className="w-44 h-28 rounded-xl overflow-hidden shadow-lg border-2 border-white/50 mb-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  <img
                    src={languages[currentIndex].flag}
                    alt={languages[currentIndex].locale}
                    className="w-full h-full object-cover"
                    loading="eager"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-white/20 text-white font-bold text-lg">${languages[currentIndex].locale.toUpperCase()}</div>`;
                    }}
                  />
                </motion.div>

                {/* Greeting */}
                <motion.h2
                  className="font-display text-7xl font-bold text-white mb-3 drop-shadow-lg"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {languages[currentIndex].greeting}
                </motion.h2>

                {/* Subtext */}
                <motion.p
                  className="text-white/90 text-lg leading-relaxed"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {languages[currentIndex].subtext}
                </motion.p>

                {/* Tap hint */}
                <motion.div
                  className="mt-8 flex items-center gap-2 text-white/70 text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                  Toca para seleccionar
                </motion.div>
              </div>
            </motion.button>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={() => {
            if (currentIndex > 0) {
              setDirection(-1);
              setCurrentIndex(currentIndex - 1);
            }
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-20"
          style={{ opacity: currentIndex > 0 ? 1 : 0.3 }}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => {
            if (currentIndex < languages.length - 1) {
              setDirection(1);
              setCurrentIndex(currentIndex + 1);
            }
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-20"
          style={{ opacity: currentIndex < languages.length - 1 ? 1 : 0.3 }}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex gap-3 mt-8 z-10">
        {languages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className="rounded-full transition-all duration-300"
            style={{
              width: idx === currentIndex ? 14 : 10,
              height: idx === currentIndex ? 14 : 10,
              backgroundColor: idx === currentIndex ? 'white' : 'rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>

      {/* Bottom hint */}
      <motion.p
        className="text-white/60 text-lg mt-6 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Desliza o selecciona un idioma
      </motion.p>
    </div>
  );
}
