/**
 * ═══ FASE 11 — Group Ordering Tests ═══
 */

import { describe, it, expect } from 'vitest';
import {
  criarGrupo,
  entrarGrupo,
  adicionarItem,
  removerItem,
  fecharGrupo,
  estaExpirado,
  tempoRestanteMinutos,
  calcularTotalPorPessoa,
  calcularTotalGrupo,
  getItensPorMembro,
  isHost,
  podeEditarItem,
} from './groupOrder';
import type { CartItem } from '../types';

describe('Fase 11 — Group Ordering', () => {
  const mockItem: CartItem = {
    product: {
      id: 'p1',
      nome: { es: 'Helado', ca: 'Helat', pt: 'Gelado', en: 'Ice Cream' },
      imagem: '',
      categoriaId: 'copo300',
      emEstoque: true,
      alergenos: [],
      isPersonalizavel: false,
      preco: 3.5,
      descricao: { es: '', ca: '', pt: '', en: '' },
      opcoes: {},
      active: true,
      displayOrder: 0,
    },
    quantity: 2,
    unitPrice: 3.5,
  };

  // ═══ Criar grupo ═══
  describe('criarGrupo', () => {
    it('deve criar grupo com código de 6 dígitos', () => {
      const grupo = criarGrupo('Cumpleaños', 'Juan');
      expect(grupo.codigo).toHaveLength(6);
      expect(grupo.nome).toBe('Cumpleaños');
      expect(grupo.status).toBe('abierto');
      expect(grupo.membros).toHaveLength(1);
      expect(grupo.membros[0].nome).toBe('Juan');
      expect(grupo.hostId).toBe(grupo.membros[0].id);
    });

    it('deve gerar códigos únicos', () => {
      const g1 = criarGrupo('G1', 'A');
      const g2 = criarGrupo('G2', 'B');
      expect(g1.codigo).not.toBe(g2.codigo);
    });
  });

  // ═══ Entrar no grupo ═══
  describe('entrarGrupo', () => {
    it('deve permitir entrada com nome único', () => {
      const grupo = criarGrupo('Test', 'Host');
      const resultado = entrarGrupo(grupo, 'Ana');
      expect(resultado.sucesso).toBe(true);
      expect(resultado.grupo?.membros).toHaveLength(2);
    });

    it('deve rejeitar nome duplicado', () => {
      const grupo = criarGrupo('Test', 'Host');
      const r1 = entrarGrupo(grupo, 'Ana');
      expect(r1.sucesso).toBe(true);
      const resultado = entrarGrupo(r1.grupo!, 'ana'); // case insensitive
      expect(resultado.sucesso).toBe(false);
    });

    it('deve rejeitar entrada em grupo fechado', () => {
      const grupo = criarGrupo('Test', 'Host');
      const g1 = adicionarItem(grupo, mockItem, grupo.hostId, 'Host');
      const fechado = fecharGrupo(g1, grupo.hostId);
      expect(fechado.sucesso).toBe(true);
      const resultado = entrarGrupo(fechado.grupo!, 'Ana');
      expect(resultado.sucesso).toBe(false);
    });
  });

  // ═══ Adicionar item ═══
  describe('adicionarItem', () => {
    it('deve adicionar item ao grupo', () => {
      const grupo = criarGrupo('Test', 'Host');
      const atualizado = adicionarItem(grupo, mockItem, grupo.hostId, 'Host');
      expect(atualizado.itens).toHaveLength(1);
      expect(atualizado.itens[0].addedBy).toBe(grupo.hostId);
      expect(atualizado.itens[0].addedByName).toBe('Host');
    });

    it('deve gerar ID único para cada item', () => {
      const grupo = criarGrupo('Test', 'Host');
      const g1 = adicionarItem(grupo, mockItem, grupo.hostId, 'Host');
      const g2 = adicionarItem(g1, mockItem, grupo.hostId, 'Host');
      expect(g2.itens[0].id).not.toBe(g2.itens[1].id);
    });
  });

  // ═══ Remover item ═══
  describe('removerItem', () => {
    it('deve permitir host remover qualquer item', () => {
      const grupo = criarGrupo('Test', 'Host');
      const g1 = adicionarItem(grupo, mockItem, grupo.hostId, 'Host');
      const resultado = removerItem(g1, g1.itens[0].id, grupo.hostId);
      expect(resultado.sucesso).toBe(true);
      expect(resultado.grupo?.itens).toHaveLength(0);
    });

    it('deve permitir dono remover seu item', () => {
      const grupo = criarGrupo('Test', 'Host');
      const entrada = entrarGrupo(grupo, 'Ana');
      const anaId = entrada.grupo!.membros.find((m) => m.nome === 'Ana')!.id;
      const g1 = adicionarItem(entrada.grupo!, mockItem, anaId, 'Ana');
      const resultado = removerItem(g1, g1.itens[0].id, anaId);
      expect(resultado.sucesso).toBe(true);
    });

    it('deve rejeitar membro remover item de outro', () => {
      const grupo = criarGrupo('Test', 'Host');
      const entrada = entrarGrupo(grupo, 'Ana');
      const anaId = entrada.grupo!.membros.find((m) => m.nome === 'Ana')!.id;
      const g1 = adicionarItem(entrada.grupo!, mockItem, grupo.hostId, 'Host');
      const resultado = removerItem(g1, g1.itens[0].id, anaId);
      expect(resultado.sucesso).toBe(false);
    });
  });

  // ═══ Fechar grupo ═══
  describe('fecharGrupo', () => {
    it('deve permitir host fechar grupo com itens', () => {
      const grupo = criarGrupo('Test', 'Host');
      const g1 = adicionarItem(grupo, mockItem, grupo.hostId, 'Host');
      const resultado = fecharGrupo(g1, grupo.hostId);
      expect(resultado.sucesso).toBe(true);
      expect(resultado.grupo?.status).toBe('cerrado');
    });

    it('deve rejeitar fechar grupo vazio', () => {
      const grupo = criarGrupo('Test', 'Host');
      const resultado = fecharGrupo(grupo, grupo.hostId);
      expect(resultado.sucesso).toBe(false);
    });

    it('deve rejeitar não-host fechar grupo', () => {
      const grupo = criarGrupo('Test', 'Host');
      const entrada = entrarGrupo(grupo, 'Ana');
      const anaId = entrada.grupo!.membros.find((m) => m.nome === 'Ana')!.id;
      const g1 = adicionarItem(entrada.grupo!, mockItem, anaId, 'Ana');
      const resultado = fecharGrupo(g1, anaId);
      expect(resultado.sucesso).toBe(false);
    });
  });

  // ═══ Cálculos ═══
  describe('cálculos', () => {
    it('deve calcular total do grupo', () => {
      const grupo = criarGrupo('Test', 'Host');
      const g1 = adicionarItem(grupo, mockItem, grupo.hostId, 'Host');
      expect(calcularTotalGrupo(g1)).toBe(7.0); // 2 × 3.5
    });

    it('deve calcular total por pessoa', () => {
      const grupo = criarGrupo('Test', 'Host');
      const entrada = entrarGrupo(grupo, 'Ana');
      const anaId = entrada.grupo!.membros.find((m) => m.nome === 'Ana')!.id;
      const g1 = adicionarItem(entrada.grupo!, mockItem, grupo.hostId, 'Host');
      const g2 = adicionarItem(g1, { ...mockItem, quantity: 1 }, anaId, 'Ana');
      const porPessoa = calcularTotalPorPessoa(g2);
      expect(porPessoa.get(grupo.hostId)?.total).toBe(7.0);
      expect(porPessoa.get(anaId)?.total).toBe(3.5);
    });

    it('deve agrupar itens por membro', () => {
      const grupo = criarGrupo('Test', 'Host');
      const g1 = adicionarItem(grupo, mockItem, grupo.hostId, 'Host');
      const porMembro = getItensPorMembro(g1);
      expect(porMembro.get(grupo.hostId)?.length).toBe(1);
    });
  });

  // ═══ Permissões ═══
  describe('permissões', () => {
    it('deve identificar host corretamente', () => {
      const grupo = criarGrupo('Test', 'Host');
      expect(isHost(grupo, grupo.hostId)).toBe(true);
      expect(isHost(grupo, 'outro-id')).toBe(false);
    });

    it('deve verificar quem pode editar item', () => {
      const grupo = criarGrupo('Test', 'Host');
      const g1 = adicionarItem(grupo, mockItem, grupo.hostId, 'Host');
      expect(podeEditarItem(g1, g1.itens[0].id, grupo.hostId)).toBe(true);
      expect(podeEditarItem(g1, g1.itens[0].id, 'outro-id')).toBe(false);
    });
  });

  // ═══ Expiração ═══
  describe('expiração', () => {
    it('deve calcular tempo restante', () => {
      const grupo = criarGrupo('Test', 'Host');
      const restante = tempoRestanteMinutos(grupo);
      expect(restante).toBeGreaterThan(0);
      expect(restante).toBeLessThanOrEqual(120);
    });

    it('grupo recém-criado não deve estar expirado', () => {
      const grupo = criarGrupo('Test', 'Host');
      expect(estaExpirado(grupo)).toBe(false);
    });
  });
});
