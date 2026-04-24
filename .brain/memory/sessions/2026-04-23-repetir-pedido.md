# 2026-04-23 — Feature: Botão "Repetir Pedido" no Histórico

**Tags:** #feature #ux #cliente #historial #pedidos

---

## O que foi feito

Adicionamos um botão funcional **"¡Otra!"** em cada pedido do histórico (`tab === 'historial'`), permitindo que o usuário repita um pedido anterior com um clique.

### Arquivos modificados

1. `apps/cliente/src/hooks/useClienteToast.ts`
   - Nova função `reorderPlaced(orderNumber, count)` com toast divertido

2. `apps/cliente/src/pages/PedidosPage.tsx`
   - `PedidoCard` agora aceita prop `onRepetir` opcional
   - Botão "¡Otra!" com ícone `RefreshCcw` aparece só no histórico
   - `handleRepetirPedido` converte `ItemPedido[]` → `CartItem[]` usando `productSnapshot`
   - `e.stopPropagation()` evita abrir detalhes ao clicar no botão
   - Só mostra o botão se `pedido.itens.some(i => i.productSnapshot)` (segurança)

### UX Decisions (The Product)

- **Texto:** "¡Otra!" — curto, divertido, casual (espanhol)
- **Ícone:** `RefreshCcw` (setas circulares) — universalmente reconhecido como "repetir"
- **Cor:** Gradiente rosa/laranja (#FF6B9D) — consistente com a identidade visual
- **Posição:** À direita do card, antes da seta `ChevronRight`
- **Toast:** "¡De nuevo! 🍦" — confirmação amigável com emoji de sorvete

### Implementação (The Surgeon)

```typescript
const handleRepetirPedido = (pedido: Pedido) => {
  for (const item of pedido.itens) {
    if (!item.productSnapshot) continue;
    addToCarrinho({
      product: item.productSnapshot,
      quantity: item.quantidade,
      unitPrice: item.precoUnitario,
      selections: item.selections,
      notes: item.notas,
    });
  }
  toast.reorderPlaced(orderNumber, count);
};
```

### Resultado

Build: ✅ Compila sem erros

---

*Personas ativas: Product + Surgeon*
