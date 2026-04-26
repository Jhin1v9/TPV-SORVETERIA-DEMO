# INCIDENT_RUNBOOK

## Use when

- production behavior is degraded
- live triage is needed
- partial outage or regression is suspected

## Default team

- WEB_SCOUT
- CODE_SCOUT
- VERIFIER
- SYNTHESIZER

## Mission flow

1. principal defines blast radius and timeline
2. WEB_SCOUT checks external changes, status pages, docs, release notes
3. CODE_SCOUT traces internal code path and recent ownership
4. VERIFIER reproduces against live or staging
5. SYNTHESIZER drafts current incident truth

## Required outputs

- incident scope
- affected systems
- strongest hypotheses
- reproduction evidence
- safest next move

## Failure conditions

- no live evidence
- no timeline
- speculation presented as root cause

## Author

Author: CODEX
Date: 2026-04-25
