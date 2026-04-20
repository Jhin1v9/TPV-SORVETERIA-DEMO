export type Locale = 'es' | 'ca' | 'pt' | 'en';

export type CategoriaId = 'copo300' | 'copo500' | 'cone' | 'pote1l';

export type SaborCategoria = 'cremoso' | 'chocolate' | 'especial' | 'fruta' | 'sorbete' | 'frutos_secos';

export type PedidoStatus = 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';

export type MetodoPago = 'tarjeta' | 'efectivo' | 'bizum' | 'pendiente';

export type ToppingCategoria = 'cobertura' | 'crema' | 'crocante' | 'decoracion' | 'mix-in';

export interface LocalizedText {
  es: string;
  ca: string;
  pt: string;
  en: string;
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
  nome: LocalizedText;
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
  subtotal?: number;
  descuento?: number;
  extras?: number;
  total: number;
  iva: number;
  verifactuQr: string | null;
  clienteTelefone: string | null;
  itens: ItemPedido[];
  origem: 'tpv' | 'pwa';
  nomeUsuario?: string | null;
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

export interface EstablishmentSettings {
  name: string;
  nif: string;
  address: string;
  summerHours: string;
  winterHours: string;
}

export interface DemoStateSnapshot {
  categorias: Categoria[];
  sabores: Sabor[];
  toppings: Topping[];
  pedidos: Pedido[];
  vendasHistorico: DiaVenda[];
  establishment: EstablishmentSettings;
  lastOrderNumber: number;
  updatedAt: string;
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

// === Tipos do Projeto Local (Tropicale) fusionados ===

export type ProdutoCategoria =
  | 'todos'
  | 'acai'
  | 'crema'
  | 'picole'
  | 'picole-premium'
  | 'picole-duplo'
  | 'conos'
  | 'melhorados'
  | 'sundae'
  | 'sabores-especiais'
  | 'yogurt-especial'
  | 'barquillo'
  | 'donuts'
  | 'sorvetes-artesanais';

export interface Produto {
  id: string;
  nome: LocalizedText;
  preco: number;
  imagem: string;
  categoria: ProdutoCategoria;
  descricao?: LocalizedText;
  emEstoque: boolean;
  badge?: LocalizedText;
}

export interface ItemCarrinhoPWA {
  produto: Produto;
  quantidade: number;
  observacoes?: string;
}

export interface PedidoPWA {
  id: string;
  itens: ItemCarrinhoPWA[];
  total: number;
  status: PedidoStatus;
  origem: 'pwa';
  timestamp: number;
  usuarioId: string;
  nomeUsuario: string;
  emailUsuario: string;
  metodoPago: MetodoPago;
  telefone?: string;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  logado: boolean;
}

export type ViewMode = 'selector' | 'kiosk' | 'cocina' | 'cliente' | 'admin';
