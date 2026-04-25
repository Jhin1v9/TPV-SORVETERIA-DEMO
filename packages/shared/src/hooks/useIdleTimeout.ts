import { useEffect, useRef, useCallback, useState } from 'react';

interface UseIdleTimeoutOptions {
  /** Tempo em ms antes de mostrar o aviso (default: 30000 = 30s) */
  idleTimeout?: number;
  /** Tempo em ms para o usuário responder ao aviso (default: 10000 = 10s) */
  warningTimeout?: number;
  /** Callback quando o timeout completa (usuário não respondeu) */
  onTimeout: () => void;
  /** Se false, o hook não ativa (default: true) */
  enabled?: boolean;
}

interface UseIdleTimeoutReturn {
  /** Se o modal de aviso está visível */
  isWarningVisible: boolean;
  /** Segundos restantes no countdown do aviso */
  secondsRemaining: number;
  /** Reseta o timer manualmente (ex: ao clicar "Sí, continuar") */
  reset: () => void;
  /** Força o timeout imediatamente */
  forceTimeout: () => void;
}

/**
 * Hook para detectar inatividade e mostrar aviso antes de resetar.
 * Baseado em melhores práticas de QSR kiosks (McDonald's, IdealPOS, etc.):
 * - 30s inatividade → mostra aviso "¿Sigues aquí?"
 * - 15s sem resposta → reseta sessão (limpa carrinho, volta home)
 * - Qualquer interação (touch, click, key, scroll) reseta o timer
 */
export function useIdleTimeout({
  idleTimeout = 30000,
  warningTimeout = 10000,
  onTimeout,
  enabled = true,
}: UseIdleTimeoutOptions): UseIdleTimeoutReturn {
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(
    Math.ceil(warningTimeout / 1000)
  );

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeoutRef = useRef(onTimeout);

  // Manter callback atualizado sem re-criar timers
  onTimeoutRef.current = onTimeout;

  const clearAllTimers = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const startWarningCountdown = useCallback(() => {
    setSecondsRemaining(Math.ceil(warningTimeout / 1000));
    setIsWarningVisible(true);

    // Atualiza countdown a cada segundo
    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Timer para executar onTimeout
    warningTimerRef.current = setTimeout(() => {
      clearAllTimers();
      setIsWarningVisible(false);
      onTimeoutRef.current();
    }, warningTimeout);
  }, [warningTimeout, clearAllTimers]);

  const startIdleTimer = useCallback(() => {
    if (!enabled) return;
    clearAllTimers();
    setIsWarningVisible(false);

    idleTimerRef.current = setTimeout(() => {
      startWarningCountdown();
    }, idleTimeout);
  }, [enabled, idleTimeout, clearAllTimers, startWarningCountdown]);

  const reset = useCallback(() => {
    startIdleTimer();
  }, [startIdleTimer]);

  const forceTimeout = useCallback(() => {
    clearAllTimers();
    setIsWarningVisible(false);
    onTimeoutRef.current();
  }, [clearAllTimers]);

  useEffect(() => {
    if (!enabled) {
      clearAllTimers();
      setIsWarningVisible(false);
      return;
    }

    // Eventos que indicam atividade do usuário
    const events = ['mousedown', 'touchstart', 'keydown', 'scroll', 'click', 'mousemove'];

    const handleActivity = () => {
      // Só reseta se o aviso NÃO está visível
      // (se o aviso está visível, o usuário precisa clicar explicitamente no botão)
      if (!isWarningVisible) {
        startIdleTimer();
      }
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Inicia o timer
    startIdleTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      clearAllTimers();
    };
  }, [enabled, isWarningVisible, startIdleTimer, clearAllTimers]);

  return {
    isWarningVisible,
    secondsRemaining,
    reset,
    forceTimeout,
  };
}
