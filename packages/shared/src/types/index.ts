export type Locale = 'ca' | 'es' | 'pt' | 'en';

export type CategoriaId = 'copo300' | 'copo500' | 'cone' | 'pote1l';

export type SaborCategoria = 'cremoso' | 'chocolate' | 'especial' | 'fruta' | 'sorbete' | 'frutos_secos';

export type PedidoStatus = 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';

export type MetodoPago = 'tarjeta' | 'efectivo' | 'bizum' | 'pendiente';

export type OrigemPedido = 'tpv' | 'kiosk' | 'pwa';

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
  // Novo modelo de produtos
  itemType?: 'product' | 'legacy';
  productId?: string;
  productName?: string;
  productSnapshot?: Product;
  selections?: Record<string, OpcaoPersonalizacao[]>;

  // Legado (mantido para compatibilidade)
  categoriaSku: CategoriaId | string;
  categoriaNome: string;
  sabores: Sabor[];
  toppings: Topping[];
  precoUnitario: number;
  quantidade: number;
  notas?: string;
}

export type EstadoPagamento = 'aprovado' | 'rejeitado' | 'pendente' | 'reembolsado';

export interface ComprovantePagamento {
  estado: EstadoPagamento;
  /** ID da transação (Stripe, Bizum, etc.) */
  idTransacao?: string;
  /** Data/hora do processamento */
  dataProcessamento?: string;
  /** Mensagem de erro se rejeitado */
  mensagemErro?: string;
  /** URL do comprovante PDF/IMG */
  urlComprovante?: string;
  /** Últimos 4 dígitos do cartão (se aplicável) */
  ultimos4Digitos?: string;
  /** Bandeira do cartão (visa, mastercard, etc.) */
  bandeiraCartao?: string;
  /** Gateway usado: stripe, bizum, efectivo, etc. */
  gateway?: string;
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
  customerId: string | null;
  itens: ItemPedido[];
  origem?: OrigemPedido;
  nomeUsuario?: string | null;
  /** Dados do pagamento — mock por enquanto, preparado para real */
  comprovantePagamento?: ComprovantePagamento;
}

// ─── Formato legado de carrinho (deprecated, mantido para compatibilidade) ───
export interface CarrinhoItem {
  categoria: Categoria;
  sabores: Sabor[];
  toppings: Topping[];
}

// ─── Formato novo de carrinho (produtos reais) ───
export interface CartItem {
  product: Product;
  quantity: number;
  selections?: Record<string, OpcaoPersonalizacao[]>;
  unitPrice: number;
  notes?: string;
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
  productCategories: ProductCategory[];
  products: Product[];
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
  flavorRef?: string; // referência ao id do sabor no estoque
}

// Produto personalizável (ex: Açaí, Helado à carta)
export interface ProdutoPersonalizavel {
  id: string;
  nome: LocalizedText;
  descricao?: LocalizedText;
  badge?: LocalizedText;
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

// ─── Tipos para o banco de dados (mapeamento do Supabase) ───

export interface ProductCategory {
  id: string;
  nome: LocalizedText;
  emoji: string;
  displayOrder: number;
  active: boolean;
}

export interface Product {
  id: string;
  nome: LocalizedText;
  descricao?: LocalizedText;
  badge?: LocalizedText;
  preco?: number;
  precoBase?: number;
  imagem: string;
  categoriaId: string;
  emEstoque: boolean;
  alergenos: AvisoAlergeno[];
  isPersonalizavel: boolean;
  opcoes: {
    tamanhos?: OpcaoPersonalizacao[];
    sabores?: OpcaoPersonalizacao[];
    toppings?: OpcaoPersonalizacao[];
    frutas?: OpcaoPersonalizacao[];
    extras?: OpcaoPersonalizacao[];
  };
  limites?: {
    maxToppings?: number;
    maxFrutas?: number;
    maxSabores?: number;
  };
  active: boolean;
  displayOrder: number;
}

// Helper: converte Produto (TipoScript local) para Product (formato Supabase)
export function normalizeProdutoToProduct(p: Produto): Product {
  if (isProdutoPersonalizavel(p)) {
    return {
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      badge: p.badge,
      precoBase: p.precoBase,
      imagem: p.imagem,
      categoriaId: p.categoria,
      emEstoque: p.emEstoque,
      alergenos: p.alergenos,
      isPersonalizavel: true,
      opcoes: p.opcoes,
      limites: p.limites,
      active: true,
      displayOrder: 0,
    };
  }
  return {
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    badge: p.badge,
    preco: p.preco,
    imagem: p.imagem,
    categoriaId: p.categoria,
    emEstoque: p.emEstoque,
    alergenos: p.alergenos,
    isPersonalizavel: false,
    opcoes: {},
    active: true,
    displayOrder: 0,
  };
}

// Helper: converte Product (Supabase) para Produto (TipoScript local)
export function normalizeProductToProduto(p: Product): Produto {
  if (p.isPersonalizavel) {
    return {
      id: p.id,
      nome: p.nome,
      descricao: p.descricao,
      badge: p.badge,
      precoBase: p.precoBase ?? 0,
      imagem: p.imagem,
      categoria: p.categoriaId as ProdutoCategoria,
      emEstoque: p.emEstoque,
      alergenos: p.alergenos,
      opcoes: p.opcoes,
      limites: p.limites,
    };
  }
  return {
    id: p.id,
    nome: p.nome,
    descricao: p.descricao,
    badge: p.badge,
    preco: p.preco ?? 0,
    imagem: p.imagem,
    categoria: p.categoriaId as ProdutoCategoria,
    emEstoque: p.emEstoque,
    alergenos: p.alergenos,
  };
}

// Nota: Modelo kiosk (Categoria, Sabor, Topping) definido no topo do arquivo
