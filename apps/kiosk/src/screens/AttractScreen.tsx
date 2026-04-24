import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttractScreenProps {
  onTap: () => void;
}

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1627308594190-a057cd4bfac8?w=3840&q=90',
    title: 'Açaí Tropical',
    subtitle: 'Cremoso · Natural · Energético',
    color: '#7C3AED',
  },
  {
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=3840&q=90',
    title: 'Cones Artesanais',
    subtitle: 'Crocante · Fresco · Irresistível',
    color: '#D97706',
  },
  {
    image: 'https://images.unsplash.com/photo-1590288488147-f46142daf112?w=3840&q=90',
    title: 'Copa Bahia',
    subtitle: 'Frutas Frescas · Granola · Leite Condensado',
    color: '#EC4899',
  },
  {
    image: 'https://images.unsplash.com/photo-1562790879-dfde82829db0?w=3840&q=90',
    title: 'Gelato Artesanal',
    subtitle: 'Sabores Únicos · Para Compartilhar',
    color: '#10B981',
  },
];

export default function AttractScreen({ onTap }: AttractScreenProps) {
  const [current, setCurrent] = useState(0);
  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = slides[current];

  return (
    <div
      className="relative h-full w-full overflow-hidden select-none cursor-pointer"
      onClick={onTap}
    >
      {/* Background image with crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"

          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        </motion.div>
      </AnimatePresence>

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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2D8A4E] to-[#4CAF50] flex items-center justify-center shadow-lg">
              <span className="text-2xl">🍦</span>
            </div>
            <span className="font-display text-3xl font-bold text-white drop-shadow-lg">
              Tropicale
            </span>
          </div>
        </motion.div>

        {/* Slide indicators */}
        <div className="absolute top-8 right-8 flex gap-2">
          {slides.map((_, idx) => (
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

        {/* Product text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="font-display text-5xl font-bold text-white drop-shadow-xl mb-3">
              {slide.title}
            </h2>
            <p className="text-white/70 text-xl drop-shadow-md">
              {slide.subtitle}
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
              TOQUE PARA ENTRAR
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
