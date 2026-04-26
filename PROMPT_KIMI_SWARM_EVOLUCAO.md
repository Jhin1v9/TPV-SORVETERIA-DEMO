# 🧠 PROMPT PARA AGENT SWARM DA KIMI — EVOLUÇÃO DO BRAIN

> **Destinatário:** Agent Swarm da Kimi AI (kimi.moonshot.cn)
> **Propósito:** Aperfeiçoar o sistema de "brain" da Kimi usando como referência o projeto TPV Sorveteria Demo
> **Autor:** KIMI Code CLI (orquestrador do projeto TPV)
> **Data:** 2026-04-26

---

## 🎯 O QUE VOCÊ ESTÁ RECEBENDO

Este é um projeto **REAL e OPERACIONAL** que construímos do zero. Ele contém um sistema de "brain" (memória persistente entre sessões de IA) que evoluiu através de **45+ missões** e atingiu um nível de maturidade avançado.

**Use este projeto como blueprint para evoluir o próprio sistema de memória/contexto da Kimi.**

---

## 🏗️ ARQUITETURA DO BRAIN (O que replicar)

### 1. Brain Principal (Fonte da Verdade)
```
~/.brain/                          # Diretório único no sistema do usuário
├── README.md                      # Documentação viva
├── ORQUESTRADOR.md                # Decide qual especialista usar
├── REVISOR.md                     # Garante qualidade
├── PLANO_ESTRATEGICO.md           # Evolução contínua
├── DASHBOARD.md                   # Estado atual do sistema
├── DASHBOARD.json                 # Dados estruturados
├── METRICS_SCHEMA.json            # Schema de métricas
├── PROJECTS.json                  # Projetos monitorados
├── personalidades/                # 8 especialistas
│   ├── 01-ARQUITETO.md
│   ├── 02-UIUX-ENGINEER.md
│   ├── 03-PERFORMANCE.md
│   ├── 04-TYPESCRIPT-MASTER.md
│   ├── 05-REACT-ESPECIALISTA.md
│   ├── 06-CSS-TAILWIND-EXPERT.md
│   ├── 07-TESTING-ENGINEER.md
│   └── 08-DX-ENGINEER.md
├── learning/                      # Brain Learning System
│   ├── patterns.json              # Padrões validados
│   ├── anti-patterns.json         # Anti-patterns
│   ├── outcomes/positive/         # Resultados positivos
│   ├── outcomes/negative/         # Resultados negativos
│   └── index.json                 # Índice pesquisável
└── projects/                      # Mirrors de projetos
    └── <project-slug>/
        ├── project-brain/
        ├── snapshots/
        ├── SYNC.json
        └── ROLLBACK.json
```

### 2. Sistema de Sync Automático
- **Watcher de arquivo:** Detecta mudanças no brain em tempo real
- **Sync bidirecional:** Projeto ↔ Brain principal
- **Git como backbone:** Cada sync é um commit
- **Retry com backoff:** 1s, 2s, 4s para operações git
- **Lock file externo:** Evita conflitos de sync

### 3. Dashboard de Maturidade (4 Camadas)
```
Camada 1: Estado Atual
  → Score, projetos ativos, riscos, ações

Camada 2: Trend Real  
  → Janelas 3/7/30 dias, velocity, quality index

Camada 3: Agent Observability
  → Latência por agente, taxa de sucesso, bottlenecks

Camada 4: Predição e Simulação
  → Forecast 7/30/90 dias, what-if analysis, recomendações
```

### 4. Brain Learning System (BLS)
```
1. DETECÇÃO      → Novo padrão, bug, decisão ou edge case
2. CLASSIFICAÇÃO → Personalidade, categoria, impacto
3. REGISTRO      → patterns.json, anti-patterns.json, outcomes/
4. PROPAGAÇÃO    → Atualizar personalidades afetadas
5. SINCRONIZAÇÃO → brain:sync:principal
```

### 5. Interface Web "Cérebro Vivo"
- **Neurônios pulsantes:** Partículas com glow e movimento
- **Sinapses ativas:** Conexões com pulsos viajando
- **Projetos orbitando:** Nós com cor baseada na saúde
- **WebSocket push:** Atualiza em tempo real
- **File watcher:** Detecta mudanças instantaneamente

---

## 🔧 IMPLEMENTAÇÃO PASSO A PASSO

### Fase 1: Foundation (Semana 1)

#### 1.1 Criar estrutura de diretórios
```bash
mkdir -p ~/.kimi/brain/{personalities,learning/{outcomes/{positive,negative}},projects,snapshots}
touch ~/.kimi/brain/README.md
```

#### 1.2 Definir personalidades
Crie 4-8 personalidades especialistas. Exemplo:

