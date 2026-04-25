# 📐 Padrões de Código do Projeto

> "Um padrão é uma solução testada para um problema recorrente em um contexto específico."
> — Christopher Alexander

## Convenções Gerais

### Idioma
- Código e comentários: **inglês** (para consistência internacional)
- UI/UX e textos visíveis ao usuário: **português/español/català** (i18n via `@tpv/shared/i18n`)
- Nomes de arquivos: **kebab-case** (`carrinho-page.tsx`)
- Nomes de componentes: **PascalCase** (`CarrinhoPage`)
- Nomes de funções/variáveis: **camelCase** (`handlePagamento`)
- Nomes de constantes: **SCREAMING_SNAKE_CASE** (`RECONNECT_DELAY_MS`)
- Nomes de types/interfaces: **PascalCase** com sufixo descritivo (`PagamentoData`, `PedidoStatus`)

### TypeScript
- **Sempre** use `type` para objetos simples; `interface` apenas quando necessitar `extends`
- **Nunca** use `any`. Use `unknown` + type guard.
- **Prefira** `??` sobre `||` para defaults (nullish coalescing)
- **Use** `satisfies` quando precisar inferência restrita

### React
- Componentes funcionais com hooks. **Nenhum** class component.
- Props desestruturadas no parâmetro: `function Button({ label, onClick }: Props)`
- `useCallback` para handlers passados a children
- `useMemo` para computações pesadas
- **Evite** `useEffect` quando possível. Prefira event handlers.

### CSS/Tailwind
- Classes em ordem: layout → sizing → spacing → typography → colors → effects
- Não use valores arbitrários (`w-[123px]`) sem boa razão
- Use `cn()` utility (se existir) para classes condicionais
- Animações via `framer-motion` para interações complexas

---

## Padrões Arquiteturais

### P1: Realtime Sync Pattern
**Contexto:** 4 apps precisam ver os mesmos dados em tempo real.
**Solução:**
```typescript
// 1. Hook se inscreve no RealtimeManager
useRealtimeSync();

// 2. RealtimeManager escuta postgres_changes no canal 'tpv-demo-sync'
// 3. Ao receber evento, faz fetch de snapshot completo
// 4. Snapshot é aplicado ao Zustand store via hydrateRemoteState()
```
**Quando usar:** Sempre que múltiplos clients precisam dados sincronizados.
**Quando NÃO usar:** Dados locais/efêmeros (ex: estado de input).

---

### P2: RPC with Security Definer Pattern
**Contexto:** Escritas sensíveis no banco precisam de validação e lógica de negócio.
**Solução:**
```sql
CREATE OR REPLACE FUNCTION public.create_order(...)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER  -- <-- executa com privilégios do dono
SET search_path = public
AS $$
  -- validação
  -- lógica de negócio
  -- inserção
  -- retorno
$$;
```
**Quando usar:** Criação de pedidos, atualização de estoque, operações financeiras.
**Quando NÃO usar:** Leituras simples (use RLS + REST direto).

---

### P3: Snapshot + Hydrate Pattern
**Contexto:** Estado precisa ser sincronizado entre server e client.
**Solução:**
```typescript
// Server retorna snapshot completo após mutação
const { snapshot } = await createRemoteOrder(payload);

// Client aplica snapshot no store (sobrescreve estado local)
hydrateRemoteState(snapshot);
```
**Quando usar:** Após qualquer mutação que afete múltiplas entidades.
**Quando NÃO usar:** Atualizações locais simples (ex: toggle de checkbox).

---

### P4: Product Snapshot Immutability Pattern
**Contexto:** Preços e nomes de produtos mudam, mas pedidos antigos devem mostrar o valor original.
**Solução:**
```typescript
// No momento da compra, salva snapshot JSONB imutável
product_snapshot: item.product  // JSONB no banco

// No KDS/Admin, renderiza product_snapshot em vez de fazer JOIN
// Isso preserva o estado histórico
```
**Quando usar:** Toda entidade que referencia dados que podem mudar (produtos, sabores, preços).
**Quando NÃO usar:** Referências a entidades estáveis (ex: usuário que não muda de nome).

---

### P5: Fallback / Standalone Pattern
**Contexto:** App precisa funcionar offline ou sem backend configurado.
**Solução:**
```typescript
const runtimeMode = hasSupabaseConfig ? 'supabase' : 'standalone';

if (runtimeMode === 'standalone') {
  // usa localStorage + mock data
} else {
  // usa Supabase RPC + Realtime
}
```
**Quando usar:** Demo, desenvolvimento offline, fallback de conectividade.
**Quando NÃO usar:** Produção com sincronização multi-device (localStorage é isolado).

---

### P6: i18n with Locale Key Pattern
**Contexto:** App suporta múltiplos idiomas (pt, es, ca, en).
**Solução:**
```typescript
// 1. Textos como objetos com chaves de idioma
const nome = { es: 'Helado', ca: 'Gelat', pt: 'Sorvete', en: 'Ice Cream' };

// 2. Hook/utility seleciona idioma atual
const label = product.nome[locale] || product.nome.es;
```
**Quando usar:** Todo texto visível ao usuário.
**Quando NÃO usar:** Logs, erros técnicos, nomes de variáveis.

