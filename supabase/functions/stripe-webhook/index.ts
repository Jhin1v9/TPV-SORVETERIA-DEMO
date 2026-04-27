import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// ── Security: Idempotency tracking ──
const processedEvents = new Set<string>();
const EVENT_TTL_MS = 24 * 60 * 60 * 1000;

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const signature = req.headers.get('stripe-signature');
  const body = await req.text();
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature || '', webhookSecret);
  } catch (err) {
    console.error('[stripe-webhook] Invalid signature:', err.message);
    return new Response('Invalid signature', { status: 400 });
  }

  // Idempotency check
  if (processedEvents.has(event.id)) {
    return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          await supabase.rpc('confirm_order_payment', {
            order_id_input: orderId,
            transaction_id_input: paymentIntent.id,
            gateway_input: 'stripe',
            receipt_url_input: paymentIntent.charges?.data?.[0]?.receipt_url || null,
          });
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId) {
          await supabase.rpc('reject_order_payment', {
            order_id_input: orderId,
            error_message_input: paymentIntent.last_payment_error?.message || 'Payment failed',
          });
        }
        break;
      }
      default:
        console.log(`[stripe-webhook] Unhandled event: ${event.type}`);
    }

    processedEvents.add(event.id);
    setTimeout(() => processedEvents.delete(event.id), EVENT_TTL_MS);

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error('[stripe-webhook] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
});
