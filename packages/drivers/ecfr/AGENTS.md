# @beep/ecfr Agent Guide

## Purpose & Fit
- eCFR driver package

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION | package entry point |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/ecfr` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/ecfr"
```

## Verifications
- `bunx turbo run test --filter=@beep/ecfr`
- `bunx turbo run test:integration --filter=@beep/ecfr`
- `bunx turbo run lint --filter=@beep/ecfr`
- `bunx turbo run check --filter=@beep/ecfr`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
