# @beep/agents-server Agent Guide

## Purpose & Fit
- Server adapter package for the agents slice. It hosts assistant-turn
  streaming primitives (`scanChunk` and friends) and the Layers that wrap them.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `AssistantTurn` | public namespace for streaming helpers |
| AssistantTurn subpath | `ScanState`, `initialScanState`, `scanChunk` | incremental completed-block extractor, property-test-proven |
| test subpath | deterministic test seeds | test-only helpers |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/agents-server` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep the `scanChunk` algorithm byte-for-byte stable; it is property-test-proven.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { initialScanState, scanChunk } from "@beep/agents-server/AssistantTurn"

console.log(initialScanState, scanChunk)
```

## Verifications
- `bunx turbo run test --filter=@beep/agents-server`
- `bunx turbo run test:integration --filter=@beep/agents-server`
- `bunx turbo run lint --filter=@beep/agents-server`
- `bunx turbo run check --filter=@beep/agents-server`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
