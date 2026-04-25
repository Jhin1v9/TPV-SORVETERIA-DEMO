# Checklist de Execucao Pass/Fail

## Como usar
- Marcar `PASS`, `FAIL` ou `N/A`.
- Cada `FAIL` deve ter evidência em `artifacts/`.
- Não aprovar a rodada se qualquer item crítico falhar.

## Metadata da rodada
- Data:
- Operador:
- Ambiente:
- Bundle cliente:
- Bundle kds:
- Bundle kiosk:
- Supabase cliente:
- Supabase kds:
- Supabase kiosk:

## Bloco A - Sanidade crítica
- [ ] PASS / FAIL - Cliente carrega sem erro fatal
- [ ] PASS / FAIL - KDS carrega sem erro fatal
- [ ] PASS / FAIL - Kiosk carrega sem erro fatal
- [ ] PASS / FAIL - Cliente e KDS apontam para o mesmo Supabase

## Bloco B - Pedido simples
- [ ] PASS / FAIL - Pedido simples nasce no cliente
- [ ] PASS / FAIL - `create_order` responde sem erro
- [ ] PASS / FAIL - Pedido entra em `orders`
- [ ] PASS / FAIL - Pedido entra em `order_items`
- [ ] PASS / FAIL - Pedido aparece no KDS em até 10s
- [ ] PASS / FAIL - Origem do pedido no KDS está correta

## Bloco C - Status round-trip
- [ ] PASS / FAIL - KDS muda para `preparando`
- [ ] PASS / FAIL - Cliente reflete `preparando`
- [ ] PASS / FAIL - KDS muda para `listo`
- [ ] PASS / FAIL - Cliente reflete `listo`
- [ ] PASS / FAIL - KDS muda para `entregado`
- [ ] PASS / FAIL - Cliente move pedido para histórico

## Bloco D - Perfil e persistência
- [ ] PASS / FAIL - Perfil possui `customer_id` válido
- [ ] PASS / FAIL - Reload no cliente preserva histórico
- [ ] PASS / FAIL - Reload no KDS preserva fila
- [ ] PASS / FAIL - Login com mesmo telefone recupera perfil correto

## Bloco E - Repetição e volume
- [ ] PASS / FAIL - 3 pedidos seguidos entram sem falha
- [ ] PASS / FAIL - Sequência numérica permanece consistente
- [ ] PASS / FAIL - Nenhum pedido duplica
- [ ] PASS / FAIL - Nenhum pedido some

## Bloco F - Origens
- [ ] PASS / FAIL - Pedido do cliente marcado como `PWA`
- [ ] PASS / FAIL - Pedido do kiosk marcado como `Kiosk` ou `TPV`
- [ ] PASS / FAIL - Ambos coexistem corretamente no KDS

## Bloco G - Resiliência
- [ ] PASS / FAIL - Falha de rede não duplica pedido
- [ ] PASS / FAIL - UI mostra erro útil em vez de erro genérico opaco
- [ ] PASS / FAIL - Sessão longa não degrada realtime

## Critérios de reprovação imediata
- [ ] FAIL - Cliente confirma sem backend persistido
- [ ] FAIL - Pedido persiste mas não chega no KDS
- [ ] FAIL - KDS muda status e cliente não acompanha
- [ ] FAIL - `customer_id` órfão volta a aparecer
- [ ] FAIL - Cliente e KDS em Supabases diferentes

## Resultado final da rodada
- Status final: PASS / FAIL
- Resumo:
- Próximo passo:
