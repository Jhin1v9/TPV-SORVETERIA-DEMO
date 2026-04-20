import type { AvisoAlergeno, Locale } from '../types';
import { nomeAlergeno, nomeNivel } from '../i18n/alergenos';
import { AlertTriangle, Leaf } from 'lucide-react';

interface AlergenoBadgeProps {
  alergenos: AvisoAlergeno[];
  locale: Locale;
  compact?: boolean;
  showOnlyUserAlergias?: AvisoAlergeno[];
}

export default function AlergenoBadge({ alergenos, locale, compact, showOnlyUserAlergias }: AlergenoBadgeProps) {
  const displayAlergenos = showOnlyUserAlergias || alergenos;
  
  if (displayAlergenos.length === 0) return null;

  if (compact) {
    const hasContem = displayAlergenos.some(a => a.nivel === 'contem');
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
        hasContem ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-green-50 text-green-700 border border-green-200'
      }`}>
        {hasContem ? <AlertTriangle size={10} /> : <Leaf size={10} />}
        {displayAlergenos.length} {locale === 'en' ? 'allergen' + (displayAlergenos.length > 1 ? 's' : '') : locale === 'ca' ? 'al·lèrgen' + (displayAlergenos.length > 1 ? 's' : '') : locale === 'pt' ? 'alérgeno' + (displayAlergenos.length > 1 ? 's' : '') : 'alérgeno' + (displayAlergenos.length > 1 ? 's' : '')}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {displayAlergenos.map((aviso) => (
        <span
          key={aviso.alergeno}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
            aviso.nivel === 'contem'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          }`}
        >
          {aviso.nivel === 'contem' ? <AlertTriangle size={10} /> : <Leaf size={10} />}
          {nomeNivel(aviso.nivel, locale)} {nomeAlergeno(aviso.alergeno, locale)}
        </span>
      ))}
    </div>
  );
}
