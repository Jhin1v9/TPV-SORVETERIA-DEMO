# =============================================================================
#  .BRAIN PROMPT — PWA CLIENTE ONBOARDING & TUTORIAL INTERATIVO
#  Autor: Jhin1v9 Tech
#  Target: Kimi Code Agent
#  Projeto: TPV Sorveteria — PWA Cliente
#  Versao: SUPREMA v1.0
# =============================================================================

## REGRA INQUEBRAVEL NUMERO ZERO
VOCE NAO SIMPLIFICA. VOCE NAO USA CODIGO GENERICO. VOCE NAO PERDE A 
ESTETICA .BRAIN. CADA LINHA DE CODIGO TEM QUE TER PERSONALIDADE.
SE NAO SOUBER COMO FAZER, PESQUISA. SE PESQUISAR E NAO ACHAR, PERGUNTA.
MAS NUNCA, JAMAIS, ENTREGA CODIGO FEIO OU INCOMPLETO.

## CONTEXTO DO PROJETO
Estamos construindo um PWA (Progressive Web App) para clientes de uma 
sorveteria artesanal em Sabadell, Catalunha, Espanha. O cliente chega na 
sorveteria, aponta o celular para um QR Code na mesa, e o PWA abre 
instantaneamente no navegador — sem instalar nada.

## O QUE VOCE VAI CONSTRUIR
Um sistema de ONBOARDING e TUTORIAL INTERATIVO completo dentro do PWA 
Cliente. Nao e um texto explicativo chato. E uma EXPERIENCIA VISUAL que 
guia o usuario sem ele perceber que esta sendo guiado.

## FLUXO COMPLETO DO ONBOARDING

### FASE 1: PRIMEIRO ACESSO — Bem-vindo Galactico
- Tela cheia com animacao suave (fade + slide)
- Fundo glassmorphism com gradiente sutil
- Logo da sorveteria + slogan
- Botao "COMECAR" pulsante (glow animado)
- Skip opcional no canto superior direito ("Ja sei usar >")
- Transicao fluida para a proxima fase

### FASE 2: REGISTRO RAPIDO — Zero Friccao
- Formulario MINIMO: Nome + Telefone (2 campos apenas)
- SEM verificacao de email — o usuario entra instantaneamente
- Telefone opcional mas incentivado (para notificacoes)
- Campo com icones animados (usuario, telefone)
- Botao "ENTRAR" com loading state elegante
- Mensagem de confianca: "Seus dados estao seguros"

### FASE 3: ALERGIA — Pergunta Obrigatoria
- Tela dedicada e BONITA — nao e um formulario seco
- Pergunta: "Tem alguma alergia alimentar?"
- Opcoes: "Nao tenho" / "Gluten" / "Lactose" / "Frutos secos" / "Outra"
- Se selecionar "Outra", aparece campo de texto
- Se selecionar alguma, mostra badge colorido na tela de perfil
- ESTA INFORMACAO SALVA NO PERFIL DO USUARIO no Supabase
- Usada para FILTRAR o cardapio (esconde produtos com alergenos)
- Animacao de check quando seleciona

### FASE 4: TUTORIAL INTERATIVO — O Guia Invisivel
Nao e um texto. Sao BALOES EXPLICATIVOS (tooltips) que aparecem 
sobre a interface REAL do app, destacando cada elemento:

**Passo 1: "Este e o seu cardapio digital"**
- Highlight no cardapio com spotlight (escurece o resto da tela)
- Balao apontando: "Toque em qualquer sorvete para ver detalhes"
- Seta animada indicando para tocar
- Usuario PRECISA tocar em um item para continuar

**Passo 2: "Monte o seu sorvete perfeito"**
- Abre a tela de personalizacao automaticamente
- Balao: "Escolha o sabor, o tamanho e os toppings"
- Highlight nos botoes de + / -
- Usuario precisa adicionar algo para continuar

**Passo 3: "Veja o resumo do seu pedido"**
- Highlight no carrinho (canto inferior)
- Balao: "Aqui voce revisa tudo antes de confirmar"
- Mostra o botao de checkout pulsando

