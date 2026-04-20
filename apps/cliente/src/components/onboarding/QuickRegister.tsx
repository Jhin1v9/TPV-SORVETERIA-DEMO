import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { useStore } from '@tpv/shared/stores/useStore';
import type { PerfilUsuario } from '@tpv/shared/types';

interface QuickRegisterProps {
  onComplete: () => void;
  onBack: () => void;
}

export default function QuickRegister({ onComplete, onBack }: QuickRegisterProps) {
  const { locale, setPerfilUsuario } = useStore();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    ca: { title: 'Crear compte', subtitle: 'Només 2 dades per començar', name: 'Nom', phone: 'Telèfon', placeholderName: 'El teu nom', placeholderPhone: '+34 612 345 678', secure: 'Les teves dades estan segures', cta: 'ENTRAR', back: 'Enrere', required: 'Camp obligatori' },
    es: { title: 'Crear cuenta', subtitle: 'Solo 2 datos para empezar', name: 'Nombre', phone: 'Teléfono', placeholderName: 'Tu nombre', placeholderPhone: '+34 612 345 678', secure: 'Tus datos están seguros', cta: 'ENTRAR', back: 'Atrás', required: 'Campo obligatorio' },
    pt: { title: 'Criar conta', subtitle: 'Apenas 2 dados para começar', name: 'Nome', phone: 'Telefone', placeholderName: 'Seu nome', placeholderPhone: '+34 612 345 678', secure: 'Seus dados estão seguros', cta: 'ENTRAR', back: 'Voltar', required: 'Campo obrigatório' },
    en: { title: 'Create account', subtitle: 'Just 2 details to get started', name: 'Name', phone: 'Phone', placeholderName: 'Your name', placeholderPhone: '+34 612 345 678', secure: 'Your data is secure', cta: 'ENTER', back: 'Back', required: 'Required field' },
  }[locale || 'es'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nome.trim()) { setError(t.required); return; }
    setLoading(true);
    setTimeout(() => {
      const perfil: PerfilUsuario = {
        id: crypto.randomUUID(),
        nome: nome.trim(),
        email: '',
        telefone: telefone.trim(),
        temAlergias: false,
        alergias: [],
        criadoEm: new Date().toISOString(),
      };
      setPerfilUsuario(perfil);
      setLoading(false);
      onComplete();
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]"
    >
      <div className="flex-1 flex flex-col justify-center px-6 max-w-sm mx-auto w-full">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="text-white/40 text-sm mb-8 hover:text-white transition-colors self-start"
        >
          ← {t.back}
        </motion.button>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-2"
        >
          {t.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white/50 mb-8"
        >
          {t.subtitle}
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="text-white/60 text-sm mb-1.5 flex items-center gap-1.5">
              <User size={14} /> {t.name}
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder={t.placeholderName}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF6B9D]/50 focus:ring-1 focus:ring-[#FF6B9D]/30 transition-all"
              autoFocus
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="text-white/60 text-sm mb-1.5 flex items-center gap-1.5">
              <Phone size={14} /> {t.phone}
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder={t.placeholderPhone}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF6B9D]/50 focus:ring-1 focus:ring-[#FF6B9D]/30 transition-all"
            />
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-sm"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold text-lg shadow-lg shadow-[#FF6B9D]/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : t.cta}
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/30 text-xs mt-6 flex items-center justify-center gap-1"
        >
          <ShieldCheck size={12} /> {t.secure}
        </motion.p>
      </div>
    </motion.div>
  );
}
