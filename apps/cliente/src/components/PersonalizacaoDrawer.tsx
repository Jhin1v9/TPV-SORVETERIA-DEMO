import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import type { ProdutoPersonalizavel, OpcaoPersonalizacao } from '@tpv/shared/types';
import { normalizeProdutoToProduct } from '@tpv/shared/types';
import { useStore } from '@tpv/shared/stores/useStore';
import { useClienteToast } from '../hooks/useClienteToast';

interface PersonalizacaoDrawerProps {
  produto: ProdutoPersonalizavel | null;
  onClose: () => void;
}

export default function PersonalizacaoDrawer({ produto, onClose }: PersonalizacaoDrawerProps) {
  const { locale, addToCarrinho } = useStore();
  const toast = useClienteToast();
  const [selecoes, setSelecoes] = useState<Record<string, OpcaoPersonalizacao[]>>({});

  if (!produto) return null;

  const nome = produto.nome[locale] || produto.nome.es;

  const toggleOpcao = (tipo: string, opcao: OpcaoPersonalizacao, max: number) => {
    setSelecoes((prev) => {
      const atuais = prev[tipo] || [];
      const existe = atuais.find((o) => o.id === opcao.id);
      if (existe) {
        return { ...prev, [tipo]: atuais.filter((o) => o.id !== opcao.id) };
      }
      if (atuais.length >= max) return prev;
      return { ...prev, [tipo]: [...atuais, opcao] };
    });
  };

  const calcularTotal = () => {
    let total = produto.precoBase;
    Object.values(selecoes).forEach((lista) => {
      lista.forEach((o) => {
        if (o.tipo === 'tamanho') total = o.preco;
        else total += o.preco;
      });
    });
    return total;
  };

  const handleAdd = () => {
    const selections: Record<string, OpcaoPersonalizacao[]> = {};
    Object.entries(selecoes).forEach(([key, lista]) => {
      if (lista.length > 0) selections[key] = lista;
    });

    addToCarrinho({
      product: normalizeProdutoToProduct(produto),
      quantity: 1,
      unitPrice: calcularTotal(),
      selections: Object.keys(selections).length > 0 ? selections : undefined,
    });

    toast.addedToCart(nome);
    setSelecoes({});
    onClose();
  };

  const opcoesConfig = [
    { key: 'tamanhos', label: 'Tamaño', icon: '📏', max: 1 },
    { key: 'sabores', label: 'Sabores', icon: '🍦', max: produto.limites?.maxSabores || 3 },
    { key: 'toppings', label: 'Toppings', icon: '🍫', max: produto.limites?.maxToppings || 4 },
    { key: 'frutas', label: 'Frutas', icon: '🍓', max: produto.limites?.maxFrutas || 3 },
    { key: 'extras', label: 'Extras', icon: '✨', max: 5 },
  ] as const;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white w-full max-h-[85vh] rounded-t-3xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-lg text-gray-800">{nome}</h3>
              <p className="text-[#FF6B9D] font-bold">€{calcularTotal().toFixed(2)}</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable options */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {opcoesConfig.map(({ key, label, icon, max }) => {
              const opcoes = (produto.opcoes as Record<string, OpcaoPersonalizacao[]>)[key];
              if (!opcoes || opcoes.length === 0) return null;
              const selecionadas = selecoes[key] || [];

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{icon} {label}</span>
                    <span className="text-xs text-gray-400">{selecionadas.length}/{max}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {opcoes.map((opcao) => {
                      const isSelected = selecionadas.some((o) => o.id === opcao.id);
                      const opcaoNome = opcao.nome[locale] || opcao.nome.es;
                      return (
                        <button
                          key={opcao.id}
                          onClick={() => toggleOpcao(key, opcao, max)}
                          className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all ${
                            isSelected
                              ? 'bg-[#FF6B9D] text-white shadow-sm'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {isSelected && <Check size={14} />}
                          {opcao.emoji && <span>{opcao.emoji}</span>}
                          {opcaoNome}
                          {opcao.preco > 0 && <span className="opacity-70">+€{opcao.preco.toFixed(2)}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-gray-100 bg-white">
            <button
              onClick={handleAdd}
              className="w-full py-3.5 rounded-xl bg-[#FF6B9D] text-white font-bold text-base shadow-lg shadow-[#FF6B9D]/20 active:scale-[0.98] transition-transform"
            >
              Añadir al carrito — €{calcularTotal().toFixed(2)}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
