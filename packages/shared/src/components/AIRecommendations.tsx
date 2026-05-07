/**
 * ═══ FASE 13 — AI Upselling Integration ═══
 * Componente de recomendações inteligentes baseado em padrões de compra
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus } from 'lucide-react';
import { recomendarParaCarrinho } from '../ai/aiUpselling';
import type { CartItem, Product, Pedido } from '../types';

interface AIRecommendationsProps {
  carrinho: CartItem[];
  historicoPedidos: Pedido[];
  todosProdutos: Product[];
  onAddProduct: (product: Product) => void;
  locale?: string;
  maxRecommendations?: number;
  theme?: 'dark' | 'light';
}

export default function AIRecommendations({
  carrinho,
  historicoPedidos,
  todosProdutos,
  onAddProduct,
  locale = 'es',
  maxRecommendations = 3,
  theme = 'light',
}: AIRecommendationsProps) {
  const recomendacoes = useMemo(() => {
    if (carrinho.length === 0 || historicoPedidos.length === 0) return [];
    return recomendarParaCarrinho(carrinho, historicoPedidos, todosProdutos, maxRecommendations);
  }, [carrinho, historicoPedidos, todosProdutos, maxRecommendations]);

  if (recomendacoes.length === 0) return null;

  const isDark = theme === 'dark';
  const bgClass = isDark
    ? 'bg-white/5 border-white/10'
    : 'bg-gradient-to-r from-[#FF6B9D]/5 to-[#FFA07A]/5 border-[#FF6B9D]/10';
  const textClass = isDark ? 'text-white' : 'text-gray-800';
  const subtextClass = isDark ? 'text-white/50' : 'text-gray-500';
  const priceClass = isDark ? 'text-[#FF6B9D]' : 'text-[#FF6B9D]';
  const buttonClass = isDark
    ? 'bg-[#FF6B9D] text-white hover:bg-[#FF5A8F]'
    : 'bg-[#FF6B9D] text-white hover:bg-[#FF5A8F]';

  const titleText = {
    es: 'Clientes también pidieron',
    pt: 'Clientes também pediram',
    en: 'Customers also ordered',
    ca: 'Clients també van demanar',
  };

  const addText = {
    es: 'Añadir',
    pt: 'Add',
    en: 'Add',
    ca: 'Afegir',
  };

  return (
    <div className="mb-4">
      <h3 className={`font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2 ${subtextClass}`}>
        <Sparkles size={14} className="text-[#FF6B9D]" />
        {titleText[locale as keyof typeof titleText] || titleText.es}
      </h3>
      <div className="space-y-2">
        {recomendacoes.map((rec) => {
          const produto = todosProdutos.find((p) => p.id === rec.produtoId);
          if (!produto) return null;

          return (
            <motion.div
              key={rec.produtoId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl p-3 border flex items-center gap-3 ${bgClass}`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0 ${isDark ? 'bg-white/10' : 'bg-white'}`}>
                {produto.imagem ? (
                  <img src={produto.imagem} alt={produto.nome.es} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <span>✨</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-sm ${textClass}`}>
                  {produto.nome[locale as keyof typeof produto.nome] || produto.nome.es}
                </p>
                <p className={`text-xs ${subtextClass}`}>
                  {rec.razao}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-mono font-bold ${priceClass}`}>
                  €{(produto.preco ?? 0).toFixed(2)}
                </p>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onAddProduct(produto)}
                  className={`mt-1 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors ${buttonClass}`}
                >
                  <Plus size={12} />
                  {addText[locale as keyof typeof addText] || addText.es}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
