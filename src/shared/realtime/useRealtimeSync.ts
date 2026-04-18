import { useEffect } from 'react';
import { useEffectEvent } from 'react';
import { subscribeRealtimeSession } from './client';
import { useStore } from '../stores/useStore';
import type { DemoStateSnapshot } from '../types';

export function useRealtimeSync() {
  const applySnapshot = useEffectEvent((snapshot: DemoStateSnapshot) => {
    useStore.getState().hydrateRemoteState(snapshot);
  });

  const applyConnection = useEffectEvent((status: 'connecting' | 'connected' | 'offline' | 'standalone') => {
    useStore.getState().setConnectionStatus(status);
  });

  useEffect(() => {
    const subscription = subscribeRealtimeSession(
      (snapshot) => {
        applySnapshot(snapshot);
      },
      (status) => {
        applyConnection(status);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [applyConnection, applySnapshot]);
}
