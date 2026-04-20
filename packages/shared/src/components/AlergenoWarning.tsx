import type { AvisoAlergeno, Locale } from '../types';
import { tAlergeno, nomeAlergeno, nomeNivel } from '../i18n/alergenos';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

interface AlergenoWarningProps {
  alergenosDoUsuario: string[];
  alergenosNoCarrinho: AvisoAlergeno[];
  locale: Locale;
  onConfirm?: () => void;
  confirmed?: boolean;
}

export default function AlergenoWarning({
  alergenosDoUsuario,
  alergenosNoCarrinho,
  locale,
  onConfirm,
  confirmed,
}: AlergenoWarningProps) {
  const alergenosConflito = alergenosNoCarrinho.filter(
    (a) => alergenosDoUsuario.includes(a.alergeno)
  );

  if (alergenosConflito.length === 0) return null;

  const temContem = alergenosConflito.some((a) => a.nivel === 'contem');

  return (
    <div className={`rounded-xl border p-4 mb-4 ${
      temContem
        ? 'bg-red-50 border-red-200'
        : 'bg-amber-50 border-amber-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${temContem ? 'bg-red-100' : 'bg-amber-100'}`}>
          <ShieldAlert size={20} className={temContem ? 'text-red-600' : 'text-amber-600'} />
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold text-sm mb-1 ${temContem ? 'text-red-800' : 'text-amber-800'}`}>
            {tAlergeno('alergenoAlerta', locale)}
          </h4>
          <p className={`text-xs mb-2 ${temContem ? 'text-red-700' : 'text-amber-700'}`}>
            {tAlergeno('avisoCheckout', locale)}
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {alergenosConflito.map((a) => (
              <span
                key={a.alergeno}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                  a.nivel === 'contem'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-amber-100 text-amber-700 border border-amber-200'
                }`}
              >
                <AlertTriangle size={10} />
                {nomeNivel(a.nivel, locale)} {nomeAlergeno(a.alergeno, locale)}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-gray-500 italic mb-3">
            {tAlergeno('crossContamination', locale)}
          </p>
          {onConfirm && (
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={() => onConfirm?.()}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-xs text-gray-700 leading-relaxed">
                {tAlergeno('confirmoAlergenos', locale)}
              </span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
