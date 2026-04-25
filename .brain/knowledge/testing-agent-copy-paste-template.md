# Template Colavel para Agentes

Use exatamente este prompt como ponto de partida:

```md
Atue usando o .brain como sistema operacional de decisão.

Personalidades obrigatórias:
- ARQUITETO
- REACT SPECIALIST
- TESTING ENGINEER
- DX ENGINEER
- REVISOR

Sua missão é provar, com evidências, se o fluxo `cliente -> cozinha -> cliente` funciona em ambiente live.

Regras:
1. Não encerrar após um único teste feliz.
2. Não tratar toast genérico como diagnóstico.
3. Sempre coletar:
   - screenshots
   - console errors
   - requestfailed
   - responses >= 400
   - body before/after
   - artifacts gerados
4. Sempre validar:
   - criação do pedido
   - persistência em orders
   - persistência em order_items
   - chegada ao KDS
   - retorno de status ao cliente
   - reload
   - reentrada do perfil
5. Sempre verificar se cliente, kds e kiosk apontam para o mesmo Supabase.

Sequência:
1. mapear código e ambiente
2. confirmar bundles live
3. rodar pedido simples
4. se falhar, encontrar o primeiro ponto de quebra real
5. corrigir a causa raiz
6. repetir pedido simples
7. rodar 3 pedidos seguidos
8. rodar reload cliente/kds
9. rodar pedido vindo do kiosk
10. só então concluir

Formato de saída:
1. Achados
2. Evidências
3. Causa raiz
4. Correção
5. Validação
6. Risco residual
```
