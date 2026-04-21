import { motion } from 'framer-motion';

interface SkeletonCardProps {
  count?: number;
  className?: string;
}

/**
 * Skeleton card para loading de produtos no Cliente PWA.
 * Replica o layout exato do card de produto com shimmer animado.
 */
export default function SkeletonCard({ count = 4, className = '' }: SkeletonCardProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
        >
          {/* Imagem placeholder */}
          <div className="aspect-square relative overflow-hidden bg-gray-100">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]" />
          </div>

          {/* Info placeholder */}
          <div className="p-3 space-y-2">
            <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse" />
            <div className="flex items-center justify-between">
              <div className="h-3.5 bg-gray-200 rounded-md w-1/3 animate-pulse" />
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Skeleton para lista horizontal (categorias, etc.)
 */
export function SkeletonRow({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex-shrink-0 w-20 h-20 rounded-xl bg-gray-200 animate-pulse"
        />
      ))}
    </div>
  );
}

/**
 * Skeleton para texto (títulos, parágrafos)
 */
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gray-200 rounded-md animate-pulse"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}
