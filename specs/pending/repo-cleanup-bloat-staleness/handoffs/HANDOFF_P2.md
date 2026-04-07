# Handoff P2 — Docgen Verification And Cleanup

## Goal

Verify what currently owns docgen in the repo and remove genuine stale docgen assumptions if they still exist.

## Required Inputs

- `../README.md`
- `../outputs/manifest.json`
- `../outputs/cleanup-checklist.md`
- `../outputs/p0-planning-and-document-classification.md`
- `../outputs/p1-workspace-removal-and-regeneration.md`
- root docgen scripts plus `tooling/docgen` and `tooling/cli`

## Required Output

- `../outputs/p2-docgen-verification-and-cleanup.md`

## Required Decisions

- current docgen owner
- stale docgen references that are safe to remove
- generated-doc cleanup obligations
- required verification commands
- phase commit contents

## Required Command Set

- `bun run docgen` when docgen or generated docs changed
- `bun run lint`
- `bun run check`
- `bun run test`
- `bun run check:full` if root TS wiring changed during cleanup

## Exit Gate

P2 closes only when docgen ownership is proven from repo reality and stale docgen assumptions or artifacts are removed or explicitly ruled out.
