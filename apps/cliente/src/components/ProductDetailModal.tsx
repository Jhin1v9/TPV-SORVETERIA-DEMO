import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ChevronRight, AlertTriangle, Leaf, Info } from 'lucide-react';
import type { Produto, OpcaoPersonalizacao } from '@tpv/shared/types';
import { normalizeProdutoToProduct, isProdutoPersonalizavel } from '@tpv/shared/types';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
import OptimizedImage from '@tpv/shared/components/OptimizedImage';
import { todosProdutos } from '@tpv/shared/data/produtosLocal';

interface ProductDetailModalProps {
  produto: Produto | null;
  onClose: () => void;
}

/**
 * Inferir limite de sabores a partir do nome do tamanho.
 * Ex: "Petit Xocolata — 1 bola" → 1, "Gran — 3 sabores / 3 bolas" → 3
 */
function inferirMaxSaboresDoTamanho(tamanhoNome: string): number | null {
  const match = tamanhoNome.match(/(\d+)\s*(?:bola|sabor|boles|sabors|sabores|scoops|flavor)/i);
  if (match) return parseInt(match[1], 10);
  return null;
}

/** Sugestões de combinação por categoria */
function getSugestoes(categoriaId: string, produtoId: string): Produto[] {
  const sugestoes: Record<string, string[]> = {
    copas: ['copa-oreo', 'cafe-leche'],
    gofres: ['cafe-leche', 'copa-oreo'],
    souffle: ['helado-terra', 'cafe'],
    'banana-split': ['cafe-leche'],
    acai: ['granizado', 'batido'],
    helados: ['cono', 'gofre'],
    conos: ['cafe', 'granizado'],
    granizados: ['orxata', 'gofre'],
    batidos: ['gofre', 'copa-bahia'],
    orxata: ['gofre', 'copa-bahia'],
    cafes: ['copa-oreo', 'gofre'],
    'tarrinas-nata': ['copa-bahia'],
    'para-llevar': ['copa-bahia', 'cafe'],
  };
  const ids = sugestoes[categoriaId] || [];
  return todosProdutos.filter((p) => ids.includes(p.id) && p.id !== produtoId).slice(0, 2);
}

