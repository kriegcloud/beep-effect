# @beep/tika Agent Guide

## Purpose & Fit
- Apache Tika driver for product-neutral file detection, text extraction, and metadata extraction

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION | package entry point |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/tika` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/tika"
```

## Verifications
- `bunx turbo run test --filter=@beep/tika`
- `bunx turbo run test:integration --filter=@beep/tika`
- `bunx turbo run lint --filter=@beep/tika`
- `bunx turbo run check --filter=@beep/tika`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
