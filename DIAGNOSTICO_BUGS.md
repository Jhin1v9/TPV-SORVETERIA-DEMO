# Relatório de Diagnóstico — Bugs Cliente PWA + Kiosk

**Data:** 2026-04-21
**Versão do código:** commit `1d9d399` (main)
**Build:** ✅ Passou em todos os 4 apps
**Testes unitários:** ✅ 81/81 passando

---

## RESUMO EXECUTIVO

| Bug | Severidade | Status | Causa Principal |
|-----|-----------|--------|-----------------|
| **Cliente PWA — Tela branca ao abrir modal** | 🔴 Alta | **NÃO CORRIGIDO** | Múltiplas causas prováveis (ver seção 1) |
| **Kiosk — Produtos fixos não adicionam ao carrinho** | 🔴 Alta | **NÃO CORRIGIDO** | Botão "Añadir" desabilitado quando quantidade = 0, bloqueando o fallback do handler |

---

## 1. CLIENTE PWA — TELA BRANCA AO ABRIR MODAL

### 1.1 Descrição do Problema
Ao clicar em qualquer produto no cardápio, o `ProductDetailModal` deveria abrir com foto grande, descrição e opções. Em vez disso, a tela fica completamente branca (white screen of death — WSOD).

### 1.2 Análise do Código — `ProductDetailModal.tsx`

O componente foi criado do zero (448 linhas) e substituiu o `PersonalizacaoDrawer` anterior. O build passa e o TypeScript não reporta erros, mas **erros de runtime podem ocorrer** mesmo quando o build passa.

#### Causa Provável #1: Erro no `useEffect` com ref acessando DOM inexistente
```tsx
// Linha 53-58
useEffect(() => {
  setSelecoes({});
  setHeaderCompact(false);
  if (scrollRef.current) scrollRef.current.scrollTop = 0;
}, [produto?.id]);
```
**Problema:** Quando `produto` muda rapidamente (ex: usuário clica em produto A, depois imediatamente em produto B), o `useEffect` pode rodar enquanto o DOM anterior foi desmontado mas o novo ainda não foi montado. O `scrollRef.current` pode estar `null` ou referir a um elemento desconectado. Embora o `if` previna o crash em `null`, o estado interno do React pode ficar inconsistente, causando WSOD em cascata.

**Impacto:** ALTO — afeta todos os produtos quando o usuário clica rapidamente.

#### Causa Provável #2: AnimatePresence aninhado sem chave única
```tsx
// ProductDetailModal.tsx — linha 73
<AnimatePresence>
  <motion.div ...>
```
O `AnimatePresence` interno do modal NÃO tem `mode="wait"` nem `key` nos filhos. O `ClienteApp.tsx` já tem um `AnimatePresence mode="wait"` no nível superior. AnimatePresences aninhados sem keys adequadas podem causar:
- Conflitos de estado de animação
- Renderização de elementos fantasmas
- WSOD quando o componente é montado/desmontado rapidamente

**Impacto:** MÉDIO — afeta principalmente transições rápidas.

#### Causa Provável #3: Cast forçado de `produto.opcoes` sem verificação de tipo em runtime
```tsx
// Linha ~240 (dentro do map de secoes)
const opcoes = (produto.opcoes as Record<string, OpcaoPersonalizacao[]>)[key];
```
O cast `as Record<string, OpcaoPersonalizacao[]>` assume que `produto.opcoes` existe e é um objeto indexável. Embora `isPersonalizavel` seja verificado antes, o TypeScript cast não oferece proteção em runtime. Se `produto.opcoes` for:
- `undefined`
- `null`
- Um array em vez de objeto
- Um proxy que não suporta indexação por string

O acesso `[key]` retornaria `undefined`, e `if (!opcoes || opcoes.length === 0) return null;` lidaria com isso. **MAS** se `produto.opcoes` for um tipo inesperado, o cast pode mascarar um erro que explode em outro lugar.

**Impacto:** BAIXO — improvável com dados estáticos, mas possível com dados do Supabase.

#### Causa Provável #4: Loop infinito de renderização
O `useEffect` depende de `produto?.id`. Se o componente pai (`CardapioPage`) recria o objeto `produto` a cada render (em vez de passar a referência do array `todosProdutos`), o `useEffect` pode rodar repetidamente, causando:
- `setSelecoes({})` → re-render
- `produto?.id` muda (porque é um novo objeto) → useEffect roda de novo
- Loop infinito

