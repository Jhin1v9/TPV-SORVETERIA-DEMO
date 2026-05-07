import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { maximoPontosResgataveis, pontosParaEuros, nomeTier, corTier } from '@tpv/shared';
import { Star, Gift } from 'lucide-react';

interface LoyaltySliderProps {
  subtotal: number;
  onResgatar: (pontos: number, desconto: number) => void;
}

export default function LoyaltySlider({ subtotal, onResgatar }: LoyaltySliderProps) {
  const { loyalty, locale } = useStore();
  const [pontosSelecionados, setPontosSelecionados] = useState(0);

  const maxPontos = useMemo(() => {
    const maxBySubtotal = maximoPontosResgataveis(subtotal);
    return Math.min(maxBySubtotal, loyalty.pontosDisponiveis);
  }, [subtotal, loyalty.pontosDisponiveis]);

  const desconto = pontosParaEuros(pontosSelecionados);

  const handleChange = (value: number) => {
    // Arredonda para múltiplo de 100
    const rounded = Math.floor(value / 100) * 100;
    setPontosSelecionados(rounded);
    onResgatar(rounded, pontosParaEuros(rounded));
  };

  if (maxPontos < 100) return null;

  const tierNome = nomeTier(loyalty.tier, locale);
  const tierCor = corTier(loyalty.tier);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-black/5 mb-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Gift size={18} style={{ color: tierCor }} />
        <h3 className="font-bold text-gray-800 text-sm">
          {locale === 'pt' ? 'Usar pontos' : 'Usar puntos'}
        </h3>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full ml-auto"
          style={{ backgroundColor: `${tierCor}20`, color: tierCor }}
        >
          <Star size={10} className="inline mr-1" fill={tierCor} />
          {loyalty.pontosDisponiveis} pts
        </span>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={maxPontos}
          step={100}
          value={pontosSelecionados}
          onChange={(e) => handleChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: tierCor }}
        />
        <div className="text-right shrink-0 min-w-[80px]">
          <p className="font-mono font-bold text-[#FF6B9D]">-EUR{desconto.toFixed(2)}</p>
          <p className="text-xs text-gray-400">{pontosSelecionados} pts</p>
        </div>
      </div>

      {desconto > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-emerald-600 mt-2 font-medium"
        >
          {locale === 'pt'
            ? `Desconto de ${tierNome} aplicado!`
            : `Descuento de ${tierNome} aplicado!`}
        </motion.p>
      )}
    </motion.div>
  );
}
