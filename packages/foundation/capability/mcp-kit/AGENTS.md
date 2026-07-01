# @beep/mcp-kit Agent Guide

## Purpose & Fit
- Reusable MCP host-construction kit: credential-keyed toolkit composition, api_key_required envelope, tier-gate dispatch, progressive field-tier projection, span hygiene.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION | package entry point |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/mcp-kit` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/mcp-kit"
```

## Verifications
- `bunx turbo run test --filter=@beep/mcp-kit`
- `bunx turbo run test:integration --filter=@beep/mcp-kit`
- `bunx turbo run lint --filter=@beep/mcp-kit`
- `bunx turbo run check --filter=@beep/mcp-kit`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