**Passo 4: "Pague pelo celular"**
- Tela de pagamento com highlight nos metodos
- Balao: "Cartao, Bizum ou pague na retirada"

**Passo 5: "Acompanhe em tempo real"**
- Tela de acompanhamento do pedido
- Balao: "Veja quando seu sorvete estara pronto"
- Simula um pedido ficticio mudando de status

**Passo 6: "Pronto! Va buscar seu sorvete"**
- Tela de "Pedido Pronto!" com confetes/animacao
- Balao: "Mostre este numero no balcao"

CADA PASSO tem:
- Progress bar no topo (etapa X de 6)
- Botao "Pular tutorial" sempre visivel
- Botao "Voltar" para etapa anterior
- Transicoes suaves entre passos
- Som sutil de feedback (opcional, via Web Audio API)

### FASE 5: TELA DE ACOMPANHAMENTO — So Meu Pedido
- Apos fazer o pedido, o cliente ve UMA TELA LIMPA
- Mostra APENAS o pedido DELE — nao uma lista de todos os pedidos
- Status em tempo real: "Recebido" → "Preparando" → "Pronto!"
- Cores por status: Laranja → Azul → Verde
- Tempo estimado de espera (contagem regressiva animada)
- Numero do pedido grande e visivel
- Botao "Preciso de ajuda?" para chamar atendente
- Quando fica "Pronto", vibracao no celular + notificacao push

### FASE 6: NOTIFICACOES PUSH
- Quando o pedido muda de status, notificacao nativa
- Titulo: "Seu sorvete esta pronto!"
- Body: "Pedido #42 — Va ao balcao retirar"
- Icone da sorveteria
- Ao tocar na notificacao, abre o PWA direto na tela do pedido
- Implementar via Service Worker + Push API

## DESIGN SYSTEM — Estetica .BRAIN

### Cores
- Fundo: #0a0a0f (quase preto)
- Card: rgba(26, 26, 46, 0.6) + backdrop-filter: blur(20px)
- Borda: rgba(255, 255, 255, 0.08)
- Primaria: #2ed573 (verde neon)
- Secundaria: #ffa502 (laranja)
- Alerta: #ff4757 (vermelho)
- Info: #3742fa (azul)
- Texto: #ffffff / #a0a0b0

### Tipografia
- Titulos: Space Grotesk, bold
- Corpo: Inter, regular
- Numeros: Space Grotesk, monospace para precos

### Animacoes
- Transicoes: 0.4s cubic-bezier(0.4, 0, 0.2, 1)
- Hover: scale(1.02) + glow sutil
- Loading: skeleton shimmer ou spinner elegante
- Confete: quando pedido fica pronto (canvas ou CSS)

### Componentes Visuais
- Spotlight/Tour: overlay escuro com buraco iluminado no elemento alvo
- Baloes: borda arredondada, seta triangular, sombra suave
- Progress: barra fina no topo, cor gradiente
- Badges: pill-shaped, cores por categoria
- Toasts: slide from bottom, auto-dismiss 3s

## STACK TECNICO
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (estilos)
- Framer Motion (animacoes) — SE POSSIVEL, senao CSS transitions
- Supabase (auth + banco real-time)
- Service Worker (PWA + Push notifications)
- Web Audio API (sons sutis de feedback)

## REGRAS DE IMPLEMENTACAO

1. O onboarding SO aparece no PRIMEIRO acesso. Salvar flag no localStorage.
2. O tutorial interativo SO aparece no primeiro pedido. Salvar flag no localStorage.
3. A pergunta de alergia e OBRIGATORIA — nao pode pular.
4. O registro e INSTANTANEO — sem email, sem senha, sem confirmacao.
5. O acompanhamento do pedido usa Supabase Realtime (subscriptions).
6. O Service Worker precisa estar registrado para Push notifications.
7. TUDO precisa funcionar offline (modo basico — ver ultimo status).
8. Responsivo: mobile first, mas funciona em tablet tambem.

