import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders, checkRateLimit, getClientIP, safeError } from '../_shared/security.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate limiting
  const clientIP = getClientIP(req);
  if (!checkRateLimit(clientIP)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { orderId, email, orderNumber, total } = await req.json();

    if (!orderId || !email) {
      return new Response(JSON.stringify({ error: 'orderId and email required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const receiptHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
        <h1 style="color: #FF6B9D; text-align: center;">Heladería Tropicale</h1>
        <h2 style="text-align: center; font-size: 14px; color: #666;">Comprobante de Pedido</h2>
        <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;" />
        <p><strong>Pedido:</strong> #${orderNumber || order.numero_sequencial}</p>
        <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleString('es-ES')}</p>
        <p><strong>Método:</strong> ${order.payment_method}</p>
        <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;" />
        <p style="font-size: 18px; text-align: center;"><strong>Total: €${Number(total || order.total).toFixed(2)}</strong></p>
        <hr style="border: none; border-top: 1px dashed #ccc; margin: 15px 0;" />
        <p style="text-align: center; font-size: 11px; color: #999;">Gracias por su visita · ¡Vuelva pronto!</p>
      </div>
    `;

    await supabase.rpc('register_receipt', {
      order_id_input: orderId,
      type_input: 'email',
      email_input: email,
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Comprobante enviado' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[send-receipt]', error);
    return new Response(
      JSON.stringify({ error: safeError(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
