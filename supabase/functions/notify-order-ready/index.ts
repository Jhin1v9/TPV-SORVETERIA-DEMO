import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

// ── Security: CORS restricted ──
const ALLOWED_ORIGINS = [
  'https://cliente-pearl.vercel.app',
  'https://kiosk-swart-delta.vercel.app',
  'https://admin-ten-vert-54.vercel.app',
  'https://kds-one.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// ── Security: Rate limiting ──
const rateStore = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}

function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

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
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const clientIP = getClientIP(req);
  if (!checkRateLimit(clientIP)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
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
    if (subscriptionsError) throw subscriptionsError;

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
      data: { orderId: order.id, url: '/' },
    });

    let delivered = 0;
    const expiredIds: string[] = [];

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification({
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        }, payload);
        delivered += 1;
      } catch (error) {
        const statusCode = Number(error?.statusCode ?? error?.status ?? 0);
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
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
