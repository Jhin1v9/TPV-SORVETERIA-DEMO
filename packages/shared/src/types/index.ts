export type Locale = 'ca' | 'es' | 'pt' | 'en';

export type CategoriaId = 'copo300' | 'copo500' | 'cone' | 'pote1l';

export type SaborCategoria = 'cremoso' | 'chocolate' | 'especial' | 'fruta' | 'sorbete' | 'frutos_secos';

export type PedidoStatus = 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';

export type MetodoPago = 'tarjeta' | 'efectivo' | 'bizum' | 'pendiente';

export type ToppingCategoria = 'cobertura' | 'crema' | 'crocante' | 'decoracion' | 'mix-in';

export interface LocalizedText {
  ca: string;
  es: string;
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
  origem?: 'tpv' | 'pwa';
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

// ===========================
// ALÉRGENOS relevantes para sorveteria / gelateria
// ===========================
export type Alergeno =
  | 'gluten'
  | 'leite'
  | 'ovos'
  | 'frutos_casca_rija'
  | 'amendoim'
  | 'soja'
  | 'sesamo'
  | 'sulfitos';

export interface AvisoAlergeno {
  alergeno: Alergeno;
  nivel: 'contem' | 'pode_conter'; // 'contem' = ingrediente | 'pode_conter' = cross-contamination
}

export interface PerfilUsuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  temAlergias: boolean;
  alergias: Alergeno[];
  criadoEm: string;
}

export const IVA_RATE = 0.10;

export const ML_POR_BALDE = 5000;

export const RENDIMENTO_PORCOES: Record<string, number> = {
  copo300: 312.5,
  copo500: 500,
  cone: 156.25,
  pote1l: 1000,
};

// ===========================
// CATEGORIAS REAIS DO CARDÁPIO
// ===========================
export type ProdutoCategoria =
  | 'todos'
  | 'copas'
  | 'gofres'
  | 'souffle'
  | 'banana-split'
  | 'acai'
  | 'helados'
  | 'conos'
  | 'granizados'
  | 'batidos'
  | 'orxata'
  | 'cafes'
  | 'tarrinas-nata'
  | 'para-llevar';

// Produto com preço fixo (ex: Copa Bahia €8,10)
export interface ProdutoFixo {
  id: string;
  nome: LocalizedText;
  descricao?: LocalizedText;
  badge?: LocalizedText;
  preco: number;
  imagem: string;
  categoria: ProdutoCategoria;
  emEstoque: boolean;
  alergenos: AvisoAlergeno[];
}

// Opção de personalização (ex: tamanho, topping, fruta)
export interface OpcaoPersonalizacao {
  id: string;
  nome: LocalizedText;
  preco: number;
  tipo: 'tamanho' | 'topping' | 'fruta' | 'extra' | 'sabor';
  imagem?: string;
  emoji?: string;
}

// Produto personalizável (ex: Açaí, Helado à carta)
export interface ProdutoPersonalizavel {
  id: string;
  nome: LocalizedText;
  descricao?: LocalizedText;
  precoBase: number;
  imagem: string;
  categoria: ProdutoCategoria;
  emEstoque: boolean;
  alergenos: AvisoAlergeno[];
  // Regras de personalização
  opcoes: {
    tamanhos?: OpcaoPersonalizacao[];
    sabores?: OpcaoPersonalizacao[];
    toppings?: OpcaoPersonalizacao[];
    frutas?: OpcaoPersonalizacao[];
    extras?: OpcaoPersonalizacao[];
  };
  // Limites (ex: max 2 toppings, max 1 fruta)
  limites?: {
    maxToppings?: number;
    maxFrutas?: number;
    maxSabores?: number;
  };
}

// Union type para produtos do cardápio
export type Produto = ProdutoFixo | ProdutoPersonalizavel;

// Helper type guard
export function isProdutoPersonalizavel(p: Produto): p is ProdutoPersonalizavel {
  return 'precoBase' in p && 'opcoes' in p;
}

// Nota: Modelo kiosk (Categoria, Sabor, Topping) definido no topo do arquivo
