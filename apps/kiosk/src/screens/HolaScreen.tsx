import { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import type { Locale } from '@tpv/shared/types';
import { LogIn } from 'lucide-react';
const KIOSK_LOGO_SRC = '/assets/logo/ChatGPT%20Image%2025%20abr%202026,%2008_46_42.png';

interface HolaScreenProps {
  onSelectLang: () => void;
  onLogin: () => void;
}

interface LangSlide {
  locale: Locale;
  label: string;
  flagSrc: string;
  greeting: string;
  startCta: string;
  appCta: string;
}

const languages: LangSlide[] = [
  { locale: 'es', label: 'Español', flagSrc: '/assets/flags/es.svg', greeting: '¡Hola!', startCta: 'Comenzar pedido', appCta: 'Tengo la app Tropicale' },
  { locale: 'ca', label: 'Català', flagSrc: '/assets/flags/es-ct.svg', greeting: 'Hola!', startCta: 'Començar comanda', appCta: 'Tinc l\'app Tropicale' },
  { locale: 'pt', label: 'Português', flagSrc: '/assets/flags/br.svg', greeting: 'Olá!', startCta: 'Fazer pedido', appCta: 'Tenho o app Tropicale' },
  { locale: 'en', label: 'English', flagSrc: '/assets/flags/gb.svg', greeting: 'Hello!', startCta: 'Start order', appCta: 'I have the Tropicale app' },
];

export default function HolaScreen({ onSelectLang, onLogin }: HolaScreenProps) {
  const { setLocale } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const width = typeof window !== 'undefined' ? window.innerWidth : 1024;

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = width * 0.15;
    const velocityThreshold = 500;

    if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      setCurrentIndex((prev) => Math.min(prev + 1, languages.length - 1));
    } else if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleStart = () => {
    setLocale(languages[currentIndex].locale);
    onSelectLang();
  };

  const handleLogin = () => {
    setLocale(languages[currentIndex].locale);
    onLogin();
  };

  const currentLang = languages[currentIndex];

  return (
    <div className="relative h-full w-full bg-[#0a0a0f] flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#2D8A4E]/30 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-[#FF8C42]/30 to-transparent blur-3xl"
        />
      </div>

      {/* Floating ice cream emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['🍦', '🍨', '🍧', '🍓', '🥭'].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl opacity-10"
            style={{
              left: `${15 + i * 18}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full h-full">
        {/* Top: Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
          className="mt-12 mb-6"
        >
          <img
            src={KIOSK_LOGO_SRC}
            alt="Tropicale"
            className="h-24 w-auto max-w-[200px] object-contain drop-shadow-2xl"
          />
        </motion.div>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-white/40 text-lg text-center mb-6"
        >
          Gelats Artesans · Helados Artesanales
        </motion.p>

        {/* Swiper area */}
        <div className="flex-1 flex flex-col items-center justify-center w-full px-8" ref={containerRef}>
          <div className="relative w-full max-w-lg overflow-hidden">
            <motion.div
              className="flex"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              animate={{ x: -currentIndex * 100 + '%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ x }}
            >
              {languages.map((lang, idx) => (
                <div
                  key={lang.locale}
                  className="w-full flex-shrink-0 flex flex-col items-center justify-center px-4"
                >
                  <AnimatePresence mode="wait">
                    {idx === currentIndex && (
                      <motion.div
                        key={lang.locale}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center"
                      >
                        {/* Flag */}
                        <motion.img
                          src={lang.flagSrc}
                          alt={lang.label}
                          className="w-40 h-28 object-cover rounded-xl mb-4 drop-shadow-2xl shadow-2xl border border-white/10"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        {/* Greeting */}
                        <h2 className="font-display text-5xl font-bold text-white text-center mb-2">
                          {lang.greeting}
                        </h2>

                        {/* Language label */}
                        <p className="text-white/50 text-xl font-medium">
                          {lang.label}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>

            {/* Swipe hint arrows */}
            {currentIndex > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                whileHover={{ opacity: 0.8 }}
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white text-2xl"
              >
                ‹
              </motion.button>
            )}
            {currentIndex < languages.length - 1 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                whileHover={{ opacity: 0.8 }}
                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, languages.length - 1))}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white text-2xl"
              >
                ›
              </motion.button>
            )}
          </div>

          {/* Pagination dots */}
          <div className="flex gap-3 mt-8">
            {languages.map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className="h-2.5 rounded-full transition-all"
                animate={{
                  width: idx === currentIndex ? 32 : 10,
                  backgroundColor: idx === currentIndex ? '#4CAF50' : 'rgba(255,255,255,0.2)',
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>

        {/* Bottom: CTA buttons */}
        <div className="w-full max-w-md px-8 pb-12 space-y-3">
          <AnimatePresence mode="wait">
            <motion.button
              key={currentLang.locale + '-start'}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              className="w-full py-5 rounded-3xl bg-gradient-to-r from-[#2D8A4E] to-[#4CAF50] text-white font-display font-bold text-2xl shadow-2xl shadow-[#2D8A4E]/40 flex items-center justify-center gap-3"
            >
              <span>🍦</span>
              {currentLang.startCta}
            </motion.button>
          </AnimatePresence>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            className="w-full py-4 rounded-2xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 transition-colors flex items-center justify-center gap-3 font-semibold text-lg"
          >
            <LogIn size={22} />
            {currentLang.appCta}
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/30 text-sm text-center pt-2"
          >
            Desliza para cambiar idioma
          </motion.p>
        </div>
      </div>
    </div>
  );
}
