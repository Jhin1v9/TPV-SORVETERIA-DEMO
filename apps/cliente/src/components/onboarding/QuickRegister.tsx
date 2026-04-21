import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Phone, ShieldCheck, Loader2, LogIn, UserPlus } from 'lucide-react';
import { useStore } from '@tpv/shared/stores/useStore';
import { registerUser, loginByPhone } from '@tpv/shared/lib/authMock';
import type { PerfilUsuario } from '@tpv/shared/types';

interface QuickRegisterProps {
  onComplete: () => void;
  onBack: () => void;
}

type AuthMode = 'register' | 'login';

export default function QuickRegister({ onComplete, onBack }: QuickRegisterProps) {
  const { locale, setPerfilUsuario } = useStore();
  const [mode, setMode] = useState<AuthMode>('register');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    ca: {
      registerTitle: 'Crear compte',
      registerSubtitle: 'Només 2 dades per començar',
      signInTitle: 'Entrar',
      signInSubtitle: 'Introdueix el teu telèfon',
      name: 'Nom',
      phone: 'Telèfon',
      placeholderName: 'El teu nom',
      placeholderPhone: '+34 612 345 678',
      secure: 'Les teves dades estan segures',
      ctaRegister: 'CREAR COMPTE',
      ctaLogin: 'ENTRAR',
      back: 'Enrere',
      required: 'Camp obligatori',
      phoneRequired: 'Introdueix el telèfon',
      phoneInvalid: 'Telèfon invàlid (9 dígits)',
      userNotFound: 'Usuari no trobat. Crea un compte.',
      haveAccount: 'Ja tens compte?',
      noAccount: 'No tens compte?',
      loginLink: 'Entrar',
      registerLink: 'Crear compte',
    },
    es: {
      registerTitle: 'Crear cuenta',
      registerSubtitle: 'Solo 2 datos para empezar',
      signInTitle: 'Entrar',
      signInSubtitle: 'Introduce tu teléfono',
      name: 'Nombre',
      phone: 'Teléfono',
      placeholderName: 'Tu nombre',
      placeholderPhone: '+34 612 345 678',
      secure: 'Tus datos están seguros',
      ctaRegister: 'CREAR CUENTA',
      ctaLogin: 'ENTRAR',
      back: 'Atrás',
      required: 'Campo obligatorio',
      phoneRequired: 'Introduce el teléfono',
      phoneInvalid: 'Teléfono inválido (9 dígitos)',
      userNotFound: 'Usuario no encontrado. Crea una cuenta.',
      haveAccount: '¿Ya tienes cuenta?',
      noAccount: '¿No tienes cuenta?',
      loginLink: 'Entrar',
      registerLink: 'Crear cuenta',
    },
    pt: {
      registerTitle: 'Criar conta',
      registerSubtitle: 'Apenas 2 dados para começar',
      signInTitle: 'Entrar',
      signInSubtitle: 'Introduz o teu telefone',
      name: 'Nome',
      phone: 'Telefone',
      placeholderName: 'Seu nome',
      placeholderPhone: '+34 612 345 678',
      secure: 'Seus dados estão seguros',
      ctaRegister: 'CRIAR CONTA',
      ctaLogin: 'ENTRAR',
      back: 'Voltar',
      required: 'Campo obrigatório',
      phoneRequired: 'Introduz o telefone',
      phoneInvalid: 'Telefone inválido (9 dígitos)',
      userNotFound: 'Utilizador não encontrado. Cria uma conta.',
      haveAccount: 'Já tens conta?',
      noAccount: 'Não tens conta?',
      loginLink: 'Entrar',
      registerLink: 'Criar conta',
    },
    en: {
      registerTitle: 'Create account',
      registerSubtitle: 'Just 2 details to get started',
      signInTitle: 'Sign in',
      signInSubtitle: 'Enter your phone number',
      name: 'Name',
      phone: 'Phone',
      placeholderName: 'Your name',
      placeholderPhone: '+34 612 345 678',
      secure: 'Your data is secure',
      ctaRegister: 'CREATE ACCOUNT',
      ctaLogin: 'SIGN IN',
      back: 'Back',
      required: 'Required field',
      phoneRequired: 'Enter phone number',
      phoneInvalid: 'Invalid phone (9 digits)',
      userNotFound: 'User not found. Create an account.',
      haveAccount: 'Already have an account?',
      noAccount: "Don't have an account?",
      loginLink: 'Sign in',
      registerLink: 'Create account',
    },
  }[locale || 'es'];

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `+${digits}`;
    if (digits.length <= 6) return `+${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 9) return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  };

  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 9;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!telefone.trim() || !validatePhone(telefone)) {
      setError(t.phoneInvalid);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      if (mode === 'register') {
        if (!nome.trim()) {
          setError(t.required);
          setLoading(false);
          return;
        }
        const perfil: PerfilUsuario = {
          id: crypto.randomUUID(),
          nome: nome.trim(),
          email: '',
          telefone: telefone.trim(),
          temAlergias: false,
          alergias: [],
          criadoEm: new Date().toISOString(),
        };
        registerUser(perfil);
        setPerfilUsuario(perfil);
        setLoading(false);
        onComplete();
      } else {
        // Login
        const user = loginByPhone(telefone.trim());
        if (user) {
          setPerfilUsuario(user);
          setLoading(false);
          onComplete();
        } else {
          setError(t.userNotFound);
          setLoading(false);
        }
      }
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e]"
    >
      <div className="flex-1 flex flex-col justify-center px-6 max-w-md mx-auto w-full">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="text-white/40 text-sm mb-6 hover:text-white transition-colors self-start"
        >
          ← {t.back}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-2"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
            {mode === 'register' ? <UserPlus size={20} /> : <LogIn size={20} />}
          </div>
          <h2 className="text-3xl font-bold text-white">
            {mode === 'register' ? t.registerTitle : t.signInTitle}
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white/50 mb-6"
        >
          {mode === 'register' ? t.registerSubtitle : t.signInSubtitle}
        </motion.p>

        {/* Toggle mode */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex bg-white/5 rounded-xl p-1 mb-6"
        >
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'register'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t.registerLink}
          </button>
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'login'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t.loginLink}
          </button>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
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
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="text-white/60 text-sm mb-1.5 flex items-center gap-1.5">
              <Phone size={14} /> {t.phone}
            </label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(formatPhone(e.target.value))}
              placeholder={t.placeholderPhone}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:border-[#FF6B9D]/50 focus:ring-1 focus:ring-[#FF6B9D]/30 transition-all"
              autoFocus={mode === 'login'}
            />
            <p className="text-white/20 text-[10px] mt-1">
              {mode === 'login' ? 'Ej: +34 612 345 678' : ''}
            </p>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold text-lg shadow-lg shadow-[#FF6B9D]/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : mode === 'register' ? t.ctaRegister : t.ctaLogin}
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/30 text-xs mt-6 flex items-center justify-center gap-1"
        >
          <ShieldCheck size={12} /> {t.secure}
        </motion.p>
      </div>
    </motion.div>
  );
}
