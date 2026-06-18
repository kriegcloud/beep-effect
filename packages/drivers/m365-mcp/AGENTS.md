# @beep/m365-mcp Agent Guide

## Purpose & Fit
- Model Context Protocol server exposing Microsoft 365 read-only driver tools over stdio
- This package is a read-only MCP facade over `@beep/m365`; keep Graph auth,
  HTTP transport, decoding, and redaction in the driver.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | VERSION, makeServerLayer, M365Toolkit | package entry point |
| tools | M365Toolkit | read-only `effect/unstable/ai` tools |
| server | makeServerLayer | stdio `effect/unstable/mcp` server layer |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/m365-mcp` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Do not add write tools, HTTP/SSE MCP transports, ingestion wiring, Teams,
  Excel, Search, or custom Graph request construction here.
- Span annotations may include resource names, counts, and byte sizes, but never
  document content, message bodies, tokens, or raw secrets.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { VERSION } from "@beep/m365-mcp"
```

## Verifications
- `bunx turbo run test --filter=@beep/m365-mcp`
- `bunx turbo run test:integration --filter=@beep/m365-mcp`
- `bunx turbo run lint --filter=@beep/m365-mcp`
- `bunx turbo run check --filter=@beep/m365-mcp`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
