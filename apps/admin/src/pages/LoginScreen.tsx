import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';

export default function LoginScreen() {
  const { setAdminLogged, locale } = useStore();
  const [email, setEmail] = useState('admin@sorveteria.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === '123456') {
      setAdminLogged(true);
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#FF6B9D]/20 via-[#FFA07A]/10 to-[#4ECDC4]/20 flex items-center justify-center">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF6B9D] to-[#FFA07A] rounded-2xl flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
              <circle cx="16" cy="10" r="8" fill="white" opacity="0.9" />
              <path d="M8 14 Q16 36 24 14" fill="#D2691E" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-gray-800">Sabadell Nord</h1>
          <p className="text-gray-400 text-sm mt-1">{t('loginTitle', locale)}</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">{t('email', locale)}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none text-sm transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">{t('password', locale)}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••"
              className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#FF6B9D] outline-none text-sm transition-colors"
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm">
              {t('invalidCredentials', locale)}
            </motion.p>
          )}

          <motion.button
            onClick={handleLogin}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-display font-bold shadow-lg"
            whileTap={{ scale: 0.98 }}
          >
            {t('login', locale)}
          </motion.button>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">Demo: {t('password', locale)} 123456</p>
      </motion.div>
    </div>
  );
}
