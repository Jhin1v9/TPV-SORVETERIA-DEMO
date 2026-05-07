// Types
export * from './types/index.ts';

// Stores
export { useStore } from './stores/useStore.ts';

// Data
export * from './data/produtosLocal.ts';
export * from './data/mockData.ts';
export * from './data/revenueEngineData.ts';

// i18n
export { t, defaultLocale, supportedLocales } from './i18n/index.ts';
export { tAlergeno, nomeAlergeno, nomeNivel, alergenoNomes, alergenoMensagens } from './i18n/alergenos.ts';

// Utils
export * from './utils/calculos.ts';
export * from './utils/pricing.ts';
export * from './utils/broadcast.ts';
export * from './utils/revenueEngine.ts';
export * from './utils/loyalty.ts';
export * from './utils/autoOps.ts';
export * from './utils/etaEngine.ts';

// Components
export { default as LoadingApp } from './components/LoadingApp.tsx';
export { default as OptimizedImage } from './components/OptimizedImage.tsx';
export { default as SkeletonCard } from './components/SkeletonCard.tsx';
export { default as AlergenoBadge } from './components/AlergenoBadge.tsx';
export { default as AlergenoWarning } from './components/AlergenoWarning.tsx';
export { default as AlergenoSelector } from './components/AlergenoSelector.tsx';

// Hooks
export { useIsMobile } from './hooks/use-mobile.ts';

// Lib
export { cn } from './lib/utils.ts';

// Realtime
export * from './realtime/client.ts';
export * from './realtime/bootstrap.ts';
export { useRealtimeSync } from './hooks/useRealtimeSync.ts';

// Supabase
export * from './supabase/client.ts';
export * from './supabase/mappers.ts';

// Fase 9 — Offline Resilience
export * from './offline/index.ts';

// Fase 10 — Ingredient-level Inventory
export * from './inventory/index.ts';

// Fase 11 — Group Ordering
export * from './group/index.ts';

// Fase 12 — AI-Driven Ops
export * from './ai/index.ts';

// Fase 13 — AI Upselling Integration
export { default as AIRecommendations } from './components/AIRecommendations.tsx';

// Fase 14 — Dynamic Pricing
export { useDynamicPrice } from './hooks/useDynamicPrice.ts';
export { default as DynamicPriceBadge } from './components/DynamicPriceBadge.tsx';

// Fase 15 — One-Tap Reorder + Favoritos
export { default as OneTapReorder } from './components/OneTapReorder.tsx';
export { default as FavoritosSection } from './components/FavoritosSection.tsx';

// Fase 16 — Push Notifications
export { useOrderNotifications, sendPromoNotification } from './hooks/useOrderNotifications.ts';
export { default as NotificationPermission } from './components/NotificationPermission.tsx';

// Fase 17 — Order ETA
export { default as OrderETA } from './components/OrderETA.tsx';
