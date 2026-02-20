# Current Release Surface (Phase 1)

**Captured**: 2026-02-20  
**Source of truth**: root `package.json` workspace globs (`scratchpad`, `groking-effect-v4`, `packages/*`, `tooling/*`, `apps/*`)

## Workspace Package Inventory

| Path | Package | private | version | Classification | Publish intent (Phase 1) | Notes |
|------|---------|---------|---------|----------------|---------------------------|-------|
| `groking-effect-v4` | `@beep/groking-effect-v4` | `false` | `0.0.0` | publishable library | `publish now` | Only workspace package currently non-private. Has public `publishConfig`. |
| `scratchpad` | `scratchpad` | `true` | `0.0.0` | sandbox/workbench | `private` | Local sandbox package; not part of initial release surface. |
| `tooling/cli` | `@beep/repo-cli` | `true` | `0.0.0` | internal tooling CLI | `private` | Keep private for initial rollout even though `publishConfig` exists. |
| `tooling/codebase-search` | `@beep/codebase-search` | `true` | `0.0.0` | internal tooling service | `private` | Keep private for initial rollout even though `publishConfig` exists. |
| `tooling/repo-utils` | `@beep/repo-utils` | `true` | `0.0.0` | internal shared tooling lib | `private` | Keep private for initial rollout even though `publishConfig` exists. |

## Publish-Now Surface

Initial publish target for Changesets rollout:

- `@beep/groking-effect-v4`

All other current workspace packages remain private for this rollout.

## Discovery Notes

- `apps/*` and `packages/*` currently contain no workspace `package.json` files.
- `scripts/package.json` is not a workspace package (not matched by root workspace globs).
- `tooling/repo-utils/test/fixtures/mock-monorepo/*` package manifests are fixtures only and are excluded from release decisions.
