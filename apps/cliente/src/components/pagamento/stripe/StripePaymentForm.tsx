import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useStripeContext } from './StripeProvider';
import { useStore } from '@tpv/shared/stores/useStore';
import { t } from '@tpv/shared/i18n';
import { Loader2, ShieldCheck, CreditCard } from 'lucide-react';

interface StripePaymentFormProps {
  clientSecret: string;
  total: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (message: string) => void;
  onCancel: () => void;
}

function PaymentForm({ total, onSuccess, onError, onCancel }: Omit<StripePaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const { locale } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pedidos`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setIsProcessing(false);
      onError(error.message || t('paymentError', locale));
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      setIsProcessing(false);
      onError(t('paymentUnexpected', locale));
    }
  };

  return (
    <div className="space-y-4">
      {/* Total */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4 border border-pink-100">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">{t('total', locale)}</span>
          <span className="text-2xl font-bold text-[#FF6B9D]">€{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Stripe PaymentElement */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <PaymentElement
          options={{
            layout: {
              type: 'tabs',
              defaultCollapsed: false,
            },
            wallets: {
              applePay: 'auto',
              googlePay: 'auto',
            },
          }}
        />
      </div>

      {/* Segurança */}
      <div className="flex items-center gap-2 text-gray-400 justify-center">
        <ShieldCheck size={14} />
        <span className="text-[10px]">{t('securePayment', locale)} — PCI DSS</span>
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50"
        >
          {t('cancel', locale)}
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!stripe || isProcessing}
          className="flex-[2] py-3 bg-gradient-to-r from-[#FF6B9D] to-[#FFA07A] text-white font-bold rounded-xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {t('processing', locale)}...
            </>
          ) : (
            <>
              <CreditCard size={18} />
              {t('payNow', locale)} €{total.toFixed(2)}
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

export default function StripePaymentForm({ clientSecret, ...props }: StripePaymentFormProps) {
  const { stripe, isReady, error } = useStripeContext();

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-sm">{error}</p>
        <p className="text-gray-400 text-xs mt-2">Configure VITE_STRIPE_PUBLISHABLE_KEY</p>
      </div>
    );
  }

  if (!isReady || !stripe) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-[#FF6B9D]" />
      </div>
    );
  }

  return (
    <Elements
      stripe={stripe}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#FF6B9D',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            borderRadius: '12px',
          },
        },
        locale: 'es',
      }}
    >
      <PaymentForm {...props} />
    </Elements>
  );
}
