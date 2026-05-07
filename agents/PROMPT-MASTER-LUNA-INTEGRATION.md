# PROMPT MASTER: Integração LUNA COMMAND CENTER

## OBJETIVO
Integrar o dashboard `luna-command-center.html` no backend existente do NEXO Dashboard PRO (porta 3456).

## ARQUITETURA ATUAL
- Backend: Express.js na porta 3456
- Frontend: React buildado em `backend/public/` ou `frontend/dist/`
- API existente: `/api/state`, `/api/whatsapp`, etc.

## NOVAS ROTAS NECESSÁRIAS

### 1. GET /api/luna/status
Retorna status completo do Luna Agent:
```json
{
  "status": "running",
  "version": "14.1",
  "chromeConnected": true,
  "whatsappConnected": true,
  "lastScan": "2026-05-03T10:45:00Z",
  "pid": 13104,
  "uptime": 3600
}
```

### 2. POST /api/luna/scan
Força scan imediato:
```json
{ "success": true, "messagesProcessed": 5 }
```

### 3. POST /api/luna/extract
Extrai mensagens:
Body: `{ "mode": "full|normal", "reset": true|false }`
Response: `{ "success": true, "extracted": 150 }`

### 4. POST /api/luna/mentions
Verifica menções:
Response: `{ "mentions": [{ "author": "...", "mention": "@Luna", "message": "..." }] }`

### 5. POST /api/luna/links
Verifica links:
Response: `{ "links": [{ "url": "...", "source": "..." }] }`

### 6. POST /api/luna/report
Força relatório:
Response: `{ "success": true, "sent": true }`

### 7. GET /api/whatsapp/checkpoint
Retorna checkpoint:
```json
{
  "hashes": ["hash1", "hash2"],
  "lastScan": "2026-05-03T10:45:00Z",
  "version": "14.1"
}
```

### 8. DELETE /api/whatsapp/checkpoint
Reseta checkpoint:
Response: `{ "success": true }`

### 9. GET /api/whatsapp/buffer
Retorna buffer de mensagens:
```json
{
  "messages": [
    {
      "id": "msg_123",
      "author": "Nome",
      "content": "texto",
      "timestamp": "2026-05-03T10:45:00Z",
      "hasMention": true,
      "isTask": false,
      "isIdea": false
    }
  ]
}
```

### 10. DELETE /api/whatsapp/buffer
Limpa buffer:
Response: `{ "success": true }`

### 11. POST /api/luna/config
Atualiza configurações:
Body: `{ "scanInterval": 10, "reportInterval": 30, "silentMode": false, "autoMention": true }`
Response: `{ "success": true }`

### 12. GET /api/luna/diagnose
Diagnóstico de erros:
```json
{
  "errors": [
    { "type": "ESM_IMPORT", "message": "Cannot find module", "severity": "critical" }
  ]
}
```

### 13. POST /api/luna/autofix
Tenta corrigir erro automaticamente:
Body: `{ "errorType": "ESM_IMPORT" }`
Response: `{ "success": true, "fixed": true, "action": "Recreated wrapper" }`

### 14. POST /api/luna/stop
Para o Luna:
Response: `{ "success": true }`

## WEBSOCKET EVENTS
Emitir via WebSocket (porta 3456):
- `luna_thought`: Pensamentos do agente
- `luna_log`: Logs em tempo real
- `scan_complete`: Scan finalizado
- `mention_detected`: Menção detectada

## INTEGRAÇÃO NO SERVER.JS

Adicionar no `server.js`:
```javascript
// Rotas Luna Control
app.get('/api/luna/status', (req, res) => {
    // Ler estado do luna-daemon
    res.json({ status: 'running', ... });
});

app.post('/api/luna/scan', (req, res) => {
    // Trigger scan via scheduler
    res.json({ success: true });
});

// ... demais rotas
```

## SERVIR O DASHBOARD

Adicionar rota estática:
```javascript
app.get('/luna-control', (req, res) => {
    res.sendFile(path.join(__dirname, '../agents/luna-command-center.html'));
});
```

Ou copiar para `backend/public/luna-control.html` e acessar via `http://localhost:3456/luna-control.html`

## PRIORIDADE DE IMPLEMENTAÇÃO
1. P0: `/api/luna/status`, `/api/whatsapp/checkpoint`, `/api/whatsapp/buffer`
2. P1: `/api/luna/scan`, `/api/luna/report`, `/api/luna/mentions`
3. P2: WebSocket events, `/api/luna/autofix`, `/api/luna/diagnose`

## TESTE
Após implementar, acessar:
http://127.0.0.1:3456/luna-control.html
