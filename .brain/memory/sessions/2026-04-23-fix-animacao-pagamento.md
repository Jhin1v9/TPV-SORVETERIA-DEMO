# 2026-04-23 — Fix: Animação de pagamento mostrava sempre "tarjeta"

**Tags:** #bug #fix #pagamento #ux #cliente

---

## O que foi feito

Corrigimos um bug onde a animação de processamento de pagamento (`ProcessandoPagamento`) sempre mostrava 💳 **Tarjeta**, independente do método selecionado (efectivo ou bizum).

### Causa raiz

No `CarrinhoPage.tsx`, o `metodo` estava **hardcoded** como `"tarjeta"`:

```tsx
// ANTES (bug)
<ProcessandoPagamento metodo="tarjeta" total={total * 1.10} />
```

### Solução

Adicionamos um estado `metodoPagamento` que é atualizado quando o usuário confirma o pagamento:

```tsx
// DEPOIS (fix)
const [metodoPagamento, setMetodoPagamento] = useState<string>('tarjeta');

const handlePagamentoSubmit = useCallback(async (data: PagamentoData) => {
  setShowPagamento(false);
  setMetodoPagamento(data.metodo);  // <-- método REAL do usuário
  setShowProcessando(true);
  // ...
}, []);

<ProcessandoPagamento metodo={metodoPagamento as any} total={total * 1.10} />
```

### Arquivos modificados

- `apps/cliente/src/pages/CarrinhoPage.tsx`

### Resultado

Agora a animação mostra o ícone e label correto:
- 💳 **Tarjeta** (tarjeta)
- 📱 **Bizum** (bizum)
- 💶 **Efectivo** (efectivo)

Build: ✅ Compila sem erros

---

*Persona ativa: The Surgeon (debug cirúrgico, mínimo código necessário)*
