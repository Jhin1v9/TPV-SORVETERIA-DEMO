import type { ProdutoFixo, ProdutoPersonalizavel, Produto, ProdutoCategoria, OpcaoPersonalizacao, LocalizedText } from '../types';

// Helper para criar textos localizados com fallback
function t(
  es: string,
  ca?: string,
  pt?: string,
  en?: string
): LocalizedText {
  return {
    es,
    ca: ca || es,
    pt: pt || es,
    en: en || es,
  };
}

// ===========================
// CATEGORIAS DO CARDÁPIO REAL
// ===========================
export const categoriasCardapio: { id: ProdutoCategoria; nome: LocalizedText; emoji: string; ordem: number }[] = [
  { id: 'copas', nome: t('Copas', 'Copes', 'Copas', 'Cups'), emoji: '🍨', ordem: 1 },
  { id: 'gofres', nome: t('Gofres', 'Gofres', 'Waffles', 'Waffles'), emoji: '🧇', ordem: 2 },
  { id: 'souffle', nome: t('Soufflé', 'Soufflé', 'Soufflé', 'Soufflé'), emoji: '🍫', ordem: 3 },
  { id: 'banana-split', nome: t('Banana Split', 'Banana Split', 'Banana Split', 'Banana Split'), emoji: '🍌', ordem: 4 },
  { id: 'acai', nome: t('Açaí', 'Açaí', 'Açaí', 'Açaí'), emoji: '🫐', ordem: 5 },
  { id: 'helados', nome: t('Helados', 'Gelats', 'Sorvetes', 'Ice Cream'), emoji: '🍦', ordem: 6 },
  { id: 'conos', nome: t('Conos', 'Cucurutxos', 'Cones', 'Cones'), emoji: '🍦', ordem: 7 },
  { id: 'granizados', nome: t('Granizados', 'Granissats', 'Granizados', 'Slushies'), emoji: '🥤', ordem: 8 },
  { id: 'batidos', nome: t('Batidos', 'Batuts', 'Batidos', 'Shakes'), emoji: '🥛', ordem: 9 },
  { id: 'orxata', nome: t('Orxata / Llet Merengada', 'Orxata / Llet Merengada', 'Orxata / Leite Merengado', 'Horchata / Merengada'), emoji: '🥛', ordem: 10 },
  { id: 'cafes', nome: t('Cafés y Bebidas', 'Cafès i Begudes', 'Cafés e Bebidas', 'Coffee & Drinks'), emoji: '☕', ordem: 11 },
  { id: 'tarrinas-nata', nome: t('Tarrinas Nata', 'Tarrines Nata', 'Potes de Chantilly', 'Cream Tubs'), emoji: '🥣', ordem: 12 },
  { id: 'para-llevar', nome: t('Para Llevar', 'Per Emportar', 'Para Levar', 'Take Away'), emoji: '📦', ordem: 13 },
];

// ===========================
// OPÇÕES COMPARTILHADAS
// ===========================

export const opcoesTamanhoAcai: OpcaoPersonalizacao[] = [
  { id: 'acai-petit', nome: t('Petit — 2 toppings + 1 fruta', 'Petit — 2 toppings + 1 fruita', 'Pequeno — 2 toppings + 1 fruta', 'Small — 2 toppings + 1 fruit'), preco: 7.90, tipo: 'tamanho' },
  { id: 'acai-mitja', nome: t('Mitjà — 3 toppings + 2 frutas', 'Mitjà — 3 toppings + 2 fruites', 'Médio — 3 toppings + 2 frutas', 'Medium — 3 toppings + 2 fruits'), preco: 8.90, tipo: 'tamanho' },
  { id: 'acai-gran', nome: t('Gran — 4 toppings + 3 frutas', 'Gran — 4 toppings + 3 fruites', 'Grande — 4 toppings + 3 frutas', 'Large — 4 toppings + 3 fruits'), preco: 10.90, tipo: 'tamanho' },
];

export const opcoesToppingAcai: OpcaoPersonalizacao[] = [
  { id: 'top-granola', nome: t('Granola', 'Granola', 'Granola', 'Granola'), preco: 0, tipo: 'topping', emoji: '🌾' },
  { id: 'top-leche-condensada', nome: t('Leche Condensada', 'Llet Condensada', 'Leite Condensado', 'Condensed Milk'), preco: 0, tipo: 'topping', emoji: '🥛' },
  { id: 'top-dulce-leche', nome: t('Dulce de Leche', 'Dolç de Llet', 'Doce de Leite', 'Dulce de Leche'), preco: 0, tipo: 'topping', emoji: '🍯' },
  { id: 'top-lacasitos', nome: t('Lacasitos', 'Lacasitos', 'Lacasitos', 'Lacasitos'), preco: 0, tipo: 'topping', emoji: '🍬' },
  { id: 'top-leche-polvos', nome: t('Leche en Polvo', 'Llet en Pols', 'Leite em Pó', 'Milk Powder'), preco: 0, tipo: 'topping', emoji: '🥄' },
];

export const opcoesFrutaAcai: OpcaoPersonalizacao[] = [
  { id: 'fruta-maduixa', nome: t('Fresa', 'Maduixa', 'Morango', 'Strawberry'), preco: 0, tipo: 'fruta', emoji: '🍓' },
  { id: 'fruta-kiwi', nome: t('Kiwi', 'Kiwi', 'Kiwi', 'Kiwi'), preco: 0, tipo: 'fruta', emoji: '🥝' },
  { id: 'fruta-platan', nome: t('Plátano', 'Plàtan', 'Banana', 'Banana'), preco: 0, tipo: 'fruta', emoji: '🍌' },
  { id: 'fruta-pressec', nome: t('Melocotón', 'Préssec', 'Pêssego', 'Peach'), preco: 0, tipo: 'fruta', emoji: '🍑' },
];

