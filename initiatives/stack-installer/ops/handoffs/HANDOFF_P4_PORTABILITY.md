# Handoff P4 - Portability

Status: stub.

## Mission

Prove manifest export/import across machines and OS boundaries without
re-running setup when the target machine already satisfies manifest intent.

## Required Startup

- Read `../../SPEC.md`.
- Read `../../PLAN.md`.
- Read `../manifest.json`.
- Read `../../history/outputs/p1-discord-vertical-manual.md`.
- Read `../../history/outputs/p2-ai-mode-parity.md`.
- Read `../../history/outputs/p3-recovery.md`.

## Stop Conditions

- Stop if import mutates credential values.
- Stop if setup is re-run instead of validation proving existing state.
- Stop if paired manifests cannot be normalized for comparison.
- Stop if Windows-WSL import is not included.

Full prompt to be authored when P3 closes.
