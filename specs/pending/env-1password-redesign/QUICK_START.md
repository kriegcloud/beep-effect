# Quick Start — Env + 1Password Redesign

## What This Spec Does
Defines a clean, secure, and readable local env system for this repo:

- 1Password-powered secret injection for local commands.
- A new canonical `.env.example` with zero real secrets.
- Preserved namespaced/ASCII env style.
- No interpolation chains in canonical env files.

## Current Phase
P0 and P1 are complete (scaffold + current-state audit + contract lock).

Next phase is **P2: integration design**.

## First Files to Read
1. `specs/pending/env-1password-redesign/README.md`
2. `specs/pending/env-1password-redesign/outputs/current-state-audit.md`
3. `specs/pending/env-1password-redesign/outputs/target-architecture.md`
4. `specs/pending/env-1password-redesign/outputs/key-catalog.md`
5. `specs/pending/env-1password-redesign/outputs/contract-decisions.md`
6. `specs/pending/env-1password-redesign/handoffs/HANDOFF_P2.md`
7. `specs/pending/env-1password-redesign/handoffs/P2_ORCHESTRATOR_PROMPT.md`

## Guardrails
- Do not commit real secret values.
- Keep canonical env files free of `${...}` interpolation.
- Keep section formatting readable and stable.
- Keep script changes additive and reversible.
