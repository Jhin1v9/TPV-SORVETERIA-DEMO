import { useState } from 'react';
import type { Alergeno, Locale } from '../types';
import { alergenoNomes, tAlergeno } from '../i18n/alergenos';
import { ShieldCheck, ShieldX } from 'lucide-react';

interface AlergenoSelectorProps {
  locale: Locale;
  selecionados: Alergeno[];
  onChange: (alergias: Alergeno[]) => void;
  obrigatorio?: boolean;
}

const ALERGENOS_ORDEM: Alergeno[] = [
  'gluten', 'leite', 'ovos', 'frutos_casca_rija', 'amendoim',
  'soja', 'sesamo', 'sulfitos',
];

export default function AlergenoSelector({ locale, selecionados, onChange, obrigatorio }: AlergenoSelectorProps) {
  const [temAlergia, setTemAlergia] = useState<boolean | null>(selecionados.length > 0 ? true : null);

  const toggleAlergeno = (alergeno: Alergeno) => {
    if (selecionados.includes(alergeno)) {
      onChange(selecionados.filter((a) => a !== alergeno));
    } else {
      onChange([...selecionados, alergeno]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Pergunta inicial */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-semibold text-gray-800 mb-3">
          {tAlergeno('temAlergia', locale)}
          {obrigatorio && <span className="text-red-500 ml-1">*</span>}
        </p>
        <p className="text-xs text-gray-500 mb-3">{tAlergeno('temAlergiaDesc', locale)}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => { setTemAlergia(false); onChange([]); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
              temAlergia === false
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <ShieldCheck size={18} />
            {tAlergeno('nenhumaAlergia', locale)}
          </button>
          <button
            type="button"
            onClick={() => setTemAlergia(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
              temAlergia === true
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <ShieldX size={18} />
            {locale === 'ca' ? 'Sí, tinc al·lèrgies' : locale === 'pt' ? 'Sim, tenho alergias' : locale === 'en' ? 'Yes, I have allergies' : 'Sí, tengo alergias'}
          </button>
        </div>
      </div>

      {/* Grid de alérgenos */}
      {temAlergia === true && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">
            {tAlergeno('selecioneAlergias', locale)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ALERGENOS_ORDEM.map((alergeno) => {
              const isSelected = selecionados.includes(alergeno);
              return (
                <label
                  key={alergeno}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-pink-400 bg-pink-50'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleAlergeno(alergeno)}
                    className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
                  />
                  <span className={`text-sm font-medium ${isSelected ? 'text-pink-800' : 'text-gray-700'}`}>
                    {alergenoNomes[alergeno][locale]}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
