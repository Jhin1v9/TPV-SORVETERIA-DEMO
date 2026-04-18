import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../../../shared/stores/useStore';
import { t } from '../../../shared/utils/i18n';
import { calculateCheckoutSummary } from '../../../shared/utils/pricing';

type PaymentTab = 'tarjeta' | 'efectivo' | 'bizum';

export default function PagamentoScreen({
  onBack,
  onPay,
  busy,
  errorMessage,
}: {
  onBack: () => void;
  onPay: (method: string) => Promise<void>;
  busy: boolean;
  errorMessage?: string;
}) {
  const {
    locale,
    carrinho,
    promoCode,
    promoApplied,
    promoDiscountRate,
    coffeeAdded,
    coffeePrice,
    notificationPhone,
    setNotificationPhone,
  } = useStore();
  const summary = calculateCheckoutSummary(carrinho, {
    promoCode,
    promoApplied,
    promoDiscountRate,
    coffeeAdded,
    coffeePrice,
    notificationPhone,
  });
  const [activeTab, setActiveTab] = useState<PaymentTab>('efectivo');
  const [bizumPhone, setBizumPhone] = useState(notificationPhone);

  const tabs: { id: PaymentTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'tarjeta',
      label: t('card', locale),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    },
    {
      id: 'efectivo',
      label: t('cash', locale),
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'bizum',
      label: 'Bizum',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const qrData = JSON.stringify({
    session: 'demo-realtime',
    total: summary.total.toFixed(2),
    createdAt: new Date().toISOString(),
  });

  async function handleBizum() {
    if (bizumPhone.length !== 9 || busy) {
      return;
    }
    setNotificationPhone(bizumPhone);
    await onPay('bizum');
  }

  async function handleTarjeta() {
    if (busy) {
      return;
    }
    await onPay('tarjeta');
  }

  async function handleCash() {
    if (busy) {
      return;
    }
    await onPay('efectivo');
  }

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA]">
      <div className="flex items-center justify-between px-8 py-5">
        <motion.button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700" whileTap={{ scale: 0.95 }}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">{t('back', locale)}</span>
        </motion.button>

        <h1 className="font-display text-2xl font-bold text-gray-800">{t('payment', locale)}</h1>

        <div className="font-mono font-bold text-xl text-[#FF6B9D]">EUR {summary.total.toFixed(2)}</div>
      </div>

      <div className="px-8 pb-4">
        <div className="flex bg-gray-100 rounded-2xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id ? 'bg-white text-[#FF6B9D] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        {errorMessage && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}
      </div>

      <div className="flex-1 px-8 pb-4 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'tarjeta' && (
            <motion.div key="tarjeta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center justify-center h-full">
              {!busy ? (
                <>
                  <div className="w-80 h-48 bg-gradient-to-br from-[#2D3436] to-[#636E72] rounded-2xl shadow-xl p-6 relative overflow-hidden mb-8">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-8 bg-[#FFD700]/20 rounded flex items-center justify-center">
                        <span className="text-[#FFD700] text-xs font-bold">CHIP</span>
                      </div>
                      <span className="text-white/60 text-xs font-mono">DEBIT</span>
                    </div>
                    <div className="font-mono text-white text-lg tracking-widest mb-4">**** **** **** 4242</div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-white/40 text-[9px] uppercase">Titular</p>
                        <p className="text-white text-xs">CLIENTE SABADELL</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-[9px] uppercase">Expira</p>
                        <p className="text-white text-xs">12/28</p>
                      </div>
                    </div>
                  </div>

                  <motion.button onClick={handleTarjeta} className="h-16 px-12 rounded-2xl bg-[#2D3436] text-white font-display font-bold text-lg shadow-lg flex items-center gap-3" whileTap={{ scale: 0.98 }}>
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pagar EUR {summary.total.toFixed(2)}
                  </motion.button>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 border-4 border-[#FF6B9D] border-t-transparent rounded-full mb-6" />
                  <p className="font-display text-xl text-gray-700">{t('processing', locale)}</p>
                  <p className="text-gray-400 text-sm mt-2">Confirmando com o backend local da demo...</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'efectivo' && (
            <motion.div key="efectivo" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center justify-center h-full">
              <div className="bg-white rounded-3xl p-8 shadow-lg flex flex-col items-center">
                <QRCodeSVG value={qrData} size={180} level="M" bgColor="#FFFFFF" fgColor="#2D3436" includeMargin={false} />
                <p className="font-mono font-bold text-lg text-gray-800 mt-4">EUR {summary.total.toFixed(2)}</p>
              </div>

              <div className="mt-6 flex items-center gap-3 text-gray-500 bg-gray-100 rounded-xl px-6 py-3">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">{t('payAtCounter', locale)}</p>
              </div>

              <motion.button onClick={handleCash} className="mt-8 h-14 px-10 rounded-2xl bg-[#4CAF50] text-white font-display font-bold shadow-lg disabled:opacity-60" whileTap={{ scale: 0.98 }} disabled={busy}>
                Confirmar pedido
              </motion.button>
            </motion.div>
          )}

          {activeTab === 'bizum' && (
            <motion.div key="bizum" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-[#4CAF50]/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>

              <h3 className="font-display text-xl font-bold text-gray-800 mb-2">Bizum</h3>
              <p className="text-gray-400 text-sm mb-6">O telefone fica gravado no pedido real da sessao</p>

              <input
                type="tel"
                value={bizumPhone}
                onChange={(event) => setBizumPhone(event.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder="612345678"
                className="w-64 h-14 text-center text-2xl font-mono border-2 border-gray-200 rounded-2xl focus:border-[#4CAF50] outline-none mb-6"
                maxLength={9}
              />

              <motion.button
                onClick={handleBizum}
                disabled={bizumPhone.length !== 9 || busy}
                className="h-14 px-10 rounded-2xl font-display font-bold shadow-lg transition-all disabled:opacity-50 bg-[#4CAF50] text-white"
                whileTap={bizumPhone.length === 9 ? { scale: 0.98 } : {}}
              >
                {busy ? 'Enviando...' : 'Enviar solicitud'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
