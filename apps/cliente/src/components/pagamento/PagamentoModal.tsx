import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Banknote, ChevronRight, ShieldCheck, Lock, Wallet, Apple } from 'lucide-react';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
import { formatSpanishPhoneDisplay, isValidSpanishPhone, normalizeSpanishPhone } from '@tpv/shared/lib/phone';

export type MetodoPagamento = 'tarjeta' | 'bizum' | 'efectivo' | 'apple_pay' | 'google_pay';

export interface PagamentoData {
  metodo: MetodoPagamento;
  tarjeta?: {
    numero: string;
    titular: string;
    caducidad: string;
    cvv: string;
  };
  bizum?: {
    telefono: string;
  };
  /** Usado para Stripe, Apple Pay, Google Pay */
  stripeClientSecret?: string;
  stripePaymentIntentId?: string;
}

interface PagamentoModalProps {
  total: number;
  onClose: () => void;
  onSubmit: (data: PagamentoData) => void;
  /** Se true, mostra opções de Stripe (Apple Pay, Google Pay, cartão) */
  stripeEnabled?: boolean;
  /** Se true, está em modo kiosk físico (TPV) */
  isPhysicalKiosk?: boolean;
}

export default function PagamentoModal({
  total,
  onClose,
  onSubmit,
  stripeEnabled = false,
  isPhysicalKiosk = false,
}: PagamentoModalProps) {
  const { locale } = useStore();
  const [metodo, setMetodo] = useState<MetodoPagamento>('tarjeta');
  const [tarjetaNumero, setTarjetaNumero] = useState('');
  const [tarjetaTitular, setTarjetaTitular] = useState('');
  const [tarjetaCaducidad, setTarjetaCaducidad] = useState('');
  const [tarjetaCvv, setTarjetaCvv] = useState('');
  const [bizumTelefono, setBizumTelefono] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const iva = total * 0.10;
  const totalConIva = total + iva;

  // Detecta se o navegador suporta Apple Pay ou Google Pay
  const canUseApplePay = typeof window !== 'undefined' && /iPhone|iPad|iPod|Mac/.test(navigator.userAgent);
  const canUseGooglePay = typeof window !== 'undefined' && /Android/.test(navigator.userAgent);

  const validate = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (metodo === 'tarjeta') {
      if (tarjetaNumero.replace(/\s/g, '').length < 16) errs.numero = t('cardNumberInvalid', locale);
      if (tarjetaTitular.trim().length < 3) errs.titular = t('cardHolderInvalid', locale);
      if (!/^\d{2}\/\d{2}$/.test(tarjetaCaducidad)) errs.caducidad = t('cardExpiryInvalid', locale);
      if (tarjetaCvv.length < 3) errs.cvv = t('cardCvvInvalid', locale);
    }
    if (metodo === 'bizum') {
      if (!isValidSpanishPhone(bizumTelefono)) errs.telefono = t('phoneInvalid', locale);
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [metodo, tarjetaNumero, tarjetaTitular, tarjetaCaducidad, tarjetaCvv, bizumTelefono, locale]);

  const handleSubmit = () => {
    if (!validate()) return;

    // Se kiosk físico + tarjeta → envia sem dados manuais (TPV físico lê o cartão)
    if (isPhysicalKiosk && metodo === 'tarjeta') {
      onSubmit({ metodo: 'tarjeta' });
      return;
    }

    const data: PagamentoData = {
      metodo,
      ...(metodo === 'tarjeta' && {
        tarjeta: {
          numero: tarjetaNumero.replace(/\s/g, ''),
          titular: tarjetaTitular,
          caducidad: tarjetaCaducidad,
          cvv: tarjetaCvv,
        },
      }),
      ...(metodo === 'bizum' && {
        bizum: { telefono: normalizeSpanishPhone(bizumTelefono) },
      }),
    };
    onSubmit(data);
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  // Se for kiosk físico, mostra tela especial para TPV
  if (isPhysicalKiosk) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl">{t('payment', locale)}</h2>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 mb-4 border border-pink-100">
            <div className="flex justify-between">
              <span className="font-bold text-gray-800">{t('total', locale)}</span>
              <span className="font-bold text-xl text-[#FF6B9D]">€{totalConIva.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onSubmit({ metodo: 'tarjeta' })}
              className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-pink-400 bg-pink-50 text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                <CreditCard size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{t('payCard', locale)}</p>
                <p className="text-xs text-gray-500">{t('tapPhysicalTpv', locale)}</p>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onSubmit({ metodo: 'bizum' })}
              className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                <Smartphone size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{t('payBizum', locale)}</p>
                <p className="text-xs text-gray-500">Bizum</p>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onSubmit({ metodo: 'efectivo' })}
              className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-100 hover:border-gray-200 text-left"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                <Banknote size={20} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{t('payCash', locale)}</p>
                <p className="text-xs text-gray-500">{t('payOnPickup', locale)}</p>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // Modo normal (PWA ou kiosk web)
  const metodos = [
    {
      id: 'tarjeta' as MetodoPagamento,
      icon: <CreditCard size={20} />,
      label: t('payCard', locale),
      sublabel: stripeEnabled ? 'Stripe · Visa · Mastercard' : 'Visa, Mastercard',
      gradient: 'from-blue-500 to-indigo-600',
    },
    ...(canUseApplePay ? [{
      id: 'apple_pay' as MetodoPagamento,
      icon: <Apple size={20} />,
      label: 'Apple Pay',
      sublabel: 'Pago rápido con Face ID',
      gradient: 'from-gray-800 to-black' as const,
    }] : []),
    ...(canUseGooglePay ? [{
      id: 'google_pay' as MetodoPagamento,
      icon: <Wallet size={20} />,
      label: 'Google Pay',
      sublabel: 'Pago rápido con tu móvil',
      gradient: 'from-blue-600 to-cyan-500' as const,
    }] : []),
    {
      id: 'bizum' as MetodoPagamento,
      icon: <Smartphone size={20} />,
      label: t('payBizum', locale),
      sublabel: 'Pago móvil instantáneo',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'efectivo' as MetodoPagamento,
      icon: <Banknote size={20} />,
      label: t('payCash', locale),
      sublabel: t('payOnPickup', locale),
      gradient: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <h2 className="font-display font-bold text-xl text-gray-800">{t('payment', locale)}</h2>
            <p className="text-gray-400 text-xs">{t('choosePaymentMethod', locale)}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {/* Total resumen */}
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 mb-4 border border-pink-100">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">{t('subtotal', locale)}</span>
              <span className="font-medium text-gray-700">€{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">{t('iva', locale)} (10%)</span>
              <span className="font-medium text-gray-700">€{iva.toFixed(2)}</span>
            </div>
            <div className="border-t border-pink-200 pt-2 flex justify-between">
              <span className="font-bold text-gray-800">{t('total', locale)}</span>
              <span className="font-bold text-xl text-[#FF6B9D]">€{totalConIva.toFixed(2)}</span>
            </div>
          </div>

          {/* Métodos de pago */}
          <div className="space-y-2 mb-4">
            {metodos.map((m) => (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setMetodo(m.id); setErrors({}); }}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                  metodo === m.id
                    ? 'border-pink-400 bg-pink-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center text-white shadow-md`}>
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-800">{m.label}</p>
                  <p className="text-xs text-gray-400">{m.sublabel}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  metodo === m.id ? 'border-pink-500' : 'border-gray-300'
                }`}>
                  {metodo === m.id && <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Form dinâmico por método */}
          <AnimatePresence mode="wait">
            {(metodo === 'tarjeta' || metodo === 'apple_pay' || metodo === 'google_pay') && (
              <motion.div
                key="tarjeta"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {stripeEnabled && (metodo === 'apple_pay' || metodo === 'google_pay') ? (
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">
                      {metodo === 'apple_pay'
                        ? 'Apple Pay se procesará via Stripe en el siguiente paso'
                        : 'Google Pay se procesará via Stripe en el siguiente paso'}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Card preview */}
                    <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-5 text-white shadow-xl mb-2">
                      <div className="flex justify-between items-start mb-6">
                        <CreditCard size={28} className="opacity-80" />
                        <div className="flex gap-1">
                          <div className="w-8 h-5 bg-yellow-400/80 rounded-sm" />
                          <div className="w-8 h-5 bg-red-500/80 rounded-sm" />
                        </div>
                      </div>
                      <p className="text-lg tracking-[0.2em] font-mono mb-4">
                        {tarjetaNumero || '•••• •••• •••• ••••'}
                      </p>
                      <div className="flex justify-between">
                        <div>
                          <p className="text-[8px] opacity-60 uppercase">Titular</p>
                          <p className="text-xs font-medium">{tarjetaTitular || 'NOMBRE APELLIDO'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] opacity-60 uppercase">Caduca</p>
                          <p className="text-xs font-medium">{tarjetaCaducidad || 'MM/AA'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">{t('cardNumber', locale)}</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="4242 4242 4242 4242"
                        value={tarjetaNumero}
                        onChange={(e) => setTarjetaNumero(formatCardNumber(e.target.value))}
                        className={`w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border-2 transition-colors outline-none focus:border-pink-400 ${errors.numero ? 'border-red-300' : 'border-transparent'}`}
                      />
                      {errors.numero && <p className="text-red-500 text-xs mt-1">{errors.numero}</p>}
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">{t('cardHolder', locale)}</label>
                      <input
                        type="text"
                        placeholder="MARÍA GARCÍA"
                        value={tarjetaTitular}
                        onChange={(e) => setTarjetaTitular(e.target.value.toUpperCase())}
                        className={`w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border-2 transition-colors outline-none focus:border-pink-400 ${errors.titular ? 'border-red-300' : 'border-transparent'}`}
                      />
                      {errors.titular && <p className="text-red-500 text-xs mt-1">{errors.titular}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">{t('cardExpiry', locale)}</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="12/28"
                          value={tarjetaCaducidad}
                          onChange={(e) => setTarjetaCaducidad(formatExpiry(e.target.value))}
                          className={`w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border-2 transition-colors outline-none focus:border-pink-400 ${errors.caducidad ? 'border-red-300' : 'border-transparent'}`}
                        />
                        {errors.caducidad && <p className="text-red-500 text-xs mt-1">{errors.caducidad}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">CVV</label>
                        <input
                          type="password"
                          inputMode="numeric"
                          placeholder="123"
                          maxLength={4}
                          value={tarjetaCvv}
                          onChange={(e) => setTarjetaCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className={`w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border-2 transition-colors outline-none focus:border-pink-400 ${errors.cvv ? 'border-red-300' : 'border-transparent'}`}
                        />
                        {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-gray-400">
                      <Lock size={12} />
                      <span className="text-[10px]">{t('securePayment', locale)}</span>
                      <ShieldCheck size={12} className="text-emerald-500" />
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {metodo === 'bizum' && (
              <motion.div
                key="bizum"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white text-center shadow-xl mb-2">
                  <Smartphone size={32} className="mx-auto mb-2 opacity-90" />
                  <p className="font-bold text-lg">Bizum</p>
                  <p className="text-xs opacity-80">Pago instantáneo desde tu banco</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">{t('phoneNumber', locale)}</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="612 345 678"
                    value={bizumTelefono}
                    onChange={(e) => setBizumTelefono(formatSpanishPhoneDisplay(e.target.value))}
                    className={`w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border-2 transition-colors outline-none focus:border-pink-400 ${errors.telefono ? 'border-red-300' : 'border-transparent'}`}
                  />
                  {errors.telefono && <p className="text-red-500 text-xs mt-1">{errors.telefono}</p>}
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {t('bizumDesc', locale)}
                </p>
              </motion.div>
            )}

            {metodo === 'efectivo' && (
              <motion.div
                key="efectivo"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white text-center shadow-xl mb-2">
                  <Banknote size={32} className="mx-auto mb-2 opacity-90" />
                  <p className="font-bold text-lg">{t('payOnPickup', locale)}</p>
                  <p className="text-xs opacity-80">Paga en el mostrador al recoger</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <p className="text-amber-700 text-xs font-medium">💡 {t('cashTip', locale, { amount: totalConIva.toFixed(2) })}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer button */}
        <div className="p-5 pt-2 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
          >
            {t('payNow', locale)} €{totalConIva.toFixed(2)}
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
