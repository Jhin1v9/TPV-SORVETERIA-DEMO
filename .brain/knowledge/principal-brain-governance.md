# Principal Brain Governance

## Purpose

Define the relationship between:

1. the project-local `.brain`
2. the project-local `.brain-orchestrator`
3. the principal independent brain in `C:\Users\Administrator\Documents\.brain`

## Canonical Rule

- The principal brain is the long-lived canonical knowledge system.
- The project brain is the local execution mirror.
- Relevant updates must land in both.

## Operational Rule

After relevant `.brain` or `.brain-orchestrator` changes:

1. update the local project files
2. run `npm run brain:sync:principal`
3. confirm commit was created in the principal brain
4. if a Git remote exists, push it
5. if no remote exists, record the blocked push state explicitly

## Automation

- sync script: `scripts/sync-principal-brain.mjs`
- watch mode: `scripts/watch-principal-brain-sync.mjs`

## Principal Brain Outputs

Every sync should maintain:

- `PROJECTS.md`
- `PROJECTS.json`
- `CHANGELOG.md`
- `projects/<slug>/LATEST_SYNC.md`
- `projects/<slug>/PROJECT_INDEX.md`
- `projects/<slug>/SYNC_RESULT.json`

## Status VIGENTE

- Principal brain is canonical.
- Project brain is operational mirror.
- CODEX is responsible for keeping both aligned.

## Author

Author: CODEX
Date: 2026-04-25