**Verificação:** No `CardapioPage`, `produtosFiltrados` é criado via `useMemo`, mas os objetos do array vêm de `todosProdutos` que é um módulo importado — deveriam ser as mesmas referências. Mas o `useMemo` pode recriar o array a cada mudança de `locale` ou `categoriaAtiva`, e embora os objetos sejam os mesmos, se o `useMemo` do `CardapioPage` mudar, pode causar re-render do `ProdutoCard`.

**Impacto:** MÉDIO — possível se houver renderização frequente do CardapioPage.

#### Causa Provável #5: Problema com `todosProdutos` no escopo do modal
```tsx
import { todosProdutos } from '@tpv/shared/data/produtosLocal';
```
O `getSugestoes` function itera sobre `todosProdutos`. Se o módulo `produtosLocal.ts` tiver um erro de circular dependency ou exportação, `todosProdutos` poderia ser `undefined` em runtime. O `filter` em `undefined` causaria `TypeError: Cannot read properties of undefined`.

**Impacto:** BAIXO — improvável, mas a arquitetura do modal importa o catálogo inteiro apenas para 2 sugestões.

### 1.3 Como Reproduzir
1. Abrir https://cliente-pearl.vercel.app/
2. Clicar em qualquer produto (fixo ou personalizável)
3. A tela fica branca

### 1.4 Como Confirmar a Causa Exata
Abrir o DevTools do navegador (F12) e verificar:
- **Console:** Erro de JavaScript (vermelho) com stack trace
- **Network:** Alguma requisição falhou?
- **React DevTools:** O componente está montando? O estado está correto?

**Sem acesso ao console, é impossível determinar a causa exata com 100% de certeza.**

### 1.5 Soluções Recomendadas (por ordem de prioridade)

#### Solução A: Adicionar Error Boundary no modal
```tsx
class ModalErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("Modal error:", error, info); }
  render() { return this.state.hasError ? <div>Erro ao carregar produto</div> : this.props.children; }
}
```
**Por quê:** Captura qualquer erro de runtime no modal, evitando WSOD e mostrando mensagem amigável.

#### Solução B: Simplificar o useEffect do scrollRef
```tsx
useEffect(() => {
  setSelecoes({});
  setHeaderCompact(false);
  // Mover scroll reset para APÓS a animação de abertura
  const timer = setTimeout(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, 100);
  return () => clearTimeout(timer);
}, [produto?.id]);
```
**Por quê:** Evita acessar o ref antes do DOM estar completamente montado.

#### Solução C: Adicionar `key` ao AnimatePresence do modal
```tsx
<AnimatePresence mode="wait">
  {produto && (
    <motion.div key={produto.id} ...>
```
**Por quê:** Garante que o AnimatePresence trate cada produto como um elemento único, evitando conflitos de animação.

#### Solução D: Remover sugestões de combinação (simplificação)
A seção de sugestões importa `todosProdutos` e itera sobre todo o catálogo. Remover temporariamente essa funcionalidade isolaria se o problema está nessa seção.

---

## 2. KIOSK — PRODUTOS FIXOS NÃO ADICIONAM AO CARRINHO

### 2.1 Descrição do Problema
No Kiosk, produtos personalizáveis (cono, gofre, açaí) funcionam corretamente. Produtos fixos (copa-bahia, cafe, agua, etc.) NÃO são adicionados ao carrinho. O usuário clica no botão mas nada acontece.

### 2.2 Análise do Código — `apps/kiosk/src/screens/CardapioScreen.tsx`

#### O Bug (linha 251-258):
```tsx
<motion.button
  onClick={onAdd}
  disabled={quantidade === 0}   // ← BUG CRÍTICO
  className="... disabled:opacity-40"
>
  <Plus size={18} /> Añadir
</motion.button>
```

#### O Handler (linha 44-54):
```tsx
const handleAdd = (produto: Produto) => {
  const qtd = getQuantidade(produto.id);
  if (qtd > 0) {
    onAddToCart(produto, qtd);
    setQuantidades((prev) => ({ ...prev, [produto.id]: 0 }));
  } else if (isProdutoPersonalizavel(produto)) {
    onPersonalizar(produto);
  } else {
    onAddToCart(produto, 1);   // ← ESTE CÓDIGO NUNCA É ALCANÇADO
  }
};
```

### 2.3 Explicação do Fluxo quebrado

Para produtos fixos no Kiosk:

1. O usuário vê o card do produto com:
   - Botão `[-]` (diminuir quantidade)
   - Contador mostrando `0`
   - Botão `[+]` (aumentar quantidade)
   - Botão "Añadir" (gradiente rosa)

2. O usuário espera: clicar em "Añadir" → produto vai para o carrinho

3. O que acontece: O botão "Añadir" está **`disabled={quantidade === 0}`**
   - Como a quantidade inicial é 0, o botão está DESABILITADO
   - O clique NÃO dispara `onAdd`
   - O fallback `onAddToCart(produto, 1)` NUNCA executa

4. O usuário precisa descobrir sozinho que deve:
   - Clicar no `[+]` para aumentar quantidade para 1
   - SÓ ENTÃO o botão "Añadir" fica habilitado
   - Clicar em "Añadir" para adicionar

5. **Mas mesmo quando a quantidade é > 0**, o handler funciona de forma estranha:
   ```tsx
   if (qtd > 0) {
     onAddToCart(produto, qtd);  // Adiciona com a quantidade selecionada
     setQuantidades(...);         // Reseta a quantidade para 0
   }
   ```
   Isso significa que o usuário precisa clicar `[+]` 3 vezes e depois "Añadir" para adicionar 3 unidades. Isso pode ser intencional para o Kiosk (permitir múltiplas unidades), mas a UX é confusa.

### 2.4 Por que Produtos Personalizáveis Funcionam?

Produtos personalizáveis têm um botão SEPARADO:
```tsx
{personalizavel ? (
  <motion.button onClick={onPersonalizar}>
    ⚙️ Personalizar
  </motion.button>
) : (
  // Contador + botão Añadir desabilitado
)}
```

O botão "Personalizar" NÃO está desabilitado! Ele abre a tela de personalização diretamente. Por isso produtos personalizáveis funcionam.

### 2.5 Como Reproduzir
1. Abrir https://kiosk-swart-delta.vercel.app/
2. Selecionar qualquer categoria com produtos fixos (ex: "Cafés")
3. Clicar no botão "Añadir" de um produto fixo (ex: Café)
4. Nada acontece — o botão está desabilitado

### 2.6 Soluções Recomendadas

#### Solução A: Habilitar o botão "Añadir" sempre (RECOMENDADA)
```tsx
// Remover disabled={quantidade === 0}
<motion.button
  onClick={onAdd}
  className="..."
>
  {quantidade === 0 ? 'Añadir' : `Añadir (${quantidade})`}
</motion.button>
```

E ajustar o handler para ser mais claro:
```tsx
const handleAdd = (produto: Produto) => {
  const qtd = getQuantidade(produto.id);
  if (isProdutoPersonalizavel(produto)) {
    onPersonalizar(produto);
  } else {
    // Produto fixo: adiciona quantidade selecionada, ou 1 se for 0
    const quantidadeFinal = qtd > 0 ? qtd : 1;
    onAddToCart(produto, quantidadeFinal);
    setQuantidades((prev) => ({ ...prev, [produto.id]: 0 }));
  }
};
```

#### Solução B: Simplificar a UX — botão único "Añadir" sem contador
Para produtos fixos no Kiosk, usar o mesmo padrão do Cliente PWA: botão "Añadir" que adiciona 1 unidade diretamente, sem contador de quantidade.

---

## 3. COMPARAÇÃO: CARDÁPIO CLIENTE vs KIOSK

### 3.1 Fonte de Dados
| App | Fonte do Cardápio | Método de Acesso |
|-----|-------------------|-------------------|
| **Cliente PWA** | `todosProdutos` (local) | Import direto de `@tpv/shared/data/produtosLocal` |
| **Kiosk** | `todosProdutos` (local) | Import direto de `@tpv/shared/data/produtosLocal` |

✅ **Ambos usam a MESMA fonte de dados.** O cardápio é idêntico em ambos.

