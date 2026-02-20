# Env + 1Password Redesign

## Status
ACTIVE

## Purpose
Redesign local environment configuration for the effect-v4 migration branch so secrets are handled through 1Password Environments, while preserving the human-friendly qualities of the legacy setup (clear namespacing and visually structured ASCII sections).

## Problem Statement
Current local environment management is hard to maintain and easy to misuse:

- The branch has a populated root `.env` with many secret-bearing variables.
- Variable interpolation chains increase coupling and hidden breakage.
- There is no committed root `.env.example` in this branch today.
- Legacy bootstrap helpers exist in `.repos/beep-effect/` but are not yet adapted to the current branch.

## Scope

### In Scope
- Define a new canonical `.env.example` for this repo.
- Define a secure local `.env` strategy using 1Password Environments.
- Preserve sectioned, namespaced, "pretty" env formatting (ASCII/comment style).
- Remove variable interpolation from canonical env files.
- Define bootstrap/validation scripts for env setup and drift detection.
- Align package scripts with `op run --env-file=.env -- ...` execution.

### Out of Scope
- Production secret management rollout.
- CI/CD secret provider migration (tracked separately).
- Re-architecting package-level config parsing.

## Success Criteria
- [ ] Root `.env.example` exists and contains no secrets.
- [ ] `.env.example` preserves namespaced sections and readable ASCII structure.
- [ ] Canonical env files contain no `${...}` interpolation.
- [ ] 1Password CLI execution model is documented and script-ready.
- [ ] Local commands can run through `op run --env-file=.env -- ...`.
- [ ] Env bootstrap tooling preserves comments/formatting when updating values.
- [ ] Clear migration checklist exists for moving from current `.env` to new model.

## Current State Snapshot
- Current branch root `.env`: 131 keys, 40 interpolation references, 39 unique interpolation variables.
- Current branch root `.env`: heavy secret surface (57 key names matching secret-like patterns such as `KEY`, `TOKEN`, `SECRET`, `PASSWORD`).
- Legacy subtree `.repos/beep-effect/.env.example`: 92 keys, 33 interpolation references.
- Legacy subtree includes bootstrap tools:
  - `.repos/beep-effect/tooling/repo-scripts/src/bootstrap.ts`
  - `.repos/beep-effect/tooling/repo-scripts/src/generate-env-secrets.ts`

## Key Decisions (Locked)
1. Local development secret loading will use **1Password CLI** via `op run --env-file=.env -- ...`.
2. New canonical env layout will keep **namespaced groups** (`APP_`, `DB_PG_`, `KV_REDIS_`, `OAUTH_PROVIDER_`, `NEXT_PUBLIC_`, etc.).
3. New canonical env files will keep **human-readable section formatting** (ASCII/comment blocks).
4. Canonical env files contain no interpolation chains.
5. User-provided 64-key target set is the canonical baseline for migration.

## Phase Overview

| Phase | Goal | Status |
|-------|------|--------|
| P0 | Spec scaffold + current-state audit | Complete |
| P1 | Key catalog + target env contract design | Complete |
| P2 | 1Password command integration + bootstrap tool design | Pending |
| P3 | Implement new `.env.example` and migration workflow | Pending |
| P4 | Verify, document, and handoff | Pending |

## Planned Outputs
- `outputs/current-state-audit.md`
- `outputs/target-architecture.md`
- `outputs/migration-plan.md`
- `outputs/key-catalog.md`
- `outputs/contract-decisions.md`
- (P2+) `outputs/script-and-command-matrix.md`

## Reference Files
- Current env file: `.env`
- Legacy template: `.repos/beep-effect/.env.example`
- Legacy bootstrap flow: `.repos/beep-effect/tooling/repo-scripts/src/bootstrap.ts`
- Legacy secret generation: `.repos/beep-effect/tooling/repo-scripts/src/generate-env-secrets.ts`
- Spec process reference: `.repos/beep-effect/specs/_guide/README.md`
- Handoff standard reference: `.repos/beep-effect/specs/_guide/HANDOFF_STANDARDS.md`

## Navigation
- [Quick Start](./QUICK_START.md)
- [Master Orchestration](./MASTER_ORCHESTRATION.md)
- [Reflection Log](./REFLECTION_LOG.md)
- [Outputs](./outputs/)
- [Handoffs](./handoffs/)
