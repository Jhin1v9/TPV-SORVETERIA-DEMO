import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Delete, Smartphone, CheckCircle2, User, LogIn } from 'lucide-react';
import { validateKioskCode } from '@tpv/shared/realtime/client';

interface LoginKioskScreenProps {
  onLogin: (customerId: string, nome: string | null) => void;
  onSkip: () => void;
}

export default function LoginKioskScreen({ onLogin, onSkip }: LoginKioskScreenProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [nome, setNome] = useState<string | null>(null);

  const handleDigit = (d: string) => {
    if (digits.length < 5 && !validating && !success) {
      setError('');
      setDigits((prev) => [...prev, d]);
    }
  };

  const handleBackspace = () => {
    if (!validating && !success) {
      setError('');
      setDigits((prev) => prev.slice(0, -1));
    }
  };

  const handleValidate = async () => {
    if (digits.length !== 5) return;
    const code = digits.join('');
    setValidating(true);
    setError('');
    try {
      const result = await validateKioskCode(code);
      setNome(result.nome);
      setSuccess(true);
      setTimeout(() => {
        onLogin(result.customerId, result.nome);
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Código inválido');
      setDigits([]);
    } finally {
      setValidating(false);
    }
  };

  const keypad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'DEL'],
  ];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f] relative">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#2D8A4E]/20 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-gradient-to-tl from-[#FF8C42]/20 to-transparent blur-3xl"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-center px-6 py-5">
        <img
          src="/assets/logo/ChatGPT%20Image%2025%20abr%202026,%2008_46_42.png"
          alt="Tropicale"
          className="h-10 w-auto max-w-[160px] object-contain"
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md flex flex-col items-center gap-6"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#2D8A4E] to-[#4CAF50] flex items-center justify-center shadow-2xl shadow-[#2D8A4E]/30"
              >
                <Smartphone size={52} className="text-white" />
              </motion.div>

              <div className="text-center">
                <h3 className="font-display text-3xl font-bold text-white mb-2">¿Tienes la app?</h3>
                <p className="text-white/40 text-base">Introduce tu código de 5 dígitos para vincular tu pedido</p>
              </div>

              {/* Display de dígitos */}
              <div className="flex gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`w-16 h-20 rounded-2xl flex items-center justify-center text-3xl font-mono font-bold border-2 transition-colors ${
                      digits[i]
                        ? 'bg-white text-[#0a0a0f] border-white'
                        : 'bg-white/5 text-white/20 border-white/10'
                    }`}
                    animate={digits[i] ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.15 }}
                  >
                    {digits[i] ? digits[i] : ''}
                  </motion.div>
                ))}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm font-medium"
                >
                  {error}
                </motion.p>
              )}

              {/* Teclado numérico */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                {keypad.flat().map((key) => (
                  <motion.button
                    key={key}
                    onClick={() => {
                      if (key === 'DEL') handleBackspace();
                      else if (key) handleDigit(key);
                    }}
                    whileTap={key ? { scale: 0.9 } : {}}
                    disabled={!key || validating}
                    className={`h-16 rounded-2xl text-2xl font-bold transition-colors flex items-center justify-center ${
                      key === 'DEL'
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : key
                        ? 'bg-white/10 text-white hover:bg-white/20'
                        : 'bg-transparent cursor-default'
                    }`}
                  >
                    {key === 'DEL' ? <Delete size={24} /> : key}
                  </motion.button>
                ))}
              </div>

              <div className="w-full max-w-xs space-y-3">
                <motion.button
                  onClick={handleValidate}
                  disabled={digits.length !== 5 || validating}
                  whileTap={digits.length === 5 ? { scale: 0.97 } : {}}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2D8A4E] to-[#4CAF50] text-white font-display font-bold text-xl shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <LogIn size={22} />
                  {validating ? 'Verificando...' : 'Vincular pedido'}
                </motion.button>

                <motion.button
                  onClick={onSkip}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3 rounded-2xl bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowRight size={18} />
                  Continuar sin app
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30"
              >
                <CheckCircle2 size={48} className="text-emerald-400" />
              </motion.div>
              <div className="text-center">
                <h3 className="font-display text-3xl font-bold text-white mb-2">¡Vinculado!</h3>
                {nome && (
                  <p className="text-white/50 text-lg flex items-center justify-center gap-2">
                    <User size={18} />
                    Hola, {nome}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
