# @beep/runpod Agent Guide

## Purpose & Fit
- Effect-first Runpod REST API v1 driver package.
- This package owns provider API transport, generated OpenAPI models, typed driver errors, and Runpod docs-index retrieval.
- Do not place infrastructure deployment policy here; infra consumers should depend on this driver.

## Surface Map
| Surface | Key exports | Notes |
| --- | --- | --- |
| entry module | Runpod, RunpodDocs, RunpodError, RunpodRawRequest, generated request/response models | package entry point |
| generated module | src/_generated/Runpod.generated.ts | generated from openapi.json by scripts/generate.ts; do not hand-edit |
| OpenAPI source | openapi.json | checked-in source for generated models and operation descriptors |
| docs index | RunpodDocs, parseRunpodDocsIndex | fetches and parses docs.runpod.io/llms.txt |

## Laws
- Follow repository laws through command discovery.
- Run `bun run beep docs laws`.
- Prefer tersest equivalent helper forms when behavior is unchanged.
- In `test/` and `dtslint/`, import package source through `@beep/runpod` or other `@beep/*` package aliases; keep relative imports for local helpers, fixtures, and snapshots only.
- Keep package guidance concise and avoid duplicating long policy prose.

## Quick Recipes
```ts
import { Effect } from "effect"
import { Runpod } from "@beep/runpod"

const program = Effect.gen(function* () {
  const runpod = yield* Runpod
  return yield* runpod.listPods()
})

void program
```

## Verifications
- `bunx turbo run test --filter=@beep/runpod`
- `bunx turbo run test:integration --filter=@beep/runpod`
- `bunx turbo run lint --filter=@beep/runpod`
- `bunx turbo run check --filter=@beep/runpod`
- `bun run --cwd packages/drivers/runpod beep:audit`

## Contributor Checklist
- [ ] New exports include jsdoc metadata
- [ ] Tests added or updated for behavior changes
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
