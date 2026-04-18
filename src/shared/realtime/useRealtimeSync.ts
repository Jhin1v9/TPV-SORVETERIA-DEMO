import { useEffect } from 'react';
import { useEffectEvent } from 'react';
import { ensureRemoteSnapshot, getRuntimeMode, openRealtimeStream } from './client';
import { useStore } from '../stores/useStore';
import type { DemoStateSnapshot } from '../types';

export function useRealtimeSync() {
  const applySnapshot = useEffectEvent((snapshot: DemoStateSnapshot) => {
    useStore.getState().hydrateRemoteState(snapshot);
    useStore.getState().setConnectionStatus(getRuntimeMode() === 'standalone' ? 'standalone' : 'connected');
  });

  useEffect(() => {
    let disposed = false;
    let reconnectTimer = 0;
    let stream: { close: () => void } | null = null;

    async function connect() {
      try {
        useStore.getState().setConnectionStatus('connecting');
        const snapshot = await ensureRemoteSnapshot();
        if (disposed) {
          return;
        }

        applySnapshot(snapshot);

        stream = openRealtimeStream(async (nextSnapshot) => {
          if (disposed) {
            return;
          }
          applySnapshot(nextSnapshot);
        });

        if (!stream) {
          useStore.getState().setConnectionStatus('standalone');
          return;
        }
      } catch {
        if (disposed) {
          return;
        }
        if (getRuntimeMode() === 'standalone') {
          useStore.getState().setConnectionStatus('standalone');
        } else {
          useStore.getState().setConnectionStatus('offline');
          reconnectTimer = window.setTimeout(connect, 1500);
        }
      }
    }

    connect();

    return () => {
      disposed = true;
      window.clearTimeout(reconnectTimer);
      if (stream) {
        stream.close();
      }
    };
  }, [applySnapshot]);
}
