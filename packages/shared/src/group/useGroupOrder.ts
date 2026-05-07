/**
 * ═══ FASE 11 — Group Ordering ═══
 * useGroupOrder — Hook React para gerenciar pedidos em grupo
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { GroupOrder, CartItem } from '../types';
import {
  criarGrupo,
  entrarGrupo,
  adicionarItem,
  removerItem,
  fecharGrupo,
  sairDoGrupo,
  marcarPedidoRealizado,
  estaExpirado,
  tempoRestanteMinutos,
  calcularTotalPorPessoa,
  calcularTotalGrupo,
  getItensPorMembro,
  isHost,
  podeEditarItem,
} from './groupOrder';
import { getStoredGroup, setStoredGroup, clearStoredGroup, broadcastGroupUpdate, listenGroupUpdates } from './groupStorage';

export interface UseGroupOrderReturn {
  /** Grupo ativo (null se não houver) */
  grupo: GroupOrder | null;
  /** ID do membro atual */
  memberId: string | null;
  /** Se o usuário atual é host */
  isHostUser: boolean;
  /** Minutos restantes até expirar */
  tempoRestante: number;
  /** Total do grupo */
  total: number;
  /** Total por pessoa */
  totalPorPessoa: Map<string, { nome: string; total: number; count: number }>;
  /** Itens agrupados por membro */
  itensPorMembro: Map<string, import('../types').GroupCartItem[]>;
  /** Criar novo grupo */
  criar: (nomeGrupo: string, hostName: string) => void;
  /** Entrar em grupo existente */
  entrar: (codigo: string, nomeMembro: string) => { sucesso: boolean; erro?: string };
  /** Adicionar item ao grupo */
  adicionar: (item: CartItem) => void;
  /** Remover item do grupo */
  remover: (itemId: string) => { sucesso: boolean; erro?: string };
  /** Fechar grupo (só host) */
  fechar: () => { sucesso: boolean; erro?: string };
  /** Sair do grupo */
  sair: () => void;
  /** Marcar pedido como realizado */
  marcarRealizado: () => void;
  /** Verifica se pode editar um item */
  podeEditar: (itemId: string) => boolean;
  /** Limpar grupo */
  limpar: () => void;
}

const MEMBER_ID_KEY = 'tpv-group-member-id';

function getMemberId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(MEMBER_ID_KEY);
}

function setMemberId(id: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MEMBER_ID_KEY, id);
}

function clearMemberId(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MEMBER_ID_KEY);
}

