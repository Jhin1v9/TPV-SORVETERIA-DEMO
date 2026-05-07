import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Complementar } from '@tpv/shared/types';
import { Plus, Check, X } from 'lucide-react';

interface UpsellModalProps {
  visible: boolean;
  complementares: Complementar[];
  locale: string;
  onAdd: (comp: Complementar) => void;
  onSkip: () => void;
}

export default function UpsellModal({ visible, complementares, locale, onAdd, onSkip }: UpsellModalProps) {
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!visible) {
      setAddedIds(new Set());
    }
  }, [visible, complementares]);

  const handleAdd = (comp: Complementar) => {
    setAddedIds((prev) => new Set(prev).add(comp.id));
    onAdd(comp);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={onSkip}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-[#1a1a24] rounded-3xl p-8 w-full max-w-2xl mx-4 shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {locale === 'pt' ? 'Quer adicionar algo mais?' : '¿Quieres añadir algo más?'}
                </h3>
                <p className="text-white/50 mt-1">
                  {locale === 'pt' ? 'Os clientes costumam pedir também:' : 'Los clientes suelen pedir también:'}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onSkip}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Complementares */}
            <div className="space-y-3">
              {complementares.map((comp) => {
                const isAdded = addedIds.has(comp.id);
                const nome = comp.nome[locale as keyof typeof comp.nome] || comp.nome.es;
                const desc = comp.descricao?.[locale as keyof typeof comp.descricao] || comp.descricao?.es;

                return (
                  <motion.div
                    key={comp.id}
                    layout
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                      isAdded
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#FF6B9D]/20 to-[#FFA07A]/20 flex items-center justify-center text-3xl shrink-0">
                      {comp.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-lg">{nome}</p>
                      {desc && <p className="text-white/40 text-sm">{desc}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-[#FF6B9D] text-xl">+€{comp.preco.toFixed(2)}</p>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAdd(comp)}
                        disabled={isAdded}
                        className={`mt-2 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${
                          isAdded
                            ? 'bg-emerald-500/20 text-emerald-400 cursor-default'
                            : 'bg-[#FF6B9D] text-white hover:bg-[#FF5A8F]'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={14} /> {locale === 'pt' ? 'Adicionado' : 'Añadido'}
                          </>
                        ) : (
                          <>
                            <Plus size={14} /> {locale === 'pt' ? 'Adicionar' : 'Añadir'}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Footer */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={onSkip}
              className="w-full mt-6 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-lg transition-colors"
            >
              {locale === 'pt' ? 'Continuar' : 'Continuar'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
