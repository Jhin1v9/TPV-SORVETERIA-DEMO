import { useEffect } from 'react';
import { useEffectEvent } from 'react';
import { ensureRemoteSnapshot, getRuntimeMode, openRealtimeStream } from './client';
import { useStore } from '../stores/useStore';
import type { DemoStateSnapshot } from '../types';

const RESYNC_INTERVAL_MS = 4000;
const RECONNECT_DELAY_MS = 1500;

export function useRealtimeSync() {
  const applySnapshot = useEffectEvent((snapshot: DemoStateSnapshot) => {
    useStore.getState().hydrateRemoteState(snapshot);
    useStore.getState().setConnectionStatus(getRuntimeMode() === 'standalone' ? 'standalone' : 'connected');
  });

  useEffect(() => {
    let disposed = false;
    let reconnectTimer = 0;
    let resyncTimer = 0;
    let stream: { close: () => void } | null = null;

    async function syncSnapshot() {
      const snapshot = await ensureRemoteSnapshot();
      if (disposed) {
        return null;
      }
      applySnapshot(snapshot);
      return snapshot;
    }

    function scheduleReconnect() {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = window.setTimeout(connect, RECONNECT_DELAY_MS);
    }

    function startResyncLoop() {
      window.clearInterval(resyncTimer);
      if (getRuntimeMode() === 'standalone') {
        return;
      }

      resyncTimer = window.setInterval(() => {
        if (disposed || document.hidden) {
          return;
        }

        void syncSnapshot().catch(() => {
          if (!disposed && getRuntimeMode() !== 'standalone') {
            useStore.getState().setConnectionStatus('offline');
          }
        });
      }, RESYNC_INTERVAL_MS);
    }

    async function handleForegroundSync() {
      if (disposed || document.hidden) {
        return;
      }

      try {
        await syncSnapshot();
      } catch {
        if (!disposed && getRuntimeMode() !== 'standalone') {
          useStore.getState().setConnectionStatus('offline');
        }
      }
    }

    async function connect() {
      try {
        useStore.getState().setConnectionStatus('connecting');
        await syncSnapshot();

        stream?.close();
        stream = openRealtimeStream(
          async (nextSnapshot) => {
            if (disposed) {
              return;
            }
            applySnapshot(nextSnapshot);
          },
          (status) => {
            if (disposed) {
              return;
            }

            if (status === 'SUBSCRIBED') {
              void syncSnapshot().catch(() => {
                if (!disposed && getRuntimeMode() !== 'standalone') {
                  useStore.getState().setConnectionStatus('offline');
                }
              });
              return;
            }

            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              if (getRuntimeMode() !== 'standalone') {
                useStore.getState().setConnectionStatus('offline');
                scheduleReconnect();
              }
            }
          },
        );

        if (disposed) {
          return;
        }

        if (!stream || getRuntimeMode() === 'standalone') {
          useStore.getState().setConnectionStatus('standalone');
        } else {
          startResyncLoop();
        }
      } catch {
        if (disposed) {
          return;
        }
        if (getRuntimeMode() === 'standalone') {
          useStore.getState().setConnectionStatus('standalone');
        } else {
          useStore.getState().setConnectionStatus('offline');
          scheduleReconnect();
        }
      }
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void handleForegroundSync();
      }
    };

    const handleWindowFocus = () => {
      void handleForegroundSync();
    };

    const handleWindowOnline = () => {
      void handleForegroundSync();
    };

    connect();
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('online', handleWindowOnline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      disposed = true;
      window.clearTimeout(reconnectTimer);
      window.clearInterval(resyncTimer);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('online', handleWindowOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (stream) {
        stream.close();
      }
    };
  }, [applySnapshot]);
}
