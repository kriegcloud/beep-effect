# @beep/sanity Agent Guide

## Purpose & Fit
- Sanity API driver package

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION, Sanity, SanityConfigInput, SanityError, SanityQueryRequest, SanityQueryResponse | package entry point |
| Sanity.config | SANITY_API_VERSION, SanityConfigInput | runtime configuration model |
| Sanity.errors | SanityError, SanityErrorOptions, SanityErrorReason | typed driver errors |
| Sanity.service | Sanity, SanityQueryRequest, SanityQueryResponse, SanityShape | service and request/response surface |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/sanity` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { Sanity, SanityConfigInput, VERSION } from "@beep/sanity"
```

## Verifications
- `bunx turbo run test --filter=@beep/sanity`
- `bunx turbo run test:integration --filter=@beep/sanity`
- `bunx turbo run lint --filter=@beep/sanity`
- `bunx turbo run check --filter=@beep/sanity`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
