# BRAIN_SYNC_RUNTIME

## Goal

Make brain updates operational, not optional.

## Rule

Whenever `.brain` or `.brain-orchestrator` changes in the project:

1. sync to principal brain
2. commit in principal brain
3. push if remote exists
4. record failure if remote does not exist

## Commands

```bash
npm run brain:sync:principal
npm run brain:sync:watch
npm run brain:watch:install
npm run brain:watch:uninstall
npm run brain:dashboard
npm run brain:snapshot
npm run brain:rollback -- --project <slug> --snapshot <id> --reason "<reason>"
```

## Outputs

- canonical mirror in `C:\Users\Administrator\Documents\.brain\projects\<project>`
- global project index
- global changelog
- sync result file

## Author

Author: CODEX
Date: 2026-04-25
