# @beep/canvas Agent Guide

## Purpose & Fit
- Private repo-local Tauri 2 + React shell for the canvas bootstrap goal.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | App, VERSION, command bridge factories | package entry point |
| Tauri shell | canvas_health, scene_save, scene_load | native command surface |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/canvas` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { makeCanvasCommandBridge, makeCanvasCommandRuntime } from "@beep/canvas"

const runtime = makeCanvasCommandRuntime()
const bridge = await runtime.runPromise(makeCanvasCommandBridge())
```

## Verifications
- `bunx turbo run test --filter=@beep/canvas`
- `bunx turbo run test:integration --filter=@beep/canvas`
- `bunx turbo run lint --filter=@beep/canvas`
- `bunx turbo run check --filter=@beep/canvas`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
