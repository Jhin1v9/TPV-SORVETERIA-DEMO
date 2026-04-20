import type { Produto, ProdutoCategoria } from '../types';

type ProdutoInput = Omit<Produto, 'nome' | 'descricao' | 'badge'> & {
  nome: Record<string, string>;
  descricao?: Record<string, string>;
  badge?: Record<string, string>;
};

function p(data: ProdutoInput): Produto {
  return {
    ...data,
    nome: {
      es: data.nome.es || data.nome.pt || data.nome.en,
      ca: data.nome.ca || data.nome.es || data.nome.pt || data.nome.en,
      pt: data.nome.pt || data.nome.es || data.nome.en,
      en: data.nome.en || data.nome.es || data.nome.pt,
    },
    descricao: data.descricao
      ? {
          es: data.descricao.es || data.descricao.pt || data.descricao.en,
          ca: data.descricao.ca || data.descricao.es || data.descricao.pt || data.descricao.en,
          pt: data.descricao.pt || data.descricao.es || data.descricao.en,
          en: data.descricao.en || data.descricao.es || data.descricao.pt,
        }
      : undefined,
    badge: data.badge
      ? {
          es: data.badge.es || data.badge.pt || data.badge.en,
          ca: data.badge.ca || data.badge.es || data.badge.pt || data.badge.en,
          pt: data.badge.pt || data.badge.es || data.badge.en,
          en: data.badge.en || data.badge.es || data.badge.pt,
        }
      : undefined,
  } as Produto;
}

