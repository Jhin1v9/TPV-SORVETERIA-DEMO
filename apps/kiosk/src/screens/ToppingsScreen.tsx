import { motion } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
import { calcularPrecoItem } from '@tpv/shared/utils/calculos';

export default function ToppingsScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const { locale, selectedCategoria, selectedSabores, selectedToppings, toggleTopping, toppings } = useStore();

  // Smart upsell: suggest matching toppings based on selected flavors
  const selectedSaborIds = selectedSabores.map((s) => s.id);
  const getSmartSuggestion = (toppingId: string): boolean => {
    if (selectedSaborIds.includes('choco_negro') && toppingId === 'choco_negro_derretido') return true;
    if (selectedSaborIds.includes('fresa') && toppingId === 'sirope_fresa') return true;
    if (selectedSaborIds.includes('vainilla_madagascar') && toppingId === 'virutas_choco') return true;
    return false;
  };

  const currentItemTotal = selectedCategoria ? calcularPrecoItem(selectedCategoria, selectedSabores, selectedToppings) : 0;

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA]">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-7">
        <motion.button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700" whileTap={{ scale: 0.95 }}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-base font-medium">{t('back', locale)}</span>
        </motion.button>

        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-gray-800">{t('addExtras', locale)}</h1>
          <p className="text-base text-gray-400">{selectedToppings.length}/5 extras</p>
        </div>

        <div className="font-mono font-bold text-[#FF6B9D]">€{currentItemTotal.toFixed(2)}</div>
      </div>

      {/* Current item summary */}
      <div className="mx-8 mb-4 bg-white rounded-2xl p-6 shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: selectedCategoria?.corHex }}>
          {selectedSabores.length}
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold text-gray-800">{selectedCategoria?.nome[locale]}</p>
          <p className="text-sm text-gray-400">{selectedSabores.map((s) => s.nome[locale] || s.nome.es).join(', ')}</p>
        </div>
        {selectedToppings.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-400">+{selectedToppings.length} extras</p>
          </div>
        )}
      </div>

      {/* Toppings list */}
      <div className="flex-1 px-8 pb-4 overflow-auto">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {toppings.map((topping, idx) => {
            const isSelected = selectedToppings.some((t) => t.id === topping.id);
            const isSmartMatch = getSmartSuggestion(topping.id);

            return (
              <motion.button
                key={topping.id}
                onClick={() => toggleTopping(topping)}
                className={`relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-[#FF6B9D] bg-pink-50 shadow-md'
                    : 'border-gray-100 bg-white hover:border-gray-200 shadow-sm'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Smart match badge */}
                {isSmartMatch && !isSelected && (
                  <div className="absolute -top-2 -right-2 bg-[#FFD700] text-[#2D3436] text-xs font-bold px-2 py-1 rounded-full shadow">
                    ★ {t('perfectMatch', locale)}
                  </div>
                )}

                {/* Checkbox */}
                <div
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected ? 'border-[#FF6B9D] bg-[#FF6B9D]' : 'border-gray-200'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="font-medium text-lg text-gray-800">{topping.nome[locale] || topping.nome.es}</p>
                  <p className="text-sm text-gray-400 capitalize">{t(`topping_${topping.categoria}` as any, locale)}</p>
                </div>

                {/* Price */}
                <span className="font-mono font-bold text-[#FF6B9D]">+€{topping.preco.toFixed(2)}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom button */}
      <div className="px-8 py-5">
        <motion.button
          onClick={onContinue}
          className="w-full h-20 rounded-2xl font-display font-bold text-xl text-white flex items-center justify-center gap-2 transition-all"
          style={{
            background: selectedToppings.length > 0
              ? 'linear-gradient(135deg, #FF6B9D, #FFA07A)'
              : 'linear-gradient(135deg, #4ECDC4, #2196F3)',
          }}
          whileTap={{ scale: 0.98 }}
        >
          {selectedToppings.length > 0 ? `${t('continue', locale)} (+€${selectedToppings.reduce((s, t) => s + t.preco, 0).toFixed(2)})` : `${t('continue', locale)} (${t('noExtras', locale)})`}
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