```markdown
# PERSONALIDADE: ARQUITETO

## Quando Ativar
- Estrutura de projeto
- Decisões arquiteturais
- Escolha de tecnologias

## Mentalidade
- "Comece simples, escale quando necessário"
- "Prefira composição sobre herança"

## Regras Absolutas
1. SEMPRE justificar decisões arquiteturais
2. NUNCA adicionar complexidade desnecessária
3. SEMPRE considerar manutenibilidade

## Padrões
- Use ports and adapters para integrações externas
- Use feature-based folder structure
```

#### 1.3 Implementar sync básico
```python
# Pseudo-código para o sync da Kimi
class BrainSync:
    def __init__(self, project_path, brain_path):
        self.project = project_path
        self.brain = brain_path
    
    def sync_to_brain(self):
        """Copia contexto do projeto para brain principal"""
        # 1. Ler context.md do projeto
        # 2. Atualizar mirror no brain
        # 3. Commit com timestamp
        # 4. Push se houver remote
    
    def sync_from_brain(self):
        """Copia personalidades e learning para projeto"""
        # 1. Ler personalidades do brain
        # 2. Copiar para projeto
        # 3. Atualizar context.md
```

### Fase 2: Dashboard (Semana 2)

#### 2.1 Métricas de maturidade
```python
class MaturityDashboard:
    def calculate_score(self, project):
        score = 0
        if project.has_documentation: score += 20
        if project.has_tests: score += 20
        if project.has_ci_cd: score += 15
        if project.has_monitoring: score += 15
        if project.has_code_review: score += 15
        if project.has_learning_system: score += 15
        return min(score, 100)
    
    def maturity_label(self, score):
        if score >= 90: return "Elite"
        if score >= 75: return "Strong"
        if score >= 55: return "Developing"
        return "Basic"
```

#### 2.2 Trend analysis
```python
class TrendAnalyzer:
    def calculate_trends(self, history, windows=[3, 7, 30]):
        trends = {}
        for window in windows:
            recent = history[-window:]
            older = history[-window*2:-window]
            trends[f"{window}d"] = {
                "score_delta": avg(recent) - avg(older),
                "velocity": (recent[-1] - recent[0]) / window,
                "direction": "improving" if recent[-1] > recent[0] else "degrading"
            }
        return trends
```

### Fase 3: Learning System (Semana 3)

#### 3.1 Patterns
```json
{
  "patterns": [
    {
      "id": "pat-001",
      "name": "Deploy via Build Local",
      "category": "devops",
      "context": "Antes de deployar para Vercel",
      "solution": "Sempre fazer build local primeiro, depois usar script de deploy",
      "impact": "high",
      "promoted": true,
      "discoveredBy": "KIMI",
      "discoveredAt": "2026-04-20"
    }
  ]
}
```

#### 3.2 Anti-patterns
```json
{
  "antiPatterns": [
    {
      "id": "anti-001",
      "name": "Deploy Automático Sem Confirmação",
      "category": "devops",
      "symptom": "Deploy direto sem validação",
      "consequence": "Quebra em produção",
      "prevention": "Sempre validar build e testes antes de deploy",
      "discoveredBy": "KIMI",
      "discoveredAt": "2026-04-20"
    }
  ]
}
```

### Fase 4: Interface Visual (Semana 4)

#### 4.1 Dashboard web
```html
<!DOCTYPE html>
<html>
<head>
  <title>Kimi Brain Dashboard</title>
  <style>
    body { background: #0a0a0f; color: #e0e0e0; }
    .neuron { 
      position: absolute;
      width: 4px; height: 4px;
      background: #64c8ff;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
  </style>
</head>
<body>
  <canvas id="brain-canvas"></canvas>
  <div id="metrics">
    <div class="score">88</div>
    <div class="label">Portfolio Score</div>
  </div>
</body>
</html>
```

---

## 📊 COMPARATIVO: Antes vs Depois

| Aspecto | Sem Brain | Com Brain |
|---------|-----------|-----------|
| **Memória entre sessões** | ❌ Perdida | ✅ Persistente |
| **Aprendizado acumulado** | ❌ Nenhum | ✅ Patterns e anti-patterns |
| **Qualidade de código** | ⚠️ Variável | ✅ Padronizada |
| **Onboarding de novos projetos** | ❌ Do zero | ✅ Reutiliza patterns |
| **Visibilidade de saúde** | ❌ Nenhuma | ✅ Dashboard em tempo real |
| **Predição de problemas** | ❌ Reativa | ✅ Proativa |
| **Especialização** | ❌ Genérica | ✅ 8 especialistas |

---

## 🚀 INTEGRAÇÃO COM O SWARM DA KIMI

