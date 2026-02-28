# @beep/db-admin Agent Guide

## Purpose & Fit
- The internal db-admin for migrations

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION | package entry point |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/db-admin"
```

## Verifications
- `bunx turbo run test --filter=@beep/db-admin`
- `bunx turbo run lint --filter=@beep/db-admin`
- `bunx turbo run check --filter=@beep/db-admin`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
