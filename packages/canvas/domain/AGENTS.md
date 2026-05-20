# @beep/canvas-domain Agent Guide

## Purpose & Fit
- Architecture-lab domain package for the synthetic CanvasProject aggregate.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION | package entry point |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/canvas-domain` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/canvas-domain"
```

## Verifications
- `bunx turbo run test --filter=@beep/canvas-domain`
- `bunx turbo run test:integration --filter=@beep/canvas-domain`
- `bunx turbo run lint --filter=@beep/canvas-domain`
- `bunx turbo run check --filter=@beep/canvas-domain`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
