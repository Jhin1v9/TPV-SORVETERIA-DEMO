import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../shared/stores/useStore';
import { t } from '../../../shared/utils/i18n';
import { calcularPrecoItem, calcularTotalCarrinho } from '../../../shared/utils/calculos';

export default function CarrinhoScreen({ onBack, onPay }: { onBack: () => void; onPay: () => void }) {
  const { locale, carrinho, removeFromCarrinho } = useStore();
  const { subtotal, iva, total } = calcularTotalCarrinho(carrinho);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [showCoffeeUpsell] = useState(total > 5);
  const [coffeeAdded, setCoffeeAdded] = useState(false);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'SABADELL20') {
      setPromoApplied(true);
    }
  };

  const discount = promoApplied ? subtotal * 0.2 : 0;
  const finalTotal = total - discount + (coffeeAdded ? 1.5 : 0);

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA]">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5">
        <motion.button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700" whileTap={{ scale: 0.95 }}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">{t('back', locale)}</span>
        </motion.button>

        <h1 className="font-display text-2xl font-bold text-gray-800">{t('yourOrder', locale)}</h1>

        <div className="w-20" />
      </div>

      {/* Items list */}
      <div className="flex-1 px-8 pb-4 overflow-auto">
        <div className="space-y-3">
          <AnimatePresence>
            {carrinho.map((item, idx) => {
              const preco = calcularPrecoItem(item.categoria, item.sabores, item.toppings);
              return (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
                >
                  {/* Color indicator */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: item.categoria.corHex }}>
                    {item.sabores.length}x
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{item.categoria.nome[locale]}</p>
                    <p className="text-sm text-gray-400 truncate">
                      {item.sabores.map((s) => s.nome[locale] || s.nome.es).join(' + ')}
                    </p>
                    {item.toppings.length > 0 && (
                      <p className="text-xs text-[#FF6B9D]">
                        + {item.toppings.map((t) => t.nome).join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Price + remove */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-bold text-gray-800">€{preco.toFixed(2)}</p>
                    <button
                      onClick={() => removeFromCarrinho(idx)}
                      className="text-red-400 hover:text-red-600 text-xs mt-1"
                    >
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Coffee upsell */}
        <AnimatePresence>
          {showCoffeeUpsell && !coffeeAdded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-gradient-to-r from-[#6F4E37] to-[#8B6914] rounded-2xl p-4 text-white flex items-center gap-4"
            >
              <div className="text-3xl">☕</div>
              <div className="flex-1">
                <p className="font-semibold">{t('addCoffee', locale)}</p>
                <p className="text-xs text-white/70">Perfecto para acompañar</p>
              </div>
              <button
                onClick={() => setCoffeeAdded(true)}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                Añadir
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Promo code */}
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-2">{t('promoCode', locale)}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder="SABADELL20"
              className="flex-1 h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-[#FF6B9D] outline-none text-sm"
            />
            <button
              onClick={handleApplyPromo}
              className="h-12 px-6 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold text-sm transition-colors"
            >
              {t('apply', locale)}
            </button>
          </div>
          {promoApplied && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-500 text-sm mt-2">
              ✓ Descuento 20% aplicado (-€{discount.toFixed(2)})
            </motion.p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="px-8 py-5 bg-white border-t border-gray-100">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-500">
            <span>{t('subtotal', locale)}</span>
            <span className="font-mono">€{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>{t('iva', locale)}</span>
            <span className="font-mono">€{iva.toFixed(2)}</span>
          </div>
          {coffeeAdded && (
            <div className="flex justify-between text-gray-500">
              <span>Café</span>
              <span className="font-mono">€1.50</span>
            </div>
          )}
          {promoApplied && (
            <div className="flex justify-between text-green-500">
              <span>Descuento (20%)</span>
              <span className="font-mono">-€{discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-100">
            <span>{t('total', locale)}</span>
            <span className="font-mono text-[#FF6B9D]">€{finalTotal.toFixed(2)}</span>
          </div>
        </div>

        <motion.button
          onClick={onPay}
          className="w-full h-16 rounded-2xl bg-[#4CAF50] text-white font-display font-bold text-xl flex items-center justify-center gap-3 shadow-lg hover:bg-[#43A047] transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {t('pay', locale, { amount: finalTotal.toFixed(2) })}
        </motion.button>
      </div>
    </div>
  );
}
