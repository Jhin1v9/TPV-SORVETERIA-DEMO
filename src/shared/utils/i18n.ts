import type { Locale } from '../types';

const translations: Record<string, Record<Locale, string>> = {
  // Hola screen
  greeting: {
    ca: 'Hola!',
    es: '¡Hola!',
    en: 'Hello!',
    fr: 'Bonjour!',
  },
  welcome: {
    ca: 'Benvinguts a la nostra gelateria',
    es: 'Bienvenidos a nuestra heladería',
    en: 'Welcome to our ice cream shop',
    fr: 'Bienvenue dans notre glacier',
  },
  // Navigation
  continue: {
    ca: 'Continuar',
    es: 'Continuar',
    en: 'Continue',
    fr: 'Continuer',
  },
  back: {
    ca: 'Tornar',
    es: 'Volver',
    en: 'Back',
    fr: 'Retour',
  },
  cancel: {
    ca: 'Cancel·lar',
    es: 'Cancelar',
    en: 'Cancel',
    fr: 'Annuler',
  },
  // Categories
  chooseContainer: {
    ca: 'Escull el teu got',
    es: 'Elige tu vaso',
    en: 'Choose your cup',
    fr: 'Choisissez votre pot',
  },
  // Flavors
  chooseFlavors: {
    ca: 'Escull els sabors',
    es: 'Elige los sabores',
    en: 'Choose flavors',
    fr: 'Choisissez les saveurs',
  },
  maxFlavors: {
    ca: 'Màxim {n} sabors per aquest got',
    es: 'Máximo {n} sabores para este vaso',
    en: 'Maximum {n} flavors for this cup',
    fr: 'Maximum {n} saveurs pour ce pot',
  },
  selectedCount: {
    ca: '{current}/{max} seleccionats',
    es: '{current}/{max} seleccionados',
    en: '{current}/{max} selected',
    fr: '{current}/{max} sélectionnés',
  },
  // Toppings
  addExtras: {
    ca: 'Afegeix extres',
    es: 'Añade extras',
    en: 'Add extras',
    fr: 'Ajoutez des extras',
  },
  perfectMatch: {
    ca: 'Combinació perfecta',
    es: 'Combinación perfecta',
    en: 'Perfect match',
    fr: 'Accord parfait',
  },
  // Cart
  yourOrder: {
    ca: 'La teva comanda',
    es: 'Tu pedido',
    en: 'Your order',
    fr: 'Votre commande',
  },
  subtotal: {
    ca: 'Subtotal',
    es: 'Subtotal',
    en: 'Subtotal',
    fr: 'Sous-total',
  },
  iva: {
    ca: 'IVA (10%)',
    es: 'IVA (10%)',
    en: 'VAT (10%)',
    fr: 'TVA (10%)',
  },
  total: {
    ca: 'Total',
    es: 'Total',
    en: 'Total',
    fr: 'Total',
  },
  pay: {
    ca: 'Pagar €{amount}',
    es: 'Pagar €{amount}',
    en: 'Pay €{amount}',
    fr: 'Payer €{amount}',
  },
  addCoffee: {
    ca: 'Vols afegir un cafè per 1,50€?',
    es: '¿Añadir un café por 1,50€?',
    en: 'Add a coffee for €1.50?',
    fr: 'Ajouter un café pour 1,50€?',
  },
  promoCode: {
    ca: 'Codi promocional',
    es: 'Código promocional',
    en: 'Promo code',
    fr: 'Code promo',
  },
  apply: {
    ca: 'Aplicar',
    es: 'Aplicar',
    en: 'Apply',
    fr: 'Appliquer',
  },
  // Payment
  payment: {
    ca: 'Pagament',
    es: 'Pago',
    en: 'Payment',
    fr: 'Paiement',
  },
  card: {
    ca: 'Targeta',
    es: 'Tarjeta',
    en: 'Card',
    fr: 'Carte',
  },
  cash: {
    ca: 'Efectiu',
    es: 'Efectivo',
    en: 'Cash',
    fr: 'Espèces',
  },
  payAtCounter: {
    ca: 'Paga a caixa mostrant aquest codi',
    es: 'Pague en caja mostrando este código',
    en: 'Pay at the counter showing this code',
    fr: 'Payez au comptoir en montrant ce code',
  },
  processing: {
    ca: 'Processant...',
    es: 'Procesando...',
    en: 'Processing...',
    fr: 'Traitement...',
  },
  // Confirmation
  orderReady: {
    ca: 'Comanda feta!',
    es: '¡Pedido realizado!',
    en: 'Order placed!',
    fr: 'Commande passée!',
  },
  orderNumber: {
    ca: 'Número de comanda',
    es: 'Número de pedido',
    en: 'Order number',
    fr: 'Numéro de commande',
  },
  estimatedTime: {
    ca: 'Temps estimat',
    es: 'Tiempo estimado',
    en: 'Estimated time',
    fr: 'Temps estimé',
  },
  minutes: {
    ca: '{min}-{max} minuts',
    es: '{min}-{max} minutos',
    en: '{min}-{max} minutes',
    fr: '{min}-{max} minutes',
  },
  scanVerify: {
    ca: 'Escaneja per verificar la factura',
    es: 'Escanea para verificar factura',
    en: 'Scan to verify invoice',
    fr: 'Scannez pour vérifier',
  },
  notifySMS: {
    ca: 'Et avisem quan estigui llest',
    es: 'Te avisamos cuando esté listo',
    en: 'We\'ll notify you when ready',
    fr: 'Nous vous informerons',
  },
  // KDS
  pending: {
    ca: 'Pendent',
    es: 'Pendiente',
    en: 'Pending',
    fr: 'En attente',
  },
  preparing: {
    ca: 'Preparant',
    es: 'Preparando',
    en: 'Preparing',
    fr: 'En préparation',
  },
  ready: {
    ca: 'Llest',
    es: 'Listo',
    en: 'Ready',
    fr: 'Prêt',
  },
  delivered: {
    ca: 'Lliurat',
    es: 'Entregado',
    en: 'Delivered',
    fr: 'Livré',
  },
  newOrder: {
    ca: 'Nova comanda',
    es: 'Nuevo pedido',
    en: 'New order',
    fr: 'Nouvelle commande',
  },
  queue: {
    ca: '{n} comandes en cua',
    es: '{n} pedidos en cola',
    en: '{n} orders in queue',
    fr: '{n} commandes en file',
  },
  // Admin
  stock: {
    ca: 'Estoc',
    es: 'Stock',
    en: 'Stock',
    fr: 'Stock',
  },
  orders: {
    ca: 'Comandes',
    es: 'Pedidos',
    en: 'Orders',
    fr: 'Commandes',
  },
  analytics: {
    ca: 'Analítiques',
    es: 'Analíticas',
    en: 'Analytics',
    fr: 'Analytiques',
  },
  customers: {
    ca: 'Clients',
    es: 'Clientes',
    en: 'Customers',
    fr: 'Clients',
  },
  config: {
    ca: 'Configuració',
    es: 'Configuración',
    en: 'Settings',
    fr: 'Configuration',
  },
  logout: {
    ca: 'Tancar sessió',
    es: 'Cerrar sesión',
    en: 'Logout',
    fr: 'Déconnexion',
  },
  login: {
    ca: 'Iniciar sessió',
    es: 'Iniciar sesión',
    en: 'Login',
    fr: 'Connexion',
  },
  buckets: {
    ca: 'Baldes de 5L',
    es: 'Baldes de 5L',
    en: '5L Tubs',
    fr: 'Seaux de 5L',
  },
  portions: {
    ca: 'porcions disponibles',
    es: 'porciones disponibles',
    en: 'portions available',
    fr: 'portions disponibles',
  },
  lowStock: {
    ca: 'Estoc baix',
    es: 'Stock bajo',
    en: 'Low stock',
    fr: 'Stock bas',
  },
  today: {
    ca: 'Avui',
    es: 'Hoy',
    en: 'Today',
    fr: 'Aujourd\'hui',
  },
  yesterday: {
    ca: 'Ahir',
    es: 'Ayer',
    en: 'Yesterday',
    fr: 'Hier',
  },
  thisWeek: {
    ca: 'Aquesta setmana',
    es: 'Esta semana',
    en: 'This week',
    fr: 'Cette semaine',
  },
  exportCSV: {
    ca: 'Exportar CSV',
    es: 'Exportar CSV',
    en: 'Export CSV',
    fr: 'Exporter CSV',
  },
  soldOut: {
    ca: 'Esgotat',
    es: 'Agotado',
    en: 'Sold out',
    fr: 'Épuisé',
  },
  unavailable: {
    ca: 'No disponible',
    es: 'No disponible',
    en: 'Unavailable',
    fr: 'Indisponible',
  },
  minutesAbbrev: {
    ca: 'min',
    es: 'min',
    en: 'min',
    fr: 'min',
  },
};

export function t(key: string, locale: Locale, params?: Record<string, string | number>): string {
  const entry = translations[key];
  if (!entry) return key;
  let text = entry[locale] || entry['es'] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}
