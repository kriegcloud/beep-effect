# @beep/iam-client Agent Guide

## Purpose & Fit
- The client package for the iam slice

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
import { VERSION } from "@beep/iam-client"
```

## Verifications
- `bunx turbo run test --filter=@beep/iam-client`
- `bunx turbo run lint --filter=@beep/iam-client`
- `bunx turbo run check --filter=@beep/iam-client`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