export default function ProductDetailModal({ produto, onClose }: ProductDetailModalProps) {
  const { locale, addToCarrinho, perfilUsuario, temAlergiaA } = useStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selecoes, setSelecoes] = useState<Record<string, OpcaoPersonalizacao[]>>({});
  const [headerCompact, setHeaderCompact] = useState(false);

  // Reset selections when product changes
  useEffect(() => {
    setSelecoes({});
    setHeaderCompact(false);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [produto?.id]);

  if (!produto) return null;

  const nome = produto.nome[locale] || produto.nome.es;
  const descricao = produto.descricao?.[locale] || produto.descricao?.es;
  const isPersonalizavel = isProdutoPersonalizavel(produto);
  const precoBase = 'precoBase' in produto ? produto.precoBase : 'preco' in produto ? produto.preco : 0;
  const emojiMap: Record<string, string> = { copas: '🍨', gofres: '🧇', souffle: '🍫', 'banana-split': '🍌', acai: '🫐', helados: '🍦', conos: '🍦', granizados: '🥤', batidos: '🥛', orxata: '🥛', cafes: '☕', 'tarrinas-nata': '🥣', 'para-llevar': '📦' };
  const categoriaEmoji = emojiMap[produto.categoria] || '🍨';

  const alergenosProduto = produto.alergenos || [];
  const alergenosConflito = perfilUsuario?.temAlergias
    ? alergenosProduto.filter((a) => temAlergiaA(a.alergeno))
    : [];

  // ─── Limites dinâmicos ───
  const tamanhoSelecionado = selecoes['tamanhos']?.[0];
  const maxSaboresInferido = tamanhoSelecionado
    ? inferirMaxSaboresDoTamanho(tamanhoSelecionado.nome[locale] || tamanhoSelecionado.nome.es)
    : null;

  const maxSabores = maxSaboresInferido ?? (isPersonalizavel ? produto.limites?.maxSabores ?? 3 : 0);
  const maxToppings = isPersonalizavel ? produto.limites?.maxToppings ?? 4 : 0;
  const maxFrutas = isPersonalizavel ? produto.limites?.maxFrutas ?? 3 : 0;
  const maxExtras = 5;

  // ─── Toggle opções ───
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

  // Tamanho é radio (só 1)
  const selecionarTamanho = (opcao: OpcaoPersonalizacao) => {
    setSelecoes((prev) => {
      const atual = prev['tamanhos']?.[0];
      if (atual?.id === opcao.id) {
        return { ...prev, tamanhos: [] };
      }
      return { ...prev, tamanhos: [opcao] };
    });
  };

  // ─── Cálculo de preço ───
  const calcularTotal = useMemo(() => {
    let total = precoBase;
    Object.values(selecoes).forEach((lista) => {
      lista.forEach((o) => {
        if (o.tipo === 'tamanho') total = o.preco;
        else total += o.preco;
      });
    });
    return total;
  }, [selecoes, precoBase]);

  // ─── Handle scroll para header compacto ───
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setHeaderCompact(scrollTop > 180);
  };

  // ─── Adicionar ao carrinho ───
  const handleAdd = () => {
    const selections: Record<string, OpcaoPersonalizacao[]> = {};
    Object.entries(selecoes).forEach(([key, lista]) => {
      if (lista.length > 0) selections[key] = lista;
    });

    addToCarrinho({
      product: normalizeProdutoToProduct(produto),
      quantity: 1,
      unitPrice: calcularTotal,
      selections: Object.keys(selections).length > 0 ? selections : undefined,
    });

    onClose();
  };

  // ─── Sugestões ───
  const sugestoes = getSugestoes(produto.categoria, produto.id);

  // ─── Configuração das seções ───
  const secoes = isPersonalizavel
    ? [
        { key: 'tamanhos', label: t('chooseSize', locale), icon: '📏', max: 1, radio: true },
        { key: 'sabores', label: t('chooseFlavors', locale), icon: '🍦', max: maxSabores },
        { key: 'toppings', label: t('chooseToppings', locale), icon: '🍫', max: maxToppings },
        { key: 'frutas', label: 'Frutas', icon: '🍓', max: maxFrutas },
        { key: 'extras', label: t('addExtras', locale), icon: '✨', max: maxExtras },
      ]
    : [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-white w-full max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[92vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header flutuante (aparece ao scrollar) */}
          <AnimatePresence>
            {headerCompact && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 py-3 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-800 truncate">{nome}</p>
                  <p className="text-[#FF6B9D] font-bold text-xs">€{calcularTotal.toFixed(2)}</p>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scrollable content */}
          <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
            {/* Hero Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <OptimizedImage
                src={produto.imagem}
                alt={nome}
                className="w-full h-full"
                fallbackEmoji={categoriaEmoji}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Botão fechar (visível quando header não está compacto) */}
              {!headerCompact && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-gray-700 shadow-lg"
                >
                  <X size={20} />
                </button>
              )}

              {/* Badge de categoria */}
              <div className="absolute bottom-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 shadow-sm">
                  <span className="text-base">{categoriaEmoji}</span>
                  {produto.categoria}
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="px-5 pt-5 pb-2">
              <h2 className="font-display font-bold text-2xl text-gray-800">{nome}</h2>
              <p className="text-[#FF6B9D] font-bold text-xl mt-1">
                €{calcularTotal.toFixed(2)}
                {isPersonalizavel && <span className="text-sm font-normal text-gray-400 ml-1">{t('scrollForMore', locale)}</span>}
              </p>

              {descricao && (
                <p className="text-gray-500 text-sm mt-3 leading-relaxed">{descricao}</p>
              )}

              {/* Alergenos detalhados */}
              {alergenosProduto.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Info size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('allergens', locale)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alergenosProduto.map((aviso) => {
                      const isConflito = alergenosConflito.some((a) => a.alergeno === aviso.alergeno);
                      return (
                        <span
                          key={aviso.alergeno}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                            aviso.nivel === 'contem'
                              ? isConflito
                                ? 'bg-red-100 text-red-700 border border-red-300 ring-1 ring-red-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}
                        >
                          {aviso.nivel === 'contem' ? <AlertTriangle size={12} /> : <Leaf size={12} />}
                          {aviso.nivel === 'contem' ? t('contains', locale) : t('mayContain', locale)}{' '}
                          {aviso.alergeno}
                          {isConflito && <span className="ml-0.5">⚠️</span>}
                        </span>
                      );
                    })}
                  </div>
                  {alergenosConflito.length > 0 && (
                    <p className="text-red-600 text-xs mt-2 font-medium flex items-center gap-1">
                      <AlertTriangle size={12} />
                      {t('allergens', locale)}: Este producto contiene alérgenos que has indicado
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Opções personalizáveis */}
            {isPersonalizavel && (
              <div className="px-5 pb-4 space-y-6">
                {secoes.map(({ key, label, icon, max, radio }) => {
                  const opcoes = (produto.opcoes as Record<string, OpcaoPersonalizacao[]>)[key];
                  if (!opcoes || opcoes.length === 0) return null;
                  const selecionadas = selecoes[key] || [];
                  const atingiuLimite = selecionadas.length >= max && max > 0;

                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                          <span>{icon}</span>
                          {label}
                        </span>
                        {max > 0 && (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            atingiuLimite ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {selecionadas.length}/{max}
                          </span>
                        )}
                      </div>

                      {/* Radio-style para tamanhos */}
                      {radio ? (
                        <div className="space-y-2">
                          {opcoes.map((opcao) => {
                            const isSelected = selecionadas.some((o) => o.id === opcao.id);
                            const opcaoNome = opcao.nome[locale] || opcao.nome.es;
                            return (
                              <button
                                key={opcao.id}
                                onClick={() => selecionarTamanho(opcao)}
                                className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all text-left ${
                                  isSelected
                                    ? 'border-[#FF6B9D] bg-pink-50'
                                    : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-[#FF6B9D]' : 'border-gray-300'
                                  }`}>
                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B9D]" />}
                                  </div>
                                  <span className={`font-medium text-sm ${isSelected ? 'text-gray-800' : 'text-gray-600'}`}>
                                    {opcaoNome}
                                  </span>
                                </div>
                                <span className={`font-bold text-sm ${isSelected ? 'text-[#FF6B9D]' : 'text-gray-400'}`}>
                                  €{opcao.preco.toFixed(2)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        /* Chips para sabores/toppings/frutas/extras */
                        <div className="flex flex-wrap gap-2">
                          {opcoes.map((opcao) => {
                            const isSelected = selecionadas.some((o) => o.id === opcao.id);
                            const isDisabled = !isSelected && atingiuLimite;
                            const opcaoNome = opcao.nome[locale] || opcao.nome.es;
                            return (
                              <button
                                key={opcao.id}
                                onClick={() => !isDisabled && toggleOpcao(key, opcao, max)}
                                disabled={isDisabled}
                                className={`px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all ${
                                  isSelected
                                    ? 'bg-[#FF6B9D] text-white shadow-sm'
                                    : isDisabled
                                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {isSelected && <Check size={14} />}
                                {opcao.emoji && <span className="text-base">{opcao.emoji}</span>}
                                {opcaoNome}
                                {opcao.preco > 0 && (
                                  <span className={`opacity-70 ${isSelected ? 'text-white/80' : ''}`}>
                                    +€{opcao.preco.toFixed(2)}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {atingiuLimite && max > 0 && (
                        <p className="text-red-500 text-xs mt-2 font-medium">{t('maxReached', locale)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sugestões de combinação */}
            {sugestoes.length > 0 && (
              <div className="px-5 pb-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-sm font-bold text-gray-800">{t('suggestedCombo', locale)}</span>
                  <span className="text-xs bg-gradient-to-r from-pink-100 to-rose-100 text-[#FF6B9D] px-2 py-0.5 rounded-full font-semibold">
                    {t('perfectMatch', locale)}
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {sugestoes.map((sug) => {
                    const sugNome = sug.nome[locale] || sug.nome.es;
                    const sugPreco = 'preco' in sug ? sug.preco : sug.precoBase;
                    return (
                      <button
                        key={sug.id}
                        onClick={() => {
                          onClose();
                          // O CardapioPage vai reabrir com o novo produto
                          setTimeout(() => {
                            const event = new CustomEvent('openProductDetail', { detail: sug });
                            window.dispatchEvent(event);
                          }, 300);
                        }}
                        className="flex-shrink-0 w-32 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:border-[#FF6B9D]/30 transition-colors text-left"
                      >
                        <div className="aspect-square relative">
                          <OptimizedImage
                            src={sug.imagem}
                            alt={sugNome}
                            className="w-full h-full"
                            fallbackEmoji={categoriaEmoji}
                          />
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-semibold text-gray-700 line-clamp-1">{sugNome}</p>
                          <p className="text-[#FF6B9D] font-bold text-xs mt-0.5">€{sugPreco.toFixed(2)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Espaço para o footer não cobrir conteúdo */}
            <div className="h-24" />
          </div>

          {/* Footer CTA sticky */}
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              className="w-full py-4 bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center gap-2"
            >
              <span>{t('addToCart', locale)}</span>
              <span className="opacity-80">—</span>
              <span>€{calcularTotal.toFixed(2)}</span>
              <ChevronRight size={18} className="opacity-80" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
