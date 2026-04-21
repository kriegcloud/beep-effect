# @beep/test-utils Agent Guide

## Purpose & Fit
- An library for re-usable vitest & @effect/vitest testing utilities

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
import { VERSION } from "@beep/test-utils"
```

## Verifications
- `bunx turbo run test --filter=@beep/test-utils`
- `bunx turbo run lint --filter=@beep/test-utils`
- `bunx turbo run check --filter=@beep/test-utils`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
