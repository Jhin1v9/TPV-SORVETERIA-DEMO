import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { todosProdutos, categoriasLocal } from '@tpv/shared/data/produtosLocal';
import type { Produto, ProdutoCategoria } from '@tpv/shared/types';
import { isProdutoPersonalizavel } from '@tpv/shared/types';
import { Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react';

interface CardapioScreenProps {
  onBack: () => void;
  onAddToCart: (produto: Produto, quantidade: number) => void;
  onPersonalizar: (produto: Produto) => void;
  onGoToCart: () => void;
  cartCount: number;
  cartTotal: number;
}

export default function CardapioScreen({
  onBack,
  onAddToCart,
  onPersonalizar,
  onGoToCart,
  cartCount,
  cartTotal,
}: CardapioScreenProps) {
  const { locale } = useStore();
  const [categoriaAtiva, setCategoriaAtiva] = useState<ProdutoCategoria>('todos');
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});

  const produtosFiltrados = useMemo(() => {
    if (categoriaAtiva === 'todos') return todosProdutos;
    return todosProdutos.filter((p) => p.categoria === categoriaAtiva);
  }, [categoriaAtiva]);

  const getQuantidade = (id: string) => quantidades[id] || 0;

  const updateQuantidade = (id: string, delta: number) => {
    setQuantidades((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const handleAdd = (produto: Produto) => {
    const qtd = getQuantidade(produto.id);
    if (qtd > 0) {
      onAddToCart(produto, qtd);
      setQuantidades((prev) => ({ ...prev, [produto.id]: 0 }));
    } else if (isProdutoPersonalizavel(produto)) {
      onPersonalizar(produto);
    } else {
      onAddToCart(produto, 1);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <motion.button
          onClick={onBack}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowRight size={20} className="rotate-180" />
          <span className="text-lg font-medium">Atrás</span>
        </motion.button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#FFA07A] flex items-center justify-center">
            <span className="text-white text-lg">🍦</span>
          </div>
          <span className="font-display font-bold text-white text-xl">Sabadell Nord</span>
        </div>

        <motion.button
          onClick={onGoToCart}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors"
        >
          <ShoppingCart size={20} className="text-white" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#FF6B9D] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Category tabs */}
      <div className="px-6 py-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <motion.button
            onClick={() => setCategoriaAtiva('todos')}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-3 rounded-xl text-lg font-semibold whitespace-nowrap transition-all ${
              categoriaAtiva === 'todos'
                ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white shadow-lg'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
            }`}
          >
            🍨 Todo
          </motion.button>
          {categoriasLocal.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setCategoriaAtiva(cat.id)}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-3 rounded-xl text-lg font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                categoriaAtiva === cat.id
                  ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white shadow-lg'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.nome[locale] || cat.nome.es}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 px-6 pb-6 overflow-auto">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {produtosFiltrados.map((produto, index) => (
              <ProdutoCard
                key={produto.id}
                produto={produto}
                index={index}
                quantidade={getQuantidade(produto.id)}
                onUpdateQuantidade={updateQuantidade}
                onAdd={() => handleAdd(produto)}
                onPersonalizar={() => onPersonalizar(produto)}
                locale={locale}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="px-6 py-4 bg-white/5 border-t border-white/10"
        >
          <button
            onClick={onGoToCart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold text-xl flex items-center justify-center gap-3 shadow-lg"
          >
            <ShoppingCart size={24} />
            Ver carrito
            <span className="bg-white/20 px-3 py-1 rounded-lg">{cartCount} items</span>
            <span className="font-mono">€{cartTotal.toFixed(2)}</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}

function ProdutoCard({
  produto,
  index,
  quantidade,
  onUpdateQuantidade,
  onAdd,
  onPersonalizar,
  locale,
}: {
  produto: Produto;
  index: number;
  quantidade: number;
  onUpdateQuantidade: (id: string, delta: number) => void;
  onAdd: () => void;
  onPersonalizar: () => void;
  locale: string;
}) {
  const nome = produto.nome[locale as keyof typeof produto.nome] || produto.nome.es;
  const preco = 'preco' in produto ? produto.preco : produto.precoBase;
  const personalizavel = isProdutoPersonalizavel(produto);
  const categoriaInfo = categoriasLocal.find((c) => c.id === produto.categoria);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.03 }}
      className="bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors flex flex-col"
    >
      {/* Image */}
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-white/5 to-white/10">
        <img
          src={produto.imagem}
          alt={nome}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-white/80 text-sm font-medium">
          {categoriaInfo?.emoji} {categoriaInfo?.nome[locale as keyof typeof categoriaInfo.nome] || categoriaInfo?.nome.es}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-white text-lg leading-tight mb-1">{nome}</h3>
        {produto.descricao && (
          <p className="text-white/40 text-sm line-clamp-2 mb-3">
            {produto.descricao[locale as keyof typeof produto.descricao] || produto.descricao.es}
          </p>
        )}

        <div className="mt-auto">
          <p className="text-[#FF6B9D] font-bold text-2xl mb-3">
            €{preco.toFixed(2)}{personalizavel ? '+' : ''}
          </p>

          {personalizavel ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onPersonalizar}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold text-base flex items-center justify-center gap-2"
            >
              <span>⚙️</span> Personalizar
            </motion.button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/10 rounded-xl">
                <button
                  onClick={() => onUpdateQuantidade(produto.id, -1)}
                  className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white"
                >
                  <Minus size={18} />
                </button>
                <span className="w-10 text-center text-white font-bold text-lg">{quantidade}</span>
                <button
                  onClick={() => onUpdateQuantidade(produto.id, 1)}
                  className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white"
                >
                  <Plus size={18} />
                </button>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onAdd}
                disabled={quantidade === 0}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Plus size={18} /> Añadir
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
