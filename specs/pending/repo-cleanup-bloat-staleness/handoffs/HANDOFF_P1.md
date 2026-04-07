# Handoff P1 — Targeted Workspace Removal And Regeneration

## Goal

Remove the four named workspaces and clean active references without damaging historical evidence.

## Required Inputs

- `../README.md`
- `../outputs/manifest.json`
- `../outputs/cleanup-checklist.md`
- `../outputs/p0-planning-and-document-classification.md`
- repo config and source surfaces affected by workspace removal

## Required Output

- `../outputs/p1-workspace-removal-and-regeneration.md`

## Required Decisions

- affected-surface map
- safest removal order
- historical references to preserve
- required managed commands and repo-wide checks
- phase commit contents

## Required Command Set

- `bun run config-sync`
- `bun run version-sync --skip-network`
- `bun run docgen`
- `bun run lint`
- `bun run check`
- `bun run test`
- `bun run check:full`

## Exit Gate

P1 closes only when the target workspaces, their active references, and resulting managed-artifact drift are removed and verified.
