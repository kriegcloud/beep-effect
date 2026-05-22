# @beep/canvas-use-cases Agent Guide

## Purpose & Fit
- Use-case package for the canvas slice. It owns CanvasProject commands,
  queries, public action errors, the use-case service contract, and the
  repository port used by server adapters.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| public subpath | `CanvasProject` namespace | commands, queries, action errors, and use-case service |
| server subpath | repository port, `makeCanvasProjectUseCases` | server-only composition surface |
| aggregate namespace | CanvasProject commands and use-cases | package-internal public aggregate topology |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/canvas-use-cases` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep app/native persistence behind use-case commands. Loading a saved scene
  should restore through `RestoreCanvasProjectCommand`.
- Translate repository/domain failures to public action errors before crossing
  server or app boundaries.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { CanvasProject } from "@beep/canvas-use-cases/public"

const query = new CanvasProject.ListCanvasProjectsQuery({})
console.log(query)
```

## Verifications
- `bunx turbo run test --filter=@beep/canvas-use-cases`
- `bunx turbo run test:integration --filter=@beep/canvas-use-cases`
- `bunx turbo run lint --filter=@beep/canvas-use-cases`
- `bunx turbo run check --filter=@beep/canvas-use-cases`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
