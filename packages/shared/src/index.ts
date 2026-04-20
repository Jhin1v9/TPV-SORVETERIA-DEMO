// Types
export * from './types/index.ts';

// Stores
export { useStore } from './stores/useStore.ts';

// Data
export * from './data/produtosLocal.ts';
export * from './data/mockData.ts';

// i18n
export { t, defaultLocale, supportedLocales } from './i18n/index.ts';

// Utils
export * from './utils/calculos.ts';
export * from './utils/pricing.ts';
export * from './utils/broadcast.ts';

// Components
export { default as LoadingApp } from './components/LoadingApp.tsx';
export { default as OptimizedImage } from './components/OptimizedImage.tsx';
export { default as SkeletonCard } from './components/SkeletonCard.tsx';

// Hooks
export { useIsMobile } from './hooks/use-mobile.ts';

// Lib
export { cn } from './lib/utils.ts';

// Realtime
export * from './realtime/client.ts';
export * from './realtime/bootstrap.ts';
export * from './realtime/useRealtimeSync.ts';

// Supabase
export * from './supabase/client.ts';
export * from './supabase/mappers.ts';
