# Plano Humano de Teste Exaustivo

## Objetivo
- Validar exaustivamente o fluxo `cliente -> cozinha -> cliente`.
- Confirmar que pedidos nascem, aparecem no KDS, mudam de status e retornam corretamente ao app cliente.
- Detectar regressões de perfil, persistência, realtime, pagamento e origem do pedido.

## Ambientes live
- Cliente: `https://cliente-pearl.vercel.app`
- Kiosk: `https://kiosk-swart-delta.vercel.app`
- Admin: `https://admin-ten-vert-54.vercel.app`
- KDS: `https://kds-one.vercel.app`

## Preparação
- Abrir `cliente`, `kiosk` e `kds` em janelas separadas.
- Se possível, usar uma aba anônima para o cliente.
- Garantir internet estável.
- Deixar um bloco de notas aberto para registrar:
  - horário
  - número do pedido
  - origem
  - resultado
  - erro visível

## Critério de aprovação final
- 100% dos pedidos testados devem:
  - ser criados com sucesso
  - aparecer no KDS
  - avançar de status
  - refletir o status no cliente
- Nenhum pedido pode sumir.
- Nenhum pedido pode duplicar.
- Nenhum pedido pode cair em erro genérico sem detalhe rastreável.

## Roteiro 1: Sanidade básica
1. Criar 1 pedido simples no cliente.
2. Confirmar se o pedido aparece no KDS em até 10 segundos.
3. Avançar o pedido no KDS para `preparando`.
4. Confirmar no cliente se o status mudou.
5. Avançar para `listo`.
6. Confirmar no cliente se o status mudou.
7. Avançar para `entregado`.
8. Confirmar no cliente se o pedido saiu dos ativos e foi para histórico.

## Roteiro 2: Repetição curta
1. Criar 3 pedidos simples seguidos no cliente.
2. Confirmar ordem sequencial no KDS.
3. Confirmar que todos aparecem com origem `PWA`.
4. Atualizar status dos 3.
5. Confirmar que todos refletem no cliente.

## Roteiro 3: Origens diferentes
1. Criar 1 pedido no cliente.
2. Criar 1 pedido no kiosk.
3. Confirmar no KDS:
  - um marcado como `PWA`
  - um marcado como `TPV` ou `Kiosk`
4. Avançar ambos e confirmar consistência.

## Roteiro 4: Persistência do perfil
1. Criar um pedido no cliente com telefone X.
2. Recarregar o app cliente.
3. Abrir `Mis pedidos`.
4. Confirmar que o pedido permanece vinculado ao mesmo perfil.
5. Fazer logout.
6. Entrar novamente com o mesmo telefone.
7. Confirmar que o histórico continua acessível.

## Roteiro 5: Persistência pós-refresh
1. Criar um pedido no cliente.
2. Recarregar o KDS.
3. Confirmar que o pedido continua visível.
4. Recarregar o cliente.
5. Confirmar que o pedido continua em `Mis pedidos`.

## Roteiro 6: Stress moderado
1. Criar 5 pedidos seguidos no cliente.
2. Confirmar se os 5 aparecem no KDS.
3. Atualizar todos os 5 até `listo`.
4. Confirmar se o cliente recebe os updates.
5. Registrar qualquer atraso acima de 10 segundos.

## Roteiro 7: Tolerância a falha
1. Iniciar um pedido no cliente.
2. Antes de concluir, desligar a internet por alguns segundos.
3. Tentar finalizar.
4. Religiar a internet.
5. Tentar novamente.
6. Confirmar:
  - se o pedido não duplicou
  - se houve mensagem clara
  - se o pedido nasceu apenas uma vez

## Roteiro 8: Sessão longa
1. Manter `cliente` e `KDS` abertos por 20 a 30 minutos.
2. Criar pedidos ao longo desse período.
3. Verificar se o realtime degrada após janela longa.
4. Verificar se recarregar a tela recupera o estado corretamente.

## O que registrar como bug
- Pedido confirmado no cliente e ausente no KDS após 10 segundos.
- Pedido aparece no KDS mas não no histórico do cliente.
- Status muda no KDS e não muda no cliente.
- Toast genérico sem detalhe suficiente.
- Duplicação de pedido.
- Perda de perfil após recarregar.
- Pedido associado ao perfil errado.
- Ordem sequencial quebrada.
- Origem incorreta no KDS.

## Evidências mínimas por falha
- screenshot do cliente
- screenshot do KDS
- horário aproximado
- número do pedido
- telefone usado
- se houve refresh ou troca de aba

## Ordem recomendada
1. Sanidade básica
2. Repetição curta
3. Origens diferentes
4. Persistência do perfil
5. Persistência pós-refresh
6. Stress moderado
7. Tolerância a falha
8. Sessão longa