### 3.2 Diferenças de Renderização
| Aspecto | Cliente PWA | Kiosk |
|---------|-------------|-------|
| Tela de produto | `ProductDetailModal` (modal bottom-sheet) | `PersonalizacaoScreen` (tela fullscreen) |
| Produtos fixos | Abre modal (view-only) + CTA direto | Contador +/- + botão "Añadir" (com bug) |
| Produtos personalizáveis | Modal com opções | Tela separada com opções |
| Fly-to-cart | ✅ Sim | ❌ Não |

### 3.3 Verificação de Itens
Ambos os apps iteram sobre o **mesmo array** `todosProdutos`. Se um item existe em um, existe no outro. A única diferença é como cada app permite a interação com o item.

---

## 4. ANÁLISE DE ARQUITETURA — PROBLEMAS ESTRUTURAIS

### 4.1 Duplicação de Código de Personalização
- **Cliente PWA:** `ProductDetailModal.tsx` (448 linhas, novo)
- **Kiosk:** `PersonalizacaoScreen.tsx` (148 linhas)
- **Kiosk (tela alternativa):** `CategoriasScreen.tsx` com `PersonalizeModal` (404 linhas)

**Problema:** 3 implementações diferentes da mesma lógica de personalização. Qualquer mudança no cardápio (novos sabores, novos limites) precisa ser replicada em 3 lugares.

### 4.2 KioskApp — Duplo `useStore()` (anti-padrão)
```tsx
// KioskApp.tsx linha 19
const { setScreen: _setScreen, setCurrentPedido, clearCarrinho, resetKiosk, connectionStatus, locale } = useStore();
// ...
// KioskApp.tsx linha 48
const { carrinho, addToCarrinho, removeFromCarrinho } = useStore();
```
Chamar `useStore()` duas vezes no mesmo componente funciona, mas é desnecessário e confuso. Não causa bugs diretos, mas indica falta de organização.

### 4.3 Deploys Vercel — Inconsistência de URLs
| App | URL Esperada | URL Real após último deploy |
|-----|-------------|---------------------------|
| Cliente | cliente-pearl.vercel.app | ✅ cliente-pearl.vercel.app |
| Kiosk | kiosk-swart-delta.vercel.app | ✅ kiosk-swart-delta.vercel.app |
| Admin | admin-ten-vert-54.vercel.app | ✅ admin-ten-vert-54.vercel.app |
| KDS | kds-one.vercel.app | ✅ kds-one.vercel.app |

Todos os deploys foram atualizados com sucesso na última execução.

---

## 5. RECOMENDAÇÕES GERAIS

### Prioridade 1 (Imediata)
1. **Corrigir o Kiosk:** Remover `disabled={quantidade === 0}` do botão "Añadir" para produtos fixos
2. **Diagnosticar o Cliente:** Adicionar Error Boundary no `ProductDetailModal` para capturar e logar o erro exato

### Prioridade 2 (Curto prazo)
3. Unificar a lógica de personalização em um único componente reutilizável (`ProductCustomizer`) usado tanto pelo Cliente quanto pelo Kiosk
4. Adicionar testes E2E com Playwright para cobrir o fluxo de abrir modal e adicionar produtos

### Prioridade 3 (Médio prazo)
5. Implementar feature flags para testar novas funcionalidades (como sugestões de combinação) sem afetar o fluxo principal
6. Adicionar telemetry/Sentry para capturar erros de runtime em produção

---

## 6. CHECKLIST PARA VALIDAÇÃO APÓS CORREÇÃO

- [ ] Cliente PWA: Clicar em produto fixo → modal abre com foto, descrição, alergenos, botão "Añadir"
- [ ] Cliente PWA: Clicar em produto personalizável → modal abre com opções de tamanho/sabor/topping
- [ ] Cliente PWA: Clicar em sugestão de combinação → modal do novo produto abre corretamente
- [ ] Kiosk: Clicar em produto fixo → produto é adicionado ao carrinho imediatamente
- [ ] Kiosk: Clicar em produto personalizável → abre tela de personalização
- [ ] Kiosk: Aumentar quantidade com [+] → clicar "Añadir" → adiciona quantidade correta
- [ ] Ambos: Cardápio mostra os mesmos produtos (verificar categoria "Cafés" em ambos)
- [ ] Ambos: Preços são idênticos para o mesmo produto
