export type Locale = 'ca' | 'es' | 'en' | 'fr';

export type CategoriaId = 'copo300' | 'copo500' | 'cone' | 'pote1l';

export type SaborCategoria = 'cremoso' | 'chocolate' | 'especial' | 'fruta' | 'sorbete' | 'frutos_secos';

export type PedidoStatus = 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';

export type MetodoPago = 'tarjeta' | 'efectivo' | 'bizum' | 'pendiente';

export type ToppingCategoria = 'cobertura' | 'crema' | 'crocante' | 'decoracion' | 'mix-in';

export interface LocalizedText {
  ca: string;
  es: string;
  en: string;
  fr: string;
}

export interface Categoria {
  id: CategoriaId;
  nome: LocalizedText;
  precoBase: number;
  maxSabores: number;
  corHex: string;
  ativo: boolean;
  ordem: number;
  imagem: string;
  badge?: string;
}

export interface Sabor {
  id: string;
  nome: LocalizedText;
  categoria: SaborCategoria;
  corHex: string;
  imagemUrl: string;
  precoExtra: number;
  stockBaldes: number;
  alertaStock: number;
  disponivel: boolean;
  badge?: string;
}

export interface Topping {
  id: string;
  nome: string;
  preco: number;
  categoria: ToppingCategoria;
  emoji?: string;
}

export interface ItemPedido {
  id: string;
  categoriaSku: CategoriaId;
  categoriaNome: string;
  sabores: Sabor[];
  toppings: Topping[];
  precoUnitario: number;
  quantidade: number;
  notas?: string;
}

export interface Pedido {
  id: string;
  numeroSequencial: number;
  status: PedidoStatus;
  timestampCriacao: string;
  timestampListo: string | null;
  metodoPago: MetodoPago;
  total: number;
  iva: number;
  verifactuQr: string | null;
  clienteTelefone: string | null;
  itens: ItemPedido[];
}

export interface CarrinhoItem {
  categoria: Categoria;
  sabores: Sabor[];
  toppings: Topping[];
}

export interface EstoqueMovimentacao {
  id: string;
  saborId: string;
  tipo: 'entrada_balde' | 'saida_porcao' | 'ajuste';
  quantidadeBaldes: number;
  porcoesEquivalente: number;
  timestamp: string;
  motivo?: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  totalGasto: number;
  pedidosTotal: number;
  saborFavorito: string;
}

export interface DiaVenda {
  data: string;
  total: number;
  pedidos: number;
  ticketMedio: number;
}

export interface BroadcastMessage {
  tipo: 'novo_pedido' | 'status_update' | 'estoque_update' | 'config_update';
  timestamp: string;
  dados?: Record<string, unknown>;
  pedidoId?: string;
  status?: PedidoStatus;
  saborId?: string;
  stockBaldes?: number;
}

export const IVA_RATE = 0.10;

export const ML_POR_BALDE = 5000;

export const RENDIMENTO_PORCOES: Record<string, number> = {
  copo300: 312.5,
  copo500: 500,
  cone: 156.25,
  pote1l: 1000,
};
