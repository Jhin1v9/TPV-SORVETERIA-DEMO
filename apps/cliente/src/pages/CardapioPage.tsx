import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { todosProdutos, categoriasLocal } from '@tpv/shared/data/produtosLocal';
import type { Produto } from '@tpv/shared/types';
import { normalizeProdutoToProduct, isProdutoPersonalizavel } from '@tpv/shared/types';
import { t } from '@tpv/shared/i18n';
import OptimizedImage from '@tpv/shared/components/OptimizedImage';
import SkeletonCard from '@tpv/shared/components/SkeletonCard';
import AlergenoBadge from '@tpv/shared/components/AlergenoBadge';
import { useClienteToast } from '../hooks/useClienteToast';
import ProductDetailModal from '../components/ProductDetailModal';
import ErrorBoundary from '../components/ErrorBoundary';
import GroupOrderModal from '../components/GroupOrderModal';
import { useGroupOrder } from '@tpv/shared/group';
import { useInventory } from '@tpv/shared/inventory';
import { useDynamicPrice } from '@tpv/shared/hooks/useDynamicPrice';
import DynamicPriceBadge from '@tpv/shared/components/DynamicPriceBadge';
import { OneTapReorder, FavoritosSection } from '@tpv/shared';

interface FlyingItem {
  id: string;
  image: string;
  emoji: string;
  startX: number;
  startY: number;
}

