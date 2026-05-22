# @beep/canvas-server Agent Guide

## Purpose & Fit
- Server adapter package for the canvas slice. It turns the public
  CanvasProject use-case facade into HTTP-style, RPC-style, tool-style, and
  Effect layer surfaces.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | `VERSION`, `CanvasProject` | public namespace for protocol handlers and repository adapters |
| layer subpath | `CanvasServerLive`, `CanvasProjectServer` | canonical import path for app/runtime layer composition |
| CanvasProject aggregate | HTTP/RPC/tool handlers, repository live layer | protocol adapters stay thin and delegate to use cases |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/canvas-server` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Import app/runtime layer dependencies from `@beep/canvas-server/layer`, not
  through the package root.
- Preserve public failure redaction at protocol boundaries; keep technical
  causes in logs or lower layers.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { CanvasProject } from "@beep/canvas-server"
import { CanvasServerLive } from "@beep/canvas-server/layer"

console.log(CanvasProject.CanvasProjectToolNames.restore, CanvasServerLive)
```

## Verifications
- `bunx turbo run test --filter=@beep/canvas-server`
- `bunx turbo run test:integration --filter=@beep/canvas-server`
- `bunx turbo run lint --filter=@beep/canvas-server`
- `bunx turbo run check --filter=@beep/canvas-server`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
