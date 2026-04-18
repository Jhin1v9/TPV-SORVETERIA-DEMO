import { useEffect } from 'react';
import { useEffectEvent } from 'react';
import { ensureRemoteSnapshot, openRealtimeStream } from './client';
import { useStore } from '../stores/useStore';
import type { DemoStateSnapshot } from '../types';

export function useRealtimeSync() {
  const applySnapshot = useEffectEvent((snapshot: DemoStateSnapshot) => {
    useStore.getState().hydrateRemoteState(snapshot);
    useStore.getState().setConnectionStatus('connected');
  });

  const requireBootstrap = useEffectEvent(async () => {
    const snapshot = await ensureRemoteSnapshot();
    applySnapshot(snapshot);
  });

  useEffect(() => {
    let disposed = false;
    let reconnectTimer = 0;
    let stream: EventSource | null = null;

    async function connect() {
      try {
        useStore.getState().setConnectionStatus('connecting');
        const snapshot = await ensureRemoteSnapshot();
        if (disposed) {
          return;
        }

        applySnapshot(snapshot);

        stream = openRealtimeStream(
          (nextSnapshot) => {
            if (disposed) {
              return;
            }
            applySnapshot(nextSnapshot);
          },
          () => {
            if (!disposed) {
              requireBootstrap();
            }
          },
        );

        stream.onopen = () => {
          if (!disposed) {
            useStore.getState().setConnectionStatus('connected');
          }
        };

        stream.onerror = () => {
          if (stream) {
            stream.close();
          }
          if (disposed) {
            return;
          }
          useStore.getState().setConnectionStatus('offline');
          reconnectTimer = window.setTimeout(connect, 1500);
        };
      } catch {
        if (disposed) {
          return;
        }
        useStore.getState().setConnectionStatus('offline');
        reconnectTimer = window.setTimeout(connect, 1500);
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
  }, [applySnapshot, requireBootstrap]);
}
