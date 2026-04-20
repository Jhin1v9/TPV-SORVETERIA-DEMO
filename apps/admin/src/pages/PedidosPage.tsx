import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { formatCurrency, formatTime, generateOrderNumber } from '@tpv/shared/utils/calculos';
import type { PedidoStatus } from '@tpv/shared/types';

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
] as const;

function getDayKey(date: Date) {
  return [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, '0'),
    `${date.getDate()}`.padStart(2, '0'),
  ].join('-');
}

export default function PedidosPage() {
  const { pedidos, locale } = useStore();
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]['key']>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const todayKey = getDayKey(new Date());
  const yesterdayKey = getDayKey(new Date(Date.now() - 86400000));
  const weekStart = new Date(Date.now() - 7 * 86400000);

  const filtered = useMemo(() => {
    return pedidos.filter((pedido) => {
      const createdAt = new Date(pedido.timestampCriacao);
      const createdDay = getDayKey(createdAt);

      if (activeFilter === 'today' && createdDay !== todayKey) {
        return false;
      }
      if (activeFilter === 'yesterday' && createdDay !== yesterdayKey) {
        return false;
      }
      if (activeFilter === 'week' && createdAt < weekStart) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!generateOrderNumber(pedido.numeroSequencial).toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [activeFilter, pedidos, searchQuery, todayKey, weekStart, yesterdayKey]);

  function handleExportCSV() {
    let csv = 'Fecha,Hora,Pedido,Total,Metodo,Estado,Items\n';
    filtered.forEach((pedido) => {
      const fecha = new Date(pedido.timestampCriacao).toLocaleDateString('es-ES');
      const hora = formatTime(pedido.timestampCriacao);
      const num = generateOrderNumber(pedido.numeroSequencial);
      const items = pedido.itens.map((item) => `${item.categoriaNome}(${item.sabores.map((sabor) => sabor.nome.es).join('+')})`).join('; ');
      csv += `${fecha},${hora},${num},${pedido.total.toFixed(2)},${pedido.metodoPago},${pedido.status},"${items}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_sabadell_${todayKey}.csv`;
    link.click();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-800">Pedidos</h1>
        <button onClick={handleExportCSV} className="h-10 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium text-sm flex items-center gap-2 transition-colors">
          Exportar CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === filter.key ? 'bg-white text-[#FF6B9D] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Buscar por #pedido..."
            className="w-full h-10 px-4 rounded-xl border border-gray-200 text-sm focus:border-[#FF6B9D] outline-none"
          />
        </div>
      </div>

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
                    onClick={() => setExpandedOrder((current) => current === pedido.id ? null : pedido.id)}
                  >
                    <td className="px-5 py-4 font-mono font-bold text-gray-800">{generateOrderNumber(pedido.numeroSequencial)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{formatTime(pedido.timestampCriacao)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{pedido.itens.length} item{pedido.itens.length > 1 ? 's' : ''}</td>
                    <td className="px-5 py-4 font-mono font-bold text-gray-800">{formatCurrency(pedido.total)}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 capitalize">{pedido.metodoPago}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${statusColors[pedido.status]}20`, color: statusColors[pedido.status] }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColors[pedido.status] }} />
                        {statusLabels[pedido.status]}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No hay pedidos para este filtro</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {expandedOrder && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setExpandedOrder(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={(event) => event.stopPropagation()}>
              {(() => {
                const pedido = pedidos.find((currentPedido) => currentPedido.id === expandedOrder);
                if (!pedido) {
                  return null;
                }

                return (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-display text-2xl font-bold">{generateOrderNumber(pedido.numeroSequencial)}</h3>
                        <p className="text-gray-400 text-sm">{new Date(pedido.timestampCriacao).toLocaleString('es-ES')}</p>
                      </div>
                      <button onClick={() => setExpandedOrder(null)} className="text-gray-400 hover:text-gray-600">
                        Cerrar
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      {pedido.itens.map((item) => (
                        <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                          <p className="font-semibold">{item.quantidade}x {item.categoriaNome}</p>
                          <p className="text-sm text-gray-500">Sabores: {item.sabores.map((sabor) => sabor.nome[locale] || sabor.nome.es).join(', ')}</p>
                          {item.toppings.length > 0 && <p className="text-sm text-gray-500">Extras: {item.toppings.map((topping) => topping.nome[locale] || topping.nome.es).join(', ')}</p>}
                          <p className="font-mono font-bold text-[#FF6B9D] mt-1">{formatCurrency(item.precoUnitario)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Subtotal</span>
                        <span className="font-mono">EUR {(pedido.subtotal ?? pedido.total - pedido.iva).toFixed(2)}</span>
                      </div>
                      {(pedido.extras ?? 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Extras</span>
                          <span className="font-mono">EUR {(pedido.extras ?? 0).toFixed(2)}</span>
                        </div>
                      )}
                      {(pedido.descuento ?? 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Descuento</span>
                          <span className="font-mono">-EUR {(pedido.descuento ?? 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">IVA (10%)</span>
                        <span className="font-mono">EUR {pedido.iva.toFixed(2)}</span>
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
