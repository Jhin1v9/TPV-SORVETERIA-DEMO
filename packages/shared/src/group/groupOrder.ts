/**
 * ═══ FASE 11 — Group Ordering ═══
 * Group Order Logic — Criar, entrar, gerenciar pedidos em grupo
 */

import type { GroupOrder, GroupMember, GroupCartItem, CartItem } from '../types';

const GROUP_CODE_LENGTH = 6;
const DEFAULT_LIMITE_MINUTOS = 120; // 2 horas

function generateGroupCode(): string {
  return Math.floor(Math.random() * 1000000).toString().padStart(GROUP_CODE_LENGTH, '0');
}

function generateId(): string {
  return `group-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function generateMemberId(): string {
  return `member-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ═══ API Pública ═══

export function criarGrupo(nomeGrupo: string, hostName: string): GroupOrder {
  const hostId = generateMemberId();
  const now = new Date().toISOString();

  return {
    id: generateId(),
    codigo: generateGroupCode(),
    hostId,
    nome: nomeGrupo,
    membros: [
      {
        id: hostId,
        nome: hostName,
        timestampEntrada: now,
      },
    ],
    itens: [],
    status: 'abierto',
    criadoEm: now,
    atualizadoEm: now,
    limiteMinutos: DEFAULT_LIMITE_MINUTOS,
  };
}

export function entrarGrupo(grupo: GroupOrder, nomeMembro: string): { sucesso: boolean; grupo?: GroupOrder; erro?: string } {
  if (grupo.status !== 'abierto') {
    return { sucesso: false, erro: 'El grupo ya está cerrado' };
  }

  if (estaExpirado(grupo)) {
    return { sucesso: false, erro: 'El grupo ha expirado' };
  }

  const membroExistente = grupo.membros.find((m) => m.nome.toLowerCase() === nomeMembro.toLowerCase());
  if (membroExistente) {
    return { sucesso: false, erro: 'Ya existe un miembro con ese nombre' };
  }

  const novoMembro: GroupMember = {
    id: generateMemberId(),
    nome: nomeMembro,
    timestampEntrada: new Date().toISOString(),
  };

  const grupoAtualizado: GroupOrder = {
    ...grupo,
    membros: [...grupo.membros, novoMembro],
    atualizadoEm: new Date().toISOString(),
  };

  return { sucesso: true, grupo: grupoAtualizado };
}

export function adicionarItem(
  grupo: GroupOrder,
  item: CartItem,
  memberId: string,
  memberName: string,
): GroupOrder {
  const groupItem: GroupCartItem = {
    ...item,
    id: `gi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    addedBy: memberId,
    addedByName: memberName,
    timestamp: new Date().toISOString(),
  };

  return {
    ...grupo,
    itens: [...grupo.itens, groupItem],
    atualizadoEm: new Date().toISOString(),
  };
}

export function removerItem(grupo: GroupOrder, itemId: string, memberId: string): { sucesso: boolean; grupo?: GroupOrder; erro?: string } {
  const item = grupo.itens.find((i) => i.id === itemId);
  if (!item) {
    return { sucesso: false, erro: 'Item no encontrado' };
  }

  const isHost = grupo.hostId === memberId;
  const isOwner = item.addedBy === memberId;

  if (!isHost && !isOwner) {
    return { sucesso: false, erro: 'Solo el host o quien añadió el item puede eliminarlo' };
  }

  const grupoAtualizado: GroupOrder = {
    ...grupo,
    itens: grupo.itens.filter((i) => i.id !== itemId),
    atualizadoEm: new Date().toISOString(),
  };

  return { sucesso: true, grupo: grupoAtualizado };
}

export function fecharGrupo(grupo: GroupOrder, memberId: string): { sucesso: boolean; grupo?: GroupOrder; erro?: string } {
  if (grupo.hostId !== memberId) {
    return { sucesso: false, erro: 'Solo el host puede cerrar el grupo' };
  }

  if (grupo.status !== 'abierto') {
    return { sucesso: false, erro: 'El grupo ya está cerrado' };
  }

  if (grupo.itens.length === 0) {
    return { sucesso: false, erro: 'No hay items en el grupo' };
  }

  return {
    sucesso: true,
    grupo: {
      ...grupo,
      status: 'cerrado',
      atualizadoEm: new Date().toISOString(),
    },
  };
}

export function marcarPedidoRealizado(grupo: GroupOrder): GroupOrder {
  return {
    ...grupo,
    status: 'pedido_realizado',
    atualizadoEm: new Date().toISOString(),
  };
}

export function sairDoGrupo(grupo: GroupOrder, memberId: string): GroupOrder {
  // Host não pode sair — deve fechar o grupo
  if (grupo.hostId === memberId) {
    return grupo;
  }

  return {
    ...grupo,
    membros: grupo.membros.filter((m) => m.id !== memberId),
    itens: grupo.itens.filter((i) => i.addedBy !== memberId),
    atualizadoEm: new Date().toISOString(),
  };
}

// ═══ Queries ═══

export function estaExpirado(grupo: GroupOrder): boolean {
  const criado = new Date(grupo.criadoEm).getTime();
  const agora = Date.now();
  const limiteMs = grupo.limiteMinutos * 60 * 1000;
  return agora - criado > limiteMs;
}

export function tempoRestanteMinutos(grupo: GroupOrder): number {
  const criado = new Date(grupo.criadoEm).getTime();
  const agora = Date.now();
  const limiteMs = grupo.limiteMinutos * 60 * 1000;
  const restante = Math.max(0, limiteMs - (agora - criado));
  return Math.ceil(restante / 60000);
}

export function calcularTotalPorPessoa(grupo: GroupOrder): Map<string, { nome: string; total: number; count: number }> {
  const map = new Map<string, { nome: string; total: number; count: number }>();

  for (const item of grupo.itens) {
    const atual = map.get(item.addedBy) || { nome: item.addedByName, total: 0, count: 0 };
    atual.total += item.unitPrice * item.quantity;
    atual.count += item.quantity;
    map.set(item.addedBy, atual);
  }

  return map;
}

export function calcularTotalGrupo(grupo: GroupOrder): number {
  return grupo.itens.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function getItensPorMembro(grupo: GroupOrder): Map<string, GroupCartItem[]> {
  const map = new Map<string, GroupCartItem[]>();

  for (const item of grupo.itens) {
    const atual = map.get(item.addedBy) || [];
    atual.push(item);
    map.set(item.addedBy, atual);
  }

  return map;
}

export function gerarLinkCompartilhavel(codigo: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}?group=${codigo}`;
}

export function podeEditarItem(grupo: GroupOrder, itemId: string, memberId: string): boolean {
  const item = grupo.itens.find((i) => i.id === itemId);
  if (!item) return false;
  return grupo.hostId === memberId || item.addedBy === memberId;
}

export function isHost(grupo: GroupOrder, memberId: string): boolean {
  return grupo.hostId === memberId;
}
