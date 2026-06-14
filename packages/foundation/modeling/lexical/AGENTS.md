# @beep/lexical-schema Agent Guide

## Purpose & Fit
- Schema-first models of Lexical serialized editor state with Md to Lexical codecs

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION | package entry point |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/lexical-schema` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/lexical-schema"
```

## Verifications
- `bunx turbo run test --filter=@beep/lexical-schema`
- `bunx turbo run test:integration --filter=@beep/lexical-schema`
- `bunx turbo run lint --filter=@beep/lexical-schema`
- `bunx turbo run check --filter=@beep/lexical-schema`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
