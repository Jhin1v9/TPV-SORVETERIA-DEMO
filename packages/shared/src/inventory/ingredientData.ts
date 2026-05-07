/**
 * ═══ FASE 10 — Ingredient-level Inventory ═══
 * Dados mock de ingredientes e receitas
 */

import type { Ingrediente, ProductRecipe } from '../types';

export const ingredientes: Ingrediente[] = [
  { id: 'leite', nome: { ca: 'Llet', es: 'Leche', pt: 'Leite', en: 'Milk' }, unidade: 'ml', stock: 50000, alertaStock: 5000, ativo: true },
  { id: 'crema', nome: { ca: 'Crema', es: 'Crema de leche', pt: 'Creme de leite', en: 'Cream' }, unidade: 'ml', stock: 25000, alertaStock: 2500, ativo: true },
  { id: 'acucar', nome: { ca: 'Sucre', es: 'Azúcar', pt: 'Açúcar', en: 'Sugar' }, unidade: 'g', stock: 20000, alertaStock: 2000, ativo: true },
  { id: 'ovos', nome: { ca: 'Ous', es: 'Huevos', pt: 'Ovos', en: 'Eggs' }, unidade: 'un', stock: 200, alertaStock: 20, ativo: true },
  { id: 'morango', nome: { ca: 'Maduixa', es: 'Fresa', pt: 'Morango', en: 'Strawberry' }, unidade: 'g', stock: 8000, alertaStock: 800, ativo: true },
  { id: 'chocolate', nome: { ca: 'Xocolata', es: 'Chocolate', pt: 'Chocolate', en: 'Chocolate' }, unidade: 'g', stock: 10000, alertaStock: 1000, ativo: true },
  { id: 'baunilha', nome: { ca: 'Vainilla', es: 'Vainilla', pt: 'Baunilha', en: 'Vanilla' }, unidade: 'ml', stock: 5000, alertaStock: 500, ativo: true },
  { id: 'casquinha', nome: { ca: 'Cucurutxo', es: 'Cono', pt: 'Casquinha', en: 'Cone' }, unidade: 'un', stock: 300, alertaStock: 30, ativo: true },
  { id: 'copo_300', nome: { ca: 'Got 300ml', es: 'Vaso 300ml', pt: 'Copo 300ml', en: 'Cup 300ml' }, unidade: 'un', stock: 500, alertaStock: 50, ativo: true },
  { id: 'copo_500', nome: { ca: 'Got 500ml', es: 'Vaso 500ml', pt: 'Copo 500ml', en: 'Cup 500ml' }, unidade: 'un', stock: 400, alertaStock: 40, ativo: true },
  { id: 'granulado', nome: { ca: 'Gragea', es: 'Granulado', pt: 'Granulado', en: 'Sprinkles' }, unidade: 'g', stock: 3000, alertaStock: 300, ativo: true },
  { id: 'calda_chocolate', nome: { ca: 'Xarop de xocolata', es: 'Sirope de chocolate', pt: 'Calda de chocolate', en: 'Chocolate syrup' }, unidade: 'ml', stock: 4000, alertaStock: 400, ativo: true },
  { id: 'nata', nome: { ca: 'Nata', es: 'Nata', pt: 'Chantilly', en: 'Whipped cream' }, unidade: 'ml', stock: 6000, alertaStock: 600, ativo: true },
  { id: 'cafe', nome: { ca: 'Cafè', es: 'Café', pt: 'Café', en: 'Coffee' }, unidade: 'ml', stock: 8000, alertaStock: 800, ativo: true },
];

/**
 * Receitas — quantidade de cada ingrediente por unidade do produto
 * Produtos personalizáveis usam a base + sabores adicionais
 */
