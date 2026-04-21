import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Check, ArrowLeft, ShoppingCart } from 'lucide-react';
import type { ProdutoPersonalizavel, OpcaoPersonalizacao } from '@tpv/shared/types';

interface PersonalizacaoScreenProps {
  produto: ProdutoPersonalizavel;
  locale: string;
  onBack: () => void;
  onAddToCart: (produto: ProdutoPersonalizavel, selecoes: Record<string, OpcaoPersonalizacao[]>) => void;
}

export default function PersonalizacaoScreen({ produto, locale, onBack, onAddToCart }: PersonalizacaoScreenProps) {
  const nome = produto.nome[locale] || produto.nome.es;
  const [selecoes, setSelecoes] = useState<Record<string, OpcaoPersonalizacao[]>>({});

  const toggleOpcao = (tipo: string, opcao: OpcaoPersonalizacao, max: number) => {
    setSelecoes((prev) => {
      const atuais = prev[tipo] || [];
      const existe = atuais.find((o) => o.id === opcao.id);

      if (existe) {
        return { ...prev, [tipo]: atuais.filter((o) => o.id !== opcao.id) };
      }

      if (atuais.length >= max) {
        return prev; // já atingiu o máximo
      }

      return { ...prev, [tipo]: [...atuais, opcao] };
    });
  };

  const calcularTotal = () => {
    let total = produto.precoBase;
    Object.values(selecoes).forEach((lista) => {
      lista.forEach((o) => {
        if (o.tipo === 'tamanho') {
          total = o.preco; // tamanho define o preço base
        } else {
          total += o.preco;
        }
      });
    });
    return total;
  };

  const handleAdd = () => {
    onAddToCart(produto, selecoes);
  };

  const opcoesConfig = [
    { key: 'tamanhos', label: 'Tamaño', icon: '📏', max: 1 },
    { key: 'sabores', label: 'Sabores', icon: '🍦', max: produto.limites?.maxSabores || 3 },
    { key: 'toppings', label: 'Toppings', icon: '🍫', max: produto.limites?.maxToppings || 4 },
    { key: 'frutas', label: 'Frutas', icon: '🍓', max: produto.limites?.maxFrutas || 3 },
    { key: 'extras', label: 'Extras', icon: '✨', max: 5 },
  ] as const;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <motion.button onClick={onBack} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 text-white/60 hover:text-white">
          <ArrowLeft size={20} />
          <span className="text-lg font-medium">Atrás</span>
        </motion.button>
        <span className="font-display font-bold text-white text-xl">Personalizar</span>
        <div className="w-20" />
      </div>

      {/* Product hero */}
      <div className="px-6 py-4">
        <div className="flex gap-4 items-center">
          <img src={produto.imagem} alt={nome} className="w-24 h-24 rounded-2xl object-cover" />
          <div>
            <h2 className="text-white font-bold text-2xl">{nome}</h2>
            <p className="text-[#FF6B9D] font-bold text-xl">€{calcularTotal().toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 px-6 pb-4 overflow-auto">
        <div className="space-y-6">
          {opcoesConfig.map(({ key, label, icon, max }) => {
            const lista = produto.opcoes[key as keyof typeof produto.opcoes];
            if (!lista || lista.length === 0) return null;

            const selecionados = selecoes[key] || [];

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-lg">
                    {icon} {label}
                    <span className="text-white/40 text-sm ml-2">(max {max})</span>
                  </h3>
                  {selecionados.length > 0 && (
                    <span className="text-[#FF6B9D] text-sm font-medium">{selecionados.length} seleccionados</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {lista.map((opcao) => {
                    const selecionado = selecionados.some((s) => s.id === opcao.id);
                    return (
                      <motion.button
                        key={opcao.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleOpcao(key, opcao, max)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          selecionado
                            ? 'border-[#FF6B9D] bg-[#FF6B9D]/10 text-white'
                            : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-base">{opcao.nome[locale] || opcao.nome.es}</span>
                          {selecionado && <Check size={16} className="text-[#FF6B9D]" />}
                        </div>
                        {opcao.preco > 0 && (
                          <span className="text-sm text-[#FFA07A]">+€{opcao.preco.toFixed(2)}</span>
                        )}
                        {opcao.emoji && <span className="text-lg ml-2">{opcao.emoji}</span>}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-6 py-4 bg-white/5 border-t border-white/10">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold text-xl flex items-center justify-center gap-3 shadow-lg"
        >
          <ShoppingCart size={24} />
          Añadir al carrito — €{calcularTotal().toFixed(2)}
        </motion.button>
      </div>
    </div>
  );
}