export const opcoesExtraAcai: OpcaoPersonalizacao[] = [
  { id: 'extra-nutella', nome: t('Nutella', 'Nutela', 'Nutella', 'Nutella'), preco: 1.00, tipo: 'extra', emoji: '🌰' },
  { id: 'extra-crema-pistacho', nome: t('Crema de Pistacho', 'Crema de Festuc', 'Creme de Pistache', 'Pistachio Cream'), preco: 1.00, tipo: 'extra', emoji: '🟢' },
];

export const opcoesTamanhoHelado: OpcaoPersonalizacao[] = [
  { id: 'helado-petit', nome: t('Petit — 1 sabor / 1 bola', 'Petit — 1 sabor / 1 bola', 'Pequeno — 1 sabor / 1 bola', 'Small — 1 flavor / 1 scoop'), preco: 3.00, tipo: 'tamanho' },
  { id: 'helado-mitja', nome: t('Mitjà — 2 sabores / 2 bolas', 'Mitjà — 2 sabors / 2 boles', 'Médio — 2 sabores / 2 bolas', 'Medium — 2 flavors / 2 scoops'), preco: 4.00, tipo: 'tamanho' },
  { id: 'helado-gran', nome: t('Gran — 3 sabores / 3 bolas', 'Gran — 3 sabors / 3 boles', 'Grande — 3 sabores / 3 bolas', 'Large — 3 flavors / 3 scoops'), preco: 5.30, tipo: 'tamanho' },
];

export const opcoesTamanhoCono: OpcaoPersonalizacao[] = [
  { id: 'cono-petit-1', nome: t('Petit Xocolata — 1 bola', 'Petit Xocolata — 1 bola', 'Pequeno Chocolate — 1 bola', 'Small Chocolate — 1 scoop'), preco: 3.50, tipo: 'tamanho' },
  { id: 'cono-petit-2', nome: t('Petit Xocolata — 2 bolas', 'Petit Xocolata — 2 boles', 'Pequeno Chocolate — 2 bolas', 'Small Chocolate — 2 scoops'), preco: 4.50, tipo: 'tamanho' },
  { id: 'cono-mitja-1', nome: t('Mitjà Ametllat — 1 bola', 'Mitjà Ametllat — 1 bola', 'Médio Amêndoa — 1 bola', 'Medium Almond — 1 scoop'), preco: 4.20, tipo: 'tamanho' },
  { id: 'cono-mitja-2', nome: t('Mitjà Ametllat — 2 bolas', 'Mitjà Ametllat — 2 boles', 'Médio Amêndoa — 2 bolas', 'Medium Almond — 2 scoops'), preco: 5.20, tipo: 'tamanho' },
  { id: 'cono-gran-2', nome: t('Gran Artesano — 2 bolas', 'Gran Artesà — 2 boles', 'Grande Artesanal — 2 bolas', 'Large Artisan — 2 scoops'), preco: 5.90, tipo: 'tamanho' },
];

export const opcoesSaborHelado: OpcaoPersonalizacao[] = [
  { id: 'sab-vainilla', nome: t('Vainilla', 'Vainilla', 'Baunilha', 'Vanilla'), preco: 0, tipo: 'sabor' },
  { id: 'sab-chocolate', nome: t('Chocolate', 'Xocolata', 'Chocolate', 'Chocolate'), preco: 0, tipo: 'sabor' },
  { id: 'sab-fresa', nome: t('Fresa', 'Maduixa', 'Morango', 'Strawberry'), preco: 0, tipo: 'sabor' },
  { id: 'sab-coco', nome: t('Coco', 'Coco', 'Coco', 'Coconut'), preco: 0, tipo: 'sabor' },
  { id: 'sab-menta', nome: t('Menta', 'Menta', 'Menta', 'Mint'), preco: 0, tipo: 'sabor' },
  { id: 'sab-cafe', nome: t('Café', 'Cafè', 'Café', 'Coffee'), preco: 0, tipo: 'sabor' },
  { id: 'sab-limon', nome: t('Limón', 'Llimona', 'Limão', 'Lemon'), preco: 0, tipo: 'sabor' },
  { id: 'sab-pistacho', nome: t('Pistacho', 'Festuc', 'Pistache', 'Pistachio'), preco: 0.50, tipo: 'sabor' },
  { id: 'sab-tiramisu', nome: t('Tiramisú', 'Tiramisú', 'Tiramisù', 'Tiramisu'), preco: 0.50, tipo: 'sabor' },
  { id: 'sab-oreo', nome: t('Oreo', 'Oreo', 'Oreo', 'Oreo'), preco: 0.50, tipo: 'sabor' },
  { id: 'sab-nata', nome: t('Nata', 'Nata', 'Chantilly', 'Cream'), preco: 0, tipo: 'sabor' },
  { id: 'sab-yogurt', nome: t('Yogurt', 'Iogurt', 'Iogurte', 'Yogurt'), preco: 0, tipo: 'sabor' },
];

