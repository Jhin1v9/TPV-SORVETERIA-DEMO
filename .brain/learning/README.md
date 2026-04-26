# Brain Learning System (BLS)

> Sistema de aprendizado contínuo para o brain de consciência compartilhada entre IAs.

## Propósito

Capturar, classificar e propagar padrões de código, decisões arquiteturais, lições de missões e anti-patterns para que CODEX e KIMI operem a partir da mesma verdade evoluída.

## Estrutura

```
.brain/learning/
├── README.md              # Este arquivo
├── patterns.json          # Padrões descobertos e validados
├── anti-patterns.json     # Anti-patterns e como evitá-los
├── index.json             # Índice pesquisável de todo o learning
├── outcomes/              # Resultados de ações (positivos e negativos)
│   ├── positive/
│   └── negative/
└── subagents/             # Aprendizados de missões com subagentes
    ├── README.md
    ├── TEMPLATE.md
    └── *.md
```

## Regras

1. **Toda ação significativa gera memória de resultado** — se melhorou, registrar para repetir. Se regrediu, registrar para não repetir.
2. **A última nota verificada é a verdade operacional** — mas o histórico permanece visível.
3. **Padrões repetidos 3+ vezes são promovidos** a regras duráveis em `patterns.json`.
4. **Anti-patterns detectados 2+ vezes são registrados** em `anti-patterns.json` com prevenção.
5. **Autoria sempre explícita** — CODEX, KIMI, ou consenso.

## Fluxo de Aprendizado

```
1. DETECÇÃO
   └── Nova missão, bug, decisão ou padrão identificado
        ↓
2. CLASSIFICAÇÃO
   └── Qual personalidade? Qual categoria? Qual impacto?
        ↓
3. REGISTRO
   └── Escrever em patterns.json, anti-patterns.json, ou outcomes/
        ↓
4. PROPAGAÇÃO
   └── Atualizar personalidades afetadas, templates, e context.md
        ↓
5. SINCRONIZAÇÃO
   └── brain:sync:principal para replicar no brain canônico
```

## Categorias

| Categoria | Descrição | Exemplo |
|-----------|-----------|---------|
| `pattern` | Solução reutilizável | "Use useIdleTimeout para timeouts de kiosk" |
| `anti-pattern` | Erro comum a evitar | "Nunca usar any em novos arquivos" |
| `decision` | Decisão arquitetural | "Deploy via build local + script, não CI" |
| `insight` | Descoberta estratégica | "80% das empresas usam single-agent com tools" |
| `tooling` | Melhoria de ferramenta | "subagent-fabric gera contratos MAMIS/1" |

## Autor

- Estrutura: KIMI (2026-04-26)
- Base: ADR-011
