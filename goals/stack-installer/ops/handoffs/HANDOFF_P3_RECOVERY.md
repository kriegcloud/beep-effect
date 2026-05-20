# Handoff P3 - Recovery

Status: stub.

## Mission

Prove recovery from salted broken states using AI Mode while preserving
approval-first control and credential secrecy.

## Required Startup

- Read `../../SPEC.md`.
- Read `../../PLAN.md`.
- Read `../manifest.json`.
- Read `../../history/outputs/p1-discord-vertical-manual.md`.
- Read `../../history/outputs/p2-ai-mode-parity.md`.

## Stop Conditions

- Stop if recovery depends on hidden manual terminal commands.
- Stop if `Indeterminate` validation results are treated as failures.
- Stop if repair logs expose plaintext secrets.
- Stop if before/after validator output is unavailable.

Full prompt to be authored when P2 closes.
