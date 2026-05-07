import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { todosProdutos, categoriasLocal } from '@tpv/shared/data/produtosLocal';
import type { Produto, ProdutoCategoria } from '@tpv/shared/types';
import { isProdutoPersonalizavel } from '@tpv/shared/types';
import { Plus, Minus, ShoppingCart, ArrowRight, Gift } from 'lucide-react';
import { useDynamicPrice } from '@tpv/shared/hooks/useDynamicPrice';
import DynamicPriceBadge from '@tpv/shared/components/DynamicPriceBadge';

interface CardapioScreenProps {
  onBack: () => void;
  onAddToCart: (produto: Produto, quantidade: number) => void;
  onPersonalizar: (produto: Produto) => void;
  onGoToCart: () => void;
  onGoToBundles: () => void;
  cartCount: number;
  cartTotal: number;
}

export default function CardapioScreen({
  onBack,
  onAddToCart,
  onPersonalizar,
  onGoToCart,
  onGoToBundles,
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
    if (isProdutoPersonalizavel(produto)) {
      onPersonalizar(produto);
      return;
    }
    // Produto fixo: adiciona quantidade selecionada (ou 1 se nenhuma)
    const qtd = getQuantidade(produto.id);
    const quantidadeFinal = qtd > 0 ? qtd : 1;
    onAddToCart(produto, quantidadeFinal);
    setQuantidades((prev) => ({ ...prev, [produto.id]: 0 }));
  };

  // Fase 14 — Preço dinâmico: usa pedidos do store

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
          <span className="text-lg font-medium">Atras</span>
        </motion.button>

        <div className="flex items-center">
          <img
            src="/assets/logo/ChatGPT%20Image%2025%20abr%202026,%2008_46_42.png"
            alt="Tropicale"
            className="h-14 w-auto max-w-[140px] object-contain"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Botao Combos */}
          <motion.button
            onClick={onGoToBundles}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-400 px-4 py-2 rounded-xl transition-colors border border-amber-500/30"
          >
            <Gift size={18} />
            <span className="font-bold text-sm">
              {locale === 'pt' ? 'Combos' : 'Combos'}
            </span>
          </motion.button>

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
            Todo
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
            <span className="bg-white/20 px-3 py-1 rounded-lg">{cartCount} articulos</span>
            <span className="font-mono">EUR{cartTotal.toFixed(2)}</span>
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
  const precoBase = 'preco' in produto ? produto.preco : produto.precoBase;
  const personalizavel = isProdutoPersonalizavel(produto);
  const categoriaInfo = categoriasLocal.find((c) => c.id === produto.categoria);

  // Fase 14 — Preço dinâmico
  const { precoFinal, multiplier, label, cor, emoji, isDiscount, isSurge } = useDynamicPrice(
    precoBase ?? 0,
    [], // O KioskScreen já calcula via props
    false, // Desabilitado no card interno, o preço já vem ajustado
  );
  const preco = precoFinal || precoBase;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.03 }}
      className={`rounded-2xl overflow-hidden border transition-colors flex flex-col ${
        produto.emEstoque
          ? 'bg-white/5 border-white/5 hover:border-white/10'
          : 'bg-white/[0.02] border-white/[0.03] opacity-50'
      }`}
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
        {!produto.emEstoque && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white/10 text-white/80 text-sm font-bold px-4 py-2 rounded-full border border-white/20">
              {locale === 'pt' ? 'Indisponível' : 'Agotado'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className={`font-bold text-lg leading-tight mb-1 ${produto.emEstoque ? 'text-white' : 'text-white/40'}`}>{nome}</h3>
        {produto.descricao && (
          <p className="text-white/40 text-sm line-clamp-2 mb-3">
            {produto.descricao[locale as keyof typeof produto.descricao] || produto.descricao.es}
          </p>
        )}

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <p className={`font-bold text-2xl ${produto.emEstoque ? 'text-[#FF6B9D]' : 'text-white/30'}`}>
              EUR{preco.toFixed(2)}{personalizavel ? '+' : ''}
            </p>
            <DynamicPriceBadge
              multiplier={multiplier}
              label={label}
              cor={cor}
              emoji={emoji}
              isDiscount={isDiscount}
              isSurge={isSurge}
              precoOriginal={precoBase ?? 0}
              precoFinal={preco}
              theme="dark"
              size="sm"
            />
          </div>

          {produto.emEstoque && (
            personalizavel ? (
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
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold text-base flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Anadir
                </motion.button>
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}
