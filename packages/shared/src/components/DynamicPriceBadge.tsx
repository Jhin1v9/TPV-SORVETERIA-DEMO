/**
 * ═══ FASE 14 — Dynamic Price Badge ═══
 * Badge visual para preços dinâmicos (desconto/surge)
 */

import { motion } from 'framer-motion';

interface DynamicPriceBadgeProps {
  multiplier: number;
  label: string;
  cor: string;
  emoji: string;
  isDiscount: boolean;
  isSurge: boolean;
  precoOriginal: number;
  precoFinal?: number;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md';
}

export default function DynamicPriceBadge({
  multiplier,
  label,
  cor,
  emoji,
  isDiscount,
  isSurge,
  precoOriginal,
  precoFinal,
  theme = 'light',
  size = 'md',
}: DynamicPriceBadgeProps) {
  void precoFinal; // Usado para referência futura
  if (multiplier === 1.0 || (!isDiscount && !isSurge)) return null;

  const isDark = theme === 'dark';
  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-1';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 rounded-full font-bold ${sizeClasses} ${isDark ? 'bg-white/10' : 'bg-white'}`}
      style={{
        color: cor,
        border: `1px solid ${cor}40`,
        boxShadow: `0 0 8px ${cor}20`,
      }}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      {isDiscount && (
        <span className="line-through opacity-50 ml-1">
          €{precoOriginal.toFixed(2)}
        </span>
      )}
      {isSurge && (
        <span className="opacity-70 ml-1">
          {multiplier.toFixed(2)}x
        </span>
      )}
    </motion.div>
  );
}
