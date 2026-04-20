import { describe, it, expect } from 'vitest';
import { t, getLocaleName } from './index';
import type { Locale } from '../types';

describe('t() — sistema de i18n', () => {
  it('retorna tradução em espanhol', () => {
    expect(t('greeting', 'es')).toBe('¡Hola!');
  });

  it('retorna tradução em português', () => {
    expect(t('greeting', 'pt')).toBe('Olá!');
  });

  it('retorna tradução em catalão', () => {
    expect(t('greeting', 'ca')).toBe('Hola!');
  });

  it('retorna tradução em inglês', () => {
    expect(t('greeting', 'en')).toBe('Hello!');
  });

  it('fallback ca → es quando não existe em ca', () => {
    // "pay" existe em es ('Pagar €{amount}') mas pode não existir em ca
    const result = t('pay', 'ca');
    expect(result).not.toBe('pay');
    expect(result.length).toBeGreaterThan(3);
  });

  it('fallback pt → es → key para chave inexistente', () => {
    const result = t('nonExistentKey123', 'pt' as Locale);
    expect(result).toBe('nonExistentKey123');
  });

  it('interpolação com params', () => {
    const result = t('pay', 'es', { amount: 10 });
    expect(result).toBe('Pagar €10');
  });

  it('interpolação com múltiplos params', () => {
    const result = t('minutes', 'es', { min: 3, max: 5 });
    expect(result).toBe('3-5 minutos');
  });

  it('locale inválido → fallback es', () => {
    const result = t('greeting', 'fr' as Locale);
    expect(result).toBe('¡Hola!');
  });

  it('key inexistente → retorna a própria key', () => {
    expect(t('xyz_unknown', 'es')).toBe('xyz_unknown');
  });

  it('params em número são convertidos para string', () => {
    const result = t('selectedCount', 'es', { current: 1, max: 2 });
    expect(result).toContain('1');
    expect(result).toContain('2');
  });
});

describe('getLocaleName', () => {
  it('retorna nome completo do idioma', () => {
    expect(getLocaleName('es')).toBe('Español');
    expect(getLocaleName('ca')).toBe('Català');
    expect(getLocaleName('pt')).toBe('Português');
    expect(getLocaleName('en')).toBe('English');
  });
});
