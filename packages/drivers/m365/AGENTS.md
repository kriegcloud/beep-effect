# @beep/m365 Agent Guide

## Purpose & Fit
- Microsoft Graph v1.0 driver (delegated auth-code+PKCE, read-only verbs)

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION | package entry point |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/m365` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/m365"
```

## Verifications
- `bunx turbo run test --filter=@beep/m365`
- `bunx turbo run test:integration --filter=@beep/m365`
- `bunx turbo run lint --filter=@beep/m365`
- `bunx turbo run check --filter=@beep/m365`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
