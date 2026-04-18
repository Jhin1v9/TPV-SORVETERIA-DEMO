import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useStore } from '../../../shared/stores/useStore';
import { diasVenda, topSabores, metodosPagamento, heatmapHoras } from '../../../shared/data/mockData';

// COLORS palette for charts
// const COLORS = ['#FF6B9D', '#4ECDC4', '#FFA07A', '#FFD700', '#4CAF50', '#2196F3', '#F44336'];

function StatCard({ title, value, change, changeType, icon }: { title: string; value: string; change: string; changeType: 'up' | 'down' | 'neutral'; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
          changeType === 'up' ? 'bg-green-100 text-green-600' :
          changeType === 'down' ? 'bg-red-100 text-red-600' :
          'bg-gray-100 text-gray-500'
        }`}>
          {change}
        </span>
      </div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="font-mono text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const { pedidos } = useStore();
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'today'>('7d');

  const totalHoy = pedidos.reduce((sum, p) => sum + p.total, 0);
  const ticketMedio = pedidos.length > 0 ? totalHoy / pedidos.length : 0;
  const pedidosHoy = pedidos.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-800">Analytics</h1>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(['today', '7d', '30d'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeFilter === f ? 'bg-white text-[#FF6B9D] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {f === 'today' ? 'Hoy' : f === '7d' ? '7 días' : '30 días'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Ventas hoy" value={`€${totalHoy.toFixed(2)}`} change="+12%" changeType="up" icon="💰" />
        <StatCard title="Ticket medio" value={`€${ticketMedio.toFixed(2)}`} change="+5%" changeType="up" icon="🎫" />
        <StatCard title="Pedidos" value={`${pedidosHoy}`} change="-3%" changeType="down" icon="📦" />
        <StatCard title="Upsell rate" value="35%" change="+8%" changeType="up" icon="📈" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Line chart - Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <h3 className="font-display font-bold text-gray-800 mb-4">Ventas últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={diasVenda}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B9D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6B9D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="data"
                tickFormatter={(v) => new Date(v).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                tick={{ fontSize: 12, fill: '#999' }}
              />
              <YAxis tick={{ fontSize: 12, fill: '#999' }} tickFormatter={(v) => `€${v}`} />
              <Tooltip
                formatter={(value: number) => [`€${value.toFixed(2)}`, 'Ventas']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('es', { weekday: 'long', day: 'numeric' })}
              />
              <Area type="monotone" dataKey="total" stroke="#FF6B9D" strokeWidth={3} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar chart - Top flavors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <h3 className="font-display font-bold text-gray-800 mb-4">Top 5 Sabores</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topSabores} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#999' }} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="nome" type="category" tick={{ fontSize: 12, fill: '#666' }} width={100} />
              <Tooltip formatter={(value: number) => [`${value}%`, 'Popularidad']} />
              <Bar dataKey="percentual" radius={[0, 8, 8, 0]} barSize={24}>
                {topSabores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart - Payment methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <h3 className="font-display font-bold text-gray-800 mb-4">Métodos de pago</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={metodosPagamento}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="valor"
              >
                {metodosPagamento.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {metodosPagamento.map((m) => (
              <div key={m.nome} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: m.cor }} />
                <span className="text-xs text-gray-500">{m.nome} {m.valor}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Heatmap - Peak hours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <h3 className="font-display font-bold text-gray-800 mb-4">Horas pico</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={heatmapHoras}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hora" tick={{ fontSize: 12, fill: '#999' }} />
              <YAxis tick={{ fontSize: 12, fill: '#999' }} />
              <Tooltip formatter={(value: number) => [`${value} pedidos`, '']} />
              <Bar dataKey="pedidos" radius={[8, 8, 0, 0]} barSize={32}>
                {heatmapHoras.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pedidos > 40 ? '#F44336' : entry.pedidos > 20 ? '#FF6B9D' : entry.pedidos > 10 ? '#FFA07A' : '#4ECDC4'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
