import type { Locale } from '../types';
import es from './es';
import ca from './ca';
import pt from './pt';
import en from './en';

const dictionaries: Record<Locale, Record<string, string>> = { es, ca, pt, en };

export type TranslationKey = keyof typeof es;

export function t(key: TranslationKey | string, locale: Locale, params?: Record<string, string | number>): string {
  const dict = dictionaries[locale] || dictionaries.es;
  let text = dict[key] || dictionaries.ca[key] || dictionaries.pt[key] || dictionaries.en[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}

export function getLocaleName(locale: Locale): string {
  const names: Record<Locale, string> = {
    es: 'Español',
    ca: 'Català',
    pt: 'Português',
    en: 'English',
  };
  return names[locale];
}

export const defaultLocale: Locale = 'ca';
export const supportedLocales: Locale[] = ['ca', 'es', 'pt', 'en'];

export { es, ca, pt, en };
