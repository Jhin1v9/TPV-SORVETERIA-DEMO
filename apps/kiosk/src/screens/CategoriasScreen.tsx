import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
import type { Categoria } from '@tpv/shared/types';

const iconMap: Record<string, React.ReactNode> = {
  copo300: (
    <svg viewBox="0 0 80 80" className="w-16 h-16">
      <path d="M20 25 Q20 20 25 20h30Q60 20 60 25v35Q60 70 40 70Q20 70 20 60Z" fill="#4ECDC4" opacity="0.9" />
      <ellipse cx="40" cy="25" rx="20" ry="6" fill="#4ECDC4" />
      <ellipse cx="40" cy="25" rx="16" ry="4" fill="#E8F8F7" />
    </svg>
  ),
  copo500: (
    <svg viewBox="0 0 80 80" className="w-16 h-16">
      <path d="M15 22 Q15 16 22 16h36Q70 16 70 22v40Q70 72 40 72Q15 72 15 62Z" fill="#FF6B9D" opacity="0.9" />
      <ellipse cx="40" cy="22" rx="25" ry="7" fill="#FF6B9D" />
      <ellipse cx="40" cy="22" rx="20" ry="5" fill="#FDE8F0" />
    </svg>
  ),
  cone: (
    <svg viewBox="0 0 80 80" className="w-16 h-16">
      <path d="M25 28 L40 72 L55 28Z" fill="#D2691E" />
      <path d="M25 28 Q25 18 40 18Q55 18 55 28" fill="#FF6B9D" opacity="0.8" />
      <path d="M28 28 Q28 22 40 22Q52 22 52 28" fill="#FFF8E7" opacity="0.5" />
      <line x1="32" y1="38" x2="48" y2="42" stroke="#B8651A" strokeWidth="1" opacity="0.4" />
      <line x1="35" y1="48" x2="45" y2="52" stroke="#B8651A" strokeWidth="1" opacity="0.4" />
    </svg>
  ),
  pote1l: (
    <svg viewBox="0 0 80 80" className="w-16 h-16">
      <rect x="15" y="20" width="50" height="45" rx="8" fill="#98D8C8" opacity="0.9" />
      <rect x="12" y="16" width="56" height="10" rx="4" fill="#98D8C8" />
      <rect x="18" y="24" width="44" height="35" rx="4" fill="#E8F5F0" opacity="0.4" />
      <text x="40" y="50" textAnchor="middle" fill="#2D3436" fontSize="12" fontWeight="bold" opacity="0.6">1L</text>
    </svg>
  ),
};

export default function CategoriasScreen({ onBack, onSelectCategoria }: { onBack: () => void; onSelectCategoria: (c: Categoria) => void }) {
  const { categorias, locale, carrinho } = useStore();
  const ativas = categorias.filter((c) => c.ativo).sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="h-full flex flex-col bg-[#FAFAFA]">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">{t('back', locale)}</span>
        </motion.button>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B9D] to-[#FFA07A] rounded-xl flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none">
              <circle cx="16" cy="10" r="8" fill="white" opacity="0.9" />
              <path d="M8 14 Q16 36 24 14" fill="#D2691E" />
            </svg>
          </div>
          <span className="font-display font-bold text-gray-800">Sabadell Nord</span>
        </div>

        <div className="flex items-center gap-3">
          {carrinho.length > 0 && (
            <div className="bg-[#FF6B9D] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {carrinho.length}
            </div>
          )}
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="px-8 pb-4">
        <h1 className="font-display text-4xl font-bold text-gray-800">{t('chooseContainer', locale)}</h1>
        <p className="text-gray-400 mt-1">{t('continue', locale)}</p>
      </div>

      {/* Grid */}
      <div className="flex-1 px-8 pb-8 overflow-auto">
        <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto h-full">
          {ativas.map((cat, idx) => (
            <motion.button
              key={cat.id}
              onClick={() => onSelectCategoria(cat)}
              className="relative bg-white rounded-3xl shadow-md hover:shadow-xl transition-all p-6 flex flex-col items-center justify-center group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 0.98, y: -4 }}
              whileTap={{ scale: 0.95 }}
              style={{ border: `3px solid transparent` }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = cat.corHex;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'transparent';
              }}
            >
              {/* Badge */}
              {cat.badge && (
                <div
                  className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: cat.corHex }}
                >
                  {cat.badge}
                </div>
              )}

              {/* Icon */}
              <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                {iconMap[cat.id] || (
                  <div className="w-16 h-16 rounded-2xl" style={{ backgroundColor: cat.corHex + '30' }} />
                )}
              </div>

              {/* Name */}
              <h3 className="font-display text-xl font-bold text-gray-800 text-center">
                {cat.nome[locale] || cat.nome.es}
              </h3>

              {/* Max flavors */}
              <p className="text-gray-400 text-sm mt-1">
                {cat.maxSabores} sabores
              </p>

              {/* Price */}
              <p className="font-mono text-2xl font-bold mt-3" style={{ color: cat.corHex }}>
                €{cat.precoBase.toFixed(2)}
              </p>

              {/* Flavor dots */}
              <div className="flex gap-1 mt-3">
                {Array.from({ length: cat.maxSabores }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: cat.corHex,
                      opacity: 0.3 + i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
