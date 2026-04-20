import { useState } from 'react';
import { useStore } from '@tpv/shared/stores/useStore';
import { t, getLocaleName } from '@tpv/shared/i18n';
import type { Locale } from '@tpv/shared/types';

export default function ConfigPage() {
  const { locale, setLocale } = useStore();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const locales: Locale[] = ['es', 'ca', 'pt', 'en'];

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="font-display font-bold text-2xl">{t('settings', locale)}</h2>

      {/* Language */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
        <h3 className="font-semibold text-gray-800 mb-3">{t('language', locale)}</h3>
        <div className="grid grid-cols-2 gap-2">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => setLocale(loc)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                locale === loc
                  ? 'bg-[#FF6B9D] text-white'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {getLocaleName(loc)}
            </button>
          ))}
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 space-y-3">
        <h3 className="font-semibold text-gray-800">{t('profile', locale)}</h3>
        <div>
          <label className="text-xs text-gray-500 block mb-1">{t('name', locale)}</label>
          <input type="text" className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]/30" defaultValue="Cliente Demo" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">{t('email', locale)}</label>
          <input type="email" className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]/30" defaultValue="cliente@demo.com" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">{t('phone', locale)}</label>
          <input type="tel" className="w-full bg-gray-50 rounded-xl px-3 py-2 text-sm border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]/30" defaultValue="+34 612 345 678" />
        </div>
      </div>

      {/* Allergens */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
        <h3 className="font-semibold text-gray-800 mb-3">{t('allergens', locale)}</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'gluten', label: t('gluten', locale) },
            { key: 'lactose', label: t('lactose', locale) },
            { key: 'nuts', label: t('nuts', locale) },
            { key: 'eggs', label: t('eggs', locale) },
            { key: 'soy', label: t('soy', locale) },
            { key: 'peanuts', label: t('peanuts', locale) },
          ].map((a) => (
            <label key={a.key} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#FF6B9D] focus:ring-[#FF6B9D]" />
              <span className="text-sm text-gray-700">{a.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${
          saved ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] shadow-lg'
        }`}
      >
        {saved ? '✓ Guardado' : t('save', locale)}
      </button>
    </div>
  );
}
