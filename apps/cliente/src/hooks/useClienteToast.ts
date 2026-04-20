import { toast } from 'sonner';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';

/**
 * Hook de toast para o Cliente PWA.
 * Todas as mensagens são localizadas automaticamente.
 */
export function useClienteToast() {
  const { locale } = useStore();

  return {
    addedToCart: (productName: string) =>
      toast.success(t('success', locale), {
        description: `${productName} — ${t('addToCart', locale)}`,
        duration: 2000,
      }),

    removedFromCart: () =>
      toast.info(t('cart', locale), {
        description: t('remove', locale),
        duration: 1500,
      }),

    orderPlaced: (orderNumber?: string) =>
      toast.success(t('orderReceived', locale), {
        description: orderNumber
          ? `${t('orderNumber', locale)}: ${orderNumber}`
          : t('trackOrder', locale),
        duration: 4000,
      }),

    promoApplied: () =>
      toast.success(t('success', locale), {
        description: 'SABADELL20 -20%',
        duration: 2000,
      }),

    promoInvalid: () =>
      toast.error(t('error', locale), {
        description: t('invalidCredentials', locale),
        duration: 2000,
      }),

    connectionError: () =>
      toast.error(t('error', locale), {
        description: t('connectionOffline', locale),
        duration: 3000,
      }),
  };
}