export default function CardapioPage() {
  const { locale, pedidos, favoritos, toggleFavorito, addToCarrinho } = useStore();
  const [search, setSearch] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const groupOrder = useGroupOrder();

  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  const handleCategoriaChange = (catId: string) => {
    if (catId === categoriaAtiva) return;
    setLoading(true);
    setCategoriaAtiva(catId);
    setTimeout(() => setLoading(false), 350);
  };

  const triggerFly = useCallback((image: string, emoji: string, startX: number, startY: number) => {
    const id = `fly-${Date.now()}-${Math.random()}`;
    setFlyingItems((prev) => [...prev, { id, image, emoji, startX, startY }]);
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((f) => f.id !== id));
    }, 800);
  }, []);

  const produtosFiltrados = useMemo(() => {
    return todosProdutos.filter((p: Produto) => {
      const matchCat = categoriaAtiva === 'todos' || p.categoria === categoriaAtiva;
      const nome = p.nome[locale] || p.nome.es;
      const matchSearch = nome.toLowerCase().includes(search.toLowerCase());
      // Fase 10 — Filtrar produtos sem ingredientes (ainda mostra, mas marca como indisponível)
      return matchCat && matchSearch;
    });
  }, [search, categoriaAtiva, locale]);

  const handleReorder = (itens: import('@tpv/shared/types').CartItem[]) => {
    for (const item of itens) {
      addToCarrinho(item);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Fase 15 — One-Tap Reorder */}
      <OneTapReorder
        pedidos={pedidos}
        onReorder={handleReorder}
        locale={locale}
      />

      {/* Fase 15 — Favoritos */}
      <FavoritosSection
        favoritos={favoritos}
        produtos={todosProdutos}
        onToggleFavorito={toggleFavorito}
        onSelectProduto={(produto) => setProdutoSelecionado(produto)}
        locale={locale}
      />

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder={t('search', locale)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white rounded-2xl px-4 py-3 pl-11 text-sm shadow-sm border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#FF6B9D]/30 transition-shadow"
        />
        <svg className="absolute left-3.5 top-3.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {categoriasLocal.map((cat) => (
            <motion.button
              key={cat.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCategoriaChange(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                categoriaAtiva === cat.id
                  ? 'bg-[#FF6B9D] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-black/5 hover:bg-gray-50'
              }`}
            >
              <motion.span
                animate={categoriaAtiva === cat.id ? { rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                {cat.emoji}
              </motion.span>
              <span>{cat.nome[locale] || cat.nome.es}</span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Products Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SkeletonCard count={6} />
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <AnimatePresence>
              {produtosFiltrados.map((produto, index) => (
                <ProdutoCard
                  key={produto.id}
                  produto={produto}
                  index={index}
                  onSelect={(p) => setProdutoSelecionado(p)}
                  onFlyToCart={triggerFly}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {produtoSelecionado && (
        <ErrorBoundary key={`eb-${produtoSelecionado.id}`}>
          <ProductDetailModal
            key={`modal-${produtoSelecionado.id}`}
            produto={produtoSelecionado}
            onClose={() => setProdutoSelecionado(null)}
          />
        </ErrorBoundary>
      )}

      {/* Empty State */}
      <AnimatePresence>
        {!loading && produtosFiltrados.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-16"
          >
            <motion.span
              className="text-6xl block mb-4"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔍
            </motion.span>
            <p className="text-gray-500 font-medium">{t('noOrdersYet', locale)}</p>
            <p className="text-gray-400 text-sm mt-1">{t('search', locale)}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fase 11 — Botão flutuante de grupo */}
      <motion.button
        onClick={() => setShowGroupModal(true)}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-[#FF6B9D] text-white shadow-lg flex items-center justify-center"
      >
        {groupOrder.grupo ? (
          <div className="relative">
            <span className="text-lg">👥</span>
            <span className="absolute -top-1 -right-2 bg-white text-[#FF6B9D] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {groupOrder.grupo.membros.length}
            </span>
          </div>
        ) : (
          <span className="text-lg">👥</span>
        )}
      </motion.button>

      <GroupOrderModal visible={showGroupModal} onClose={() => setShowGroupModal(false)} />

      {/* Fly-to-cart animations (viewport fixed) */}
      <AnimatePresence>
        {flyingItems.map((item) => (
          <FlyToCartParticle key={item.id} item={item} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function FlyToCartParticle({ item }: { item: FlyingItem }) {
  const cartBtn = typeof document !== 'undefined' ? document.getElementById('cart-tab-btn') : null;
  const cartRect = cartBtn?.getBoundingClientRect();
  const endX = cartRect ? cartRect.left + cartRect.width / 2 - 16 : window.innerWidth * 0.375;
  const endY = cartRect ? cartRect.top + cartRect.height / 2 - 16 : window.innerHeight - 40;

  return (
    <motion.div
      initial={{ x: item.startX - 16, y: item.startY - 16, scale: 1, opacity: 1 }}
      animate={{ x: endX, y: endY, scale: 0.3, opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
      className="fixed z-[9999] w-8 h-8 rounded-full overflow-hidden shadow-lg pointer-events-none"
      style={{ top: 0, left: 0 }}
    >
      {item.image ? (
        <img src={item.image} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-[#FF6B9D] flex items-center justify-center text-white text-sm">
          {item.emoji}
        </div>
      )}
    </motion.div>
  );
}

function ProdutoCard({
  produto,
  index,
  onSelect,
  onFlyToCart,
}: {
  produto: Produto;
  index: number;
  onSelect?: (p: Produto) => void;
  onFlyToCart?: (image: string, emoji: string, x: number, y: number) => void;
}) {
  const { locale, addToCarrinho, perfilUsuario, temAlergiaA, ingredientes, sabores, pedidos, dynamicPricingEnabled, toggleFavorito, isFavorito } = useStore();
  const groupOrder = useGroupOrder();
  const toast = useClienteToast();
  const [added, setAdded] = useState(false);
  const nome = produto.nome[locale] || produto.nome.es;
  const precoBase = 'preco' in produto ? produto.preco : produto.precoBase;

  // Fase 14 — Preço dinâmico
  const { precoFinal, multiplier, label, cor, emoji, isDiscount, isSurge } = useDynamicPrice(
    precoBase ?? 0,
    pedidos,
    dynamicPricingEnabled,
  );
  const isPersonalizavel = isProdutoPersonalizavel(produto);

  // Fase 10 — Verificar disponibilidade por ingredientes
  const inventory = useInventory(ingredientes, sabores);
  const product = normalizeProdutoToProduct(produto);
  const podeProduzir = inventory.podeProduzir({ product, quantity: 1, unitPrice: precoBase ?? 0 });
  const capacidade = inventory.capacidade(product.id);
  const temIngredientes = capacidade > 0 || podeProduzir;

  const alergenosProduto = produto.alergenos || [];
  const alergenosConflito = perfilUsuario?.temAlergias
    ? alergenosProduto.filter((a) => temAlergiaA(a.alergeno))
    : [];

  const categoriaEmoji = categoriasLocal.find((c) => c.id === produto.categoria)?.emoji || '🍨';

  const handleCardClick = () => {
    if (!temIngredientes) return;
    onSelect?.(produto);
  };

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!temIngredientes) return;
    const rect = e.currentTarget.getBoundingClientRect();
    onFlyToCart?.(produto.imagem, categoriaEmoji, rect.left + rect.width / 2, rect.top + rect.height / 2);

    const cartItem = {
      product,
      quantity: 1,
      unitPrice: precoFinal ?? precoBase,
    };

    // Fase 11 — Se há grupo ativo, adiciona ao grupo
    if (groupOrder.grupo && groupOrder.grupo.status === 'abierto') {
      groupOrder.adicionar(cartItem);
      toast.success(`${nome} añadido al grupo`);
    } else {
      addToCarrinho(cartItem);
    }

    setAdded(true);
    toast.addedToCart(nome);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={produto.emEstoque && temIngredientes ? { scale: 0.97 } : undefined}
      onClick={produto.emEstoque && temIngredientes ? handleCardClick : undefined}
      className={`rounded-2xl overflow-hidden shadow-sm border-2 transition-colors ${
        produto.emEstoque && temIngredientes ? 'cursor-pointer' : 'cursor-not-allowed'
      } ${
        alergenosConflito.length > 0
          ? 'bg-amber-50 border-amber-300'
          : 'bg-white border-black/5'
      } ${!produto.emEstoque || !temIngredientes ? 'opacity-60' : ''}`}
    >
      <div className="aspect-square relative overflow-hidden">
        <OptimizedImage
          src={produto.imagem}
          alt={nome}
          className="w-full h-full"
          fallbackEmoji={categoriaEmoji}
        />
        {/* Fase 15 — Botão de favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorito(produto.id);
          }}
          className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isFavorito(produto.id) ? '#FF6B9D' : 'none'}
            stroke="#FF6B9D"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {(!produto.emEstoque || !temIngredientes) && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-full">
              {!temIngredientes ? 'Sin ingredientes' : locale === 'pt' ? 'Indisponível' : 'Agotado'}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className={`font-semibold text-sm line-clamp-1 ${produto.emEstoque && temIngredientes ? 'text-gray-800' : 'text-gray-400'}`}>{nome}</p>
        <AlergenoBadge alergenos={alergenosProduto} locale={locale} compact showOnlyUserAlergias={alergenosConflito.length > 0 ? alergenosConflito : undefined} />
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <p className={`font-bold text-sm ${produto.emEstoque && temIngredientes ? 'text-[#FF6B9D]' : 'text-gray-400'}`}>
            EUR{precoFinal.toFixed(2)}{isPersonalizavel ? '+' : ''}
          </p>
          <DynamicPriceBadge
            multiplier={multiplier}
            label={label}
            cor={cor}
            emoji={emoji}
            isDiscount={isDiscount}
            isSurge={isSurge}
            precoOriginal={precoBase ?? 0}
            precoFinal={precoFinal}
            size="sm"
          />
        </div>
        {!temIngredientes && capacidade <= 0 && (
          <p className="text-[10px] text-red-400 mt-0.5">Sin stock de ingredientes</p>
        )}
        {!temIngredientes && capacidade > 0 && capacidade < 5 && (
          <p className="text-[10px] text-amber-500 mt-0.5">Solo {capacidade} unidades</p>
        )}
        {produto.emEstoque && temIngredientes && (
          isPersonalizavel ? (
            <motion.button
              onClick={handleCardClick}
              whileTap={{ scale: 0.95 }}
              className="w-full mt-2 py-2 rounded-xl text-xs font-bold bg-[#FF6B9D]/10 text-[#FF6B9D] hover:bg-[#FF6B9D] hover:text-white transition-all duration-300 flex items-center justify-center gap-1"
            >
              {t('customize', locale) || 'Personalizar'} ✨
            </motion.button>
          ) : (
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.95 }}
              className={`w-full mt-2 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1 ${
                added
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[#FF6B9D]/10 text-[#FF6B9D] hover:bg-[#FF6B9D] hover:text-white'
              }`}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {t('success', locale)}
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    {t('addToCart', locale)}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        )}
      </div>
    </motion.div>
  );
}