export const opcoesTamanhoGofre: OpcaoPersonalizacao[] = [
  { id: 'gofre-solo', nome: t('Solo', 'Solo', 'Solo', 'Plain'), preco: 4.90, tipo: 'tamanho' },
  { id: 'gofre-sirope', nome: t('Con Sirope', 'Amb Xarop', 'Com Calda', 'With Syrup'), preco: 5.20, tipo: 'tamanho' },
  { id: 'gofre-1b', nome: t('Con 1 bola', 'Amb 1 bola', 'Com 1 bola', 'With 1 scoop'), preco: 5.90, tipo: 'tamanho' },
  { id: 'gofre-2b', nome: t('Con 2 bolas', 'Amb 2 boles', 'Com 2 bolas', 'With 2 scoops'), preco: 6.80, tipo: 'tamanho' },
  { id: 'gofre-1b-1f', nome: t('1 bola + 1 fruta', '1 bola + 1 fruita', '1 bola + 1 fruta', '1 scoop + 1 fruit'), preco: 6.40, tipo: 'tamanho' },
  { id: 'gofre-1b-2f', nome: t('1 bola + 2 frutas', '1 bola + 2 fruites', '1 bola + 2 frutas', '1 scoop + 2 fruits'), preco: 6.70, tipo: 'tamanho' },
  { id: 'gofre-2b-1f', nome: t('2 bolas + 1 fruta', '2 boles + 1 fruita', '2 bolas + 1 fruta', '2 scoops + 1 fruit'), preco: 7.10, tipo: 'tamanho' },
  { id: 'gofre-2b-2f', nome: t('2 bolas + 2 frutas', '2 boles + 2 fruites', '2 bolas + 2 frutas', '2 scoops + 2 fruits'), preco: 7.60, tipo: 'tamanho' },
  { id: 'gofre-1f', nome: t('1 fruta', '1 fruita', '1 fruta', '1 fruit'), preco: 5.70, tipo: 'tamanho' },
  { id: 'gofre-2f', nome: t('2 frutas', '2 fruites', '2 frutas', '2 fruits'), preco: 6.20, tipo: 'tamanho' },
];

export const opcoesExtraNata: OpcaoPersonalizacao[] = [
  { id: 'extra-nata', nome: t('Extra de Nata', 'Extra de Nata', 'Extra de Chantilly', 'Extra Cream'), preco: 1.00, tipo: 'extra', emoji: '🥛' },
];

export const opcoesTamanhoBebida: OpcaoPersonalizacao[] = [
  { id: 'beb-petit', nome: t('Pequeño', 'Petit', 'Pequeno', 'Small'), preco: 0, tipo: 'tamanho' },
  { id: 'beb-gran', nome: t('Grande', 'Gran', 'Grande', 'Large'), preco: 0, tipo: 'tamanho' },
];

export const opcoesSaborGranizado: OpcaoPersonalizacao[] = [
  { id: 'gran-limon', nome: t('Limón', 'Llimona', 'Limão', 'Lemon'), preco: 0, tipo: 'sabor' },
  { id: 'gran-fresa', nome: t('Fresa', 'Maduixa', 'Morango', 'Strawberry'), preco: 0, tipo: 'sabor' },
  { id: 'gran-naranja', nome: t('Naranja', 'Taronja', 'Laranja', 'Orange'), preco: 0, tipo: 'sabor' },
  { id: 'gran-cafe', nome: t('Café', 'Cafè', 'Café', 'Coffee'), preco: 0, tipo: 'sabor' },
  { id: 'gran-pina', nome: t('Piña Colada', 'Pinya Colada', 'Piña Colada', 'Piña Colada'), preco: 0, tipo: 'sabor' },
  { id: 'gran-manzana-kiwi', nome: t('Manzana-Kiwi', 'Poma-Kiwi', 'Maçã-Kiwi', 'Apple-Kiwi'), preco: 0, tipo: 'sabor' },
  { id: 'gran-maracuya', nome: t('Maracuyá', 'Maracujà', 'Maracujá', 'Passion Fruit'), preco: 0, tipo: 'sabor' },
];

export const opcoesTamanhoBatido: OpcaoPersonalizacao[] = [
  { id: 'bat-petit', nome: t('Pequeño', 'Petit', 'Pequeno', 'Small'), preco: 5.80, tipo: 'tamanho' },
  { id: 'bat-gran', nome: t('Grande', 'Gran', 'Grande', 'Large'), preco: 6.80, tipo: 'tamanho' },
];

export const opcoesExtraBatido: OpcaoPersonalizacao[] = [
  { id: 'bat-1b', nome: t('+1 bola de helado', '+1 bola de gelat', '+1 bola de sorvete', '+1 scoop'), preco: 0.80, tipo: 'extra' },
  { id: 'bat-2b', nome: t('+2 bolas de helado', '+2 boles de gelat', '+2 bolas de sorvete', '+2 scoops'), preco: 1.50, tipo: 'extra' },
];

export const opcoesTamanhoOrxata: OpcaoPersonalizacao[] = [
  { id: 'orx-petit', nome: t('Pequeño', 'Petit', 'Pequeno', 'Small'), preco: 4.20, tipo: 'tamanho' },
  { id: 'orx-gran', nome: t('Grande', 'Gran', 'Grande', 'Large'), preco: 5.60, tipo: 'tamanho' },
];

export const opcoesTamanhoTarrinaNata: OpcaoPersonalizacao[] = [
  { id: 'tn-peq', nome: t('Pequeña', 'Petita', 'Pequena', 'Small'), preco: 1.00, tipo: 'tamanho' },
  { id: 'tn-med', nome: t('Mediana', 'Mitjana', 'Média', 'Medium'), preco: 2.00, tipo: 'tamanho' },
  { id: 'tn-gran', nome: t('Grande', 'Gran', 'Grande', 'Large'), preco: 3.00, tipo: 'tamanho' },
  { id: 'tn-500', nome: t('½ litro', '½ litre', '½ litro', '½ liter'), preco: 5.00, tipo: 'tamanho' },
  { id: 'tn-1l', nome: t('1 litro', '1 litre', '1 litro', '1 liter'), preco: 8.00, tipo: 'tamanho' },
];

// ===========================
// PRODUTOS FIXOS
// ===========================

