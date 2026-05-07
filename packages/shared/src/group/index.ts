/**
 * ═══ FASE 11 — Group Ordering ═══
 * Barrel export
 */

export type { UseGroupOrderReturn } from './useGroupOrder';

export {
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
  gerarLinkCompartilhavel,
  podeEditarItem,
  isHost,
} from './groupOrder';

export {
  getStoredGroup,
  setStoredGroup,
  clearStoredGroup,
  broadcastGroupUpdate,
  listenGroupUpdates,
} from './groupStorage';

export { useGroupOrder } from './useGroupOrder';
