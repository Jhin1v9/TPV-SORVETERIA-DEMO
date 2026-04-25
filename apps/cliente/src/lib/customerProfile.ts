import { findRemoteCustomerByPhone, upsertRemoteCustomer } from '@tpv/shared/realtime/client';
import { normalizeSpanishPhone } from '@tpv/shared/lib/phone';
import type { Alergeno, PerfilUsuario } from '@tpv/shared/types';

function normalizePhone(telefone: string) {
  return normalizeSpanishPhone(telefone);
}

export async function syncPerfilUsuarioWithRemote(perfil: PerfilUsuario | null): Promise<PerfilUsuario | null> {
  if (!perfil) {
    return null;
  }

  const telefone = normalizePhone(perfil.telefone);
  if (!telefone) {
    return perfil;
  }

  const remoteId = await upsertRemoteCustomer({
    nome: perfil.nome || 'Cliente',
    telefone,
    email: perfil.email || '',
    alergias: perfil.alergias,
  });

  return {
    ...perfil,
    id: remoteId,
    telefone,
  };
}

export async function resolvePerfilUsuarioByPhone(params: {
  telefone: string;
  nome?: string;
  email?: string;
  alergias?: Alergeno[];
}): Promise<PerfilUsuario | null> {
  const telefone = normalizePhone(params.telefone);
  if (!telefone) {
    return null;
  }

  const remotePerfil = await findRemoteCustomerByPhone(telefone);
  if (remotePerfil) {
    return remotePerfil;
  }

  const remoteId = await upsertRemoteCustomer({
    nome: params.nome || 'Cliente',
    telefone,
    email: params.email || '',
    alergias: params.alergias || [],
  });

  return {
    id: remoteId,
    nome: params.nome || 'Cliente',
    email: params.email || '',
    telefone,
    temAlergias: Boolean(params.alergias?.length),
    alergias: params.alergias || [],
    criadoEm: new Date().toISOString(),
  };
}

export async function findPerfilUsuarioByPhone(telefone: string): Promise<PerfilUsuario | null> {
  const normalizedPhone = normalizePhone(telefone);
  if (!normalizedPhone) {
    return null;
  }

  return findRemoteCustomerByPhone(normalizedPhone);
}
