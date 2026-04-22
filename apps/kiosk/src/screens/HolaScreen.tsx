import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import type { Locale } from '@tpv/shared/types';
import { ChevronRight, LogIn } from 'lucide-react';
import TropicaleLogo from '@tpv/shared/components/TropicaleLogo';

interface HolaScreenProps {
  onSelectLang: () => void;
  onLogin: () => void;
}

const languages: { locale: Locale; label: string; flag: string }[] = [
  { locale: 'es', label: 'Español', flag: '🇪🇸' },
  { locale: 'ca', label: 'Català', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
  { locale: 'pt', label: 'Português', flag: '🇵🇹' },
  { locale: 'en', label: 'English', flag: '🇬🇧' },
];

export default function HolaScreen({ onSelectLang, onLogin }: HolaScreenProps) {
  const { setLocale } = useStore();
  const [selectedLang, setSelectedLang] = useState<number>(0);

  const handleStart = () => {
    setLocale(languages[selectedLang].locale);
    onSelectLang();
  };

  const handleLogin = () => {
    setLocale(languages[selectedLang].locale);
    onLogin();
  };

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
      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
          className="mb-6"
        >
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#2D8A4E] to-[#4CAF50] flex items-center justify-center shadow-2xl shadow-[#2D8A4E]/30">
            <TropicaleLogo size={68} className="text-white" />
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-display text-6xl font-bold text-white text-center mb-2"
        >
          Tropicale
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/50 text-2xl text-center mb-12"
        >
          Gelats Artesans · Helados Artesanales
        </motion.p>

        {/* Language selector */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3 mb-10"
        >
          {languages.map((lang, idx) => (
            <motion.button
              key={lang.locale}
              onClick={() => setSelectedLang(idx)}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-2xl text-lg font-semibold transition-all ${
                selectedLang === idx
                  ? 'bg-white text-[#0a0a0f] shadow-lg'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
              }`}
            >
              <span className="mr-2">{lang.flag}</span>
              {lang.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Main CTA Buttons */}
        <div className="w-full max-w-md space-y-3">
          <motion.button
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStart}
            className="w-full py-6 rounded-3xl bg-gradient-to-r from-[#2D8A4E] to-[#4CAF50] text-white font-display font-bold text-3xl shadow-2xl shadow-[#2D8A4E]/40 flex items-center justify-center gap-4"
          >
            <span>🍦</span>
            Comenzar Pedido
            <ChevronRight size={32} />
          </motion.button>

          <motion.button
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogin}
            className="w-full py-4 rounded-2xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 transition-colors flex items-center justify-center gap-3 font-semibold text-xl"
          >
            <LogIn size={24} />
            Tengo la app Tropicale
          </motion.button>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-white/30 text-base mt-8"
        >
          Toca la pantalla para comenzar
        </motion.p>
      </div>
    </div>
  );
}
