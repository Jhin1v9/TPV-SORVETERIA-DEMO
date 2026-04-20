import type { Locale, Alergeno } from '../types';

export const alergenoNomes: Record<Alergeno, Record<Locale, string>> = {
  gluten: { ca: 'Gluten', es: 'Gluten', pt: 'Glúten', en: 'Gluten' },
  crustaceos: { ca: 'Crustacis', es: 'Crustáceos', pt: 'Crustáceos', en: 'Crustaceans' },
  ovos: { ca: 'Ous', es: 'Huevos', pt: 'Ovos', en: 'Eggs' },
  peixe: { ca: 'Peix', es: 'Pescado', pt: 'Peixe', en: 'Fish' },
  amendoim: { ca: 'Cacauet', es: 'Cacahuete', pt: 'Amendoim', en: 'Peanuts' },
  soja: { ca: 'Soja', es: 'Soja', pt: 'Soja', en: 'Soy' },
  leite: { ca: 'Llet', es: 'Leche', pt: 'Leite', en: 'Milk' },
  frutos_casca_rija: { ca: 'Fruits secs', es: 'Frutos secos', pt: 'Frutos de casca rija', en: 'Tree Nuts' },
  apio: { ca: 'Api', es: 'Apio', pt: 'Aipo', en: 'Celery' },
  mostarda: { ca: 'Mostassa', es: 'Mostaza', pt: 'Mostarda', en: 'Mustard' },
  sesamo: { ca: 'Sèsam', es: 'Sésamo', pt: 'Sésamo', en: 'Sesame' },
  sulfitos: { ca: 'Sulfitos', es: 'Sulfitos', pt: 'Sulfitos', en: 'Sulphites' },
  tremocos: { ca: 'Tramussos', es: 'Altramuces', pt: 'Tremoços', en: 'Lupin' },
  moluscos: { ca: 'Mol·luscs', es: 'Moluscos', pt: 'Moluscos', en: 'Molluscs' },
};

export const nivelAlergenoNomes: Record<'contem' | 'pode_conter', Record<Locale, string>> = {
  contem: { ca: 'Conté', es: 'Contiene', pt: 'Contém', en: 'Contains' },
  pode_conter: { ca: 'Pot contenir traces de', es: 'Puede contener trazas de', pt: 'Pode conter vestígios de', en: 'May contain traces of' },
};

export const alergenoMensagens: Record<Locale, Record<string, string>> = {
  ca: {
    alergenoTitle: 'Al·lèrgens',
    alergenoSubtitle: 'Informació sobre aliments',
    temAlergia: 'Tens alguna al·lèrgia alimentària?',
    temAlergiaDesc: 'Aquesta informació ens ajuda a mostrar avisos personalitzats al menú i durant la comanda.',
    selecioneAlergias: 'Selecciona els teus al·lèrgens:',
    nenhumaAlergia: 'No tinc cap al·lèrgia',
    produtoContem: 'Aquest producte conté al·lèrgens',
    produtoPodeConter: 'Aquest producte pot contenir traces de',
    avisoCheckout: 'Atenció: alguns productes del teu carret contenen al·lèrgens que has indicat. Revisa la informació abans de confirmar.',
    confirmoAlergenos: 'Confirmo que he revisat la informació d\'al·lèrgens i entenc el risc de contaminació creuada.',
    alergenoAlerta: 'Alerta d\'al·lèrgens',
    crossContamination: 'Tots els productes es preparen en una cuina on es manipulen al·lèrgens. No podem garantir l\'absència total de traces.',
    adicionarNota: 'Afegir nota especial sobre al·lèrgens',
    notaAlergenoPlaceholder: 'Ex: Sóc al·lèrgic a...',
  },
  es: {
    alergenoTitle: 'Alérgenos',
    alergenoSubtitle: 'Información alimentaria',
    temAlergia: '¿Tienes alguna alergia alimentaria?',
    temAlergiaDesc: 'Esta información nos ayuda a mostrar avisos personalizados en el menú y durante el pedido.',
    selecioneAlergias: 'Selecciona tus alérgenos:',
    nenhumaAlergia: 'No tengo ninguna alergia',
    produtoContem: 'Este producto contiene alérgenos',
    produtoPodeConter: 'Este producto puede contener trazas de',
    avisoCheckout: 'Atención: algunos productos de tu carrito contienen alérgenos que has indicado. Revisa la información antes de confirmar.',
    confirmoAlergenos: 'Confirmo que he revisado la información de alérgenos y entiendo el riesgo de contaminación cruzada.',
    alergenoAlerta: 'Alerta de alérgenos',
    crossContamination: 'Todos los productos se preparan en una cocina donde se manipulan alérgenos. No podemos garantizar la ausencia total de trazas.',
    adicionarNota: 'Añadir nota especial sobre alérgenos',
    notaAlergenoPlaceholder: 'Ej: Soy alérgico a...',
  },
  pt: {
    alergenoTitle: 'Alérgenos',
    alergenoSubtitle: 'Informação alimentar',
    temAlergia: 'Tem alguma alergia alimentar?',
    temAlergiaDesc: 'Esta informação ajuda-nos a mostrar avisos personalizados no menu e durante o pedido.',
    selecioneAlergias: 'Selecione os seus alérgenos:',
    nenhumaAlergia: 'Não tenho nenhuma alergia',
    produtoContem: 'Este produto contém alérgenos',
    produtoPodeConter: 'Este produto pode conter vestígios de',
    avisoCheckout: 'Atenção: alguns produtos do seu carrinho contêm alérgenos que indicou. Revise a informação antes de confirmar.',
    confirmoAlergenos: 'Confirmo que revisei a informação de alérgenos e entendo o risco de contaminação cruzada.',
    alergenoAlerta: 'Alerta de alérgenos',
    crossContamination: 'Todos os produtos são preparados numa cozinha onde se manipulam alérgenos. Não podemos garantir a ausência total de vestígios.',
    adicionarNota: 'Adicionar nota especial sobre alérgenos',
    notaAlergenoPlaceholder: 'Ex: Sou alérgico a...',
  },
  en: {
    alergenoTitle: 'Allergens',
    alergenoSubtitle: 'Food Information',
    temAlergia: 'Do you have any food allergies?',
    temAlergiaDesc: 'This information helps us show personalized warnings on the menu and during checkout.',
    selecioneAlergias: 'Select your allergens:',
    nenhumaAlergia: 'I have no allergies',
    produtoContem: 'This product contains allergens',
    produtoPodeConter: 'This product may contain traces of',
    avisoCheckout: 'Attention: some items in your cart contain allergens you indicated. Please review before confirming.',
    confirmoAlergenos: 'I confirm I have reviewed the allergen information and understand the risk of cross-contamination.',
    alergenoAlerta: 'Allergen Alert',
    crossContamination: 'All products are prepared in a kitchen where allergens are handled. We cannot guarantee the total absence of traces.',
    adicionarNota: 'Add special note about allergens',
    notaAlergenoPlaceholder: 'Ex: I am allergic to...',
  },
};

export function tAlergeno(key: string, locale: Locale): string {
  return alergenoMensagens[locale][key] || key;
}

export function nomeAlergeno(alergeno: Alergeno, locale: Locale): string {
  return alergenoNomes[alergeno][locale];
}

export function nomeNivel(nivel: 'contem' | 'pode_conter', locale: Locale): string {
  return nivelAlergenoNomes[nivel][locale];
}
