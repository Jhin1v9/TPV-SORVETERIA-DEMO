import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../shared/stores/useStore';
import { formatCurrency, formatTime, generateOrderNumber } from '../../../shared/utils/calculos';
import type { PedidoStatus } from '../../../shared/types';

const statusColors: Record<PedidoStatus, string> = {
  pendiente: '#2196F3',
  preparando: '#FFC107',
  listo: '#4CAF50',
  entregado: '#9E9E9E',
  cancelado: '#F44336',
};

const statusLabels: Record<PedidoStatus, string> = {
  pendiente: 'Pendiente',
  preparando: 'Preparando',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

const filters = [
  { key: 'all', label: 'Todos' },
  { key: 'today', label: 'Hoy' },
  { key: 'yesterday', label: 'Ayer' },
  { key: 'week', label: 'Esta semana' },
];

export default function PedidosPage() {
  const { pedidos } = useStore();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const filtered = pedidos.filter((p) => {
    if (activeFilter === 'today' && !p.timestampCriacao.startsWith(today)) return false;
    if (activeFilter === 'yesterday' && !p.timestampCriacao.startsWith(yesterday)) return false;
    if (activeFilter === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      if (p.timestampCriacao < weekAgo) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const num = generateOrderNumber(p.numeroSequencial).toLowerCase();
      if (!num.includes(q)) return false;
    }
    return true;
  });

  const handleExportCSV = () => {
    let csv = 'Fecha,Hora,Pedido,Total,Metodo,Estado,Items\n';
    filtered.forEach((p) => {
      const fecha = new Date(p.timestampCriacao).toLocaleDateString('es-ES');
      const hora = formatTime(p.timestampCriacao);
      const num = generateOrderNumber(p.numeroSequencial);
      const items = p.itens.map((i) => `${i.categoriaNome}(${i.sabores.map((s) => s.nome.es).join('+')})`).join('; ');
      csv += `${fecha},${hora},${num},${p.total.toFixed(2)},${p.metodoPago},${p.status},"${items}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_sabadell_${today}.csv`;
    link.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-800">Pedidos</h1>
        <button
          onClick={handleExportCSV}
          className="h-10 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm flex items-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === f.key ? 'bg-white text-[#FF6B9D] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por #pedido..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-sm focus:border-[#FF6B9D] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">#</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Hora</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Items</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Total</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Pago</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Estado</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((pedido) => (
                  <motion.tr
                    key={pedido.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setExpandedOrder(expandedOrder === pedido.id ? null : pedido.id)}
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-gray-800">
                        {generateOrderNumber(pedido.numeroSequencial)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {formatTime(pedido.timestampCriacao)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">
                      {pedido.itens.length} item{pedido.itens.length > 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-gray-800">
                      {formatCurrency(pedido.total)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-500 capitalize">{pedido.metodoPago}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: statusColors[pedido.status] + '20',
                          color: statusColors[pedido.status],
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: statusColors[pedido.status] }}
                        />
                        {statusLabels[pedido.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="text-gray-400 hover:text-[#FF6B9D] transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No hay pedidos para este filtro</p>
          </div>
        )}
      </div>

      {/* Expanded order detail */}
      <AnimatePresence>
        {expandedOrder && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={() => setExpandedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const pedido = pedidos.find((p) => p.id === expandedOrder);
                if (!pedido) return null;
                return (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-display text-2xl font-bold">
                          {generateOrderNumber(pedido.numeroSequencial)}
                        </h3>
                        <p className="text-gray-400 text-sm">{new Date(pedido.timestampCriacao).toLocaleString('es-ES')}</p>
                      </div>
                      <button onClick={() => setExpandedOrder(null)} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      {pedido.itens.map((item, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-xl p-4">
                          <p className="font-semibold">{item.quantidade}x {item.categoriaNome}</p>
                          <p className="text-sm text-gray-500">Sabores: {item.sabores.map((s) => s.nome.es).join(', ')}</p>
                          {item.toppings && item.toppings.length > 0 && (
                            <p className="text-sm text-gray-500">Extras: {item.toppings.map((t) => t.nome).join(', ')}</p>
                          )}
                          <p className="font-mono font-bold text-[#FF6B9D] mt-1">{formatCurrency(item.precoUnitario)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="font-mono">€{(pedido.total - pedido.iva).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">IVA (10%)</span>
                        <span className="font-mono">€{pedido.iva.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="font-mono text-[#FF6B9D]">{formatCurrency(pedido.total)}</span>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
