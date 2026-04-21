import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, Banknote, Smartphone, ArrowLeft, CheckCircle2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<PaymentTab>('efectivo');
  const [bizumPhone, setBizumPhone] = useState('');

  const tabs: { id: PaymentTab; label: string; icon: React.ReactNode }[] = [
    { id: 'tarjeta', label: 'Tarjeta', icon: <CreditCard size={22} /> },
    { id: 'efectivo', label: 'Efectivo', icon: <Banknote size={22} /> },
    { id: 'bizum', label: 'Bizum', icon: <Smartphone size={22} /> },
  ];

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <motion.button onClick={onBack} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 text-white/60 hover:text-white">
          <ArrowLeft size={20} />
          <span className="text-lg font-medium">Atrás</span>
        </motion.button>
        <span className="font-display font-bold text-white text-xl">Pago</span>
        <div className="w-24" />
      </div>

      {/* Tabs */}
      <div className="px-6 py-4">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#0a0a0f] shadow-lg'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70'
              }`}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>
        {errorMessage && (
          <p className="mt-3 rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm font-medium text-red-300">
            {errorMessage}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'tarjeta' && (
            <motion.div
              key="tarjeta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full gap-6"
            >
              {!busy ? (
                <>
                  {/* Card visual */}
                  <div className="w-full max-w-md h-56 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-3xl p-6 relative overflow-hidden border border-white/10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-12 h-8 bg-[#FFD700]/20 rounded flex items-center justify-center border border-[#FFD700]/30">
                        <span className="text-[#FFD700] text-xs font-bold">CHIP</span>
                      </div>
                      <span className="text-white/40 text-xs font-mono tracking-widest">DEBIT</span>
                    </div>
                    <div className="font-mono text-white text-2xl tracking-[0.3em] mb-6">**** **** **** 4242</div>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-white/30 text-xs uppercase tracking-wider">Titular</p>
                        <p className="text-white text-sm mt-1">CLIENTE SABADELL</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/30 text-xs uppercase tracking-wider">Expira</p>
                        <p className="text-white text-sm mt-1">12/28</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-white/30 text-center">Acerca tu tarjeta al lector o toca el botón</p>

                  <motion.button
                    onClick={() => onPay('tarjeta')}
                    whileTap={{ scale: 0.97 }}
                    className="w-full max-w-md py-5 rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-display font-bold text-2xl shadow-2xl shadow-[#FF6B9D]/30 flex items-center justify-center gap-3"
                  >
                    <CreditCard size={28} />
                    Pagar con Tarjeta
                  </motion.button>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-[#FF6B9D] border-t-transparent rounded-full mb-6"
                  />
                  <p className="font-display text-2xl text-white">Procesando pago...</p>
                  <p className="text-white/30 text-base mt-2">No retires la tarjeta</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'efectivo' && (
            <motion.div
              key="efectivo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full gap-6"
            >
              <div className="bg-white/5 rounded-3xl p-8 border border-white/10 flex flex-col items-center">
                <QRCodeSVG value="PAGO-EFECTIVO-KIOSK" size={220} level="M" bgColor="transparent" fgColor="#ffffff" />
                <p className="font-mono font-bold text-xl text-white mt-4">Paga en caja</p>
              </div>

              <div className="flex items-center gap-3 text-white/40 bg-white/5 rounded-xl px-6 py-4 border border-white/5">
                <Banknote size={20} />
                <p className="text-base">Muestra este código en caja</p>
              </div>

              <motion.button
                onClick={() => onPay('efectivo')}
                whileTap={{ scale: 0.97 }}
                disabled={busy}
                className="w-full max-w-md py-5 rounded-2xl bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] text-white font-display font-bold text-2xl shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <CheckCircle2 size={28} />
                Confirmar pedido
              </motion.button>
            </motion.div>
          )}

          {activeTab === 'bizum' && (
            <motion.div
              key="bizum"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full gap-6"
            >
              <div className="w-24 h-24 bg-[#4CAF50]/10 rounded-full flex items-center justify-center border border-[#4CAF50]/20">
                <Smartphone size={48} className="text-[#4CAF50]" />
              </div>

              <div className="text-center">
                <h3 className="font-display text-2xl font-bold text-white mb-1">Bizum</h3>
                <p className="text-white/40 text-base">Introduce tu número de teléfono</p>
              </div>

              <input
                type="tel"
                value={bizumPhone}
                onChange={(e) => setBizumPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                placeholder="612 345 678"
                className="w-80 h-16 text-center text-3xl font-mono bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder:text-white/20 focus:border-[#4CAF50] outline-none transition-colors"
                maxLength={9}
              />

              <motion.button
                onClick={() => onPay('bizum')}
                disabled={bizumPhone.length !== 9 || busy}
                whileTap={bizumPhone.length === 9 ? { scale: 0.97 } : {}}
                className="w-full max-w-md py-5 rounded-2xl font-display font-bold text-2xl shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] text-white"
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
