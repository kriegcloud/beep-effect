# @beep/architecture-lab-server Agent Guide

## Purpose & Fit
- Architecture-lab server adapter package for WorkItem repositories, handlers, and Layers.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION | package entry point |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/architecture-lab-server` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/architecture-lab-server"
```

## Verifications
- `bunx turbo run test --filter=@beep/architecture-lab-server`
- `bunx turbo run test:integration --filter=@beep/architecture-lab-server`
- `bunx turbo run lint --filter=@beep/architecture-lab-server`
- `bunx turbo run check --filter=@beep/architecture-lab-server`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
