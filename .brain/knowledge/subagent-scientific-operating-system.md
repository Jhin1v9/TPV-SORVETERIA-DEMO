# Subagent Scientific Operating System

## Purpose

Transform delegation into a repeatable system instead of ad-hoc prompting.

This operating model is designed for principal agents such as CODEX or KIMI that need to:

1. decide when delegation is worth the cost
2. create specialized subagents with bounded ownership
3. enforce one compact machine-readable language
4. synthesize heterogeneous evidence into one current truth

## Scientific Basis

This system consolidates the strongest recurring patterns from modern agent literature:

1. OpenAI
- use tools first, agents second
- keep a central orchestrator
- parallelize only independent work

2. Anthropic
- decompose research into bounded specialist threads
- keep synthesis centralized
- preserve evidence and uncertainty separately

3. Microsoft Agent Framework / AutoGen / LangGraph
- explicit roles
- graph/state driven handoffs
- durable intermediate outputs

## State of the Art Patterns

### Pattern 1 - Manager Worker

Default for this project.

- Principal agent owns user intent.
- Subagents own narrow scopes.
- Final synthesis always returns to the principal.

### Pattern 2 - Evaluator Optimizer

Use when quality loops matter.

- SURGEON implements.
- REVIEWER critiques.
- VERIFIER validates.
- Principal agent decides whether another pass is worth it.

### Pattern 3 - Research Triangle

Use for high-uncertainty analysis.

- WEB_SCOUT gathers external evidence.
- CODE_SCOUT gathers internal evidence.
- SYNTHESIZER merges both into one state.

## Operating Rules

1. Single-agent remains default.
2. Subagents exist to reduce uncertainty, not to look sophisticated.
3. No parallel writes to the same file.
4. Every subagent gets a closed contract.
5. Every subagent speaks `MAMIS/1`.
6. Principal agent owns the final truth.

## Protocol

The project standard is `MAMIS/1`.

Inbound contract:

```text
MAMIS/1
ROLE: <role>
GOAL: <one-line objective>
SCOPE: <what is in/out>
INPUTS: <files, urls, facts, constraints>
OUTPUT: <artifact shape>
DONE: <definition of done>
RISK: <known risk>
```

Outbound result:

```text
MAMIS/1
STATUS: OK | PARTIAL | BLOCKED
SUMMARY: <3-8 lines max>
EVIDENCE:
- <fact>
FILES:
- <path>
RISKS:
- <risk>
NEXT:
- <next step>
```

## Automation Layer

Automation is provided by:

- `.brain-orchestrator/OPERACAO_AGENTES.md`
- `.brain-orchestrator/SUBAGENT_REGISTRY.json`
- `.brain-orchestrator/SUBAGENT_PROMPTS.md`
- `scripts/subagent-fabric.mjs`

The principal agent can generate a full specialist team with:

```bash
npm run agent:fabric -- --goal "research best push notification architecture and map repo impact"
```

Artifacts are emitted to `artifacts/subagent-fabric-*` and include:

- `team.json`
- `TEAM.md`
- `SPAWN_MESSAGES.md`

## What Makes This Better Than Simple Prompting

1. role catalog is versioned
2. naming is standardized
3. communication is mergeable
4. evidence is preserved
5. synthesis is explicit
6. the latest verified state can be written back into `.brain`

## Consolidation Rule

When multiple agents disagree:

1. prefer primary sources over summaries
2. prefer code evidence over memory
3. prefer live validation over static assumption
4. preserve history, but mark one `STATUS VIGENTE`

## Author

Author: CODEX
Date: 2026-04-25
