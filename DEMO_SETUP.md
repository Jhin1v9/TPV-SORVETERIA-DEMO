# Demo Setup

## Objetivo

Esta demo agora roda com uma sessao compartilhada real em rede local. O estado canônico fica no servidor `server/demo-server.mjs`, e kiosk, KDS e admin recebem atualizacoes pelo stream realtime.

## Como iniciar

1. Instale dependencias:

```powershell
npm install
```

2. Inicie o servidor realtime:

```powershell
npm run server
```

3. Em outro terminal, suba o frontend acessivel na rede local:

```powershell
npm run dev:lan
```

4. Descubra o IP do notebook na rede local e abra nos dispositivos:

```text
http://SEU-IP:3000
```

Tablet, notebook e telefone precisam estar na mesma rede Wi-Fi.

## Como funciona

- O servidor realtime escuta na porta `8787`.
- O frontend detecta o hostname atual e aponta automaticamente para `http://HOSTNAME:8787`.
- Se o servidor estiver vazio, o primeiro cliente faz o bootstrap automatico da sessao.
- O Admin tem um botao `Reset Demo` para restaurar pedidos, estoque e configuracoes.

## Fluxo recomendado de apresentacao

1. Abra `Kiosk Cliente` em um tablet.
2. Abra `Cocina KDS` em um notebook ou monitor auxiliar.
3. Abra `Admin Dashboard` em um telefone ou segundo navegador.
4. Faça um pedido no kiosk.
5. Mostre a entrada imediata do pedido no KDS.
6. Altere o status para `Preparando` e `Listo`.
7. Mostre o pedido e o estoque refletidos no admin.

## Observacoes

- As imagens principais da demo agora estao em `public/assets`.
- O reset da demo limpa a sessao e volta ao seed inicial.
- O build de producao foi validado com `npm run build`.