---

### P7: Error Boundary + Toast Pattern
**Contexto:** Erros de runtime não devem quebrar toda a UI.
**Solução:**
```typescript
// 1. Error Boundary no nível de página/major section
// 2. Try/catch em operações async com toast
} catch (err) {
  console.error('[Component] Erro:', err);
  toast.error(t('error', locale), { description: t('connectionOffline', locale) });
}
```
**Quando usar:** Todas as operações async (API calls, file operations).
**Quando NÃO usar:** Não capture erros de propósito (deixe crashar em dev para ver o stack trace).

---

### P8: Final Mirror Pattern
**Contexto:** O bug detector precisa ter uma referência final única em `Documentos`, sem múltiplas versões espalhadas.
**Solução:**
```bash
# 1. Atualize no repo
# 2. Gere a demo/artifacts se necessário
# 3. Sincronize a versão final
npm run sync:bugdetector
```
**Resultado esperado:**
- `C:\Users\Administrator\Documents\Auris-BugDetector-Final` vira a fonte final
- `artifacts/bug-detector-live-demo-*` mantém apenas a demo mais recente
- arquivos principais do detector são espelhados para a pasta final
**Quando usar:** Sempre que houver mudança relevante no bug detector, demo ou wrapper final.
**Quando NÃO usar:** Para histórico longo prazo. Essa pasta é espelho final, não arquivo morto.

---

## Anti-Padrões (NÃO Faça Isso)

### ❌ AP1: Cast forçado sem guarda
```typescript
// RUIM
const opcoes = (produto.opcoes as Record<string, OpcaoPersonalizacao[]>)[key];

// BOM
const opcoes = produto.opcoes?.[key];
if (!Array.isArray(opcoes)) return null;
```

### ❌ AP2: UseEffect sem cleanup
```typescript
// RUIM
useEffect(() => {
  const timer = setInterval(..., 5000);
}, []);

// BOM
useEffect(() => {
  const timer = setInterval(..., 5000);
  return () => clearInterval(timer);
}, []);
```

### ❌ AP3: Console.log em produção
```typescript
// RUIM
console.log('debug', data);

// BOM (use com eslint-disable quando necessário)
// eslint-disable-next-line no-console
console.error('[createRemoteOrder] RPC error:', err);
```

### ❌ AP4: Props drilling profundo
```typescript
// RUIM (passando props por 3+ níveis)
<App user={user}><Page user={user}><Modal user={user} /></Page></App>

// BOM (use Zustand store ou Context)
const { user } = useStore();
```

---

*Atualizado em: 2026-04-23*
*Próxima revisão: quando novo padrão emergir ou anti-padrão for identificado*

## P9: Brain + Documents Decision Pattern
**Contexto:** O bug detector esta evoluindo rapido e precisa de continuidade sem depender de memoria de conversa.
**Solucao:**
```text
1. Implementar a mudanca no repo
2. Registrar a decisao no `.brain/memory/sessions/...`
3. Atualizar ou confirmar o padrao em `.brain/memory/patterns.md` quando virar recorrente
4. Sincronizar `Documents\Auris-BugDetector-Final` como espelho final vivo
```
**Resultado esperado:**
- `.brain` guarda rationale, historico e padroes
- `Documents\Auris-BugDetector-Final` guarda a versao final compartilhavel
- toda decisao relevante do bug detector fica rastreavel nos dois lugares
**Quando usar:** Sempre que houver mudanca relevante no bug detector, demo, visual, fluxo ou integracoes.
**Quando NAO usar:** Ajustes descartaveis sem impacto no comportamento, sem valor de historico ou sem reflexo na versao final.

## P10: Manager-Worker Subagent Pattern
**Contexto:** Uma tarefa grande precisa de pesquisa, mapeamento tecnico, implementacao e verificacao sem colapsar tudo numa thread so.
**Solucao:**
```text
1. O agente principal mantem o contexto do usuario
2. Subagentes recebem ownership fechado
3. O padrao default e manager-worker
4. A sintese final sempre volta ao agente principal
```
**Quando usar:** Pesquisa ampla, auditoria pesada, verificacao paralela, trabalho sidecar.
**Quando NAO usar:** Bug linear, edicao pequena, mesma trilha e mesmo arquivo sem ganho real.

## P11: MAMIS/1 Protocol Pattern
**Contexto:** Subagentes precisam se comunicar com maxima densidade informacional e minimo ruido.
**Solucao:**
```text
MAMIS/1
ROLE
GOAL
SCOPE
INPUTS
OUTPUT
DONE
RISK
```
Resposta padrao:
```text
MAMIS/1
STATUS
SUMMARY
EVIDENCE
FILES
RISKS
NEXT
```
**Quando usar:** Toda interacao IA -> IA dentro do sistema de subagentes.
**Quando NAO usar:** Conversa final com humano.
