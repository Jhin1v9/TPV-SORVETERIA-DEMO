import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const STATE_PATH = path.join(DATA_DIR, 'current-state.json');
const PORT = Number(process.env.DEMO_SERVER_PORT || 8787);

const clients = new Set();
let state = null;
let saveQueue = Promise.resolve();

const CATEGORY_CONSUMPTION = {
  copo300: 0.052,
  copo500: 0.1,
  cone: 0.031,
  pote1l: 0.2,
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
  });
  res.end(JSON.stringify(payload));
}

function sendSse(res, event, payload) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function withMeta(snapshot) {
  return {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };
}

async function queueSave() {
  if (!state) {
    return;
  }

  const snapshot = JSON.stringify(state, null, 2);
  saveQueue = saveQueue.then(async () => {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(STATE_PATH, snapshot, 'utf8');
  }).catch(() => undefined);

  await saveQueue;
}

function broadcastSnapshot() {
  if (!state) {
    return;
  }

  const payload = { snapshot: state };
  for (const client of clients) {
    sendSse(client, 'snapshot', payload);
  }
}

async function persistAndBroadcast() {
  state = withMeta(state);
  await queueSave();
  broadcastSnapshot();
}

function calculateItemUnitPrice(item) {
  const flavorExtras = item.sabores.reduce((sum, sabor) => sum + Number(sabor.precoExtra || 0), 0);
  const toppingExtras = item.toppings.reduce((sum, topping) => sum + Number(topping.preco || 0), 0);
  return Number((Number(item.categoria.precoBase) + flavorExtras + toppingExtras).toFixed(2));
}

function calculateCheckout(cart, checkout) {
  const itemsSubtotal = cart.reduce((sum, item) => sum + calculateItemUnitPrice(item), 0);
  const coffeeExtra = checkout.coffeeAdded ? Number(checkout.coffeePrice || 0) : 0;
  const discountRate = Number(checkout.promoDiscountRate || 0);
  const discountValue = Number((itemsSubtotal * discountRate).toFixed(2));
  const taxableSubtotal = Number((itemsSubtotal + coffeeExtra - discountValue).toFixed(2));
  const iva = Number((taxableSubtotal * 0.1).toFixed(2));
  const total = Number((taxableSubtotal + iva).toFixed(2));

  return {
    itemsSubtotal: Number(itemsSubtotal.toFixed(2)),
    extras: Number(coffeeExtra.toFixed(2)),
    descuento: discountValue,
    subtotal: taxableSubtotal,
    iva,
    total,
  };
}

function ensureTodayHistoryEntry(timestamp) {
  const dayKey = timestamp.slice(0, 10);
  const existing = state.vendasHistorico.find((entry) => entry.data === dayKey);
  if (existing) {
    return existing;
  }

  const created = {
    data: dayKey,
    total: 0,
    pedidos: 0,
    ticketMedio: 0,
  };
  state.vendasHistorico = [...state.vendasHistorico, created].sort((a, b) => a.data.localeCompare(b.data));
  return created;
}

function updateSalesHistory(order) {
  const entry = ensureTodayHistoryEntry(order.timestampCriacao);
  entry.total = Number((entry.total + order.total).toFixed(2));
  entry.pedidos += 1;
  entry.ticketMedio = Number((entry.total / entry.pedidos).toFixed(2));
}

function decrementFlavorStock(cart) {
  for (const item of cart) {
    if (!item.sabores.length) {
      continue;
    }

    const totalConsumption = CATEGORY_CONSUMPTION[item.categoria.id] || 0;
    const perFlavorConsumption = totalConsumption / item.sabores.length;

    state.sabores = state.sabores.map((sabor) => {
      const used = item.sabores.some((selected) => selected.id === sabor.id);
      if (!used) {
        return sabor;
      }

      return {
        ...sabor,
        stockBaldes: Number(Math.max(0, sabor.stockBaldes - perFlavorConsumption).toFixed(3)),
      };
    });
  }
}

