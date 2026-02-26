# @beep/ai-sdk Agent Guide

## Purpose & Fit
- The shared agent sdk library for coding harness abstractions

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
import { VERSION } from "@beep/ai-sdk"
```

## Verifications
- `bunx turbo run test --filter=@beep/ai-sdk`
- `bunx turbo run lint --filter=@beep/ai-sdk`
- `bunx turbo run check --filter=@beep/ai-sdk`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