export const produtosLocal: Produto[] = [
  // Acai
  p({ id: 'acai-puro-copinho', nome: { es: 'Açaí Puro Copinho', pt: 'Açaí Puro Copinho' }, preco: 7.70, imagem: 'https://images.unsplash.com/photo-1617225827592-d20989e9fe61?w=600', categoria: 'acai', emEstoque: true }),
  p({ id: 'acai-com-guarana', nome: { es: 'Açaí con Guaraná', pt: 'Açaí com Guaraná' }, preco: 7.70, imagem: 'https://images.unsplash.com/photo-1504113888839-1e515e200149?w=600', categoria: 'acai', emEstoque: true }),

  // Crema
  p({ id: 'crema-salchichon', nome: { es: 'Crema Salchichón', pt: 'Creme Salchichón' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1563805042-7684c484e4b8?w=600', categoria: 'crema', emEstoque: true }),
  p({ id: 'crema-nata-y-pina', nome: { es: 'Crema Nata y Piña', pt: 'Creme Nata e Abacaxi' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600', categoria: 'crema', emEstoque: true }),
  p({ id: 'crema-leche-merengada', nome: { es: 'Crema Leche Merengada', pt: 'Creme Leite Merengado' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600', categoria: 'crema', emEstoque: true }),
  p({ id: 'crema-almendras-tostadas', nome: { es: 'Crema Almendras Tostadas', pt: 'Creme Amêndoas Torradas' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600', categoria: 'crema', emEstoque: true }),
  p({ id: 'crema-yogurt-lima', nome: { es: 'Crema Yogurt Lima', pt: 'Creme Iogurte Limão' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', categoria: 'crema', emEstoque: true }),
  p({ id: 'crema-melocoton', nome: { es: 'Crema Melocotón', pt: 'Creme Pêssego' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1477506252414-b2954dbdadb4?w=600', categoria: 'crema', emEstoque: true }),

  // Picole Tradicional
  p({ id: 'picole-nata', nome: { es: 'Picolé Nata', pt: 'Picolé Nata' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?w=600', categoria: 'picole', emEstoque: true }),
  p({ id: 'picole-nata-granizada', nome: { es: 'Picolé Nata Granizada', pt: 'Picolé Nata Granizada' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1623595119708-26b1f2a845d7?w=600', categoria: 'picole', emEstoque: true }),
  p({ id: 'picole-mint', nome: { es: 'Picolé Mint', pt: 'Picolé Menta' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1560457079-9a6532ccb118?w=600', categoria: 'picole', emEstoque: true }),
  p({ id: 'picole-fresa-yogurt', nome: { es: 'Picolé Fresa Yogurt', pt: 'Picolé Morango Iogurte' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1495278096736-c1626b6909ac?w=600', categoria: 'picole', emEstoque: true }),
  p({ id: 'picole-lemon-cream', nome: { es: 'Picolé Lemon Cream', pt: 'Picolé Limão Creme' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', categoria: 'picole', emEstoque: true }),
  p({ id: 'picole-croccantino', nome: { es: 'Picolé Croccantino', pt: 'Picolé Croccantino' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=600', categoria: 'picole', emEstoque: true }),
  p({ id: 'picole-tramontana', nome: { es: 'Picolé Tramontana', pt: 'Picolé Tramontana' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=600', categoria: 'picole', emEstoque: true }),
  p({ id: 'picole-blanco-y-negro', nome: { es: 'Picolé Blanco y Negro', pt: 'Picolé Preto e Branco' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1558326332-6d4db0c968fd?w=600', categoria: 'picole', emEstoque: true }),
  p({ id: 'picole-yogurt-coco', nome: { es: 'Picolé Yogurt Coco', pt: 'Picolé Iogurte Coco' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=600', categoria: 'picole', emEstoque: true }),
  p({ id: 'picole-yogurt-maracuya', nome: { es: 'Picolé Yogurt Maracuyá', pt: 'Picolé Iogurte Maracujá' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1505253758473-96b701d2cd03?w=600', categoria: 'picole', emEstoque: true }),
  p({ id: 'picole-yogurt-melocoton', nome: { es: 'Picolé Yogurt Melocotón', pt: 'Picolé Iogurte Pêssego' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1477506252414-b2954dbdadb4?w=600', categoria: 'picole', emEstoque: true }),

  // Picole Premium
  p({ id: 'premium-frutos-rojos-yogurt', nome: { es: 'Premium Frutos Rojos con Yogurt', pt: 'Premium Frutos Vermelhos com Iogurte' }, preco: 4.20, imagem: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600', categoria: 'picole-premium', emEstoque: true }),
  p({ id: 'premium-cookies', nome: { es: 'Premium Cookies', pt: 'Premium Cookies' }, preco: 4.20, imagem: 'https://images.unsplash.com/photo-1558326332-6d4db0c968fd?w=600', categoria: 'picole-premium', emEstoque: true }),
  p({ id: 'premium-cacau-belga', nome: { es: 'Premium Cacao Belga', pt: 'Premium Cacau Belga' }, preco: 4.20, imagem: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=600', categoria: 'picole-premium', emEstoque: true }),
  p({ id: 'premium-cafe-del-brasil', nome: { es: 'Premium Café del Brasil', pt: 'Premium Café do Brasil' }, preco: 4.20, imagem: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600', categoria: 'picole-premium', emEstoque: true }),

  // Picole Duplo
  p({ id: 'duplo-morango-leche', nome: { es: 'Duplo Morango com Leite', pt: 'Duplo Morango com Leite' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1495278096736-c1626b6909ac?w=600', categoria: 'picole-duplo', emEstoque: true }),
  p({ id: 'duplo-chocolate-blanco', nome: { es: 'Duplo Chocolate Blanco', pt: 'Duplo Chocolate Branco' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600', categoria: 'picole-duplo', emEstoque: true }),

  // Conos
  p({ id: 'cono-super-nata', nome: { es: 'Cono Super Nata', pt: 'Cone Super Nata' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1623595119708-26b1f2a845d7?w=600', categoria: 'conos', emEstoque: true }),
  p({ id: 'cono-super-cookies', nome: { es: 'Cono Super Cookies', pt: 'Cone Super Cookies' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1558326332-6d4db0c968fd?w=600', categoria: 'conos', emEstoque: true }),
  p({ id: 'cono-super-cacao', nome: { es: 'Cono Super Cacao', pt: 'Cone Super Cacau' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600', categoria: 'conos', emEstoque: true }),
  p({ id: 'cono-nata-caramelo', nome: { es: 'Cono Nata Caramelo', pt: 'Cone Nata Caramelo' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=600', categoria: 'conos', emEstoque: true }),
  p({ id: 'cono-nata-galleta', nome: { es: 'Cono Nata Galleta', pt: 'Cone Nata Biscoito' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1563805042-7684c484e4b8?w=600', categoria: 'conos', emEstoque: true }),
  p({ id: 'cono-nata-nata', nome: { es: 'Cono Nata Nata', pt: 'Cone Nata Nata' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600', categoria: 'conos', emEstoque: true }),
  p({ id: 'cono-yogurt', nome: { es: 'Cono Yogurt', pt: 'Cone Iogurte' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', categoria: 'conos', emEstoque: true }),

  // Melhorados
  p({ id: 'casero', nome: { es: 'Casero', pt: 'Caseiro' }, preco: 5.00, imagem: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600', categoria: 'melhorados', emEstoque: true }),
  p({ id: 'sandwich-nata', nome: { es: 'Sandwich Nata', pt: 'Sanduíche Nata' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1563805042-7684c484e4b8?w=600', categoria: 'melhorados', emEstoque: true }),
  p({ id: 'pocket', nome: { es: 'Pocket', pt: 'Pocket' }, preco: 4.20, imagem: 'https://images.unsplash.com/photo-1623595119708-26b1f2a845d7?w=600', categoria: 'melhorados', emEstoque: true }),
  p({ id: 'pocket-premium', nome: { es: 'Pocket Premium', pt: 'Pocket Premium' }, preco: 5.00, imagem: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=600', categoria: 'melhorados', emEstoque: true }),
  p({ id: 'nata-fresa', nome: { es: 'Nata Fresa', pt: 'Nata Morango' }, preco: 5.00, imagem: 'https://images.unsplash.com/photo-1495278096736-c1626b6909ac?w=600', categoria: 'melhorados', emEstoque: true }),
  p({ id: 'big-ice', nome: { es: 'Big Ice', pt: 'Big Ice' }, preco: 5.00, imagem: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?w=600', categoria: 'melhorados', emEstoque: true }),
  p({ id: 'almendrado', nome: { es: 'Almendrado', pt: 'Amendoado' }, preco: 5.00, imagem: 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=600', categoria: 'melhorados', emEstoque: true }),

  // Sundae
  p({ id: 'copo-nata-sundae', nome: { es: 'Copo Nata Sundae', pt: 'Copo Nata Sundae' }, preco: 4.20, imagem: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600', categoria: 'sundae', emEstoque: true }),
  p({ id: 'copo-cacao-sundae', nome: { es: 'Copo Cacao Sundae', pt: 'Copo Cacau Sundae' }, preco: 4.20, imagem: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600', categoria: 'sundae', emEstoque: true }),

  // Sabores Especiais
  p({ id: 'pina-colada', nome: { es: 'Piña Colada', pt: 'Piña Colada' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1505253758473-96b701d2cd03?w=600', categoria: 'sabores-especiais', emEstoque: true }),
  p({ id: 'limon-cheesecake', nome: { es: 'Limón Cheesecake', pt: 'Limão Cheesecake' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', categoria: 'sabores-especiais', emEstoque: true }),
  p({ id: 'honey-cheesecake', nome: { es: 'Honey Cheesecake', pt: 'Honey Cheesecake' }, preco: 4.20, imagem: 'https://images.unsplash.com/photo-1563805042-7684c484e4b8?w=600', categoria: 'sabores-especiais', emEstoque: true }),
  p({ id: 'oreo', nome: { es: 'Oreo', pt: 'Oreo' }, preco: 4.20, imagem: 'https://images.unsplash.com/photo-1558326332-6d4db0c968fd?w=600', categoria: 'sabores-especiais', emEstoque: true }),
  p({ id: 'dulce-de-leche-bonie', nome: { es: 'Dulce de Leche Bonie', pt: 'Doce de Leite Bonie' }, preco: 4.20, imagem: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=600', categoria: 'sabores-especiais', emEstoque: true }),
  p({ id: 'avellana', nome: { es: 'Avellana', pt: 'Avelã' }, preco: 4.20, imagem: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600', categoria: 'sabores-especiais', emEstoque: true }),
  p({ id: 'pistacho-especial', nome: { es: 'Pistacho', pt: 'Pistache' }, preco: 4.20, imagem: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600', categoria: 'sabores-especiais', emEstoque: true }),
  p({ id: 'yerba-buena-chocolate', nome: { es: 'Yerba Buena Chocolate', pt: 'Hortelã Chocolate' }, preco: 4.20, imagem: 'https://images.unsplash.com/photo-1560457079-9a6532ccb118?w=600', categoria: 'sabores-especiais', emEstoque: true }),

  // Yogurt Especial
  p({ id: 'yogurt-maracuya', nome: { es: 'Yogurt Maracuyá', pt: 'Iogurte Maracujá' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1505253758473-96b701d2cd03?w=600', categoria: 'yogurt-especial', emEstoque: true }),
  p({ id: 'yogurt-frutos-rojos', nome: { es: 'Yogurt Frutos Rojos', pt: 'Iogurte Frutos Vermelhos' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1495278096736-c1626b6909ac?w=600', categoria: 'yogurt-especial', emEstoque: true }),
  p({ id: 'yogurt-frutas-amarillas', nome: { es: 'Yogurt Frutas Amarillas', pt: 'Iogurte Frutas Amarelas' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1477506252414-b2954dbdadb4?w=600', categoria: 'yogurt-especial', emEstoque: true }),
  p({ id: 'yogurt-kiwi-nata', nome: { es: 'Yogurt Kiwi Nata', pt: 'Iogurte Kiwi Nata' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', categoria: 'yogurt-especial', emEstoque: true }),
  p({ id: 'yogurt-fresa-platano', nome: { es: 'Yogurt Fresa Plátano', pt: 'Iogurte Morango Banana' }, preco: 3.80, imagem: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600', categoria: 'yogurt-especial', emEstoque: true }),

  // Barquillo
  p({ id: 'barquillo-bola-nata-fresa', nome: { es: 'Barquillo Bola Nata y Fresa', pt: 'Barquillo Bola Nata e Morango' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1495278096736-c1626b6909ac?w=600', categoria: 'barquillo', emEstoque: true }),
  p({ id: 'barquillo-bola-cacao-nata', nome: { es: 'Barquillo Bola Cacao y Nata', pt: 'Barquillo Bola Cacau e Nata' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600', categoria: 'barquillo', emEstoque: true }),

  // Donuts
  p({ id: 'donut-cookies', nome: { es: 'Donut Cookies', pt: 'Donut Cookies' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1558326332-6d4db0c968fd?w=600', categoria: 'donuts', emEstoque: true }),
  p({ id: 'donut-oreo', nome: { es: 'Donut Oreo', pt: 'Donut Oreo' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1557142046-c704a3adf364?w=600', categoria: 'donuts', emEstoque: true }),
  p({ id: 'donut-rocher', nome: { es: 'Donut Rocher', pt: 'Donut Rocher' }, preco: 4.50, imagem: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600', categoria: 'donuts', emEstoque: true }),
];

export const categoriasLocal: { id: ProdutoCategoria; nome: Record<string, string>; emoji: string }[] = [
  { id: 'todos', nome: { es: 'Todos', ca: 'Tots', pt: 'Todos', en: 'All' }, emoji: '🍨' },
  { id: 'acai', nome: { es: 'Açaí', ca: 'Açaí', pt: 'Açaí', en: 'Açaí' }, emoji: '🫐' },
  { id: 'crema', nome: { es: 'Crema', ca: 'Crema', pt: 'Creme', en: 'Cream' }, emoji: '🥛' },
  { id: 'picole', nome: { es: 'Picolé', ca: 'Pols', pt: 'Picolé', en: 'Popsicle' }, emoji: '🧊' },
  { id: 'picole-premium', nome: { es: 'Picolé Premium', ca: 'Pols Premium', pt: 'Picolé Premium', en: 'Premium Popsicle' }, emoji: '💎' },
  { id: 'picole-duplo', nome: { es: 'Picolé Duplo', ca: 'Pols Doble', pt: 'Picolé Duplo', en: 'Double Popsicle' }, emoji: '🌀' },
  { id: 'conos', nome: { es: 'Conos', ca: 'Cucurutxos', pt: 'Cones', en: 'Cones' }, emoji: '🍦' },
  { id: 'melhorados', nome: { es: 'Mejorados', ca: 'Millorats', pt: 'Especiais', en: 'Specials' }, emoji: '✨' },
  { id: 'sundae', nome: { es: 'Sundae', ca: 'Sundae', pt: 'Sundae', en: 'Sundae' }, emoji: '🍧' },
  { id: 'sabores-especiais', nome: { es: 'Sabores Especiales', ca: 'Sabors Especials', pt: 'Sabores Especiais', en: 'Special Flavors' }, emoji: '🌟' },
  { id: 'yogurt-especial', nome: { es: 'Yogurt Especial', ca: 'Iogurt Especial', pt: 'Iogurte Especial', en: 'Special Yogurt' }, emoji: '🥣' },
  { id: 'barquillo', nome: { es: 'Barquillo', ca: 'Barquillo', pt: 'Barquillo', en: 'Wafer' }, emoji: '🥖' },
  { id: 'donuts', nome: { es: 'Donuts', ca: 'Donuts', pt: 'Donuts', en: 'Donuts' }, emoji: '🍩' },
  { id: 'sorvetes-artesanais', nome: { es: 'Helados Artesanales', ca: 'Gelats Artesans', pt: 'Sorvetes Artesanais', en: 'Artisan Ice Cream' }, emoji: '🍨' },
];
