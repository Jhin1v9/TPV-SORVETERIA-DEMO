/**
 * ═══ FASE 15 — Favoritos Section ═══
 * Grid horizontal de produtos favoritos do usuário
 */

import { motion } from 'framer-motion';
import { Heart, Plus } from 'lucide-react';
import type { Produto } from '../types';

interface FavoritosSectionProps {
  favoritos: string[];
  produtos: Produto[];
  onToggleFavorito: (productId: string) => void;
  onSelectProduto: (produto: Produto) => void;
  locale?: string;
}

export default function FavoritosSection({
  favoritos,
  produtos,
  onToggleFavorito,
  onSelectProduto,
  locale = 'es',
}: FavoritosSectionProps) {
  const produtosFavoritos = produtos.filter((p) => favoritos.includes(p.id));

  if (produtosFavoritos.length === 0) return null;

  const titulos = {
    es: 'Tus favoritos',
    pt: 'Seus favoritos',
    en: 'Your favorites',
    ca: 'Els teus favorits',
  };

  return (
    <div className="mb-4">
      <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
        <Heart size={14} className="text-[#FF6B9D] fill-[#FF6B9D]" />
        {titulos[locale as keyof typeof titulos] || titulos.es}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
        {produtosFavoritos.map((produto) => {
          const nome = produto.nome[locale as keyof typeof produto.nome] || produto.nome.es;
          const preco = 'preco' in produto ? produto.preco : produto.precoBase;

          return (
            <motion.div
              key={produto.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="snap-start shrink-0 w-32 bg-white rounded-2xl overflow-hidden shadow-sm border border-black/5 relative"
            >
              {/* Heart toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorito(produto.id);
                }}
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm"
              >
                <Heart size={14} className="text-[#FF6B9D] fill-[#FF6B9D]" />
              </button>

              {/* Image */}
              <button onClick={() => onSelectProduto(produto)} className="w-full">
                <div className="aspect-square relative overflow-hidden">
                  {produto.imagem ? (
                    <img
                      src={produto.imagem}
                      alt={nome}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#FF6B9D]/10 to-[#FFA07A]/10 flex items-center justify-center text-3xl">
                      🍦
                    </div>
                  )}
                </div>
              </button>

              {/* Info */}
              <div className="p-2">
                <p className="font-semibold text-gray-800 text-xs line-clamp-1">{nome}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-bold text-[#FF6B9D] text-sm">
                    €{(preco ?? 0).toFixed(2)}
                  </span>
                  <button
                    onClick={() => onSelectProduto(produto)}
                    className="w-6 h-6 rounded-full bg-[#FF6B9D] text-white flex items-center justify-center hover:bg-[#FF5A8F] transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