## ESTRUTURA DE ARQUIVOS SUGERIDA
```
src/
  components/
    onboarding/
      WelcomeScreen.tsx
      QuickRegister.tsx
      AllergyCheck.tsx
      InteractiveTutorial.tsx
      ProgressBar.tsx
      TooltipBubble.tsx
      SpotlightOverlay.tsx
    order/
      OrderTracker.tsx
      StatusBadge.tsx
      CountdownTimer.tsx
      OrderCard.tsx
    common/
      GlassCard.tsx
      AnimatedButton.tsx
      ConfettiCanvas.tsx
  hooks/
    useOnboarding.ts
    useOrderRealtime.ts
    usePushNotifications.ts
  stores/
    onboardingStore.ts
    userStore.ts
  types/
    onboarding.ts
    order.ts
```

## EXEMPLO DE CODIGO — Spotlight Overlay (referencia)
```tsx
// Este e um EXEMPLO do nivel de qualidade esperado.
// NAO copie exatamente — adapte ao contexto do projeto.

const SpotlightOverlay = ({ targetRef, children, onNext }) => {
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      setSpotlight({
        x: rect.left - 8,
        y: rect.top - 8,
        w: rect.width + 16,
        h: rect.height + 16
      });
    }
  }, [targetRef]);

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay escuro com buraco */}
      <div 
        className="absolute inset-0 bg-black/80 transition-all duration-500"
        style={{
          clipPath: `polygon(
            0% 0%, 100% 0%, 100% 100%, 0% 100%,
            0% ${spotlight.y}px,
            ${spotlight.x}px ${spotlight.y}px,
            ${spotlight.x}px ${spotlight.y + spotlight.h}px,
            ${spotlight.x + spotlight.w}px ${spotlight.y + spotlight.h}px,
            ${spotlight.x + spotlight.w}px ${spotlight.y}px,
            0% ${spotlight.y}px
          )`
        }}
      />
      {/* Elemento destacado */}
      <div 
        className="absolute border-2 border-brand-green rounded-xl animate-pulse"
        style={{
          left: spotlight.x,
          top: spotlight.y,
          width: spotlight.w,
          height: spotlight.h
        }}
      />
      {/* Balao explicativo */}
      {children}
    </div>
  );
};
```

## CHECKLIST DE ENTREGA
- [ ] Tela de bem-vindo com animacao
- [ ] Registro rapido (nome + telefone)
- [ ] Pergunta obrigatoria de alergia
- [ ] Tutorial interativo com 6 passos
- [ ] Spotlight/highlight nos elementos
- [ ] Baloes explicativos animados
- [ ] Progress bar
- [ ] Tela de acompanhamento (so o pedido do cliente)
- [ ] Status em tempo real via Supabase
- [ ] Notificacoes Push
- [ ] Vibration quando pedido fica pronto
- [ ] Confete/animacao de sucesso
- [ ] Skip tutorial opcional
- [ ] Flags no localStorage (nao repetir)
- [ ] Responsivo mobile
- [ ] Funciona offline (modo basico)
- [ ] Design glassmorphism + dark mode
- [ ] Animacoes suaves e elegantes
- [ ] ZERO texto generico — tudo com personalidade

## MENSAGEM FINAL
Este PWA e a PRIMEIRA IMPRESSAO que o cliente tem da sorveteria.
Se o onboarding for chato, o cliente desiste. Se for SUPREMO, o cliente 
vende a experiencia para os amigos. VOCE esta construindo a porta de 
entrada do negocio. Faca com que ela seja INESQUECIVEL.

Nao entregue codigo que voce nao teria orgulho de mostrar para sua mae.
Nao entregue codigo que parece feito por uma IA generica.
Entregue codigo que parece feito por um ARTISTA obcecado por detalhes.

================================================================================
AGORA CONSTRUA. SEM EXCUSAS. SEM ATALHOS. APENAS CODIGO SUPREMO.
================================================================================