export const produtosFixos: ProdutoFixo[] = [
  // COPAS
  {
    id: 'copa-bahia',
    nome: t('Copa Bahia', 'Copa Bahia', 'Copa Bahia', 'Bahia Cup'),
    descricao: t('Helado de vainilla, fresa, crocanti, sirope de fresa y galleta', 'Gelat de vainilla, maduixa, crocanti, xarop de maduixa i galeta', 'Sorvete de baunilha, morango, crocante, calda de morango e biscoito', 'Vanilla, strawberry, crunchy, strawberry syrup and cookie'),
    preco: 8.10,
    imagem: '/assets/img/Copas/copa bahia.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }, { alergeno: 'ovos', nivel: 'pode_conter' }],
    categoria: 'copas',
    emEstoque: true,
  },
  {
    id: 'copa-oreo',
    nome: t('Copa Oreo', 'Copa Oreo', 'Copa Oreo', 'Oreo Cup'),
    descricao: t('2 bolas de helado Oreo, nata montada, sirope y galletas Oreo', '2 boles de gelat Oreo, nata muntada, xarop i galetes Oreo', '2 bolas de sorvete Oreo, chantilly, calda e biscoitos Oreo', '2 scoops Oreo ice cream, whipped cream, syrup and Oreo cookies'),
    preco: 9.10,
    imagem: '/assets/img/Copas/copa oreo.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }, { alergeno: 'ovos', nivel: 'pode_conter' }],
    categoria: 'copas',
    emEstoque: true,
  },
  {
    id: 'copa-sao-paulo',
    nome: t('Copa Sao Paulo', 'Copa Sao Paulo', 'Copa Sao Paulo', 'Sao Paulo Cup'),
    descricao: t('3 bolas de helado a su elección, con nata montada, crocanti, sirope y galleta', '3 boles de gelat a la seva elecció, amb nata muntada, crocanti, xarop i galeta', '3 bolas de sorvete à escolha, com chantilly, crocante, calda e biscoito', '3 scoops of your choice, with whipped cream, crunchy, syrup and cookie'),
    preco: 9.30,
    imagem: '/assets/img/Copas/Copa Sao Paulo.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }, { alergeno: 'ovos', nivel: 'pode_conter' }],
    categoria: 'copas',
    emEstoque: true,
  },
  {
    id: 'copa-caracolino',
    nome: t('Copa Caracolino', 'Copa Caracolino', 'Copa Caracolino', 'Caracolino Cup'),
    descricao: t('Helado de chocolate y fresa silvestre, nata montada, sirope de fresa y galleta', 'Gelat de xocolata i maduixa silvestre, nata muntada, xarop de maduixa i galeta', 'Sorvete de chocolate e morango silvestre, chantilly, calda de morango e biscoito', 'Chocolate and wild strawberry ice cream, whipped cream, strawberry syrup and cookie'),
    preco: 8.30,
    imagem: '/assets/img/Copas/Copa Caracolino.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }, { alergeno: 'ovos', nivel: 'pode_conter' }],
    categoria: 'copas',
    emEstoque: true,
  },
  {
    id: 'copa-cancun',
    nome: t('Copa Cancún', 'Copa Cancún', 'Copa Cancún', 'Cancun Cup'),
    descricao: t('Helado de coco, limón, fresa, yogurt con amarenas, trozos de melocotón, crocanti, sirope de fresa y galleta', 'Gelat de coco, llimona, maduixa, iogurt amb amarenes, trossos de préssec, crocanti, xarop de maduixa i galeta', 'Sorvete de coco, limão, morango, iogurte com amarena, pedaços de pêssego, crocante, calda de morango e biscoito', 'Coconut, lemon, strawberry, yogurt with amarena, peach chunks, crunchy, strawberry syrup and cookie'),
    preco: 9.30,
    imagem: '/assets/img/Copas/Copa Cancún.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }, { alergeno: 'ovos', nivel: 'pode_conter' }],
    categoria: 'copas',
    emEstoque: true,
  },
  {
    id: 'copa-4-estaciones',
    nome: t('Copa 4 Estaciones', 'Copa 4 Estacions', 'Copa 4 Estações', '4 Seasons Cup'),
    descricao: t('4 bolas de helado a su elección y galleta', '4 boles de gelat a la seva elecció i galeta', '4 bolas de sorvete à escolha e biscoito', '4 scoops of your choice and cookie'),
    preco: 8.50,
    imagem: '/assets/img/Copas/Copa Sao Paulo.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }, { alergeno: 'ovos', nivel: 'pode_conter' }],
    categoria: 'copas',
    emEstoque: true,
  },
  {
    id: 'copa-tropicale',
    nome: t('Copa Tropicale', 'Copa Tropicale', 'Copa Tropicale', 'Tropicale Cup'),
    descricao: t('Helado de vainilla, fresa, chocolate y manzana verde. Combinación de frutas variadas con nata montada, crocanti, sirope y galleta', 'Gelat de vainilla, maduixa, xocolata i poma verda. Combinació de fruites variades amb nata muntada, crocanti, xarop i galeta', 'Sorvete de baunilha, morango, chocolate e maçã verde. Combinação de frutas variadas com chantilly, crocante, calda e biscoito', 'Vanilla, strawberry, chocolate and green apple ice cream. Mixed fruits with whipped cream, crunchy, syrup and cookie'),
    preco: 15.30,
    imagem: '/assets/img/Copas/Copa tropicale.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }, { alergeno: 'ovos', nivel: 'pode_conter' }],
    categoria: 'copas',
    emEstoque: true,
    badge: t('Especialidad', 'Especialitat', 'Especialidade', 'Specialty'),
  },
  {
    id: 'copa-frutas',
    nome: t('Copa Frutas Variadas', 'Copa Fruites Variades', 'Copa Frutas Variadas', 'Mixed Fruits Cup'),
    descricao: t('Helado de frutas variadas con nata montada y galleta', 'Gelat de fruites variades amb nata muntada i galeta', 'Sorvete de frutas variadas com chantilly e biscoito', 'Mixed fruit ice cream with whipped cream and cookie'),
    preco: 8.40,
    imagem: '/assets/img/Copas/copa bahia.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }, { alergeno: 'ovos', nivel: 'pode_conter' }],
    categoria: 'copas',
    emEstoque: true,
  },
  {
    id: 'copa-fresas-nata',
    nome: t('Copa Fresas + Nata + 1 Bola', 'Copa Maduixes + Nata + 1 Bola', 'Copa Morangos + Chantilly + 1 Bola', 'Strawberry + Cream + 1 Scoop Cup'),
    descricao: t('Fresas con nata montada y 1 bola de helado a elegir', 'Maduixes amb nata muntada i 1 bola de gelat a triar', 'Morangos com chantilly e 1 bola de sorvete à escolha', 'Strawberries with whipped cream and 1 scoop of your choice'),
    preco: 8.00,
    imagem: '/assets/img/Copas/Copa Sao Paulo.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }, { alergeno: 'ovos', nivel: 'pode_conter' }],
    categoria: 'copas',
    emEstoque: true,
  },

  // SOUFFLÉ
  {
    id: 'souffle-solo',
    nome: t('Soufflé Solo', 'Soufflé Solo', 'Soufflé Solo', 'Solo Soufflé'),
    descricao: t('Soufflé de chocolate fundido', 'Soufflé de xocolata fosa', 'Soufflé de chocolate derretido', 'Molten chocolate soufflé'),
    preco: 7.10,
    imagem: '/assets/img/Soutfflés/Soufflé solo.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'ovos', nivel: 'contem' }, { alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'soja', nivel: 'pode_conter' }],
    categoria: 'souffle',
    emEstoque: true,
  },
  {
    id: 'souffle-1b',
    nome: t('Soufflé + 1 Bola', 'Soufflé + 1 Bola', 'Soufflé + 1 Bola', 'Soufflé + 1 Scoop'),
    descricao: t('Soufflé de chocolate fundido con 1 bola de helado', 'Soufflé de xocolata fosa amb 1 bola de gelat', 'Soufflé de chocolate derretido com 1 bola de sorvete', 'Molten chocolate soufflé with 1 scoop'),
    preco: 8.80,
    imagem: '/assets/img/Soutfflés/Soufflé 1 bola.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'ovos', nivel: 'contem' }, { alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'soja', nivel: 'pode_conter' }],
    categoria: 'souffle',
    emEstoque: true,
  },
  {
    id: 'souffle-2b',
    nome: t('Soufflé + 2 Bolas', 'Soufflé + 2 Boles', 'Soufflé + 2 Bolas', 'Soufflé + 2 Scoops'),
    descricao: t('Soufflé de chocolate fundido con 2 bolas de helado', 'Soufflé de xocolata fosa amb 2 boles de gelat', 'Soufflé de chocolate derretido com 2 bolas de sorvete', 'Molten chocolate soufflé with 2 scoops'),
    preco: 9.50,
    imagem: '/assets/img/Soutfflés/Soufflé 2 bolas.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'ovos', nivel: 'contem' }, { alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'soja', nivel: 'pode_conter' }],
    categoria: 'souffle',
    emEstoque: true,
  },

  // BANANA SPLIT
  {
    id: 'banana-split',
    nome: t('Banana Split', 'Banana Split', 'Banana Split', 'Banana Split'),
    descricao: t('Helado de fresa, chocolate y vainilla, plátano natural, nata montada, sirope de fresa, sirope de chocolate y galletas', 'Gelat de maduixa, xocolata i vainilla, plàtan natural, nata muntada, xarop de maduixa, xarop de xocolata i galetes', 'Sorvete de morango, chocolate e baunilha, banana natural, chantilly, calda de morango, calda de chocolate e biscoitos', 'Strawberry, chocolate and vanilla ice cream, natural banana, whipped cream, strawberry syrup, chocolate syrup and cookies'),
    preco: 12.30,
    imagem: '/assets/img/Banana split/Banana.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }],
    categoria: 'banana-split',
    emEstoque: true,
  },

  // CAFÉS Y BEBIDAS
  { id: 'cafe', nome: t('Café', 'Cafè', 'Café', 'Coffee'), preco: 1.80, imagem: '/assets/produtos/espresso.jpg', alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }], categoria: 'cafes', emEstoque: true },
  { id: 'cafe-largo', nome: t('Café Largo', 'Cafè Llarg', 'Café Longo', 'Long Coffee'), preco: 1.90, imagem: '/assets/produtos/americano.jpg', alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }], categoria: 'cafes', emEstoque: true },
  { id: 'cafe-hielo', nome: t('Café con Hielo', 'Cafè amb Gel', 'Café com Gelo', 'Iced Coffee'), preco: 2.30, imagem: '/assets/produtos/cafe-helado.jpg', alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }], categoria: 'cafes', emEstoque: true },
  { id: 'cafe-leche', nome: t('Café con Leche', 'Cafè amb Llet', 'Café com Leite', 'Coffee with Milk'), preco: 2.00, imagem: '/assets/produtos/cafe-leche.jpg', alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }], categoria: 'cafes', emEstoque: true },
  { id: 'cafe-leche-hielo', nome: t('Café Leche + Hielo', 'Cafè Llet + Gel', 'Café Leite + Gelo', 'Iced Latte'), preco: 2.40, imagem: '/assets/produtos/cafe-helado.jpg', alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }], categoria: 'cafes', emEstoque: true },
  { id: 'cortado', nome: t('Cortado', 'Cortat', 'Cortado', 'Cortado'), preco: 1.90, imagem: '/assets/produtos/cortado.jpg', alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }], categoria: 'cafes', emEstoque: true },
  { id: 'cortado-hielo', nome: t('Cortado + Hielo', 'Cortat + Gel', 'Cortado + Gelo', 'Iced Cortado'), preco: 2.30, imagem: '/assets/produtos/cafe-helado.jpg', alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }], categoria: 'cafes', emEstoque: true },
  { id: 'americano', nome: t('Americano', 'Americà', 'Americano', 'Americano'), preco: 2.10, imagem: '/assets/produtos/americano.jpg', alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }], categoria: 'cafes', emEstoque: true },
  { id: 'americano-hielo', nome: t('Americano + Hielo', 'Americà + Gel', 'Americano + Gelo', 'Iced Americano'), preco: 2.50, imagem: '/assets/produtos/cafe-helado.jpg', alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }], categoria: 'cafes', emEstoque: true },
  { id: 'capuccino', nome: t('Capuccino', 'Caputxino', 'Capuccino', 'Cappuccino'), preco: 2.80, imagem: '/assets/produtos/capuccino.jpg', alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }], categoria: 'cafes', emEstoque: true },
  { id: 'cafe-helado', nome: t('Café + Helado', 'Cafè + Gelat', 'Café + Sorvete', 'Coffee + Ice Cream'), preco: 2.90, imagem: '/assets/produtos/cafe-helado.jpg', alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }], categoria: 'cafes', emEstoque: true },
  { id: 'te', nome: t('Té', 'Te', 'Chá', 'Tea'), preco: 2.00, imagem: '/assets/produtos/te.jpg', alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }], categoria: 'cafes', emEstoque: true },
  { id: 'te-hielo', nome: t('Té + Hielo', 'Te + Gel', 'Chá + Gelo', 'Iced Tea'), preco: 2.50, imagem: '/assets/produtos/nestea.jpg', alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }], categoria: 'cafes', emEstoque: true },
  { id: 'cacaolat', nome: t('Cacaolat', 'Cacaolat', 'Cacaolat', 'Chocolate Milk'), preco: 2.20, imagem: '/assets/produtos/cacaolat.jpg', alergenos: [{ alergeno: 'leite', nivel: 'contem' }], categoria: 'cafes', emEstoque: true },
  { id: 'agua', nome: t('Agua', 'Aigua', 'Água', 'Water'), preco: 1.30, imagem: '/assets/produtos/agua.jpg', alergenos: [], categoria: 'cafes', emEstoque: true },
  { id: 'agua-gas', nome: t('Agua con Gas', 'Aigua amb Gas', 'Água com Gás', 'Sparkling Water'), preco: 2.30, imagem: '/assets/produtos/agua-gas.jpg', alergenos: [], categoria: 'cafes', emEstoque: true },
  { id: 'zumo', nome: t('Zumo', 'Suc', 'Suco', 'Juice'), preco: 2.00, imagem: '/assets/produtos/zumo.jpg', alergenos: [], categoria: 'cafes', emEstoque: true },
  { id: 'refresco', nome: t('Refresco', 'Refresc', 'Refrigerante', 'Soft Drink'), preco: 2.20, imagem: '/assets/produtos/refresco.jpg', alergenos: [], categoria: 'cafes', emEstoque: true },
  { id: 'nestea', nome: t('Nestea', 'Nestea', 'Nestea', 'Nestea'), preco: 2.40, imagem: '/assets/produtos/nestea.jpg', alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }], categoria: 'cafes', emEstoque: true },
];

