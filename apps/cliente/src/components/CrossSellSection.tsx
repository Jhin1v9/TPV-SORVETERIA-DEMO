import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { findComplementaresForCart } from '@tpv/shared';
import { Plus } from 'lucide-react';
import type { Complementar } from '@tpv/shared/types';
import { normalizeProdutoToProduct } from '@tpv/shared/types';

interface CrossSellSectionProps {
  locale: string;
}

export default function CrossSellSection({ locale }: CrossSellSectionProps) {
  const { carrinho, complementares, addToCarrinho } = useStore();

  const sugestoes = useMemo(() => {
    return findComplementaresForCart(carrinho, complementares, 3);
  }, [carrinho, complementares]);

  if (sugestoes.length === 0) return null;

  const handleAdd = (comp: Complementar) => {
    const product = normalizeProdutoToProduct({
      id: comp.id,
      nome: comp.nome,
      preco: comp.preco,
      imagem: comp.imagem,
      categoria: 'para-llevar',
      emEstoque: true,
      alergenos: [],
    } as unknown as import('@tpv/shared/types').ProdutoFixo);
    addToCarrinho({
      product,
      quantity: 1,
      unitPrice: comp.preco,
    });
  };

  return (
    <div className="mb-4">
      <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
        <span>✨</span>
        {locale === 'pt' ? 'Complete seu pedido' : 'Completa tu pedido'}
      </h3>
      <div className="space-y-2">
        {sugestoes.map((comp) => {
          const nome = comp.nome[locale as keyof typeof comp.nome] || comp.nome.es;
          const desc = comp.descricao?.[locale as keyof typeof comp.descricao] || comp.descricao?.es;

          return (
            <motion.div
              key={comp.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#FF6B9D]/5 to-[#FFA07A]/5 rounded-2xl p-3 border border-[#FF6B9D]/10 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm shrink-0">
                {comp.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{nome}</p>
                {desc && <p className="text-gray-500 text-xs">{desc}</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono font-bold text-[#FF6B9D]">+€{comp.preco.toFixed(2)}</p>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAdd(comp)}
                  className="mt-1 px-3 py-1.5 rounded-lg bg-[#FF6B9D] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#FF5A8F] transition-colors"
                >
                  <Plus size={12} />
                  {locale === 'pt' ? 'Add' : 'Añadir'}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
