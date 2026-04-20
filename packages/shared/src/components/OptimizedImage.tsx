import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: 'blur' | 'gradient' | 'skeleton';
  fallbackEmoji?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente de imagem otimizada com:
 * - WebP via <picture> com fallback JPEG
 * - Lazy loading nativo
 * - Skeleton/gradient placeholder durante carregamento
 * - Fallback com emoji + gradiente se imagem falhar
 */
export default function OptimizedImage({
  src,
  alt,
  className = '',
  placeholder = 'skeleton',
  fallbackEmoji = '🍨',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setError(true);
    setLoaded(true);
    onError?.();
  }, [onError]);

  // Gradiente determinístico baseado no alt text
  const gradientHue = alt.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) % 360;
  const gradientStyle = {
    background: `linear-gradient(135deg, hsl(${gradientHue}, 70%, 85%), hsl(${(gradientHue + 40) % 360}, 60%, 75%))`,
  };

  // Gera URLs WebP e JPEG
  const hasExtension = /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(src);
  const baseSrc = hasExtension ? src.replace(/\.(jpg|jpeg|png|webp)(\?.*)?$/i, '') : src;
  const webpSrc = hasExtension ? `${baseSrc}.webp` : src;
  const jpegSrc = hasExtension ? `${baseSrc}.jpg` : src;

  if (error) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={gradientStyle}
      >
        <div className="text-center">
          <span className="text-4xl block mb-1">{fallbackEmoji}</span>
          <span className="text-xs font-medium text-gray-600/70 px-2">{alt}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`absolute inset-0 z-10 ${
              placeholder === 'skeleton'
                ? 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]'
                : ''
            }`}
            style={placeholder === 'gradient' ? gradientStyle : undefined}
          >
            {placeholder === 'skeleton' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Imagem otimizada */}
      <picture className="w-full h-full">
        {hasExtension && <source srcSet={webpSrc} type="image/webp" />}
        <img
          src={hasExtension ? jpegSrc : src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </picture>
    </div>
  );
}
