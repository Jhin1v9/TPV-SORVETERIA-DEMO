# ADR-006: Tela de Atração (Attract Screen) para Kiosk

**Status:** Proposed  
**Data:** 2026-04-23  
**Contexto:** O usuário propôs adicionar uma tela de atração ao kiosk, similar aos McDonald's e Burger King, com imagens/vídeos de produtos (açaí, sorvete) em loop e texto "TOQUE PARA ENTRAR".

---

## Pesquisa Realizada

### O que McDonald's e Burger King fazem
- **McDonald's**: Kiosks com tela de atração mostrando produtos em loop (vídeos slow-motion de hambúrgueres, batatas). Texto claro: "Touch to start" ou "Tap to order".
- **Burger King**: Mesmo padrão — tela idle com produtos em motion, CTA grande e único.
- **Indústria QSR**: A tela de atração (attract screen / idle screen) é considerada **essencial**. A Kiosk Industry Organization lista "No attract screen" como um dos "Common Mistakes" — um kiosk mostrando uma sub-página profunda sem interação parece quebrado.

### Best Practices da Indústria
| Prática | Fonte |
|---------|-------|
| "Idle attract screen is informative, not noisy" | Kiosk Industry Checklist |
| "Implement an idle timeout (30–60s) that returns to a visually engaging attract screen" | SpinetiX / Medialavista |
| "Food sells food best; use enticing imagery/motion graphics" | Spectrio / Eye-In Media |
| "Video loop per board should be no more than 30-35 seconds long, featuring approx. 3 high impact items" | Spectrio |
| "When the kiosk is idle, displays interactive promotional slow-motion videos of how the food is prepared" | iTransition (case study restaurant chain) |
| "During idle hours, switch to Digital Signage playing promotional videos and product imagery" | Hexnode |
| "One primary action per screen — no clutter" | AVIXA Kiosk UX Checklist |
| "Expected session length < 60 seconds for core flow" | Kiosk Industry Checklist |

---

## Análise da Proposta do Usuário

### ✅ Pontos Fortes
1. **A tela de atração é padrão da indústria** — não ter uma é considerado erro grave.
2. **Imagens de produto em loop funcionam** — "Food sells food best". Açaí grande, bonito, com calda escorrendo, granola caindo... isso VENDE.
3. **"Toque para entrar" é o padrão correto** — simples, claro, uma ação por tela.
4. **Separar "atração" de "funcionalidade" é a abordagem certa** — a tela de atração não deve ter botões complexos.

### ⚠️ Pontos de Atenção
1. **Não pode ser imagem estática** — precisa de motion (vídeo curto em loop ou animação CSS). Imagens estáticas perdem o impacto rápido.
2. **Timeout para voltar à tela de atração** — se o usuário abandonar no meio do fluxo, voltar para a tela de atração em 30-60s.
3. **A transição precisa ser suave** — toque → fade → tela de entrada. Não pode pular de forma brusca.
4. **A tela deve ser "informativa, não noisy"** — não pode ter muita informação. Só o produto + "Toque para entrar".

### 🤔 Sugestões de Melhoria
1. **NÃO forçar login na primeira tela após o toque** — o padrão McDonald's/BK é: toque → menu direto. Login é opcional, geralmente no final (para pontos) ou num botão "Entrar com app". Forçar login antes de ver o menu é **fricção desnecessária** que reduz conversão.
2. **Colocar "Comprar como convidado" como opção principal** e "Entrar com PWA" como secundária.
3. **Dayparting na tela de atração** — manhã: açaí bowl/café, tarde: sorvete/granizado, noite: açaí energético.
4. **Produtos em destaque rotativos** — mostrar os 3 produtos de maior margem em loop de 30s.

---

## Decisão Proposta

**Aprovar a ideia com ajustes:**
1. Implementar tela de atração com vídeo/imagens de produtos em loop
2. CTA único: "Toque para entrar" (ou "Toque para pedir")
3. Ao tocar → vai direto para o cardápio (não para tela de login)
4. Login/identificação fica opcional no checkout ou num botão no header
5. Timeout de 60s para voltar à tela de atração

---

## Consequências

- **Positivas:** Aumenta conversão (produto vende produto), reduz percepção de "kiosk quebrado", alinha com padrão da indústria.
- **Negativas:** Requer assets de vídeo/imagem de alta qualidade, adiciona uma tela ao fluxo (mas essa tela é necessária).

---

## Referências
- Kiosk Industry Organization — Kiosk Design Checklist
- SpinetiX / Medialavista — Kiosk Touch Integration
- Spectrio / Eye-In Media — Digital Menu Board Best Practices
- iTransition — Self-service kiosk app for restaurant chain
- AVIXA — Kiosk UX/UI Design Checklist
- TAPBOX — 9 tips for perfect kiosk UX
