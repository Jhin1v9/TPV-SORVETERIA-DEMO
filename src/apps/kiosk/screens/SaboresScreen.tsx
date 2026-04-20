import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../shared/stores/useStore';
import { t } from '../../../shared/i18n';
import type { Sabor } from '../../../shared/types';

export default function SaboresScreen({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  const { locale, selectedCategoria, selectedSabores, toggleSabor, sabores } = useStore();
  const maxSabores = selectedCategoria?.maxSabores ?? 2;
  const disponiveis = sabores.filter((s) => s.disponivel);
  const [showError, setShowError] = useState(false);

  const handleToggleSabor = (s: Sabor) => {
    const exists = selectedSabores.find((x) => x.id === s.id);
    if (!exists && selectedSabores.length >= maxSabores) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
      return;
    }
    toggleSabor(s);
  };

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

        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-gray-800">{t('chooseFlavors', locale)}</h1>
          <p className="text-sm text-gray-400">{selectedCategoria?.nome[locale] || ''}</p>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <span className="font-mono font-bold text-gray-700">{selectedSabores.length}/{maxSabores}</span>
          <span className="text-xs text-gray-400">{t('selectedCount', locale, { current: selectedSabores.length, max: maxSabores })}</span>
        </div>
      </div>

      {/* Counter + progress */}
      <div className="px-8 pb-4">
        <div className="flex gap-2">
          {Array.from({ length: maxSabores }).map((_, i) => (
            <div
              key={i}
              className="h-2 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i < selectedSabores.length ? selectedCategoria?.corHex || '#FF6B9D' : '#E0E0E0',
              }}
            />
          ))}
        </div>
      </div>

      {/* Flavors grid */}
      <div className="flex-1 px-8 pb-4 overflow-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5">
          {disponiveis.map((sabor, idx) => {
            const isSelected = selectedSabores.some((s) => s.id === sabor.id);
            const isLowStock = sabor.stockBaldes <= sabor.alertaStock;
            const isOutOfStock = sabor.stockBaldes <= 0;

            return (
              <motion.button
                key={sabor.id}
                onClick={() => !isOutOfStock && handleToggleSabor(sabor)}
                className="relative flex flex-col items-center group"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.04 }}
                whileTap={!isOutOfStock ? { scale: 0.92 } : {}}
                disabled={isOutOfStock}
              >
                {/* Circle */}
                <div
                  className="relative w-24 h-24 rounded-full overflow-hidden transition-all duration-300"
                  style={{
                    border: isSelected ? `4px solid ${sabor.corHex}` : `3px solid ${sabor.corHex}40`,
                    boxShadow: isSelected ? `0 4px 16px ${sabor.corHex}50` : 'none',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <img
                    src={sabor.imagemUrl}
                    alt={sabor.nome[locale] || sabor.nome.es}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement!;
                      parent.style.background = sabor.corHex + '40';
                      parent.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#1f2937;font-weight:700;font-size:12px;text-align:center;padding:8px;">${(sabor.nome[locale] || sabor.nome.es).split(' ').slice(0, 2).join('<br/>')}</div>`;
                    }}
                  />

                  {/* Out of stock overlay */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{t('soldOut', locale)}</span>
                    </div>
                  )}

                  {/* Selected checkmark */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ backgroundColor: sabor.corHex + '30' }}
                      >
                        <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={sabor.corHex} strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Badges */}
                <div className="absolute -top-1 -right-1 flex flex-col gap-1">
                  {sabor.precoExtra > 0 && (
                    <span className="bg-[#FFD700] text-[#2D3436] text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                      +€{sabor.precoExtra.toFixed(2)}
                    </span>
                  )}
                </div>

                {isLowStock && !isOutOfStock && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {t('lowStock', locale)}
                  </span>
                )}

                {/* Name */}
                <p className="mt-2 text-sm font-medium text-gray-700 text-center leading-tight max-w-[90px]">
                  {sabor.nome[locale] || sabor.nome.es}
                </p>

                {/* Extra price indicator */}
                {sabor.precoExtra > 0 && (
                  <p className="text-[10px] text-[#FFD700] font-semibold">Premium</p>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Error snackbar */}
      <AnimatePresence>
        {showError && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-2 z-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">{t('maxFlavors', locale, { n: maxSabores })}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom button */}
      <div className="px-8 py-5">
        <motion.button
          onClick={selectedSabores.length > 0 ? onContinue : undefined}
          className="w-full h-16 rounded-2xl font-display font-bold text-lg text-white transition-all duration-300 flex items-center justify-center gap-2"
          style={{
            backgroundColor: selectedSabores.length > 0 ? selectedCategoria?.corHex || '#FF6B9D' : '#E0E0E0',
            opacity: selectedSabores.length > 0 ? 1 : 0.6,
          }}
          whileTap={selectedSabores.length > 0 ? { scale: 0.98 } : {}}
        >
          {t('continue', locale)}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>
    </div>
  );
}