// ===========================
// PRODUTOS PERSONALIZÁVEIS
// ===========================

export const produtosPersonalizaveis: ProdutoPersonalizavel[] = [
  // AÇAÍ
  {
    id: 'acai',
    nome: t('Açaí', 'Açaí', 'Açaí', 'Açaí'),
    descricao: t('Açaí con toppings y frutas a elegir', 'Açaí amb toppings i fruites a triar', 'Açaí com toppings e frutas à escolha', 'Açaí with toppings and fruits of your choice'),
    precoBase: 7.90,
    imagem: '/assets/img/Açai/copo mediano.png',
    alergenos: [{ alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }, { alergeno: 'leite', nivel: 'pode_conter' }, { alergeno: 'gluten', nivel: 'pode_conter' }],
    categoria: 'acai',
    emEstoque: true,
    opcoes: {
      tamanhos: opcoesTamanhoAcai,
      toppings: opcoesToppingAcai,
      frutas: opcoesFrutaAcai,
      extras: opcoesExtraAcai,
    },
    limites: { maxToppings: 4, maxFrutas: 3 },
  },

  // HELADOS À CARTA (TERRINAS)
  {
    id: 'helado-terra',
    nome: t('Helado en Terrina', 'Gelat en Terrina', 'Sorvete no Pote', 'Ice Cream Tub'),
    descricao: t('Helado artesanal en terrina. Elige tamaño y sabores.', 'Gelat artesà en terrina. Tria mida i sabors.', 'Sorvete artesanal no pote. Escolha o tamanho e os sabores.', 'Artisan ice cream in tub. Choose size and flavors.'),
    precoBase: 3.00,
    imagem: '/assets/img/Tarrina/2 sabores.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'soja', nivel: 'pode_conter' }, { alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }],
    categoria: 'helados',
    emEstoque: true,
    opcoes: {
      tamanhos: opcoesTamanhoHelado,
      sabores: opcoesSaborHelado,
      extras: opcoesExtraNata,
    },
    limites: { maxSabores: 3 },
  },

  // CONOS
  {
    id: 'cono',
    nome: t('Cono', 'Cucurutxo', 'Cone', 'Cone'),
    descricao: t('Cono artesanal con helado a elegir', 'Cucurutxo artesà amb gelat a triar', 'Cone artesanal com sorvete à escolha', 'Artisan cone with ice cream of your choice'),
    precoBase: 3.50,
    imagem: '/assets/img/Conos/Cono Ametllat/Blanco/1sabor.jpg',
    alergenos: [{ alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'leite', nivel: 'contem' }, { alergeno: 'ovos', nivel: 'pode_conter' }, { alergeno: 'soja', nivel: 'pode_conter' }],
    categoria: 'conos',
    emEstoque: true,
    opcoes: {
      tamanhos: opcoesTamanhoCono,
      sabores: opcoesSaborHelado,
      extras: opcoesExtraNata,
    },
    limites: { maxSabores: 2 },
  },

  // GOFRES
  {
    id: 'gofre',
    nome: t('Gofre', 'Gofre', 'Waffle', 'Waffle'),
    descricao: t('Gofre con helado, frutas y sirope a elegir', 'Gofre amb gelat, fruites i xarop a triar', 'Waffle com sorvete, frutas e calda à escolha', 'Waffle with ice cream, fruits and syrup of your choice'),
    precoBase: 4.90,
    imagem: '/assets/img/Conos/Cono Ametllat/Blanco/2sabores.jpg',
    alergenos: [{ alergeno: 'gluten', nivel: 'contem' }, { alergeno: 'leite', nivel: 'contem' }, { alergeno: 'ovos', nivel: 'contem' }, { alergeno: 'soja', nivel: 'pode_conter' }],
    categoria: 'gofres',
    emEstoque: true,
    opcoes: {
      tamanhos: opcoesTamanhoGofre,
      sabores: opcoesSaborHelado,
      frutas: opcoesFrutaAcai,
      extras: opcoesExtraNata,
    },
  },

  // GRANIZADOS
  {
    id: 'granizado',
    nome: t('Granizado', 'Granissat', 'Granizado', 'Slushie'),
    descricao: t('Granizado natural. Elige sabor y tamaño.', 'Granissat natural. Tria sabor i mida.', 'Granizado natural. Escolha o sabor e o tamanho.', 'Natural slushie. Choose flavor and size.'),
    precoBase: 4.20,
    imagem: '/assets/img/Granizado/Granizado Natural.jpg',
    alergenos: [{ alergeno: 'sulfitos', nivel: 'pode_conter' }],
    categoria: 'granizados',
    emEstoque: true,
    opcoes: {
      tamanhos: [
        { id: 'gran-petit', nome: t('Pequeño', 'Petit', 'Pequeno', 'Small'), preco: 4.20, tipo: 'tamanho' },
        { id: 'gran-gran', nome: t('Grande', 'Gran', 'Grande', 'Large'), preco: 5.60, tipo: 'tamanho' },
      ],
      sabores: opcoesSaborGranizado,
    },
  },

  // GRANIZADO YOGURT
  {
    id: 'granizado-yogurt',
    nome: t('Granizado Yogurt', 'Granissat Iogurt', 'Granizado Iogurte', 'Yogurt Slushie'),
    descricao: t('Granizado de yogurt natural. Elige sabor y tamaño.', 'Granissat d\'iogurt natural. Tria sabor i mida.', 'Granizado de iogurte natural. Escolha o sabor e o tamanho.', 'Yogurt slushie. Choose flavor and size.'),
    precoBase: 4.80,
    imagem: '/assets/img/Granizado/Granizado Yogurt.jpg',
    alergenos: [{ alergeno: 'sulfitos', nivel: 'pode_conter' }],
    categoria: 'granizados',
    emEstoque: true,
    opcoes: {
      tamanhos: [
        { id: 'gry-petit', nome: t('Pequeño', 'Petit', 'Pequeno', 'Small'), preco: 4.80, tipo: 'tamanho' },
        { id: 'gry-gran', nome: t('Grande', 'Gran', 'Grande', 'Large'), preco: 6.20, tipo: 'tamanho' },
      ],
      sabores: opcoesSaborGranizado,
    },
  },

  // BATIDOS
  {
    id: 'batido',
    nome: t('Batido de Helado', 'Batut de Gelat', 'Batido de Sorvete', 'Milkshake'),
    descricao: t('Batido con helado artesanal. Elige tamaño y extras.', 'Batut amb gelat artesà. Tria mida i extres.', 'Batido com sorvete artesanal. Escolha o tamanho e os extras.', 'Milkshake with artisan ice cream. Choose size and extras.'),
    precoBase: 5.80,
    imagem: '/assets/img/Tarrina/1 sabor.png',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'soja', nivel: 'pode_conter' }, { alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }],
    categoria: 'batidos',
    emEstoque: true,
    opcoes: {
      tamanhos: opcoesTamanhoBatido,
      sabores: opcoesSaborHelado,
      extras: opcoesExtraBatido,
    },
  },

  // ORXATA / LLET MERENGADA
  {
    id: 'orxata',
    nome: t('Orxata de Chufa', 'Orxata de Xufa', 'Orxata de Chufa', 'Horchata'),
    descricao: t('Orxata de chufa tradicional valenciana', 'Orxata de xufa tradicional valenciana', 'Orxata de chufa tradicional valenciana', 'Traditional Valencian horchata'),
    precoBase: 4.20,
    imagem: '/assets/img/Tarrina/1 sabor.png',
    alergenos: [{ alergeno: 'frutos_casca_rija', nivel: 'contem' }],
    categoria: 'orxata',
    emEstoque: true,
    opcoes: {
      tamanhos: opcoesTamanhoOrxata,
    },
  },

  {
    id: 'llet-merengada',
    nome: t('Leche Merengada', 'Llet Merengada', 'Leite Merengado', 'Merengada Milk'),
    descricao: t('Leche merengada tradicional', 'Llet merengada tradicional', 'Leite merengado tradicional', 'Traditional merengada milk'),
    precoBase: 4.20,
    imagem: '/assets/img/Tarrina/1 sabor.png',
    alergenos: [{ alergeno: 'frutos_casca_rija', nivel: 'contem' }],
    categoria: 'orxata',
    emEstoque: true,
    opcoes: {
      tamanhos: opcoesTamanhoOrxata,
    },
  },

  // TARRINAS SOLO NATA
  {
    id: 'tarrina-nata',
    nome: t('Tarrina de Nata', 'Tarrina de Nata', 'Pote de Chantilly', 'Cream Tub'),
    descricao: t('Nata montada para llevar', 'Nata muntada per emportar', 'Chantilly para levar', 'Whipped cream to go'),
    precoBase: 1.00,
    imagem: '/assets/img/Tarrina/1 sabor.png',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }],
    categoria: 'tarrinas-nata',
    emEstoque: true,
    opcoes: {
      tamanhos: opcoesTamanhoTarrinaNata,
    },
  },

  // PARA LLEVAR (TARRINAS VACÍAS / HELADO)
  {
    id: 'tarrina-vacia',
    nome: t('Tarrina Vacía', 'Tarrina Buida', 'Pote Vazio', 'Empty Tub'),
    descricao: t('Tarrina vacía para llevar', 'Tarrina buida per emportar', 'Pote vazio para levar', 'Empty tub to go'),
    precoBase: 0.20,
    imagem: '/assets/img/Tarrina/1 sabor.png',
    alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }, { alergeno: 'gluten', nivel: 'pode_conter' }],
    categoria: 'para-llevar',
    emEstoque: true,
    opcoes: {
      tamanhos: [
        { id: 'tv-peq', nome: t('Pequeña', 'Petita', 'Pequena', 'Small'), preco: 0.20, tipo: 'tamanho' },
        { id: 'tv-med', nome: t('Mediana', 'Mitjana', 'Média', 'Medium'), preco: 0.30, tipo: 'tamanho' },
        { id: 'tv-gran', nome: t('Grande', 'Gran', 'Grande', 'Large'), preco: 0.50, tipo: 'tamanho' },
      ],
    },
  },

  // Para llevar: Granizado / Batido / Orxata (precios diferentes dos para mesa)
  {
    id: 'llevar-granizado',
    nome: t('Granizado Para Llevar', 'Granissat Per Emportar', 'Granizado Para Levar', 'Slushie To Go'),
    descricao: t('Granizado para llevar en vaso', 'Granissat per emportar en got', 'Granizado para levar no copo', 'Slushie to go in cup'),
    precoBase: 3.70,
    imagem: '/assets/img/Granizado/Granizado Natural.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'pode_conter' }, { alergeno: 'gluten', nivel: 'pode_conter' }],
    categoria: 'para-llevar',
    emEstoque: true,
    opcoes: {
      tamanhos: [
        { id: 'llg-p', nome: t('Pequeño', 'Petit', 'Pequeno', 'Small'), preco: 3.70, tipo: 'tamanho' },
        { id: 'llg-m', nome: t('Mediano', 'Mitjà', 'Médio', 'Medium'), preco: 4.70, tipo: 'tamanho' },
        { id: 'llg-g', nome: t('Grande', 'Gran', 'Grande', 'Large'), preco: 5.70, tipo: 'tamanho' },
      ],
      sabores: opcoesSaborGranizado,
    },
  },

  // Para llevar: Potes de Gelado
  {
    id: 'llevar-pote-500ml',
    nome: t('Helado Llevar (½ litro)', 'Gelat Emportar (½ litre)', 'Sorvete Levar (½ litro)', 'Ice Cream To Go (½ liter)'),
    descricao: t('½ litro de helado artesanal para llevar', '½ litre de gelat artesà per emportar', '½ litro de sorvete artesanal para levar', '½ liter of artisan ice cream to go'),
    precoBase: 9.00,
    imagem: '/assets/img/Tarrina/2 sabores.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'soja', nivel: 'pode_conter' }, { alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }],
    categoria: 'para-llevar',
    emEstoque: true,
    opcoes: {
      tamanhos: [
        { id: 'llp-500', nome: t('½ litro (hasta 3 sabores)', '½ litre (fins a 3 sabors)', '½ litro (até 3 sabores)', '½ liter (up to 3 flavors)'), preco: 9.00, tipo: 'tamanho' },
      ],
      sabores: opcoesSaborHelado,
    },
    limites: { maxSabores: 3 },
  },
  {
    id: 'llevar-pote-1l',
    nome: t('Helado Llevar (1 litro)', 'Gelat Emportar (1 litre)', 'Sorvete Levar (1 litro)', 'Ice Cream To Go (1 liter)'),
    descricao: t('1 litro de helado artesanal para llevar', '1 litre de gelat artesà per emportar', '1 litro de sorvete artesanal para levar', '1 liter of artisan ice cream to go'),
    precoBase: 16.00,
    imagem: '/assets/img/Tarrina/3 sabores.jpg',
    alergenos: [{ alergeno: 'leite', nivel: 'contem' }, { alergeno: 'soja', nivel: 'pode_conter' }, { alergeno: 'frutos_casca_rija', nivel: 'pode_conter' }],
    categoria: 'para-llevar',
    emEstoque: true,
    opcoes: {
      tamanhos: [
        { id: 'llp-1l', nome: t('1 litro (hasta 3 sabores)', '½ litre (fins a 3 sabors)', '½ litro (até 3 sabores)', '½ liter (up to 3 flavors)'), preco: 16.00, tipo: 'tamanho' },
      ],
      sabores: opcoesSaborHelado,
    },
    limites: { maxSabores: 3 },
  },
];

// ===========================
// EXPORTAÇÃO ÚNICA
// ===========================

export const todosProdutos: Produto[] = [...produtosFixos, ...produtosPersonalizaveis];

export const categoriasLocal = categoriasCardapio;
