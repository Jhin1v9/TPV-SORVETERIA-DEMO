import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Smartphone, Clock } from 'lucide-react';
import { useStore } from '@tpv/shared/stores/useStore';
import { generateKioskCode } from '@tpv/shared/realtime/client';

const CODE_TTL_SECONDS = 300; // 5 minutos

export default function MeuCodigo() {
  const { perfilUsuario, locale } = useStore();
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [, setTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const remainingSeconds = expiresAt ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) : 0;
  const isExpired = expiresAt !== null && remainingSeconds <= 0;

  const generate = useCallback(async () => {
    if (!perfilUsuario?.id) return;
    setLoading(true);
    setError('');
    try {
      const newCode = await generateKioskCode(perfilUsuario.id);
      setCode(newCode);
      setExpiresAt(Date.now() + CODE_TTL_SECONDS * 1000);
      setTick((t) => t + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar código');
    } finally {
      setLoading(false);
    }
  }, [perfilUsuario?.id]);

  useEffect(() => {
    if (code && !isExpired) {
      intervalRef.current = setInterval(() => {
        setTick((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [code, isExpired]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!perfilUsuario) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Smartphone size={18} className="text-[#FF6B9D]" />
          Código del Tótem
        </h3>
        <p className="text-sm text-gray-500">Guarda tu perfil para generar un código.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Smartphone size={18} className="text-[#FF6B9D]" />
        {locale === 'pt' ? 'Código do Totem' : locale === 'ca' ? 'Codi del Tòtem' : 'Código del Tótem'}
      </h3>

      {!code || isExpired ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {locale === 'pt'
              ? 'Gere um código de 5 dígitos para vincular seu pedido no totem.'
              : locale === 'ca'
              ? 'Genera un codi de 5 dígits per vincular la teva comanda al tòtem.'
              : 'Genera un código de 5 dígitos para vincular tu pedido en el tótem.'}
          </p>
          <motion.button
            onClick={generate}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold text-sm shadow-lg disabled:opacity-50"
          >
            {loading ? '...' : locale === 'pt' ? 'Gerar Código' : locale === 'ca' ? 'Generar Codi' : 'Generar Código'}
          </motion.button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Código grande */}
          <div className="flex justify-center gap-2">
            {code.split('').map((digit, i) => (
              <motion.div
                key={`${code}-${i}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="w-12 h-14 bg-gray-900 rounded-xl flex items-center justify-center text-white font-mono text-2xl font-bold shadow-lg"
              >
                {digit}
              </motion.div>
            ))}
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <Clock size={14} className={remainingSeconds < 60 ? 'text-red-500' : 'text-gray-400'} />
            <span className={remainingSeconds < 60 ? 'text-red-500 font-medium' : 'text-gray-500'}>
              {formatTime(remainingSeconds)}
            </span>
          </div>

          {/* Instruções */}
          <p className="text-xs text-center text-gray-400 leading-relaxed">
            {locale === 'pt'
              ? 'Digite este código no totem para vincular seu pedido ao seu perfil.'
              : locale === 'ca'
              ? 'Introdueix aquest codi al tòtem per vincular la teva comanda al teu perfil.'
              : 'Introduce este código en el tótem para vincular tu pedido a tu perfil.'}
          </p>

          {/* Renovar */}
          <motion.button
            onClick={generate}
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} />
            {locale === 'pt' ? 'Gerar Novo' : locale === 'ca' ? 'Generar Nou' : 'Generar Nuevo'}
          </motion.button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  );
}