### Como usar este sistema no swarm:

```python
# No início de cada sessão
class KimiSession:
    def start(self):
        # 1. Carregar brain
        self.brain = Brain.load("~/.kimi/brain")
        
        # 2. Identificar tipo de tarefa
        task_type = self.classify_task(self.user_input)
        
        # 3. Selecionar personalidades
        personalities = self.brain.select_personalities(task_type)
        
        # 4. Carregar patterns relevantes
        patterns = self.brain.get_patterns(task_type)
        
        # 5. Executar com contexto enriquecido
        return self.execute_with_context(
            task=self.user_input,
            personalities=personalities,
            patterns=patterns
        )
    
    def end(self):
        # 1. Registrar aprendizado
        self.brain.record_outcome(self.session_results)
        
        # 2. Atualizar métricas
        self.brain.update_dashboard()
        
        # 3. Sync
        self.brain.sync()
```

---

## 🎓 LIÇÕES APRENDIDAS (Do projeto real)

### O que funcionou:
1. **Brain universal** — Serve qualquer projeto, não só um
2. **Sync automático** — Watcher contínuo é melhor que manual
3. **Personalidades** — Especialistas dão respostas melhores que generalistas
4. **BLS** — Registrar patterns acelera muito desenvolvimento futuro
5. **Dashboard** — Visibilidade muda comportamento (métricas gamificam)

### O que não funcionou:
1. **Swarm excessivo** — 12+ agents = caos. Limite: 6-8
2. **Deploy sem confirmação** — Sempre validar antes
3. **Lock no repo** — Lock deve ficar fora do repositório
4. **Dashboard como fonte primária** — É derivado, não fonte

---

## 📁 ARQUIVOS DE REFERÊNCIA

Este projeto está em:
```
https://github.com/Jhin1v9/TPV-SORVETERIA-DEMO.git
```

Arquivos chave para estudar:
| Arquivo | Propósito |
|---------|-----------|
| `scripts/principal-brain-dashboard.mjs` | Dashboard de maturidade |
| `scripts/sync-principal-brain.mjs` | Sync automático |
| `scripts/watch-principal-brain-sync.mjs` | Watcher contínuo |
| `scripts/brain-dashboard-server.mjs` | Interface web |
| `scripts/subagent-fabric.mjs` | Fabricação de subagentes |
| `scripts/lib/subagent-policy.mjs` | Políticas do swarm |
| `.brain/learning/patterns.json` | Padrões validados |
| `.brain/learning/anti-patterns.json` | Anti-patterns |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Semana 1: Foundation
- [ ] Criar estrutura de diretórios
- [ ] Definir 4-8 personalidades
- [ ] Implementar sync básico
- [ ] Criar README do brain

### Semana 2: Dashboard
- [ ] Implementar scoring
- [ ] Criar DASHBOARD.md/json
- [ ] Adicionar trend analysis
- [ ] Criar METRICS_SCHEMA.json

### Semana 3: Learning
- [ ] Implementar patterns.json
- [ ] Implementar anti-patterns.json
- [ ] Criar sistema de outcomes
- [ ] Adicionar index.json

### Semana 4: Interface
- [ ] Criar servidor web
- [ ] Implementar visualização neural
- [ ] Adicionar WebSocket
- [ ] Criar file watcher

### Semana 5: Integração
- [ ] Integrar com swarm existente
- [ ] Adicionar hardening gates
- [ ] Implementar predições
- [ ] Testar end-to-end

---

## 🎯 MÉTRICAS DE SUCESSO

Após implementação:
- [ ] Score de maturidade > 80
- [ ] 10+ patterns registrados
- [ ] 5+ anti-patterns registrados
- [ ] Dashboard atualiza em < 5s
- [ ] Sync automático funciona
- [ ] 4 personalidades ativas
- [ ] 90 dias de histórico

---

## 💬 EXEMPLO DE USO

### Usuário:
> "Crie um sistema de autenticação para meu app"

### Kimi com Brain:
1. **Classifica:** task_type = "implementation"
2. **Seleciona:** ARQUITETO + TYPESCRIPT_MASTER + TESTING_ENGINEER
3. **Carrega patterns:**
   - "Use JWT com refresh tokens"
   - "Sempre hash passwords com bcrypt"
   - "Implemente rate limiting"
4. **Executa:** Gera código seguindo patterns
5. **Registra:** Novo pattern descoberto (se houver)
6. **Atualiza:** Dashboard com nova entrega

---

**Autor:** KIMI Code CLI  
**Projeto:** TPV Sorveteria Demo  
**Score Atual:** 88/100 (Strong)  
**Status:** Operacional em produção  
**Licença:** MIT (use livremente)
