import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Bundle, Produto } from '@tpv/shared/types';
import { calculateBundleSavings, isBundleComplete } from '@tpv/shared';
import { ArrowLeft, Check } from 'lucide-react';

interface BundleScreenProps {
  bundles: Bundle[];
  locale: string;
  getProdutoById: (id: string) => Produto | undefined;
  onBack: () => void;
  onAddBundle: (bundle: Bundle) => void;
}

export default function BundleScreen({ bundles, locale, getProdutoById, onBack, onAddBundle }: BundleScreenProps) {
  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const [bundleChoices, setBundleChoices] = useState<Record<string, string>>({});

  const activeBundles = useMemo(() => bundles.filter((b) => b.ativo), [bundles]);

  const selectedBundle = activeBundles.find((b) => b.id === selectedBundleId);

  const handleSelectOption = (itemId: string, produtoId: string) => {
    setBundleChoices((prev) => ({ ...prev, [itemId]: produtoId }));
  };

  const handleConfirmBundle = () => {
    if (!selectedBundle) return;
    // Aplica as escolhas no bundle
    const bundleWithChoices: Bundle = {
      ...selectedBundle,
      itens: selectedBundle.itens.map((item) =>
        item.tipo === 'escolha'
          ? { ...item, opcaoSelecionada: bundleChoices[item.id] || item.opcoes?.[0]?.produtoId }
          : item
      ),
    };
    onAddBundle(bundleWithChoices);
    setSelectedBundleId(null);
    setBundleChoices({});
  };

  // ─── Lista de bundles ───
  if (!selectedBundle) {
    return (
      <div className="h-full flex flex-col bg-[#0a0a0f]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <motion.button onClick={onBack} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 text-white/60 hover:text-white">
            <ArrowLeft size={20} />
            <span className="text-lg font-medium">
              {locale === 'pt' ? 'Voltar' : 'Atrás'}
            </span>
          </motion.button>
          <span className="font-display font-bold text-white text-xl">
            {locale === 'pt' ? 'Combos Especiais' : 'Combos Especiales'}
          </span>
          <div className="w-20" />
        </div>

        <div className="flex-1 px-6 py-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {activeBundles.map((bundle) => {
              const nome = bundle.nome[locale as keyof typeof bundle.nome] || bundle.nome.es;
              const desc = bundle.descricao[locale as keyof typeof bundle.descricao] || bundle.descricao.es;
              const badge = bundle.badge?.[locale as keyof typeof bundle.badge] || bundle.badge?.es;
              const savings = calculateBundleSavings(bundle);

              return (
                <motion.button
                  key={bundle.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedBundleId(bundle.id)}
                  className="bg-white/5 hover:bg-white/10 rounded-2xl p-5 border border-white/10 text-left transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-white text-xl">{nome}</h3>
                      <p className="text-white/50 text-sm mt-1">{desc}</p>
                    </div>
                    {badge && (
                      <span className="bg-[#FF6B9D]/20 text-[#FF6B9D] text-xs font-bold px-3 py-1 rounded-full shrink-0">
                        {badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-end gap-3 mt-4">
                    <span className="font-mono font-bold text-[#FF6B9D] text-2xl">€{bundle.precoPromocional.toFixed(2)}</span>
                    <span className="text-white/30 line-through text-sm mb-1">€{bundle.precoOriginal.toFixed(2)}</span>
                    {savings > 0 && (
                      <span className="text-emerald-400 text-sm font-bold mb-1">
                        -€{savings.toFixed(2)}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── Tela de escolhas do bundle ───
  const nome = selectedBundle.nome[locale as keyof typeof selectedBundle.nome] || selectedBundle.nome.es;
  const desc = selectedBundle.descricao[locale as keyof typeof selectedBundle.descricao] || selectedBundle.descricao.es;
  const savings = calculateBundleSavings(selectedBundle);

  const bundleWithCurrentChoices: Bundle = {
    ...selectedBundle,
    itens: selectedBundle.itens.map((item) =>
      item.tipo === 'escolha'
        ? { ...item, opcaoSelecionada: bundleChoices[item.id] || item.opcoes?.[0]?.produtoId }
        : item
    ),
  };
  const canConfirm = isBundleComplete(bundleWithCurrentChoices);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <motion.button
          onClick={() => { setSelectedBundleId(null); setBundleChoices({}); }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-white/60 hover:text-white"
        >
          <ArrowLeft size={20} />
          <span className="text-lg font-medium">
            {locale === 'pt' ? 'Combos' : 'Combos'}
          </span>
        </motion.button>
        <span className="font-display font-bold text-white text-xl">{nome}</span>
        <div className="w-20" />
      </div>

      <div className="flex-1 px-6 py-6 overflow-auto max-w-3xl mx-auto w-full">
        <p className="text-white/50 mb-6">{desc}</p>

        <div className="space-y-4">
          {selectedBundle.itens.map((item) => {
            const itemNome = item.nome[locale as keyof typeof item.nome] || item.nome.es;

            if (item.tipo === 'fixo') {
              const produto = item.produtoId ? getProdutoById(item.produtoId) : undefined;
              const prodNome = produto?.nome[locale as keyof typeof produto.nome] || produto?.nome.es || item.produtoId;

              return (
                <div key={item.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Check size={18} className="text-emerald-400" />
                    <span className="text-white/50 text-sm uppercase tracking-wider">{itemNome}</span>
                  </div>
                  <p className="text-white font-semibold text-lg mt-1 ml-7">{prodNome} x{item.quantidade}</p>
                </div>
              );
            }

            // tipo === 'escolha'
            const selected = bundleChoices[item.id] || item.opcoes?.[0]?.produtoId;

            return (
              <div key={item.id} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-white/50 text-sm uppercase tracking-wider mb-3">{itemNome} — {locale === 'pt' ? 'Escolha uma opção' : 'Elige una opción'}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {item.opcoes?.map((opt) => {
                    const optProd = getProdutoById(opt.produtoId);
                    const isSelected = selected === opt.produtoId;
                    const optNome = opt.nome[locale as keyof typeof opt.nome] || opt.nome.es;

                    return (
                      <motion.button
                        key={opt.produtoId}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelectOption(item.id, opt.produtoId)}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                          isSelected
                            ? 'bg-[#FF6B9D]/20 border-[#FF6B9D]/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {isSelected ? (
                          <Check size={16} className="text-[#FF6B9D] shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 shrink-0" />
                        )}
                        <span className="text-white font-medium">{optNome}</span>
                        {optProd && (
                          <span className="text-white/40 text-sm ml-auto">
                            €{('preco' in optProd ? optProd.preco : optProd.precoBase ?? 0).toFixed(2)}
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer com total */}
      <div className="px-6 py-4 bg-white/5 border-t border-white/10">
        <div className="flex items-center justify-between mb-4 max-w-3xl mx-auto">
          <div>
            <span className="text-white/50">{locale === 'pt' ? 'Total do combo' : 'Total del combo'}</span>
            <div className="flex items-center gap-3">
              <span className="font-mono font-bold text-[#FF6B9D] text-3xl">€{selectedBundle.precoPromocional.toFixed(2)}</span>
              <span className="text-white/30 line-through">€{selectedBundle.precoOriginal.toFixed(2)}</span>
              {savings > 0 && (
                <span className="bg-emerald-500/20 text-emerald-400 text-sm font-bold px-3 py-1 rounded-full">
                  {locale === 'pt' ? 'Economia' : 'Ahorro'} €{savings.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleConfirmBundle}
          disabled={!canConfirm}
          className="w-full max-w-3xl mx-auto py-5 rounded-2xl bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] text-white font-bold text-2xl flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={28} />
          {locale === 'pt' ? 'Adicionar Combo' : 'Añadir Combo'}
        </motion.button>
      </div>
    </div>
  );
}
