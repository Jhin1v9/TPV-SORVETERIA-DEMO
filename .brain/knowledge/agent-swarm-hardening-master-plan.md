# Agent Swarm Hardening Master Plan

Author: CODEX
Date: 2026-04-26
Status: Vigente

## Purpose

Transform the current swarm system from a strong prototype into an auditable, policy-obedient, scalable operating system for CODEX and KIMI.

This plan exists because the current direction is strong, but the executable runtime still violates some of its own safety and orchestration rules. The correct decision is to harden the foundation before adding more swarm power.

## Current Decision

Status vigente:

1. Freeze swarm feature expansion.
2. Treat orchestration inconsistencies as architectural bugs.
3. Harden runtime, policy, contracts, and learning lineage first.
4. Only then re-promote `aggressive-safe` as the default scaling strategy.

## Why this decision is correct

The current system already shows the right ambition:

1. adaptive scaling
2. recursive delegation
3. principal-agent governance
4. brain-linked learning

But ambition without enforcement creates false confidence.

Today the system still has risks such as:

1. generated plans that can violate global parallel ceilings
2. child fan-out that can exceed parent budget rules
3. mission composition that can omit required lanes for audit/review
4. lineage and learning metadata that are not fully consistent
5. contracts that describe policy better than they enforce it

So the right move is not “grow more.”

The right move is “make the system true.”

## External guidance synthesized

This plan is grounded in official or primary references and adapted to this repo.

### OpenAI

- Practical guide to building agents:
  - https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/
- Agents guide:
  - https://platform.openai.com/docs/guides/agents
- Evaluation best practices:
  - https://platform.openai.com/docs/guides/evaluation-best-practices
- Trace grading:
  - https://platform.openai.com/docs/guides/trace-grading

Key takeaways used here:

1. start with the simplest orchestration that works
2. scale complexity only when evaluation proves the need
3. keep strong observability and review loops
4. prefer reliable, testable execution over impressive architecture

### Anthropic

- How we built our multi-agent research system:
  - https://www.anthropic.com/engineering/built-multi-agent-research-system

Key takeaways used here:

1. the orchestrator must know how to delegate clearly
2. effort must scale to query complexity
3. over-spawning is a real failure mode
4. tracing and prompt/tool observability are mandatory

### Microsoft Agent Framework

- Overview:
  - https://learn.microsoft.com/en-us/agent-framework/overview/
- Orchestrations:
  - https://learn.microsoft.com/en-us/agent-framework/workflows/orchestrations/
- Safety:
  - https://learn.microsoft.com/en-us/agent-framework/agents/safety

Key takeaways used here:

1. orchestration patterns must be explicit
2. state and execution flow need strong control
3. safety is not inherited automatically from abstractions

### LangChain / LangGraph

- Multi-agent:
  - https://docs.langchain.com/oss/python/langchain/multi-agent/index

Key takeaways used here:

1. use multi-agent only when specialization or context partitioning truly helps
2. deterministic logic should constrain agentic behavior where possible

## Extraordinary target state

The swarm system should become:

1. policy-obedient
2. audit-friendly
3. lineage-preserving
4. evaluation-driven
5. parallel by default only when safe
6. recursively scalable without ownership collisions

In practical terms, “extraordinary” means:

1. every generated plan obeys its own ceilings
2. every mission type has the right minimum lanes
3. every delegation step is traceable
4. every learning artifact is machine-linkable to the mission tree
5. every promotion in maturity is earned by tests, not optimism

## Master architecture

The target system should have 5 layers:

### Layer 1 - Governance

Files:

- `.brain-orchestrator/SUBAGENT_REGISTRY.json`
- `.brain-orchestrator/OPERACAO_AGENTES.md`
- `.brain-orchestrator/PRINCIPAL_AGENT_RUNTIME.md`
- `.brain-orchestrator/SUBAGENT_PROMPTS.md`

Responsibilities:

1. declare allowed patterns
2. declare scaling strategies
3. declare recursion rules
4. declare role capabilities and forbidden behaviors
5. define machine-readable contract shape

### Layer 2 - Planning

Files:

- `scripts/subagent-mission.mjs`
- `scripts/subagent-swarm.mjs`

Responsibilities:

1. infer mission type
2. infer strategy
3. infer minimal required lanes
4. generate safe waves
5. reject invalid plans before execution

### Layer 3 - Fabric

Files:

- `scripts/subagent-fabric.mjs`
- `scripts/lib/subagent-policy.mjs`

Responsibilities:

1. generate teams
2. allocate shards
3. enforce caps and budgets
4. assign ownership
5. emit spawn contracts

### Layer 4 - Learning

Files:

- `scripts/subagent-learn.mjs`
- `.brain/learning/subagents/*`

Responsibilities:

1. preserve mission lineage
2. preserve lessons and anti-patterns
3. escalate recurring lessons into patterns
4. keep CODEX and KIMI operating from the same latest truth

### Layer 5 - Evaluation and Observability

Target artifacts:

1. mission outcomes
2. policy compliance checks
3. orchestration trace summaries
4. drift reports
5. promotion gates

This is the least mature layer today and needs deliberate buildout.

## Phase plan

## Phase 0 - Truth Reset

Objective:

Reclassify the current system honestly before expanding it.

Actions:

1. mark swarm status as “strong direction, partial implementation”
2. record the known policy/runtime mismatches
3. forbid premature “extraordinary” labeling

Done when:

1. `.brain` reflects the real status
2. current critical findings are explicitly listed
3. the team stops treating roadmap language as runtime truth

## Phase 1 - Policy Hardening

Objective:

Make the policy executable and self-consistent.

Actions:

1. unify all scaling logic under `scripts/lib/subagent-policy.mjs`
2. enforce `max_parallel_global`
3. enforce `max_children_per_agent`
4. enforce `max_write_agents_per_parent`
5. define minimum lane composition by mission type
6. define contract-required fields for recursion and ownership

Required contract fields:

1. `PARENT`
2. `DEPTH`
3. `READ_SCOPE`
4. `WRITE_SCOPE`
5. `PARALLEL_BUDGET`
6. `SPAWN_BUDGET`
7. `CHILD_ROLES_ALLOWED`
8. `ESCALATE_IF`
9. `MERGE_PLAN`

Done when:

1. no generated team violates policy
2. plan generation fails closed on invalid configurations
3. policy becomes the single source of truth

## Phase 2 - Mission Composition Hardening

Objective:

Guarantee that each mission type gets the right minimum specialist coverage.

Required baseline by mission:

### Research

1. `WEB_SCOUT`
2. `CODE_SCOUT` when repo context matters
3. `SYNTHESIZER`

### Implementation

1. `CODE_SCOUT`
2. `SURGEON`
3. `VERIFIER`

### Audit

1. `CODE_SCOUT`
2. `REVIEWER`
3. `VERIFIER`
4. `SYNTHESIZER`

### Incident

1. `WEB_SCOUT` when external state matters
2. `CODE_SCOUT`
3. `VERIFIER`
4. `SYNTHESIZER`

Actions:

1. move role inference from keyword-only behavior to mission-template behavior
2. allow user overrides, but never below the minimum safe floor unless explicitly forced
3. detect under-provisioned audits and block them

Done when:

1. “audit” never degenerates into reviewer-only fan-out
2. each mission type produces a composition aligned with its purpose

## Phase 3 - Ownership and Recursion Hardening

Objective:

Make nested delegation safe and explainable.

Actions:

1. enforce disjoint write ownership before any writable branch exists
2. default nested children to read-only
3. inherit budgets downward
4. record lineage upward
5. ensure one parent can only spawn within its declared budget
6. emit clear merge responsibility per branch

Rules:

1. nested delegation is for frontier expansion, not indecision
2. writable recursion must be rarer than read-only recursion
3. recursive branches must be traceable from root to leaf

