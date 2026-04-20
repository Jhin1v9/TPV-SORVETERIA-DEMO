import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../shared/stores/useStore';
import { t } from '../../../shared/i18n';
import { calcularPrecoItem } from '../../../shared/utils/calculos';
import { calculateCheckoutSummary } from '../../../shared/utils/pricing';

export default function CarrinhoScreen({ onBack, onPay }: { onBack: () => void; onPay: () => void }) {
  const {
    locale,
    carrinho,
    removeFromCarrinho,
    promoCode,
    setPromoCode,
    promoApplied,
    applyPromoCode,
    coffeeAdded,
    setCoffeeAdded,
    promoDiscountRate,
    coffeePrice,
  } = useStore();
  const summary = calculateCheckoutSummary(carrinho, {
    promoCode,
    promoApplied,
    promoDiscountRate,
    coffeeAdded,
    coffeePrice,
    notificationPhone: '',
  });
  const showCoffeeUpsell = summary.itemsSubtotal > 5;

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA]">
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

      <div className="flex-1 px-8 pb-4 overflow-auto">
        <div className="space-y-3">
          <AnimatePresence>
            {carrinho.map((item, idx) => {
              const preco = calcularPrecoItem(item.categoria, item.sabores, item.toppings);
              const stableKey = `${item.categoria.id}-${item.sabores.map((sabor) => sabor.id).join('-')}-${item.toppings.map((topping) => topping.id).join('-')}-${idx}`;
              return (
                <motion.div
                  key={stableKey}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: item.categoria.corHex }}>
                    {item.sabores.length}x
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800">{item.categoria.nome[locale]}</p>
                    <p className="text-sm text-gray-400 truncate">
                      {item.sabores.map((sabor) => sabor.nome[locale] || sabor.nome.es).join(' + ')}
                    </p>
                    {item.toppings.length > 0 && (
                      <p className="text-xs text-[#FF6B9D]">
                        + {item.toppings.map((topping) => topping.nome.es).join(', ')}
                      </p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-mono font-bold text-gray-800">EUR {preco.toFixed(2)}</p>
                    <button onClick={() => removeFromCarrinho(idx)} className="text-red-400 hover:text-red-600 text-xs mt-1">
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showCoffeeUpsell && !coffeeAdded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 bg-gradient-to-r from-[#6F4E37] to-[#8B6914] rounded-2xl p-4 text-white flex items-center gap-4"
            >
              <div className="text-3xl">Cafe</div>
              <div className="flex-1">
                <p className="font-semibold">{t('addCoffee', locale)}</p>
                <p className="text-xs text-white/70">Extra integrado ao pedido real da demo</p>
              </div>
              <button onClick={() => setCoffeeAdded(true)} className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                Anadir
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-700 mb-2">{t('promoCode', locale)}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(event) => setPromoCode(event.target.value)}
              placeholder="SABADELL20"
              className="flex-1 h-12 px-4 rounded-xl border-2 border-gray-100 focus:border-[#FF6B9D] outline-none text-sm"
            />
            <button onClick={applyPromoCode} className="h-12 px-6 rounded-xl bg-gray-100 hover:bg-gray-200 font-semibold text-sm transition-colors">
              {t('apply', locale)}
            </button>
          </div>
          {promoApplied && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-500 text-sm mt-2">
              Descuento 20% aplicado (-EUR {summary.descuento.toFixed(2)})
            </motion.p>
          )}
        </div>
      </div>

      <div className="px-8 py-5 bg-white border-t border-gray-100">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-gray-500">
            <span>Base productos</span>
            <span className="font-mono">EUR {summary.itemsSubtotal.toFixed(2)}</span>
          </div>
          {summary.extras > 0 && (
            <div className="flex justify-between text-gray-500">
              <span>Cafe</span>
              <span className="font-mono">EUR {summary.extras.toFixed(2)}</span>
            </div>
          )}
          {summary.descuento > 0 && (
            <div className="flex justify-between text-green-500">
              <span>Descuento</span>
              <span className="font-mono">-EUR {summary.descuento.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>{t('iva', locale)}</span>
            <span className="font-mono">EUR {summary.iva.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-100">
            <span>{t('total', locale)}</span>
            <span className="font-mono text-[#FF6B9D]">EUR {summary.total.toFixed(2)}</span>
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
          {t('pay', locale, { amount: summary.total.toFixed(2) })}
        </motion.button>
      </div>
    </div>
  );
}