export function useGroupOrder(): UseGroupOrderReturn {
  const [grupo, setGrupo] = useState<GroupOrder | null>(getStoredGroup);
  const [memberId, setMemberIdState] = useState<string | null>(getMemberId);

  // Persiste grupo no localStorage
  useEffect(() => {
    if (grupo) {
      setStoredGroup(grupo);
    } else {
      clearStoredGroup();
    }
  }, [grupo]);

  // Escuta atualizações de outras tabs
  useEffect(() => {
    const unsubscribe = listenGroupUpdates((g) => {
      setGrupo(g);
    });
    return unsubscribe;
  }, []);

  // Auto-expiração
  useEffect(() => {
    if (!grupo) return;
    const interval = window.setInterval(() => {
      if (estaExpirado(grupo)) {
        clearStoredGroup();
        clearMemberId();
        setGrupo(null);
        setMemberIdState(null);
      }
    }, 30000);
    return () => window.clearInterval(interval);
  }, [grupo]);

  const isHostUser = useMemo(() => {
    if (!grupo || !memberId) return false;
    return isHost(grupo, memberId);
  }, [grupo, memberId]);

  const tempoRestante = useMemo(() => {
    if (!grupo) return 0;
    return tempoRestanteMinutos(grupo);
  }, [grupo]);

  const total = useMemo(() => {
    if (!grupo) return 0;
    return calcularTotalGrupo(grupo);
  }, [grupo]);

  const totalPorPessoa = useMemo(() => {
    if (!grupo) return new Map();
    return calcularTotalPorPessoa(grupo);
  }, [grupo]);

  const itensPorMembro = useMemo(() => {
    if (!grupo) return new Map();
    return getItensPorMembro(grupo);
  }, [grupo]);

  const criar = useCallback((nomeGrupo: string, hostName: string) => {
    const novoGrupo = criarGrupo(nomeGrupo, hostName);
    setGrupo(novoGrupo);
    setMemberIdState(novoGrupo.hostId);
    setMemberId(novoGrupo.hostId);
    broadcastGroupUpdate(novoGrupo);
  }, []);

  const entrar = useCallback((codigo: string, nomeMembro: string): { sucesso: boolean; erro?: string } => {
    // Procura grupo pelo código — em produção seria via Supabase
    // Para demo, usamos o grupo armazenado localmente
    const stored = getStoredGroup();
    if (!stored || stored.codigo !== codigo) {
      return { sucesso: false, erro: 'Código de grupo no válido' };
    }

    const resultado = entrarGrupo(stored, nomeMembro);
    if (resultado.sucesso && resultado.grupo) {
      const novoMemberId = resultado.grupo.membros.find((m) => m.nome === nomeMembro)?.id || '';
      setGrupo(resultado.grupo);
      setMemberIdState(novoMemberId);
      setMemberId(novoMemberId);
      broadcastGroupUpdate(resultado.grupo);
    }
    return resultado;
  }, []);

  const adicionar = useCallback((item: CartItem) => {
    if (!grupo || !memberId) return;
    const membro = grupo.membros.find((m) => m.id === memberId);
    if (!membro) return;
    const atualizado = adicionarItem(grupo, item, memberId, membro.nome);
    setGrupo(atualizado);
    broadcastGroupUpdate(atualizado);
  }, [grupo, memberId]);

  const remover = useCallback((itemId: string): { sucesso: boolean; erro?: string } => {
    if (!grupo || !memberId) return { sucesso: false, erro: 'No estás en un grupo' };
    const resultado = removerItem(grupo, itemId, memberId);
    if (resultado.sucesso && resultado.grupo) {
      setGrupo(resultado.grupo);
      broadcastGroupUpdate(resultado.grupo);
    }
    return resultado;
  }, [grupo, memberId]);

  const fechar = useCallback((): { sucesso: boolean; erro?: string } => {
    if (!grupo || !memberId) return { sucesso: false, erro: 'No estás en un grupo' };
    const resultado = fecharGrupo(grupo, memberId);
    if (resultado.sucesso && resultado.grupo) {
      setGrupo(resultado.grupo);
      broadcastGroupUpdate(resultado.grupo);
    }
    return resultado;
  }, [grupo, memberId]);

  const sair = useCallback(() => {
    if (!grupo || !memberId) return;
    if (isHost(grupo, memberId)) {
      // Host sai = fecha o grupo
      clearStoredGroup();
      clearMemberId();
      setGrupo(null);
      setMemberIdState(null);
    } else {
      const atualizado = sairDoGrupo(grupo, memberId);
      setGrupo(atualizado);
      clearMemberId();
      setMemberIdState(null);
      broadcastGroupUpdate(atualizado);
    }
  }, [grupo, memberId]);

  const marcarRealizado = useCallback(() => {
    if (!grupo) return;
    const atualizado = marcarPedidoRealizado(grupo);
    setGrupo(atualizado);
    broadcastGroupUpdate(atualizado);
  }, [grupo]);

  const podeEditar = useCallback((itemId: string): boolean => {
    if (!grupo || !memberId) return false;
    return podeEditarItem(grupo, itemId, memberId);
  }, [grupo, memberId]);

  const limpar = useCallback(() => {
    clearStoredGroup();
    clearMemberId();
    setGrupo(null);
    setMemberIdState(null);
  }, []);

  return {
    grupo,
    memberId,
    isHostUser,
    tempoRestante,
    total,
    totalPorPessoa,
    itensPorMembro,
    criar,
    entrar,
    adicionar,
    remover,
    fechar,
    sair,
    marcarRealizado,
    podeEditar,
    limpar,
  };
}
