import { motion } from 'framer-motion';
import { useStore } from '@tpv/shared/stores/useStore';
import { corTier, nomeTier } from '@tpv/shared';
import { Star } from 'lucide-react';

export default function LoyaltyBadge() {
  const { loyalty, locale } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{
        backgroundColor: `${corTier(loyalty.tier)}20`,
        color: corTier(loyalty.tier),
        border: `1px solid ${corTier(loyalty.tier)}40`,
      }}
    >
      <Star size={12} fill={corTier(loyalty.tier)} />
      <span>{loyalty.pontosDisponiveis}</span>
      <span className="opacity-70">{nomeTier(loyalty.tier, locale)}</span>
    </motion.div>
  );
}
