import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttractScreenProps {
  onTap: () => void;
}

const greetings = [
  { lang: 'Hola', region: 'Español', image: 'https://images.unsplash.com/photo-1627308594190-a057cd4bfac8?w=3840&q=90', color: '#7C3AED' },
  { lang: 'Hola', region: 'Català', image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=3840&q=90', color: '#D97706' },
  { lang: 'Hello', region: 'English', image: 'https://images.unsplash.com/photo-1590288488147-f46142daf112?w=3840&q=90', color: '#EC4899' },
  { lang: 'Bonjour', region: 'Français', image: 'https://images.unsplash.com/photo-1562790879-dfde82829db0?w=3840&q=90', color: '#10B981' },
  { lang: 'Ciao', region: 'Italiano', image: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=3840&q=90', color: '#EF4444' },
  { lang: 'Hallo', region: 'Deutsch', image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=3840&q=90', color: '#3B82F6' },
];

export default function AttractScreen({ onTap }: AttractScreenProps) {
  const [current, setCurrent] = useState(0);
  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % greetings.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = greetings[current];

  return (
    <div
      className="relative h-full w-full overflow-hidden select-none cursor-pointer"
      onClick={onTap}
    >
      {/* Background image stack — crossfade with overlap, no black flash */}
      {greetings.map((g, idx) => (
        <motion.div
          key={g.image}
          initial={false}
          animate={{
            opacity: idx === current ? 1 : 0,
            scale: idx === current ? 1 : 1.1,
          }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
          className="absolute inset-0"
          style={{ zIndex: idx === current ? 1 : 0 }}
        >
          <img
            src={g.image}
            alt={g.lang}
            className="h-full w-full object-cover"
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        </motion.div>
      ))}

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-20"
            style={{
              width: 4 + i * 3,
              height: 4 + i * 3,
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 4) * 20}%`,
              backgroundColor: slide.color,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-end pb-20">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="absolute top-8 left-1/2 -translate-x-1/2"
        >
          <img
            src="/assets/logo/ChatGPT%20Image%2025%20abr%202026,%2008_46_42.png"
            alt="Tropicale"
            className="h-14 w-auto max-w-[180px] object-contain drop-shadow-lg"
          />
        </motion.div>

        {/* Slide indicators */}
        <div className="absolute top-8 right-8 flex gap-2">
          {greetings.map((_, idx) => (
            <motion.div
              key={idx}
              className="h-1.5 rounded-full"
              animate={{
                width: idx === current ? 32 : 8,
                backgroundColor: idx === current ? '#fff' : 'rgba(255,255,255,0.3)',
              }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Greeting carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 1.05 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-7xl font-black text-white drop-shadow-xl mb-2">
              {slide.lang}
            </h2>
            <p className="text-white/60 text-lg font-medium tracking-widest uppercase drop-shadow-md">
              {slide.region}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* CTA Button */}
        <motion.div
          animate={{
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-white/20 blur-xl animate-pulse" />
          <div className="relative px-12 py-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <span className="font-display text-2xl font-bold text-white tracking-wide">
              TOCA PARA EMPEZAR
            </span>
          </div>
        </motion.div>

        {/* Bottom hint */}
        <motion.p
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-white/40 text-sm mt-6"
        >
          Helados Artesanales · Açaí · Granizados
        </motion.p>
      </div>
    </div>
  );
}