Done when:

1. every child has a valid lineage chain
2. every writable branch has explicit ownership
3. no branch exceeds inherited budgets

## Phase 4 - Learning System Hardening

Objective:

Make learning trustworthy, queryable, and cumulative across CODEX and KIMI.

Actions:

1. use `team.missionId` as canonical mission identity everywhere
2. store parent/root/child linkage consistently
3. attach learned anti-patterns to policy review
4. promote repeated lessons into patterns automatically or semi-automatically
5. write a compact `status_vigente` after each meaningful mission

Done when:

1. learning notes correlate cleanly to generated mission artifacts
2. session records point to canonical mission IDs
3. repeated failures become policy improvements, not just notes

## Phase 5 - Evaluation and Observability

Objective:

Make the swarm measurable instead of merely expressive.

Metrics to introduce:

1. policy compliance rate
2. invalid plan rejection count
3. average fan-out by mission type
4. average nested depth used
5. writable branch count
6. contract completeness score
7. learning linkage completeness score
8. review-to-fix cycle time
9. mission success rate
10. residual-risk rate after synthesis

Artifacts to introduce:

1. `MISSION_TRACE.json`
2. `POLICY_COMPLIANCE.json`
3. `LEARNING_LINKAGE.json`
4. `MISSION_SCORECARD.md`

Done when:

1. orchestration quality is observable
2. failures are diagnosable
3. maturity promotion can be earned quantitatively

## Phase 6 - Promotion Gate for Extraordinary Status

The system may only be promoted to extraordinary when all gates below are green.

### Gate A - Policy truth

1. all caps enforced
2. no invalid generated plans in smoke suite
3. runtime and docs agree

### Gate B - Mission truth

1. each mission type has correct minimum composition
2. user overrides cannot silently create unsafe skeletal teams

### Gate C - Recursion truth

1. nested delegation obeys budget
2. writable branches obey ownership rules
3. lineage is preserved end to end

### Gate D - Learning truth

1. learning notes map to canonical mission IDs
2. repeated lessons are promoted into patterns or rules

### Gate E - Evaluation truth

1. mission scorecards exist
2. policy compliance metrics exist
3. trend over time exists

Only after all 5 gates are satisfied should the system be labeled extraordinary.

## Test matrix

The hardening effort should include smoke generation and review for at least:

1. small research mission
2. large research mission
3. small implementation mission
4. high-risk implementation mission
5. audit mission
6. incident mission
7. nested research mission
8. nested review mission

Assertions:

1. generated direct children <= `max_children_per_agent`
2. total planned parallelism <= effective allowed cap
3. writable branches <= allowed write budget
4. required roles exist for mission type
5. mission IDs are consistent across all artifacts
6. learning notes use canonical IDs

## Dashboard implications

The principal brain dashboard should eventually expose swarm maturity explicitly.

Recommended additions:

1. `swarmPolicyCompliance`
2. `swarmMissionCoverage`
3. `swarmLearningIntegrity`
4. `swarmObservabilityDepth`
5. `swarmMaturityBand`
6. `openSwarmRisks`

This should not happen before the underlying metrics become real.

## Operational rule for CODEX and KIMI

Until the hardening gates pass:

1. use swarm where it helps
2. but treat generated plans as proposed structures, not unquestionable truth
3. prefer bounded safe deployment of subagents
4. verify the plan before trusting it

After hardening gates pass:

1. `aggressive-safe` may remain the default
2. recursive delegation may scale more boldly
3. dashboard maturity claims may be upgraded

## Immediate next steps

1. fix policy/runtime inconsistencies in `fabric`, `swarm`, and `learn`
2. create smoke suite for all mission archetypes
3. record compliance artifacts
4. update `.brain` context and session
5. sync principal brain with commit + push

## Final principle

Extraordinary systems do not become extraordinary by sounding powerful.

They become extraordinary when:

1. the policy is real
2. the runtime obeys it
3. the evidence proves it
4. the learning compounds it

