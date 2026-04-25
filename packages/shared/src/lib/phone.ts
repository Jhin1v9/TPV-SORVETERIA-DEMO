export function normalizeSpanishPhone(input: string): string {
  const digitsOnly = input.replace(/\D/g, '');

  if (!digitsOnly) {
    return '';
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith('34')) {
    return digitsOnly.slice(2);
  }

  if (digitsOnly.length === 12 && digitsOnly.startsWith('0034')) {
    return digitsOnly.slice(4);
  }

  if (digitsOnly.length === 9) {
    return digitsOnly;
  }

  return digitsOnly;
}

export function isValidSpanishPhone(input: string): boolean {
  return normalizeSpanishPhone(input).length === 9;
}

export function formatSpanishPhoneDisplay(input: string): string {
  const normalized = normalizeSpanishPhone(input).slice(0, 9);

  if (normalized.length <= 3) return normalized;
  if (normalized.length <= 6) return `${normalized.slice(0, 3)} ${normalized.slice(3)}`;
  return `${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6)}`;
}
