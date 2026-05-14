# @beep/ai-provider-cli Agent Guide

## Purpose & Fit
- Driver-level Claude and Codex CLI capability wrapper for product-neutral auth status checks.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION | package entry point |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/ai-provider-cli` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/ai-provider-cli"
```

## Verifications
- `bunx turbo run test --filter=@beep/ai-provider-cli`
- `bunx turbo run test:integration --filter=@beep/ai-provider-cli`
- `bunx turbo run lint --filter=@beep/ai-provider-cli`
- `bunx turbo run check --filter=@beep/ai-provider-cli`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
