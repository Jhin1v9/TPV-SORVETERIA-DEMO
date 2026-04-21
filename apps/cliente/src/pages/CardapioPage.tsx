import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { todosProdutos, categoriasLocal } from '@tpv/shared/data/produtosLocal';
import type { Produto, ProdutoPersonalizavel } from '@tpv/shared/types';
import { normalizeProdutoToProduct, isProdutoPersonalizavel } from '@tpv/shared/types';
import { t } from '@tpv/shared/i18n';
import OptimizedImage from '@tpv/shared/components/OptimizedImage';
import SkeletonCard from '@tpv/shared/components/SkeletonCard';
import AlergenoBadge from '@tpv/shared/components/AlergenoBadge';
import { useClienteToast } from '../hooks/useClienteToast';
import PersonalizacaoDrawer from '../components/PersonalizacaoDrawer';

interface FlyingItem {
  id: string;
  image: string;
  emoji: string;
  startX: number;
  startY: number;
}

export default function CardapioPage() {
  const { locale } = useStore();
  const [search, setSearch] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [produtoPersonalizando, setProdutoPersonalizando] = useState<ProdutoPersonalizavel | null>(null);
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
      return matchCat && matchSearch;
    });
  }, [search, categoriaAtiva, locale]);

  return (
    <div className="p-4 space-y-4">
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
                  onPersonalizar={(p) => setProdutoPersonalizando(p)}
                  onFlyToCart={triggerFly}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <PersonalizacaoDrawer
        produto={produtoPersonalizando}
        onClose={() => setProdutoPersonalizando(null)}
      />

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
  onPersonalizar,
  onFlyToCart,
}: {
  produto: Produto;
  index: number;
  onPersonalizar?: (p: ProdutoPersonalizavel) => void;
  onFlyToCart?: (image: string, emoji: string, x: number, y: number) => void;
}) {
  const { locale, addToCarrinho, perfilUsuario, temAlergiaA } = useStore();
  const toast = useClienteToast();
  const [added, setAdded] = useState(false);
  const nome = produto.nome[locale] || produto.nome.es;
  const preco = 'preco' in produto ? produto.preco : produto.precoBase;
  const isPersonalizavel = isProdutoPersonalizavel(produto);

  const alergenosProduto = produto.alergenos || [];
  const alergenosConflito = perfilUsuario?.temAlergias
    ? alergenosProduto.filter((a) => temAlergiaA(a.alergeno))
    : [];

  const categoriaEmoji = categoriasLocal.find((c) => c.id === produto.categoria)?.emoji || '🍨';

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isPersonalizavel) {
      onPersonalizar?.(produto);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    onFlyToCart?.(produto.imagem, categoriaEmoji, rect.left + rect.width / 2, rect.top + rect.height / 2);

    const product = normalizeProdutoToProduct(produto);
    addToCarrinho({
      product,
      quantity: 1,
      unitPrice: preco,
    });
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
      whileTap={{ scale: 0.97 }}
      className={`rounded-2xl overflow-hidden shadow-sm border-2 transition-colors ${
        alergenosConflito.length > 0
          ? 'bg-amber-50 border-amber-300'
          : 'bg-white border-black/5'
      }`}
    >
      <div className="aspect-square relative overflow-hidden">
        <OptimizedImage
          src={produto.imagem}
          alt={nome}
          className="w-full h-full"
          fallbackEmoji={categoriaEmoji}
        />
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-gray-800 line-clamp-1">{nome}</p>
        <AlergenoBadge alergenos={alergenosProduto} locale={locale} compact showOnlyUserAlergias={alergenosConflito.length > 0 ? alergenosConflito : undefined} />
        <p className="text-[#FF6B9D] font-bold text-sm mt-1">
          €{preco.toFixed(2)}{isPersonalizavel ? '+' : ''}
        </p>
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
      </div>
    </motion.div>
  );
}
