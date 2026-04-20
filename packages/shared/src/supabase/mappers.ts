import type {
  Categoria,
  CategoriaId,
  DemoStateSnapshot,
  DiaVenda,
  LocalizedText,
  Pedido,
  Sabor,
  SaborCategoria,
  Topping,
  ToppingCategoria,
} from '../types';

type AnyRecord = Record<string, unknown>;

function normalizeFlavor(row: AnyRecord): Sabor {
  return {
    id: String(row.id),
    nome: row.nome as { ca: string; es: string; en: string; pt: string },
    categoria: String(row.categoria) as SaborCategoria,
    corHex: String(row.cor_hex),
    imagemUrl: String(row.image_url),
    precoExtra: Number(row.extra_price),
    stockBaldes: Number(row.stock_buckets),
    alertaStock: Number(row.low_stock_threshold),
    disponivel: Boolean(row.available),
    badge: row.badge ? String(row.badge) : undefined,
  };
}

function normalizeCategory(row: AnyRecord): Categoria {
  return {
    id: String(row.id) as CategoriaId,
    nome: row.nome as { ca: string; es: string; en: string; pt: string },
    precoBase: Number(row.base_price),
    maxSabores: Number(row.max_flavors),
    corHex: String(row.cor_hex),
    ativo: Boolean(row.active),
    ordem: Number(row.display_order),
    imagem: String(row.image_url),
    badge: row.badge ? String(row.badge) : undefined,
  };
}

function normalizeTopping(row: AnyRecord): Topping {
  return {
    id: String(row.id),
    nome: row.nome as LocalizedText,
    preco: Number(row.price),
    categoria: String(row.categoria) as ToppingCategoria,
    emoji: row.emoji ? String(row.emoji) : undefined,
  };
}

function buildSalesHistory(orders: Pedido[]): DiaVenda[] {
  const grouped = new Map<string, { total: number; pedidos: number }>();

  orders.forEach((pedido) => {
    const day = pedido.timestampCriacao.slice(0, 10);
    const current = grouped.get(day) ?? { total: 0, pedidos: 0 };
    current.total += pedido.total;
    current.pedidos += 1;
    grouped.set(day, current);
  });

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([data, value]) => ({
      data,
      total: Number(value.total.toFixed(2)),
      pedidos: value.pedidos,
      ticketMedio: Number((value.total / value.pedidos).toFixed(2)),
    }));
}

export function buildSnapshotFromSupabase(data: {
  categories: AnyRecord[];
  flavors: AnyRecord[];
  toppings: AnyRecord[];
  settings: AnyRecord | null;
  orders: AnyRecord[];
}): DemoStateSnapshot {
  const pedidos: Pedido[] = data.orders.map((row) => ({
    id: String(row.id),
    numeroSequencial: Number(row.numero_sequencial),
    status: String(row.status) as Pedido['status'],
    timestampCriacao: String(row.created_at),
    timestampListo: row.ready_at ? String(row.ready_at) : null,
    metodoPago: String(row.payment_method) as Pedido['metodoPago'],
    subtotal: Number(row.subtotal ?? 0),
    descuento: Number(row.discount ?? 0),
    extras: Number(row.extras ?? 0),
    total: Number(row.total),
    iva: Number(row.iva),
    verifactuQr: row.verifactu_qr ? String(row.verifactu_qr) : null,
    clienteTelefone: row.customer_phone ? String(row.customer_phone) : null,
    origem: ((row.origem as string) || 'tpv') as Pedido['origem'],
    itens: ((row.order_items as AnyRecord[] | null) ?? [])
      .sort((left, right) => Number(left.sort_order ?? 0) - Number(right.sort_order ?? 0))
      .map((item) => ({
        id: String(item.id),
        categoriaSku: String(item.category_sku) as Pedido['itens'][number]['categoriaSku'],
        categoriaNome: String(item.category_name),
        sabores: ((item.flavors as AnyRecord[] | null) ?? []).map(normalizeFlavor),
        toppings: ((item.toppings as AnyRecord[] | null) ?? []).map(normalizeTopping),
        precoUnitario: Number(item.unit_price),
        quantidade: Number(item.quantity),
        notas: item.notes ? String(item.notes) : undefined,
      })),
  }));

  return {
    categorias: data.categories.map(normalizeCategory),
    sabores: data.flavors.map(normalizeFlavor),
    toppings: data.toppings.map(normalizeTopping),
    pedidos,
    vendasHistorico: buildSalesHistory(pedidos),
    establishment: {
      name: data.settings?.name ? String(data.settings.name) : 'Heladeria Sabadell Nord',
      nif: data.settings?.nif ? String(data.settings.nif) : 'B-12345678',
      address: data.settings?.address ? String(data.settings.address) : 'Carrer de la Concepcio, 23, 08201 Sabadell, Barcelona',
      summerHours: data.settings?.summer_hours ? String(data.settings.summer_hours) : '16:00 - 23:00',
      winterHours: data.settings?.winter_hours ? String(data.settings.winter_hours) : '17:00 - 22:00',
    },
    lastOrderNumber: pedidos.reduce((max, pedido) => Math.max(max, pedido.numeroSequencial), 0),
    updatedAt: new Date().toISOString(),
  };
}
