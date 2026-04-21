import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, CreditCard } from 'lucide-react';
import { useStore } from '@tpv/shared/stores/useStore';

interface CarrinhoScreenProps {
  onBack: () => void;
  onPay: () => void;
  onRemove: (index: number) => void;
  total: number;
}

export default function CarrinhoScreen({ onBack, onPay, onRemove, total }: CarrinhoScreenProps) {
  const { carrinho, locale } = useStore();
  const iva = total * 0.1;
  const totalConIva = total + iva;

  const formatSelections = (selections?: Record<string, unknown[]>) => {
    if (!selections) return null;
    const parts: string[] = [];
    Object.entries(selections).forEach(([, items]) => {
      if (items.length > 0) {
        const label = items.map((i: unknown) => {
          const item = i as { emoji?: string; nome: Record<string, string> };
          return `${item.emoji ?? ''} ${item.nome[locale as keyof typeof item.nome] || item.nome.es}`;
        }).join(', ');
        parts.push(label);
      }
    });
    return parts.length > 0 ? parts.join(' · ') : null;
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <motion.button onClick={onBack} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 text-white/60 hover:text-white">
          <ArrowLeft size={20} />
          <span className="text-lg font-medium">Seguir comprando</span>
        </motion.button>
        <span className="font-display font-bold text-white text-xl">Tu pedido</span>
        <div className="w-32" />
      </div>

      {/* Items */}
      <div className="flex-1 px-6 py-4 overflow-auto">
        {carrinho.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-white/30">
            <span className="text-6xl mb-4">🛒</span>
            <p className="text-xl font-medium">Carrito vacío</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {carrinho.map((item, idx) => (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-white/5"
                >
                  <img src={item.product.imagem} alt={item.product.nome.es} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-lg">{item.product.nome.es}</p>
                    {formatSelections(item.selections) && (
                      <p className="text-white/40 text-sm truncate">{formatSelections(item.selections)}</p>
                    )}
                    <p className="text-white/40 text-sm">{item.quantity}x €{item.unitPrice.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-white text-lg">€{(item.quantity * item.unitPrice).toFixed(2)}</p>
                    <button onClick={() => onRemove(idx)} className="text-red-400 hover:text-red-300 text-sm mt-1 flex items-center gap-1">
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer totals */}
      {carrinho.length > 0 && (
        <div className="px-6 py-4 bg-white/5 border-t border-white/10">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-white/50 text-lg">
              <span>Subtotal</span>
              <span className="font-mono">€{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/50 text-lg">
              <span>IVA (10%)</span>
              <span className="font-mono">€{iva.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-2xl font-bold text-white pt-2 border-t border-white/10">
              <span>Total</span>
              <span className="font-mono text-[#FF6B9D]">€{totalConIva.toFixed(2)}</span>
            </div>
          </div>
          <motion.button
            onClick={onPay}
            whileTap={{ scale: 0.97 }}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] text-white font-bold text-2xl flex items-center justify-center gap-3 shadow-lg"
          >
            <CreditCard size={28} />
            Pagar €{totalConIva.toFixed(2)}
          </motion.button>
        </div>
      )}
    </div>
  );
}
