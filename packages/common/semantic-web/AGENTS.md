# @beep/semantic-web Agent Guide

## Purpose & Fit
- An library containing utilities, schemas & services for working with the semantic web

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION | package entry point |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/semantic-web"
```

## Verifications
- `bunx turbo run test --filter=@beep/semantic-web`
- `bunx turbo run lint --filter=@beep/semantic-web`
- `bunx turbo run check --filter=@beep/semantic-web`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
