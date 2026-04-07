# P1: Targeted Workspace Removal And Regeneration

## Status

**NOT_STARTED**

## Objective

Remove the target workspaces and clean active references while regenerating managed repo artifacts.

## Target Workspaces

- `apps/clawhole` as `@beep/clawhole`
- `apps/web` as `@beep/web`
- `apps/crypto-taxes` as `@beep/crypto-taxes`
- `packages/ai/sdk` as `@beep/ai-sdk`

## Required Evidence

- affected-surface map
- removal order
- preserved historical references
- managed commands executed
- repo-wide verification summary
- phase commit reference

## Required Command Set

- `bun run config-sync`
- `bun run version-sync --skip-network`
- `bun run docgen`
- `bun run lint`
- `bun run check`
- `bun run test`
- `bun run check:full`

## Affected-Surface Checklist

- root workspaces and scripts
- TS project references and quality refs
- root `paths` and identity registries
- tests, fixtures, Playwright, e2e, CI, and security-scan wiring
- docs, standards inventories, generated docs, ignores
- package metadata, dependency catalog, and lockfile impact

## Affected-Surface Map

| Surface | Evidence | Planned Action | Notes |
|---|---|---|---|
| TBD | TBD | TBD | Populate during P1 |

## Commands Run

| Command | Result | Notes |
|---|---|---|
| TBD | TBD | Populate during P1 |

## Phase Commit

| Commit | Scope | Notes |
|---|---|---|
| TBD | TBD | Populate during P1 if changes were made |

## Historical References Preserved

| Surface | Reason Preserved | Notes |
|---|---|---|
| TBD | TBD | Populate during P1 |

## Deferred Findings For Later Phases

| Finding | Carry To | Notes |
|---|---|---|
| TBD | TBD | Populate when P1 discovers out-of-phase work |

## Residual Risks

- Populate during P1.

## Handoff Notes For P2

- Populate after P1 reaches `COMPLETED`.

## Exit Gate

P1 is complete when the target workspaces, active references, and resulting managed-artifact drift are removed and verified.
