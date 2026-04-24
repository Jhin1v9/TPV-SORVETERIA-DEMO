import { useState, useEffect, createContext, useContext } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const StripeContext = createContext<{
  stripe: Stripe | null;
  isReady: boolean;
  error: string | null;
}>({ stripe: null, isReady: false, error: null });

export function useStripeContext() {
  return useContext(StripeContext);
}

export default function StripeProvider({ children }: { children: React.ReactNode }) {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stripeKey || stripeKey === 'pk_test_...') {
      setError('Stripe no configurado. Usa VITE_STRIPE_PUBLISHABLE_KEY en el .env');
      return;
    }
    loadStripe(stripeKey)
      .then((s) => {
        setStripe(s);
        setIsReady(true);
      })
      .catch(() => setError('Error al cargar Stripe'));
  }, []);

  return (
    <StripeContext.Provider value={{ stripe, isReady, error }}>
      {children}
    </StripeContext.Provider>
  );
}
