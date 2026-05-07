/**
 * ═══ FASE 16 — Push Notifications Ativas ═══
 * Hook para notificar o cliente sobre mudanças de status do pedido
 */

import { useEffect, useRef } from 'react';
import type { Pedido, PedidoStatus } from '../types';

interface OrderNotificationConfig {
  enabled?: boolean;
  soundEnabled?: boolean;
  vibrateEnabled?: boolean;
}

const statusMessages: Record<PedidoStatus, { title: string; body: string; icon: string }> = {
  pendiente: {
    title: 'Pedido recibido',
    body: 'Tu pedido ha sido recibido y está en cola',
    icon: '📋',
  },
  preparando: {
    title: 'Preparando tu pedido',
    body: 'Los cocineros están trabajando en tu pedido',
    icon: '👨‍🍳',
  },
  listo: {
    title: '¡Pedido listo!',
    body: 'Tu pedido está listo para recoger',
    icon: '✅',
  },
  entregado: {
    title: 'Pedido entregado',
    body: 'Esperamos que disfrutes tu pedido',
    icon: '😋',
  },
  cancelado: {
    title: 'Pedido cancelado',
    body: 'Tu pedido ha sido cancelado',
    icon: '❌',
  },
};

function playNotificationSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 600;
    gain.gain.value = 0.2;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    setTimeout(() => osc.stop(), 300);
  } catch {
    // Audio não suportado
  }
}

function vibrateDevice(pattern: number[] = [100, 50, 100]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

export function useOrderNotifications(
  pedidos: Pedido[],
  meusPedidoIds: string[],
  config: OrderNotificationConfig = {},
) {
  const { enabled = true, soundEnabled = true, vibrateEnabled = true } = config;
  const prevStatuses = useRef<Record<string, PedidoStatus>>({});

  useEffect(() => {
    if (!enabled) return;

    const meusPedidos = pedidos.filter((p) => meusPedidoIds.includes(p.id));

    for (const pedido of meusPedidos) {
      const prevStatus = prevStatuses.current[pedido.id];
      const currentStatus = pedido.status;

      // Só notifica se o status mudou
      if (prevStatus && prevStatus !== currentStatus) {
        const message = statusMessages[currentStatus];

        // Notificação via Service Worker (se disponível)
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready
            .then((registration) => {
              registration.showNotification(message.title, {
                body: `${message.icon} ${message.body}`,
                icon: '/assets/logo/ChatGPT%20Image%2025%20abr%202026,%2008_46_42.png',
                badge: '/assets/logo/ChatGPT%20Image%2025%20abr%202026,%2008_46_42.png',
                tag: `pedido-${pedido.id}-${currentStatus}`,
                requireInteraction: currentStatus === 'listo',
                data: {
                  pedidoId: pedido.id,
                  status: currentStatus,
                  url: '/pedidos',
                },
              });
            })
            .catch(() => {
              // Fallback: notificação simples do browser
              if (Notification.permission === 'granted') {
                new Notification(message.title, {
                  body: `${message.icon} ${message.body}`,
                  icon: '/assets/logo/ChatGPT%20Image%2025%20abr%202026,%2008_46_42.png',
                });
              }
            });
        }

        // Som
        if (soundEnabled) {
          playNotificationSound();
        }

        // Vibração
        if (vibrateEnabled) {
          vibrateDevice(currentStatus === 'listo' ? [200, 100, 200, 100, 400] : [100, 50, 100]);
        }
      }

      // Atualiza o status de referência
      prevStatuses.current[pedido.id] = currentStatus;
    }

    // Limpa pedidos que não existem mais
    const currentIds = new Set(meusPedidoIds);
    for (const id of Object.keys(prevStatuses.current)) {
      if (!currentIds.has(id)) {
        delete prevStatuses.current[id];
      }
    }
  }, [pedidos, meusPedidoIds, enabled, soundEnabled, vibrateEnabled]);
}

/**
 * Envia notificação de promoção ativa
 */
export async function sendPromoNotification(titulo: string, mensagem: string, desconto?: string) {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(titulo, {
      body: `${desconto ? `🔥 ${desconto} — ` : ''}${mensagem}`,
      icon: '/assets/logo/ChatGPT%20Image%2025%20abr%202026,%2008_46_42.png',
      badge: '/assets/logo/ChatGPT%20Image%2025%20abr%202026,%2008_46_42.png',
      tag: 'promo-' + Date.now(),
      requireInteraction: false,
      data: {
        type: 'promo',
        url: '/',
      },
    } as NotificationOptions);
  } catch {
    // Silencioso
  }
}
