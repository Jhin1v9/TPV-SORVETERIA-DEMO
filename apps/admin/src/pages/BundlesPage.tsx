import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { calculateBundleSavings } from '@tpv/shared';
import { Gift, ToggleLeft, ToggleRight, Tag } from 'lucide-react';

export default function BundlesPage() {
  const { bundles, locale } = useStore();
  const [localBundles, setLocalBundles] = useState(bundles);

  const toggleBundle = (id: string) => {
    setLocalBundles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ativo: !b.ativo } : b))
    );
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
        <Gift className="text-[#FF6B9D]" size={32} />
        Combos & Bundles
      </h1>
      <p className="text-gray-500 mb-6">
        {locale === 'pt'
          ? 'Gerencie os combos disponíveis no Kiosk e Cliente'
          : 'Gestiona los combos disponibles en Kiosk y Cliente'}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {localBundles.map((bundle) => {
          const nome = bundle.nome[locale as keyof typeof bundle.nome] || bundle.nome.es;
          const desc = bundle.descricao[locale as keyof typeof bundle.descricao] || bundle.descricao.es;
          const badge = bundle.badge?.[locale as keyof typeof bundle.badge] || bundle.badge?.es;
          const savings = calculateBundleSavings(bundle);

          return (
            <motion.div
              key={bundle.id}
              layout
              className={`bg-white rounded-2xl p-6 shadow-sm border transition-colors ${
                bundle.ativo ? 'border-gray-100' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xl text-gray-800">{nome}</h3>
                    {badge && (
                      <span className="bg-[#FF6B9D]/10 text-[#FF6B9D] text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Tag size={10} />
                        {badge}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{desc}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleBundle(bundle.id)}
                  className={bundle.ativo ? 'text-emerald-500' : 'text-gray-300'}
                >
                  {bundle.ativo ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                </motion.button>
              </div>

              {/* Itens do bundle */}
              <div className="space-y-2 mb-4">
                {bundle.itens.map((item) => {
                  const itemNome = item.nome[locale as keyof typeof item.nome] || item.nome.es;
                  return (
                    <div key={item.id} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-gray-400">
                        {item.tipo === 'fixo' ? '✓' : '◎'}
                      </span>
                      <span>
                        {itemNome} x{item.quantidade}
                      </span>
                      {item.tipo === 'escolha' && (
                        <span className="text-gray-400 text-xs ml-auto">
                          {locale === 'pt' ? `${item.opcoes?.length ?? 0} opções` : `${item.opcoes?.length ?? 0} opciones`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Preços */}
              <div className="flex items-end gap-3 pt-3 border-t border-gray-100">
                <span className="font-mono font-bold text-[#FF6B9D] text-2xl">€{bundle.precoPromocional.toFixed(2)}</span>
                <span className="text-gray-400 line-through text-sm mb-1">€{bundle.precoOriginal.toFixed(2)}</span>
                {savings > 0 && (
                  <span className="bg-emerald-50 text-emerald-600 text-sm font-bold px-2 py-1 rounded-lg mb-0.5">
                    {locale === 'pt' ? 'Economia' : 'Ahorro'} €{savings.toFixed(2)}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {localBundles.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Gift size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">
            {locale === 'pt' ? 'Nenhum combo configurado' : 'Sin combos configurados'}
          </p>
        </div>
      )}
    </div>
  );
}
