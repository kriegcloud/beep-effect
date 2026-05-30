# @beep/nlp-mcp Agent Guide

## Purpose & Fit
- Model Context Protocol server exposing `@beep/nlp` operations and the generic IR handoff contract as MCP tools.
- Default runtime wiring uses the `@beep/wink` driver for `NLPBackend`.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION | package entry point |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/nlp-mcp` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/nlp-mcp"
```

## Verifications
- `bunx turbo run test --filter=@beep/nlp-mcp`
- `bunx turbo run test:integration --filter=@beep/nlp-mcp`
- `bunx turbo run lint --filter=@beep/nlp-mcp`
- `bunx turbo run check --filter=@beep/nlp-mcp`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
