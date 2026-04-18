import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStore } from '../../../shared/stores/useStore';

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

export default function AnalyticsPage() {
  const { pedidos, vendasHistorico } = useStore();
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'today'>('7d');

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const rangeDays = timeFilter === 'today' ? 1 : timeFilter === '7d' ? 7 : 30;

    return pedidos.filter((pedido) => {
      const createdAt = new Date(pedido.timestampCriacao).getTime();
      if (timeFilter === 'today') {
        return createdAt >= dayStart;
      }
      return createdAt >= dayStart - (rangeDays - 1) * 86400000;
    });
  }, [pedidos, timeFilter]);

  const totalVentas = filteredOrders.reduce((sum, pedido) => sum + pedido.total, 0);
  const ticketMedio = filteredOrders.length ? totalVentas / filteredOrders.length : 0;
  const paymentMethods = [
    { nome: 'Tarjeta', valor: filteredOrders.filter((pedido) => pedido.metodoPago === 'tarjeta').length, cor: '#2196F3' },
    { nome: 'Efectivo', valor: filteredOrders.filter((pedido) => pedido.metodoPago === 'efectivo').length, cor: '#4CAF50' },
    { nome: 'Bizum', valor: filteredOrders.filter((pedido) => pedido.metodoPago === 'bizum').length, cor: '#FF6B9D' },
  ].filter((entry) => entry.valor > 0);

  const topSabores = Object.values(filteredOrders.reduce<Record<string, { nome: string; valor: number; cor: string }>>((acc, pedido) => {
    pedido.itens.forEach((item) => {
      item.sabores.forEach((sabor) => {
        if (!acc[sabor.id]) {
          acc[sabor.id] = { nome: sabor.nome.es, valor: 0, cor: sabor.corHex };
        }
        acc[sabor.id].valor += 1;
      });
    });
    return acc;
  }, {}))
    .sort((left, right) => right.valor - left.valor)
    .slice(0, 5);

  const salesSeries = vendasHistorico.slice(-7);
  const hourlySeries = filteredOrders.reduce<Record<string, number>>((acc, pedido) => {
    const hour = new Date(pedido.timestampCriacao).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});
  const hourlyData = Object.entries(hourlySeries).map(([hora, count]) => ({ hora, pedidos: count }));

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
        <StatCard title="Ventas" value={`EUR ${totalVentas.toFixed(2)}`} caption="Sesion real" icon="V" />
        <StatCard title="Ticket medio" value={`EUR ${ticketMedio.toFixed(2)}`} caption="Datos vivos" icon="T" />
        <StatCard title="Pedidos" value={`${filteredOrders.length}`} caption="Fuente unica" icon="P" />
        <StatCard title="Listos" value={`${filteredOrders.filter((pedido) => pedido.status === 'listo').length}`} caption="Operacion" icon="K" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-display font-bold text-gray-800 mb-4">Ventas ultimos 7 dias</h3>
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
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-display font-bold text-gray-800 mb-4">Top sabores</h3>
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
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-display font-bold text-gray-800 mb-4">Metodos de pago</h3>
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
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-display font-bold text-gray-800 mb-4">Horas de actividad</h3>
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
        </motion.div>
      </div>
    </div>
  );
}
