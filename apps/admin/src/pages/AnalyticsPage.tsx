import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStore } from '@tpv/shared/stores/useStore';

function StatCard({ title, value, caption, icon }: { title: string; value: string; caption: string; icon: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500">{caption}</span>
      </div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="font-mono text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </motion.div>
  );
}

function getDayKey(date: Date) {
  return [
    date.getFullYear(),
    `${date.getMonth() + 1}`.padStart(2, '0'),
    `${date.getDate()}`.padStart(2, '0'),
  ].join('-');
}

export default function AnalyticsPage() {
  const { pedidos } = useStore();
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'today'>('7d');

  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const rangeDays = timeFilter === 'today' ? 1 : timeFilter === '7d' ? 7 : 30;
  const rangeStart = dayStart - (rangeDays - 1) * 86400000;

  const filteredOrders = useMemo(() => {
    return pedidos.filter((pedido) => {
      const createdAt = new Date(pedido.timestampCriacao).getTime();
      if (timeFilter === 'today') {
        return createdAt >= dayStart;
      }
      return createdAt >= rangeStart;
    });
  }, [pedidos, timeFilter, dayStart, rangeStart]);

  const totalVentas = filteredOrders.reduce((sum, pedido) => sum + pedido.total, 0);
  const ticketMedio = filteredOrders.length ? totalVentas / filteredOrders.length : 0;

  const paymentMethods = [
    { nome: 'Tarjeta', valor: filteredOrders.filter((p) => p.metodoPago === 'tarjeta').length, cor: '#2196F3' },
    { nome: 'Efectivo', valor: filteredOrders.filter((p) => p.metodoPago === 'efectivo').length, cor: '#4CAF50' },
    { nome: 'Bizum', valor: filteredOrders.filter((p) => p.metodoPago === 'bizum').length, cor: '#FF6B9D' },
  ].filter((entry) => entry.valor > 0);

  // Top sabores a partir dos pedidos reais
  const topSabores = useMemo(() => {
    const contagem: Record<string, { nome: string; valor: number; cor: string }> = {};
    filteredOrders.forEach((pedido) => {
      pedido.itens.forEach((item) => {
        // Sabores em selections (produtos novos)
        if (item.selections?.sabores) {
          item.selections.sabores.forEach((sabor: { nome?: { es?: string }; id: string }) => {
            const nome = sabor.nome?.es || sabor.id;
            if (!contagem[sabor.id]) {
              contagem[sabor.id] = { nome, valor: 0, cor: '#FF6B9D' };
            }
            contagem[sabor.id].valor += item.quantidade;
          });
        }
        // Sabores legados
        item.sabores?.forEach((sabor) => {
          const nome = sabor.nome.es || sabor.id;
          if (!contagem[sabor.id]) {
            contagem[sabor.id] = { nome, valor: 0, cor: sabor.corHex || '#FF6B9D' };
          }
          contagem[sabor.id].valor += item.quantidade;
        });
      });
    });
    return Object.values(contagem)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [filteredOrders]);

  // Série de vendas por dia (calculada dos pedidos reais)
  const salesSeries = useMemo(() => {
    const porDia: Record<string, number> = {};
    const dias: string[] = [];

    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(dayStart - i * 86400000);
      const key = getDayKey(d);
      porDia[key] = 0;
      dias.push(key);
    }

    filteredOrders.forEach((pedido) => {
      const key = getDayKey(new Date(pedido.timestampCriacao));
      if (porDia[key] !== undefined) {
        porDia[key] += pedido.total;
      }
    });

    return dias.map((data) => ({ data, total: Number(porDia[data].toFixed(2)) }));
  }, [filteredOrders, rangeDays, dayStart]);

  // Horas de actividad
  const hourlyData = useMemo(() => {
    const series: Record<string, number> = {};
    filteredOrders.forEach((pedido) => {
      const hour = new Date(pedido.timestampCriacao).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      series[hour] = (series[hour] || 0) + 1;
    });
    return Object.entries(series)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hora, pedidos]) => ({ hora, pedidos }));
  }, [filteredOrders]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-800">Analytics</h1>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(['today', '7d', '30d'] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setTimeFilter(filterKey)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeFilter === filterKey ? 'bg-white text-[#FF6B9D] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {filterKey === 'today' ? 'Hoy' : filterKey === '7d' ? '7 dias' : '30 dias'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Ventas" value={`EUR ${totalVentas.toFixed(2)}`} caption="Pedidos reales" icon="💶" />
        <StatCard title="Ticket medio" value={`EUR ${ticketMedio.toFixed(2)}`} caption="Datos vivos" icon="📊" />
        <StatCard title="Pedidos" value={`${filteredOrders.length}`} caption="Fuente única" icon="📋" />
        <StatCard title="Listos" value={`${filteredOrders.filter((p) => p.status === 'listo').length}`} caption="Operación" icon="✅" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-display font-bold text-gray-800 mb-4">Ventas últimos {timeFilter === 'today' ? 'día' : timeFilter === '7d' ? '7 días' : '30 días'}</h3>
          {salesSeries.some((s) => s.total > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={salesSeries}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B9D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B9D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="data" tickFormatter={(value) => new Date(value).toLocaleDateString('es', { day: 'numeric', month: 'short' })} tick={{ fontSize: 12, fill: '#999' }} />
                <YAxis tick={{ fontSize: 12, fill: '#999' }} />
                <Tooltip formatter={(value: number) => [`EUR ${value.toFixed(2)}`, 'Ventas']} />
                <Area type="monotone" dataKey="total" stroke="#FF6B9D" strokeWidth={3} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
              No hay ventas en este período
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-display font-bold text-gray-800 mb-4">Top sabores</h3>
          {topSabores.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topSabores} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#999' }} />
                <YAxis dataKey="nome" type="category" tick={{ fontSize: 12, fill: '#666' }} width={110} />
                <Tooltip formatter={(value: number) => [`${value} selecciones`, '']} />
                <Bar dataKey="valor" radius={[0, 8, 8, 0]} barSize={24}>
                  {topSabores.map((entry) => (
                    <Cell key={entry.nome} fill={entry.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
              No hay datos de sabores en este período
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-display font-bold text-gray-800 mb-4">Métodos de pago</h3>
          {paymentMethods.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="valor">
                  {paymentMethods.map((entry) => (
                    <Cell key={entry.nome} fill={entry.cor} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} pedidos`, '']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
              No hay datos de métodos de pago
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-display font-bold text-gray-800 mb-4">Horas de actividad</h3>
          {hourlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hora" tick={{ fontSize: 12, fill: '#999' }} />
                <YAxis tick={{ fontSize: 12, fill: '#999' }} />
                <Tooltip formatter={(value: number) => [`${value} pedidos`, '']} />
                <Bar dataKey="pedidos" radius={[8, 8, 0, 0]} barSize={32}>
                  {hourlyData.map((entry) => (
                    <Cell key={entry.hora} fill={entry.pedidos > 4 ? '#F44336' : entry.pedidos > 2 ? '#FF6B9D' : '#4ECDC4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400 text-sm">
              No hay datos de horas
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
