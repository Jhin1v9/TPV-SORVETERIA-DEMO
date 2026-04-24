import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
import { Mail, Printer, QrCode, X, CheckCircle2, Loader2 } from 'lucide-react';

interface ReceiptSelectorProps {
  orderNumber: string;
  total: number;
  onEmail: (email: string) => Promise<void>;
  onPrint: () => Promise<void>;
  onQR: () => void;
  onClose: () => void;
}

type ReceiptStep = 'select' | 'email' | 'sending' | 'success' | 'error';

export default function ReceiptSelector({
  orderNumber,
  total,
  onEmail,
  onPrint,
  onQR,
  onClose,
}: ReceiptSelectorProps) {
  const { locale, perfilUsuario } = useStore();
  const [step, setStep] = useState<ReceiptStep>('select');
  const [email, setEmail] = useState(perfilUsuario?.email || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmail = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg(t('emailInvalid', locale));
      return;
    }
    setStep('sending');
    try {
      await onEmail(email);
      setStep('success');
    } catch (err) {
      setErrorMsg(t('emailError', locale));
      setStep('error');
    }
  };

  const handlePrint = async () => {
    setStep('sending');
    try {
      await onPrint();
      setStep('success');
    } catch (err) {
      setErrorMsg(t('printerError', locale));
      setStep('error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-800">
              {step === 'select' ? t('receiptQuestion', locale) : t('receipt', locale)}
            </h3>
            <p className="text-xs text-gray-400">
              Pedido #{orderNumber} · €{total.toFixed(2)}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* SELEÇÃO */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {/* Email */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep('email')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-300 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                  <Mail size={22} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{t('emailReceipt', locale)}</p>
                  <p className="text-xs text-gray-500">{t('emailReceiptDesc', locale)}</p>
                </div>
              </motion.button>

              {/* Imprimir */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handlePrint}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 hover:border-emerald-300 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                  <Printer size={22} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{t('printReceipt', locale)}</p>
                  <p className="text-xs text-gray-500">{t('printReceiptDesc', locale)}</p>
                </div>
              </motion.button>

              {/* QR */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onQR}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 hover:border-purple-300 transition-colors text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white">
                  <QrCode size={22} />
                </div>
                <div>
                  <p className="font-bold text-gray-800">{t('qrReceipt', locale)}</p>
                  <p className="text-xs text-gray-500">{t('qrReceiptDesc', locale)}</p>
                </div>
              </motion.button>

              {/* Não, obrigado */}
              <button
                onClick={onClose}
                className="w-full py-3 text-gray-400 text-sm hover:text-gray-600"
              >
                {t('noThanks', locale)}
              </button>
            </motion.div>
          )}

          {/* EMAIL INPUT */}
          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <label className="text-xs font-medium text-gray-500">{t('emailLabel', locale)}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                placeholder="maria@email.com"
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm border-2 border-transparent focus:border-pink-400 outline-none"
              />
              {errorMsg && <p className="text-red-500 text-xs">{errorMsg}</p>}

              <div className="flex gap-2">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-medium"
                >
                  {t('back', locale)}
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEmail}
                  className="flex-[2] py-2.5 bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold rounded-xl text-sm"
                >
                  {t('send', locale)}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ENVIANDO */}
          {step === 'sending' && (
            <motion.div
              key="sending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center py-8"
            >
              <Loader2 size={32} className="animate-spin text-[#FF6B9D] mb-3" />
              <p className="text-gray-600 font-medium">{t('sending', locale)}...</p>
            </motion.div>
          )}

          {/* SUCESSO */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <CheckCircle2 size={48} className="text-emerald-500 mb-3" />
              </motion.div>
              <p className="text-gray-800 font-bold">{t('receiptSent', locale)}!</p>
              <p className="text-gray-400 text-xs mt-1">{t('checkInbox', locale)}</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-gray-100 rounded-xl text-gray-600 text-sm font-medium hover:bg-gray-200"
              >
                {t('close', locale)}
              </button>
            </motion.div>
          )}

          {/* ERRO */}
          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <p className="text-red-500 font-medium">{t('error', locale)}</p>
              <p className="text-gray-400 text-xs mt-1">{errorMsg}</p>
              <button
                onClick={() => setStep('select')}
                className="mt-3 px-4 py-2 bg-gray-100 rounded-lg text-gray-600 text-sm"
              >
                {t('tryAgain', locale)}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
