import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
import { todosProdutos, categoriasLocal } from '@tpv/shared/data/produtosLocal';
import type { Produto, ProdutoPersonalizavel, ProdutoFixo, OpcaoPersonalizacao, Categoria, Sabor } from '@tpv/shared/types';
import { isProdutoPersonalizavel } from '@tpv/shared/types';

/* ------------------------------------------------------------------ */
/*  Helpers: adapt new products → old CarrinhoItem shape              */
/* ------------------------------------------------------------------ */
function makeFakeCategoria(produto: ProdutoFixo): Categoria {
  return {
    id: 'copo500',
    nome: produto.nome,
    precoBase: produto.preco,
    maxSabores: 1,
    corHex: '#FF6B9D',
    ativo: true,
    ordem: 0,
    imagem: produto.imagem,
  };
}

function makeFakeSabor(produto: ProdutoFixo): Sabor {
  return {
    id: produto.id,
    nome: produto.nome,
    categoria: 'cremoso',
    corHex: '#FF6B9D',
    imagemUrl: produto.imagem,
    precoExtra: 0,
    stockBaldes: 100,
    alertaStock: 10,
    disponivel: true,
  };
}

/* ------------------------------------------------------------------ */
/*  Personalize Modal                                                 */
/* ------------------------------------------------------------------ */
function PersonalizeModal({
  produto,
  locale,
  onClose,
  onAdd,
}: {
  produto: ProdutoPersonalizavel;
  locale: string;
  onClose: () => void;
  onAdd: (precoFinal: number, opcoes: Record<string, OpcaoPersonalizacao[]>) => void;
}) {
  const [selecionadas, setSelecionadas] = useState<Record<string, OpcaoPersonalizacao[]>>({});
  const opcoes = produto.opcoes;

  const toggleOpcao = (grupo: string, opcao: OpcaoPersonalizacao) => {
    setSelecionadas((prev) => {
      const atual = prev[grupo] || [];
      const existe = atual.find((o) => o.id === opcao.id);
      const limite =
        grupo === 'toppings'
          ? (produto.limites?.maxToppings ?? 99)
          : grupo === 'frutas'
          ? (produto.limites?.maxFrutas ?? 99)
          : grupo === 'sabores'
          ? (produto.limites?.maxSabores ?? 99)
          : 99;

      if (existe) {
        return { ...prev, [grupo]: atual.filter((o) => o.id !== opcao.id) };
      }
      if (atual.length >= limite) return prev;
      return { ...prev, [grupo]: [...atual, opcao] };
    });
  };

  const precoFinal = useMemo(() => {
    let total = produto.precoBase;
    Object.values(selecionadas).forEach((lista) => {
      lista.forEach((o) => {
        if (o.tipo !== 'tamanho') total += o.preco;
      });
    });
    // Tamanho define o preço base
    const tamanhos = selecionadas['tamanhos'] || [];
    if (tamanhos.length > 0) {
      total = tamanhos[0].preco;
      // Adiciona extras dos outros grupos
      Object.entries(selecionadas).forEach(([grupo, lista]) => {
        if (grupo === 'tamanhos') return;
        lista.forEach((o) => {
          total += o.preco;
        });
      });
    }
    return total;
  }, [selecionadas, produto.precoBase]);

  const grupos = Object.entries(opcoes).filter(([, arr]) => (arr as OpcaoPersonalizacao[] | undefined)?.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-w-4xl bg-[#12121a] rounded-t-[2.5rem] shadow-2xl border-t border-white/10 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <img src={produto.imagem} alt="" className="w-16 h-16 rounded-2xl object-cover" />
            <div>
              <h3 className="text-white font-display text-2xl font-bold">{produto.nome[locale as keyof typeof produto.nome] || produto.nome.es}</h3>
              <p className="text-white/50 text-base">{produto.descricao?.[locale as keyof typeof produto.descricao] || produto.descricao?.es}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto px-8 py-6 space-y-6">
          {grupos.map(([grupo, arr]) => {
            const lista = arr as OpcaoPersonalizacao[];
            const selecionadosGrupo = selecionadas[grupo] || [];
            return (
              <div key={grupo}>
                <h4 className="text-white/70 text-lg font-semibold uppercase tracking-wider mb-3">
                  {grupo === 'tamanhos' ? 'Tamaño' : grupo === 'sabores' ? 'Sabores' : grupo === 'toppings' ? 'Toppings' : grupo === 'frutas' ? 'Frutas' : 'Extras'}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {lista.map((opcao) => {
                    const ativo = selecionadosGrupo.some((o) => o.id === opcao.id);
                    return (
                      <motion.button
                        key={opcao.id}
                        onClick={() => toggleOpcao(grupo, opcao)}
                        className={`px-5 py-3 rounded-2xl text-lg font-semibold transition-all border-2 ${
                          ativo
                            ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white border-transparent shadow-lg shadow-[#FF6B9D]/30'
                            : 'bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:bg-white/10'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {opcao.emoji && <span className="mr-2">{opcao.emoji}</span>}
                        {opcao.nome[locale as keyof typeof opcao.nome] || opcao.nome.es}
                        {opcao.preco > 0 && <span className="ml-2 text-sm opacity-80">+€{opcao.preco.toFixed(2)}</span>}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-8 py-6 border-t border-white/10 bg-[#0f0f1a]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/50 text-lg">Total</span>
            <span className="text-white font-mono text-3xl font-bold">€{precoFinal.toFixed(2)}</span>
          </div>
          <motion.button
            onClick={() => onAdd(precoFinal, selecionadas)}
            className="w-full h-16 rounded-2xl bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-display font-bold text-xl shadow-lg shadow-[#FF6B9D]/30 flex items-center justify-center gap-2"
            whileTap={{ scale: 0.97 }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Añadir al pedido
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Screen                                                       */
/* ------------------------------------------------------------------ */
export default function CategoriasScreen({
  onBack,
  onSelectCategoria,
}: {
  onBack: () => void;
  onSelectCategoria: (c: Categoria) => void;
}) {
  const { locale, carrinho, addToCarrinho, setScreen } = useStore();
  const [activeCat, setActiveCat] = useState<string>('todos');
  const [personalizando, setPersonalizando] = useState<ProdutoPersonalizavel | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const categorias = useMemo(() => {
    const cats = categoriasLocal.map((c) => ({ id: c.id, nome: c.nome, emoji: c.emoji }));
    return [{ id: 'todos', nome: { es: 'Todos', ca: 'Tots', pt: 'Todos', en: 'All' }, emoji: '🔥' }, ...cats];
  }, []);

  const produtosFiltrados = useMemo(() => {
    if (activeCat === 'todos') return todosProdutos;
    return todosProdutos.filter((p) => p.categoria === activeCat);
  }, [activeCat]);

  const totalCarrinho = carrinho.reduce((sum, item) => {
    const base = item.categoria.precoBase;
    const extras = item.sabores.reduce((s, sab) => s + (sab.precoExtra || 0), 0) + item.toppings.reduce((s, top) => s + top.preco, 0);
    return sum + base + extras;
  }, 0);

  const handleAddFixo = (produto: ProdutoFixo) => {
    addToCarrinho({
      categoria: makeFakeCategoria(produto),
      sabores: [makeFakeSabor(produto)],
      toppings: [],
    });
    setAddedId(produto.id);
    setTimeout(() => setAddedId(null), 800);
  };

  const handleAddPersonalizado = (precoFinal: number, opcoes: Record<string, OpcaoPersonalizacao[]>) => {
    if (!personalizando) return;
    const fakeCat: Categoria = {
      id: 'copo500',
      nome: personalizando.nome,
      precoBase: precoFinal,
      maxSabores: 1,
      corHex: '#FF6B9D',
      ativo: true,
      ordem: 0,
      imagem: personalizando.imagem,
    };
    const todosSabores: Sabor[] = [];
    const todosToppings = Object.values(opcoes).flat().map((o) => ({
      id: o.id,
      nome: o.nome,
      preco: o.preco,
      categoria: 'decoracion' as const,
      emoji: o.emoji,
    }));
    addToCarrinho({
      categoria: fakeCat,
      sabores: todosSabores,
      toppings: todosToppings,
    });
    setPersonalizando(null);
    setAddedId(personalizando.id);
    setTimeout(() => setAddedId(null), 800);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0a12] relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-[#0a0a12] border-b border-white/5 z-20">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </motion.button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#FFA07A] flex items-center justify-center shadow-lg shadow-[#FF6B9D]/20">
            <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
              <circle cx="16" cy="10" r="8" fill="white" opacity="0.9" />
              <path d="M8 14 Q16 36 24 14" fill="#D2691E" />
            </svg>
          </div>
          <span className="font-display font-bold text-white text-xl hidden md:block">Sabadell Nord</span>
        </div>

        <div className="w-12" />
      </div>

      {/* Category Tabs */}
      <div className="px-4 py-4 bg-[#0a0a12] border-b border-white/5 z-20">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categorias.map((cat) => {
            const ativo = activeCat === cat.id;
            const label = cat.nome[locale as keyof typeof cat.nome] || cat.nome.es;
            return (
              <motion.button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl text-lg font-bold transition-all border-2 ${
                  ativo
                    ? 'bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white border-transparent shadow-lg shadow-[#FF6B9D]/30'
                    : 'bg-white/5 text-white/60 border-white/10 hover:border-white/25 hover:bg-white/10'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className="whitespace-nowrap">{label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 overflow-auto px-4 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 max-w-7xl mx-auto">
          <AnimatePresence mode="popLayout">
            {produtosFiltrados.map((produto, idx) => {
              const nome = produto.nome[locale as keyof typeof produto.nome] || produto.nome.es;
              const desc = 'descricao' in produto && produto.descricao ? produto.descricao[locale as keyof typeof produto.descricao] || produto.descricao.es : '';
              const preco = isProdutoPersonalizavel(produto) ? produto.precoBase : produto.preco;
              const personalizavel = isProdutoPersonalizavel(produto);
              const isAdded = addedId === produto.id;

              return (
                <motion.div
                  key={produto.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.04, type: 'spring', stiffness: 300, damping: 25 }}
                  className="relative bg-[#12121a] rounded-3xl overflow-hidden border border-white/5 shadow-xl flex flex-col group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={produto.imagem}
                      alt={nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent" />
                    {(produto as ProdutoFixo).badge && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white text-sm font-bold shadow-lg">
                        {(produto as ProdutoFixo).badge?.es}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-5 flex flex-col">
                    <h3 className="font-display text-xl font-bold text-white mb-1 leading-tight">{nome}</h3>
                    {desc && <p className="text-white/40 text-sm line-clamp-2 mb-3">{desc}</p>}

                    <div className="mt-auto flex items-end justify-between gap-3">
                      <div>
                        <p className="text-white/30 text-sm">{personalizavel ? 'Desde' : ''}</p>
                        <p className="font-mono text-3xl font-bold text-[#FF6B9D]">€{preco.toFixed(2)}</p>
                      </div>

                      {personalizavel ? (
                        <motion.button
                          onClick={() => setPersonalizando(produto as ProdutoPersonalizavel)}
                          className="h-14 px-5 rounded-2xl bg-white/10 text-white font-bold text-lg border border-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
                          whileTap={{ scale: 0.92 }}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                          </svg>
                          Personalizar
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => handleAddFixo(produto as ProdutoFixo)}
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-all ${
                            isAdded
                              ? 'bg-green-500 scale-110'
                              : 'bg-gradient-to-br from-[#FF6B9D] to-[#FFA07A] hover:shadow-[#FF6B9D]/40'
                          }`}
                          whileTap={{ scale: 0.85 }}
                        >
                          {isAdded ? (
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {carrinho.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
          >
            <motion.button
              onClick={() => setScreen('carrinho')}
              className="h-20 px-8 rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-display font-bold text-xl shadow-2xl shadow-[#FF6B9D]/40 flex items-center gap-4 border-2 border-white/20"
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  '0 10px 40px -10px rgba(255,107,157,0.5)',
                  '0 10px 50px -5px rgba(255,107,157,0.7)',
                  '0 10px 40px -10px rgba(255,107,157,0.5)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="relative">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="absolute -top-2 -right-3 w-6 h-6 rounded-full bg-white text-[#FF6B9D] text-xs font-bold flex items-center justify-center">
                  {carrinho.length}
                </span>
              </div>
              <span>Ver pedido</span>
              <span className="font-mono text-2xl">€{totalCarrinho.toFixed(2)}</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Personalize Modal */}
      <AnimatePresence>
        {personalizando && (
          <PersonalizeModal
            produto={personalizando}
            locale={locale}
            onClose={() => setPersonalizando(null)}
            onAdd={handleAddPersonalizado}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
