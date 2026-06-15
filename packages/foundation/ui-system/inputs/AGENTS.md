# @beep/inputs Agent Guide

## Purpose & Fit
- Input components and primitives for Beep UI surfaces

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION | package entry point |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/inputs` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/inputs"
```

## Verifications
- `bunx turbo run test --filter=@beep/inputs`
- `bunx turbo run test:integration --filter=@beep/inputs`
- `bunx turbo run lint --filter=@beep/inputs`
- `bunx turbo run check --filter=@beep/inputs`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