export const receitas: ProductRecipe[] = [
  // Copos
  { productId: 'copo_300', ingredientes: [
    { ingredienteId: 'leite', quantidade: 150 },
    { ingredienteId: 'crema', quantidade: 50 },
    { ingredienteId: 'acucar', quantidade: 30 },
    { ingredienteId: 'copo_300', quantidade: 1 },
  ]},
  { productId: 'copo_500', ingredientes: [
    { ingredienteId: 'leite', quantidade: 250 },
    { ingredienteId: 'crema', quantidade: 80 },
    { ingredienteId: 'acucar', quantidade: 50 },
    { ingredienteId: 'copo_500', quantidade: 1 },
  ]},
  // Cones
  { productId: 'cono_simple', ingredientes: [
    { ingredienteId: 'leite', quantidade: 100 },
    { ingredienteId: 'crema', quantidade: 30 },
    { ingredienteId: 'acucar', quantidade: 20 },
    { ingredienteId: 'casquinha', quantidade: 1 },
  ]},
  { productId: 'cono_doble', ingredientes: [
    { ingredienteId: 'leite', quantidade: 180 },
    { ingredienteId: 'crema', quantidade: 60 },
    { ingredienteId: 'acucar', quantidade: 40 },
    { ingredienteId: 'casquinha', quantidade: 1 },
  ]},
  // Sundaes
  { productId: 'sundae_clasico', ingredientes: [
    { ingredienteId: 'leite', quantidade: 200 },
    { ingredienteId: 'crema', quantidade: 80 },
    { ingredienteId: 'acucar', quantidade: 40 },
    { ingredienteId: 'calda_chocolate', quantidade: 20 },
    { ingredienteId: 'granulado', quantidade: 10 },
    { ingredienteId: 'copo_500', quantidade: 1 },
  ]},
  { productId: 'sundae_fresa', ingredientes: [
    { ingredienteId: 'leite', quantidade: 200 },
    { ingredienteId: 'crema', quantidade: 80 },
    { ingredienteId: 'acucar', quantidade: 40 },
    { ingredienteId: 'morango', quantidade: 50 },
    { ingredienteId: 'nata', quantidade: 30 },
    { ingredienteId: 'copo_500', quantidade: 1 },
  ]},
  // Café
  { productId: 'cafe_solo', ingredientes: [
    { ingredienteId: 'cafe', quantidade: 120 },
    { ingredienteId: 'copo_300', quantidade: 1 },
  ]},
  { productId: 'cafe_con_leche', ingredientes: [
    { ingredienteId: 'cafe', quantidade: 80 },
    { ingredienteId: 'leite', quantidade: 100 },
    { ingredienteId: 'copo_300', quantidade: 1 },
  ]},
  // Waffles/Gofres
  { productId: 'gofre_clasico', ingredientes: [
    { ingredienteId: 'leite', quantidade: 120 },
    { ingredienteId: 'ovos', quantidade: 1 },
    { ingredienteId: 'acucar', quantidade: 30 },
    { ingredienteId: 'chocolate', quantidade: 20 },
  ]},
  { productId: 'gofre_fresa', ingredientes: [
    { ingredienteId: 'leite', quantidade: 120 },
    { ingredienteId: 'ovos', quantidade: 1 },
    { ingredienteId: 'acucar', quantidade: 30 },
    { ingredienteId: 'morango', quantidade: 40 },
    { ingredienteId: 'nata', quantidade: 20 },
  ]},
  // Açaí
  { productId: 'acai_bowl', ingredientes: [
    { ingredienteId: 'morango', quantidade: 60 },
    { ingredienteId: 'acucar', quantidade: 20 },
    { ingredienteId: 'copo_500', quantidade: 1 },
  ]},
  // Batidos
  { productId: 'batido_chocolate', ingredientes: [
    { ingredienteId: 'leite', quantidade: 300 },
    { ingredienteId: 'chocolate', quantidade: 40 },
    { ingredienteId: 'acucar', quantidade: 25 },
    { ingredienteId: 'copo_500', quantidade: 1 },
  ]},
  { productId: 'batido_fresa', ingredientes: [
    { ingredienteId: 'leite', quantidade: 300 },
    { ingredienteId: 'morango', quantidade: 60 },
    { ingredienteId: 'acucar', quantidade: 25 },
    { ingredienteId: 'copo_500', quantidade: 1 },
  ]},
  // Crepe
  { productId: 'crepe_nutella', ingredientes: [
    { ingredienteId: 'leite', quantidade: 100 },
    { ingredienteId: 'ovos', quantidade: 1 },
    { ingredienteId: 'acucar', quantidade: 20 },
    { ingredienteId: 'chocolate', quantidade: 30 },
  ]},
  { productId: 'crepe_fresa', ingredientes: [
    { ingredienteId: 'leite', quantidade: 100 },
    { ingredienteId: 'ovos', quantidade: 1 },
    { ingredienteId: 'acucar', quantidade: 20 },
    { ingredienteId: 'morango', quantidade: 50 },
    { ingredienteId: 'nata', quantidade: 20 },
  ]},
];

/** Ingredientes extras por sabor selecionado (opcional) */
export const saborExtras: Record<string, { ingredienteId: string; quantidade: number }[]> = {
  'chocolate_negro': [{ ingredienteId: 'chocolate', quantidade: 15 }],
  'chocolate_blanco': [{ ingredienteId: 'chocolate', quantidade: 15 }],
  'fresa': [{ ingredienteId: 'morango', quantidade: 20 }],
  'vainilla': [{ ingredienteId: 'baunilha', quantidade: 10 }],
  'cafe': [{ ingredienteId: 'cafe', quantidade: 15 }],
};
