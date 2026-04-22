import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { updateRemoteProductAvailability } from '@tpv/shared/realtime/client';
import { categoriasLocal } from '@tpv/shared/data/produtosLocal';

import { Package, CheckCircle, XCircle, AlertTriangle, IceCream } from 'lucide-react';

export default function ProdutosPage() {
  const { locale, products, hydrateRemoteState } = useStore();
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas');

  // Usa apenas products do store (tipo Product[])
  const produtos = products;

  const disponiveis = produtos.filter((p) => p.emEstoque).length;
  const agotados = produtos.filter((p) => !p.emEstoque).length;

  const produtosFiltrados = produtos.filter((p) => {
    const matchSearch = (p.nome.es || '').toLowerCase().includes(search.toLowerCase()) ||
                        (p.nome.ca || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = categoriaFiltro === 'todas' || p.categoriaId === categoriaFiltro;
    return matchSearch && matchCat;
  });

  async function handleToggleEstoque(id: string, nextValue: boolean) {
    const response = await updateRemoteProductAvailability(id, nextValue);
    hydrateRemoteState(response.snapshot);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">Productos del Carta</h1>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-100 text-green-700 rounded-xl px-4 py-3 mb-4">
          Disponibilidad actualizada en todos los dispositivos.
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Productos totales" value={produtos.length} color="#2196F3" icon={<Package size={20} />} />
        <StatCard label="Disponibles" value={disponiveis} color="#4CAF50" icon={<CheckCircle size={20} />} />
        <StatCard label="Agotados" value={agotados} color={agotados > 0 ? '#F44336' : '#4CAF50'} icon={<XCircle size={20} />} />
        <StatCard label="Personalizables" value={produtos.filter((p) => p.isPersonalizavel).length} color="#FF6B9D" icon={<IceCream size={20} />} />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] h-10 px-4 rounded-xl border border-gray-200 text-sm focus:border-[#FF6B9D] outline-none"
        />
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="h-10 px-4 rounded-xl border border-gray-200 text-sm focus:border-[#FF6B9D] outline-none bg-white"
        >
          <option value="todas">Todas las categorías</option>
          {categoriasLocal.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nome.es}</option>
          ))}
        </select>
      </div>

      {/* Alerta de agotados */}
      {agotados > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="font-semibold text-red-700 flex items-center gap-2">
            <AlertTriangle size={16} />
            {agotados} producto{agotados > 1 ? 's' : ''} agotado{agotados > 1 ? 's' : ''}
          </p>
          <p className="text-red-500 text-sm">Los clientes no podrán añadir estos productos al carrito.</p>
        </div>
      )}

      {/* Lista de productos */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Producto</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Categoría</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Precio</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Tipo</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Estado</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody>
              {produtosFiltrados.map((produto) => (
                <ProductRow
                  key={produto.id}
                  produto={produto}
                  locale={locale}
                  onToggleEstoque={handleToggleEstoque}
                />
              ))}
            </tbody>
          </table>
        </div>
        {produtosFiltrados.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="font-mono text-3xl font-bold text-gray-800">{value}</p>
    </motion.div>
  );
}

function ProductRow({
  produto,
  locale,
  onToggleEstoque,
}: {
  produto: import('@tpv/shared/types').Product;
  locale: string;
  onToggleEstoque: (id: string, next: boolean) => void;
}) {
  const nome = produto.nome[locale as keyof typeof produto.nome] || produto.nome.es;
  const preco = produto.preco ?? produto.precoBase ?? 0;
  const catEmoji =
    {
      copas: '🍨', gofres: '🧇', souffle: '🍫', 'banana-split': '🍌',
      acai: '🫐', helados: '🍦', conos: '🍦', granizados: '🥤',
      batidos: '🥛', orxata: '🥛', cafes: '☕', 'tarrinas-nata': '🥣', 'para-llevar': '📦',
    }[produto.categoriaId] || '🍨';

  return (
    <tr className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${!produto.emEstoque ? 'opacity-60' : ''}`}>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">
            {catEmoji}
          </div>
          <div>
            <p className={`font-medium text-sm ${produto.emEstoque ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{nome}</p>
            <p className="text-xs text-gray-400">{produto.alergenos.length} alérgeno{produto.alergenos.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-sm text-gray-500 capitalize">{produto.categoriaId}</td>
      <td className="px-5 py-4 font-mono font-bold text-gray-700">€{preco.toFixed(2)}</td>
      <td className="px-5 py-4">
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${produto.isPersonalizavel ? 'bg-[#FF6B9D]/10 text-[#FF6B9D]' : 'bg-gray-100 text-gray-500'}`}>
          {produto.isPersonalizavel ? 'Personalizable' : 'Fijo'}
        </span>
      </td>
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${produto.emEstoque ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${produto.emEstoque ? 'bg-green-500' : 'bg-red-500'}`} />
          {produto.emEstoque ? 'Disponible' : 'Agotado'}
        </span>
      </td>
      <td className="px-5 py-4">
        <button
          onClick={() => onToggleEstoque(produto.id, !produto.emEstoque)}
          className={`relative w-12 h-7 rounded-full transition-all ${produto.emEstoque ? 'bg-[#4ECDC4]' : 'bg-gray-300'}`}
        >
          <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${produto.emEstoque ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </td>
    </tr>
  );
}
