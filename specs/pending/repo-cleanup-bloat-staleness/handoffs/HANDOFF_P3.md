# Handoff P3 — Dependency, Security, And Platform Pruning

## Goal

Prune repo-level drift that remains after workspace and docgen cleanup.

## Required Inputs

- `../README.md`
- `../outputs/manifest.json`
- `../outputs/cleanup-checklist.md`
- `../outputs/p1-workspace-removal-and-regeneration.md`
- `../outputs/p2-docgen-verification-and-cleanup.md`
- root dependency and platform config files affected by the prior phases

## Required Output

- `../outputs/p3-dependency-security-and-platform-pruning.md`

## Required Decisions

- removable root catalog and override entries
- removable security exceptions
- Playwright, e2e, CI, or test wiring changes
- verification and audit commands
- phase commit contents

## Required Command Set

- `bun run version-sync --skip-network` when package graph drift exists
- `bun run lint:repo`
- `bun run audit:high`
- `bun run lint`
- `bun run check`
- `bun run test`

## Exit Gate

P3 closes only when repo-level dependency, security, and platform drift introduced or exposed by the cleanup is removed and verified.