function createOrder(payload) {
  const now = new Date().toISOString();
  const nextNumber = Number(state.lastOrderNumber || 0) + 1;
  const pricing = calculateCheckout(payload.cart, payload.checkout);

  const itens = payload.cart.map((item, index) => ({
    id: `item-${nextNumber}-${index + 1}`,
    categoriaSku: item.categoria.id,
    categoriaNome: item.categoria.nome.es,
    sabores: item.sabores,
    toppings: item.toppings,
    precoUnitario: calculateItemUnitPrice(item),
    quantidade: 1,
    notas: item.notas || null,
  }));

  const pedido = {
    id: `pedido-${nextNumber}-${Date.now()}`,
    numeroSequencial: nextNumber,
    status: 'pendiente',
    timestampCriacao: now,
    timestampListo: null,
    metodoPago: payload.metodoPago,
    subtotal: pricing.subtotal,
    descuento: pricing.descuento,
    extras: pricing.extras,
    total: pricing.total,
    iva: pricing.iva,
    verifactuQr: JSON.stringify({
      id: `pedido-${nextNumber}`,
      nif: state.establishment.nif,
      fecha: now.slice(0, 10),
      importe: pricing.total.toFixed(2),
      establecimiento: state.establishment.name,
    }),
    clienteTelefone: payload.checkout.notificationPhone || null,
    itens,
  };

  state.lastOrderNumber = nextNumber;
  state.pedidos = [pedido, ...state.pedidos];
  decrementFlavorStock(payload.cart);
  updateSalesHistory(pedido);

  return pedido;
}

async function readRequestBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function loadState() {
  try {
    const raw = await readFile(STATE_PATH, 'utf8');
    state = JSON.parse(raw);
  } catch {
    state = null;
  }
}

function setSnapshot(nextSnapshot) {
  state = withMeta({
    ...nextSnapshot,
    lastOrderNumber: nextSnapshot.lastOrderNumber || Math.max(0, ...nextSnapshot.pedidos.map((pedido) => pedido.numeroSequencial || 0)),
  });
}

function handleCors(req, res) {
  if (req.method !== 'OPTIONS') {
    return false;
  }

  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end();
  return true;
}

await loadState();

const server = createServer(async (req, res) => {
  if (handleCors(req, res)) {
    return;
  }

  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && url.pathname === '/health') {
    sendJson(res, 200, { ok: true, hasState: Boolean(state), port: PORT });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/state') {
    if (!state) {
      sendJson(res, 503, { needsBootstrap: true });
      return;
    }

    sendJson(res, 200, { snapshot: state });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });
    res.write('\n');
    clients.add(res);

    if (state) {
      sendSse(res, 'snapshot', { snapshot: state });
    } else {
      sendSse(res, 'bootstrap_required', { needsBootstrap: true });
    }

    req.on('close', () => {
      clients.delete(res);
    });
    return;
  }

  if (req.method === 'POST' && (url.pathname === '/api/bootstrap' || url.pathname === '/api/reset')) {
    const body = await readRequestBody(req);
    setSnapshot(body.snapshot);
    await persistAndBroadcast();
    sendJson(res, 200, { snapshot: state });
    return;
  }

  if (!state) {
    sendJson(res, 503, { needsBootstrap: true });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/orders') {
    const body = await readRequestBody(req);
    const pedido = createOrder(body);
    await persistAndBroadcast();
    sendJson(res, 201, { pedido, snapshot: state });
    return;
  }

  if (req.method === 'POST' && url.pathname.match(/^\/api\/orders\/[^/]+\/status$/)) {
    const body = await readRequestBody(req);
    const pedidoId = url.pathname.split('/')[3];
    state.pedidos = state.pedidos.map((pedido) => {
      if (pedido.id !== pedidoId) {
        return pedido;
      }

      return {
        ...pedido,
        status: body.status,
        timestampListo: body.status === 'listo' ? new Date().toISOString() : pedido.timestampListo,
      };
    });

    await persistAndBroadcast();
    sendJson(res, 200, { snapshot: state });
    return;
  }

  if (req.method === 'POST' && url.pathname.match(/^\/api\/flavors\/[^/]+\/stock$/)) {
    const body = await readRequestBody(req);
    const flavorId = url.pathname.split('/')[3];
    state.sabores = state.sabores.map((sabor) => {
      if (sabor.id !== flavorId) {
        return sabor;
      }

      return {
        ...sabor,
        stockBaldes: Number(Math.max(0, sabor.stockBaldes + Number(body.delta || 0)).toFixed(3)),
      };
    });

    await persistAndBroadcast();
    sendJson(res, 200, { snapshot: state });
    return;
  }

  if (req.method === 'POST' && url.pathname.match(/^\/api\/flavors\/[^/]+\/availability$/)) {
    const body = await readRequestBody(req);
    const flavorId = url.pathname.split('/')[3];
    state.sabores = state.sabores.map((sabor) => {
      if (sabor.id !== flavorId) {
        return sabor;
      }

      return {
        ...sabor,
        disponivel: Boolean(body.disponivel),
      };
    });

    await persistAndBroadcast();
    sendJson(res, 200, { snapshot: state });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/settings') {
    const body = await readRequestBody(req);
    state.establishment = {
      ...state.establishment,
      ...body.establishment,
    };
    await persistAndBroadcast();
    sendJson(res, 200, { snapshot: state });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[demo-server] listening on http://0.0.0.0:${PORT}`);
});
