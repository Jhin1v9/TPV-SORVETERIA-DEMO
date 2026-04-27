// ═════════════════════════════════════════════════════════════════════════════
// Security utilities for Edge Functions — TPV Sorveteria
// Camada 1: Hardening sem quebra de funcionamento
// ═════════════════════════════════════════════════════════════════════════════

/** Allowed origins — must match all deployed app URLs + dev ports */
const ALLOWED_ORIGINS = [
  'https://cliente-pearl.vercel.app',
  'https://kiosk-swart-delta.vercel.app',
  'https://admin-ten-vert-54.vercel.app',
  'https://kds-one.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
];

/** Get CORS headers restricted to known origins */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// ── Simple in-memory rate limiter ───────────────────────────────────────────
const rateStore = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

/** Check rate limit for an IP */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateStore.get(ip);
  if (!entry || now > entry.resetAt) {
    rateStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQUESTS) return false;
  entry.count++;
  return true;
}

/** Get client IP from request headers */
export function getClientIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** Validate payment amount (cents). Max 500 EUR. */
export function validateAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0 && amount <= 500_00;
}

/** Sanitize error for external response */
export function safeError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('invalid') || msg.includes('required') || msg.includes('not found')) {
      return error.message;
    }
  }
  return 'Internal error';
}
