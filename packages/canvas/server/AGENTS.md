# @beep/canvas-server Agent Guide

## Purpose & Fit
- Architecture-lab server adapter package for CanvasProject repositories, handlers, and Layers.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION | package entry point |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/canvas-server` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/canvas-server"
```

## Verifications
- `bunx turbo run test --filter=@beep/canvas-server`
- `bunx turbo run test:integration --filter=@beep/canvas-server`
- `bunx turbo run lint --filter=@beep/canvas-server`
- `bunx turbo run check --filter=@beep/canvas-server`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
