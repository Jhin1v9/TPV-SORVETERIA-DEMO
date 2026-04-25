/**
 * Mock Authentication Database
 * 
 * HOJE: Usa localStorage como "banco" de usuários.
 * FUTURO: Substituir por Supabase Auth + Profiles.
 * 
 * A interface permanece a mesma:
 *   register(perfil) → Promise<PerfilUsuario>
 *   login(telefone)  → Promise<PerfilUsuario | null>
 *   logout()         → void
 */

import type { PerfilUsuario } from '../types';
import { normalizeSpanishPhone } from './phone';

const USERS_KEY = 'tpv-auth-users';

function getUsers(): PerfilUsuario[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PerfilUsuario[];
  } catch {
    return [];
  }
}

function saveUsers(users: PerfilUsuario[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Busca usuário por telefone (identificador único para o demo).
 * FUTURO: supabase.from('profiles').select('*').eq('phone', telefone).single()
 */
export function findUserByPhone(telefone: string): PerfilUsuario | null {
  const normalized = normalizeSpanishPhone(telefone);
  return getUsers().find((u) => normalizeSpanishPhone(u.telefone) === normalized) || null;
}

/**
 * Registra novo usuário.
 * FUTURO: supabase.auth.signUp() + supabase.from('profiles').insert()
 */
export function registerUser(perfil: PerfilUsuario): PerfilUsuario {
  const users = getUsers();
  // Evitar duplicado por telefone
  const exists = findUserByPhone(perfil.telefone);
  if (exists) {
    // Atualiza dados se já existe (mesmo telefone, novo nome)
    const updated = users.map((u) =>
      normalizeSpanishPhone(u.telefone) === normalizeSpanishPhone(perfil.telefone) ? perfil : u
    );
    saveUsers(updated);
    return perfil;
  }
  users.push(perfil);
  saveUsers(users);
  return perfil;
}

/**
 * Login por telefone.
 * FUTURO: supabase.auth.signInWithOtp({ phone }) ou magic link
 */
export function loginByPhone(telefone: string): PerfilUsuario | null {
  return findUserByPhone(telefone);
}

/**
 * Verifica se existe algum usuário cadastrado.
 */
export function hasRegisteredUsers(): boolean {
  return getUsers().length > 0;
}

/**
 * Apaga TODOS os dados de usuários (para demo/reset).
 */
export function clearAllUsers() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USERS_KEY);
}
