import { useEffect } from 'react';
import { useStore } from '../stores/useStore';
import { subscribeRealtimeSession } from '../realtime/client';

export function useRealtimeSync() {
  const hydrateRemoteState = useStore((state) => state.hydrateRemoteState);
  const setConnectionStatus = useStore((state) => state.setConnectionStatus);

  useEffect(() => {
    const session = subscribeRealtimeSession(
      (snapshot) => {
        hydrateRemoteState(snapshot);
      },
      (status) => {
        setConnectionStatus(status);
      },
    );

    return () => {
      session.unsubscribe();
    };
  }, [hydrateRemoteState, setConnectionStatus]);
}
