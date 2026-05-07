import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { corTier, nomeTier, TIER_DISCOUNT } from '@tpv/shared';
import { Star, Trophy, Users, TrendingUp, Award } from 'lucide-react';

export default function LoyaltyPage() {
  const { locale, clientes } = useStore();

  // Mock de loyalty profiles baseado nos clientes mock
  // Em produção, viria do Supabase
  const loyaltyData = useMemo(() => {
    return clientes.map((c) => {
      const pontosLifetime = Math.floor(c.totalGasto * 10);
      const tier: import('@tpv/shared/types').CustomerTier = pontosLifetime >= 1500 ? 'gold' : pontosLifetime >= 500 ? 'silver' : 'bronze';
      return {
        ...c,
        pontosLifetime,
        pontosDisponiveis: Math.floor(pontosLifetime * 0.7), // 70% ainda disponíveis
        tier,
      };
    }).sort((a, b) => b.pontosLifetime - a.pontosLifetime);
  }, [clientes]);

  const stats = useMemo(() => {
    const totalPontos = loyaltyData.reduce((sum, c) => sum + c.pontosDisponiveis, 0);
    const totalLifetime = loyaltyData.reduce((sum, c) => sum + c.pontosLifetime, 0);
    const porTier = {
      bronze: loyaltyData.filter((c) => c.tier === 'bronze').length,
      silver: loyaltyData.filter((c) => c.tier === 'silver').length,
      gold: loyaltyData.filter((c) => c.tier === 'gold').length,
    };
    const liability = totalPontos / 100; // 100 pts = €1
    return { totalPontos, totalLifetime, porTier, liability };
  }, [loyaltyData]);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
        <Star className="text-[#FFD700]" size={32} />
        Loyalty Program
      </h1>
      <p className="text-gray-500 mb-6">
        {locale === 'pt' ? 'Gestão de pontos e tiers dos clientes' : 'Gestión de puntos y tiers de clientes'}
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={locale === 'pt' ? 'Pontos em circulação' : 'Puntos en circulación'}
          value={stats.totalPontos.toLocaleString()}
          icon={<Star size={20} className="text-amber-500" />}
          color="#F59E0B"
        />
        <StatCard
          label={locale === 'pt' ? 'Lifetime total' : 'Lifetime total'}
          value={stats.totalLifetime.toLocaleString()}
          icon={<TrendingUp size={20} className="text-emerald-500" />}
          color="#10B981"
        />
        <StatCard
          label={locale === 'pt' ? 'Clientes ativos' : 'Clientes activos'}
          value={String(loyaltyData.length)}
          icon={<Users size={20} className="text-blue-500" />}
          color="#3B82F6"
        />
        <StatCard
          label={locale === 'pt' ? 'Liability (€)' : 'Liability (€)'}
          value={`EUR${stats.liability.toFixed(2)}`}
          icon={<Award size={20} className="text-red-500" />}
          color="#EF4444"
        />
      </div>

      {/* Tiers Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {(['bronze', 'silver', 'gold'] as const).map((tier) => (
          <motion.div
            key={tier}
            whileHover={{ y: -2 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${corTier(tier)}20`, color: corTier(tier) }}
              >
                <Trophy size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{nomeTier(tier, locale)}</h3>
                <p className="text-gray-500 text-xs">
                  {locale === 'pt' ? `${Math.round(TIER_DISCOUNT[tier] * 100)}% desconto` : `${Math.round(TIER_DISCOUNT[tier] * 100)}% descuento`}
                </p>
              </div>
            </div>
            <p className="font-mono text-3xl font-bold text-gray-800">{stats.porTier[tier]}</p>
            <p className="text-gray-400 text-sm">{locale === 'pt' ? 'clientes' : 'clientes'}</p>
          </motion.div>
        ))}
      </div>

      {/* Top Clients */}
      <h2 className="font-display text-xl font-bold text-gray-800 mb-4">
        {locale === 'pt' ? 'Top Clientes' : 'Top Clientes'}
      </h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">#</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">{locale === 'pt' ? 'Nome' : 'Nombre'}</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase">Tier</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">{locale === 'pt' ? 'Pontos Lifetime' : 'Puntos Lifetime'}</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-400 uppercase">{locale === 'pt' ? 'Disponíveis' : 'Disponibles'}</th>
            </tr>
          </thead>
          <tbody>
            {loyaltyData.slice(0, 10).map((cliente, idx) => (
              <tr key={cliente.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 text-gray-400 font-mono">{idx + 1}</td>
                <td className="px-5 py-4 font-medium text-gray-800">{cliente.nome}</td>
                <td className="px-5 py-4">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: `${corTier(cliente.tier)}15`,
                      color: corTier(cliente.tier),
                    }}
                  >
                    {nomeTier(cliente.tier, locale)}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-mono font-bold text-gray-700">
                  {cliente.pontosLifetime.toLocaleString()}
                </td>
                <td className="px-5 py-4 text-right font-mono text-[#FF6B9D] font-bold">
                  {cliente.pontosDisponiveis.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) {
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
