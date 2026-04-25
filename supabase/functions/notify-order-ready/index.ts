import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
);

const publicKey = Deno.env.get('WEB_PUSH_PUBLIC_KEY') || '';
const privateKey = Deno.env.get('WEB_PUSH_PRIVATE_KEY') || '';
const contactEmail = Deno.env.get('PUSH_CONTACT_EMAIL') || 'mailto:no-reply@tropicale.app';

if (publicKey && privateKey) {
  webpush.setVapidDetails(contactEmail, publicKey, privateKey);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    if (!publicKey || !privateKey) {
      return new Response(JSON.stringify({ error: 'Push secrets not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, numero_sequencial, status, customer_id, customer_phone')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (order.status !== 'listo') {
      return new Response(JSON.stringify({ ok: true, skipped: 'status-not-listo' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let query = supabase
      .from('push_subscriptions')
      .select('id, endpoint, p256dh, auth')
      .eq('enabled', true);

    if (order.customer_id) {
      query = query.eq('customer_id', order.customer_id);
    } else if (order.customer_phone) {
      query = query.eq('telefone', order.customer_phone);
    } else {
      return new Response(JSON.stringify({ ok: true, delivered: 0, reason: 'no-customer-reference' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: subscriptions, error: subscriptionsError } = await query;
    if (subscriptionsError) {
      throw subscriptionsError;
    }

    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ ok: true, delivered: 0, reason: 'no-subscriptions' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = JSON.stringify({
      title: 'Seu sorvete está pronto',
      body: `Pedido #${String(order.numero_sequencial).padStart(3, '0')} pronto para retirada. Venha buscar na Tropicale.`,
      tag: `order-ready-${order.id}`,
      data: {
        orderId: order.id,
        url: '/',
      },
    });

    let delivered = 0;
    const expiredIds: string[] = [];

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        }, payload);
        delivered += 1;
      } catch (error) {
        const statusCode = Number(error?.statusCode ?? error?.status ?? 0);
        console.error('[notify-order-ready] send failure', statusCode, error?.body || error?.message || error);
        if (statusCode === 404 || statusCode === 410) {
          expiredIds.push(subscription.id);
        }
      }
    }

    if (expiredIds.length > 0) {
      await supabase
        .from('push_subscriptions')
        .update({ enabled: false, updated_at: new Date().toISOString() })
        .in('id', expiredIds);
    }

    await supabase
      .from('push_subscriptions')
      .update({ last_notified_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .in('id', subscriptions.map((item) => item.id));

    return new Response(JSON.stringify({ ok: true, delivered, subscriptions: subscriptions.length }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[notify-order-ready]', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
