/**
 * ═══ FASE 15 — One-Tap Reorder ═══
 * Card horizontal com últimos pedidos para repetir com 1 toque
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Clock } from 'lucide-react';
import type { Pedido, CartItem } from '../types';

interface OneTapReorderProps {
  pedidos: Pedido[];
  onReorder: (itens: CartItem[]) => void;
  locale?: string;
}

export default function OneTapReorder({ pedidos, onReorder, locale = 'es' }: OneTapReorderProps) {
  const pedidosRecentes = useMemo(() => {
    // Pega os 3 pedidos mais recentes entregues
    return pedidos
      .filter((p) => p.status === 'entregado' || p.status === 'listo')
      .sort((a, b) => new Date(b.timestampCriacao).getTime() - new Date(a.timestampCriacao).getTime())
      .slice(0, 3);
  }, [pedidos]);

  if (pedidosRecentes.length === 0) return null;

  const titulos = {
    es: 'Pedir de nuevo',
    pt: 'Pedir de novo',
    en: 'Order again',
    ca: 'Tornar a demanar',
  };

  const handleReorder = (pedido: Pedido) => {
    const itens: CartItem[] = [];
    for (const item of pedido.itens) {
      if (!item.productSnapshot) continue;
      itens.push({
        product: item.productSnapshot,
        quantity: item.quantidade,
        unitPrice: item.precoUnitario,
        selections: item.selections,
        notes: item.notas,
      });
    }
    onReorder(itens);
  };

  return (
    <div className="mb-4">
      <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
        <RefreshCcw size={14} className="text-[#FF6B9D]" />
        {titulos[locale as keyof typeof titulos] || titulos.es}
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
        {pedidosRecentes.map((pedido) => {
          const primeiroItem = pedido.itens[0];
          const totalItens = pedido.itens.reduce((sum, i) => sum + i.quantidade, 0);

          return (
            <motion.button
              key={pedido.id}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleReorder(pedido)}
              className="snap-start shrink-0 w-40 bg-white rounded-2xl p-3 shadow-sm border border-black/5 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                {primeiroItem?.productSnapshot?.imagem ? (
                  <img
                    src={primeiroItem.productSnapshot.imagem}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B9D]/20 to-[#FFA07A]/20 flex items-center justify-center text-lg">
                    🍦
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">
                    #{pedido.numeroSequencial?.toString().padStart(3, '0') || pedido.id.slice(-3)}
                  </p>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(pedido.timestampCriacao).toLocaleDateString('es', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {pedido.itens.map((i) => i.productSnapshot?.nome?.es || i.productId).join(', ')}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#FF6B9D]">
                  {totalItens} producto{totalItens > 1 ? 's' : ''}
                </span>
                <span className="text-xs font-bold text-gray-800">
                  €{pedido.total.toFixed(2)}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
