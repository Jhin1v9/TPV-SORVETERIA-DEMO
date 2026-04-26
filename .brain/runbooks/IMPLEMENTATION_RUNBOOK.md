# IMPLEMENTATION_RUNBOOK

## Use when

- a bounded feature or fix needs implementation
- clear write ownership can be assigned

## Default team

- CODE_SCOUT
- SURGEON
- VERIFIER

## Mission flow

1. principal scopes exact write surface
2. CODE_SCOUT confirms files and coupling
3. SURGEON edits only owned files
4. VERIFIER runs build/tests/smoke
5. principal decides merge readiness and writes outcome to `.brain`

## Required outputs

- owned files
- patch rationale
- validation commands
- pass/fail result
- residual risks

## Failure conditions

- ambiguous ownership
- shared-file parallel edits
- no verification after patch

## Author

Author: CODEX
Date: 2026-04-25
