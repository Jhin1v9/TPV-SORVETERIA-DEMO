import { supabase } from '@tpv/shared/supabase/client';
import type { Locale, PerfilUsuario } from '@tpv/shared/types';

const CLIENT_PUSH_SW_URL = '/sw-cliente.js';

type PushSyncResult =
  | { status: 'unsupported'; reason: string }
  | { status: 'skipped'; reason: string }
  | { status: 'blocked'; reason: string }
  | { status: 'synced'; endpoint: string };

function getPushPublicKey() {
  return (import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY ?? '').trim();
}

function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const normalized = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(normalized);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export async function registerClienteServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  const existing = await navigator.serviceWorker.getRegistration('/');
  if (existing) {
    return existing;
  }

  return navigator.serviceWorker.register(CLIENT_PUSH_SW_URL, { scope: '/' });
}

export async function syncPushSubscriptionForPerfil(
  perfil: PerfilUsuario | null,
  options: { locale?: Locale; requestPermission?: boolean } = {},
): Promise<PushSyncResult> {
  if (!perfil?.id || !perfil.telefone) {
    return { status: 'skipped', reason: 'missing-profile' };
  }

  if (!supabase) {
    return { status: 'skipped', reason: 'missing-supabase' };
  }

  if (!isPushSupported()) {
    return { status: 'unsupported', reason: 'push-not-supported' };
  }

  const publicKey = getPushPublicKey();
  if (!publicKey) {
    return { status: 'skipped', reason: 'missing-public-key' };
  }

  await registerClienteServiceWorker();
  const registration = await navigator.serviceWorker.ready;

  let permission = Notification.permission;
  if (permission === 'default' && options.requestPermission) {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') {
    return {
      status: permission === 'denied' ? 'blocked' : 'skipped',
      reason: `permission-${permission}`,
    };
  }

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const payload = subscription.toJSON();
  if (!payload.endpoint || !payload.keys?.p256dh || !payload.keys?.auth) {
    return { status: 'skipped', reason: 'invalid-subscription' };
  }

  const { error } = await supabase.functions.invoke('register-push-subscription', {
    body: {
      customerId: perfil.id,
      telefone: perfil.telefone,
      locale: options.locale,
      userAgent: navigator.userAgent,
      subscription: payload,
    },
  });

  if (error) {
    throw error;
  }

  return { status: 'synced', endpoint: payload.endpoint };
}
