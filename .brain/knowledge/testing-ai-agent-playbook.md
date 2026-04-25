# Playbook de Teste para Agentes de IA

## Missão
- Validar o fluxo completo `cliente -> cozinha -> cliente`.
- Não encerrar a análise ao primeiro sucesso.
- Continuar até existir evidência suficiente de estabilidade.

## Personas do .brain a ativar
- `ARQUITETO`: mapear boundaries do fluxo.
- `REACT SPECIALIST`: rastrear estado de UI e persistência.
- `TESTING ENGINEER`: estruturar cenários, asserts e evidências.
- `DX ENGINEER`: montar scripts de automação e artefatos.
- `REVISOR`: confirmar se o teste realmente cobre o risco.

## Hipóteses críticas a validar
- O perfil do cliente tem `customer_id` válido.
- `create_order` persiste o pedido.
- `orders` e `order_items` entram no mesmo projeto Supabase.
- O KDS está conectado ao mesmo backend do cliente.
- O realtime entrega mudanças sem refresh manual.
- O cliente reflete mudança de status.

## Regras de execução
- Sempre observar:
  - console
  - `requestfailed`
  - responses `>= 400`
  - mudanças visuais
- Sempre salvar artefatos em `artifacts/`.
- Sempre comparar estado antes e depois.
- Não tratar toast genérico como evidência suficiente.
- Confirmar dados no backend quando necessário.

## Suite mínima obrigatória
1. Criar 1 pedido no cliente e confirmar no KDS.
2. Alterar status no KDS e confirmar no cliente.
3. Repetir com 3 pedidos seguidos.
4. Repetir com reload no cliente e no KDS.
5. Repetir com pedido vindo do kiosk.

## Assertions mínimas
- O cliente exibe confirmação verdadeira do pedido.
- O pedido aparece no snapshot do KDS.
- O número sequencial aumenta.
- A origem do pedido está correta.
- O status final no cliente corresponde ao status aplicado no KDS.
- O pedido não duplica.

## Dados que devem ser coletados
- URL e bundle atual dos apps live.
- Projeto Supabase embutido no bundle.
- payload enviado para `create_order`.
- resposta de `create_order`.
- snapshot antes/depois em cliente e KDS.
- screenshots por etapa.

## Ordem de diagnóstico quando falhar
1. A UI mostrou confirmação real ou só avançou de tela?
2. O `create_order` respondeu com erro?
3. O `customer_id` enviado existe no banco?
4. Cliente e KDS estão no mesmo Supabase?
5. O realtime está ativo ou só o refresh manual reflete mudança?
6. O pedido entrou em `orders` mas não em `order_items`?
7. O filtro do KDS está escondendo o pedido?

## Gates de aprovação
- Gate 1:
  - 1 pedido simples ok ponta a ponta
- Gate 2:
  - 3 pedidos seguidos ok ponta a ponta
- Gate 3:
  - status refletido ok
- Gate 4:
  - reload ok
- Gate 5:
  - origem `PWA` e `Kiosk` ok

## Quando não encerrar a tarefa
- Se houve só um teste feliz.
- Se não foi validado o retorno do status ao cliente.
- Se não foi testado reload.
- Se não foi testado mais de um pedido.
- Se não há artefatos.

## Entrega padrão do agente
- achados por severidade
- causa raiz provável
- evidências
- risco residual
- próximo passo recomendado
