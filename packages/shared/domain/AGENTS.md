# @beep/shared-domain Agent Guide

## Purpose & Fit
- The shared kernel for cross cutting domain dependencies

## Surface Map
| Module | Key exports | Notes |
| --- | --- | --- |
| `src/index.ts` | `VERSION` | Package entry point |

## Usage Snapshots
(Add usage examples as the package grows)

## Authoring Guardrails
- **Effect-first imports**: ALWAYS use namespace imports (`import * as Effect from "effect/Effect"`). NEVER use native Array/String helpers.
- **Tagged errors**: Use `S.TaggedErrorClass` for all error types.
- **Schema-based JSON**: Use `Schema.decodeUnknownEffect`/`Schema.encodeUnknownEffect` instead of `JSON.parse`/`JSON.stringify`.
- **Effect.fn**: Use `Effect.fn` for all functions returning Effects.

## Quick Recipes
```ts
import { VERSION } from "@beep/domain"
```

## Verifications
- `bunx turbo run test --filter=@beep/shared-domain`
- `bunx turbo run lint --filter=@beep/shared-domain`
- `bunx turbo run check --filter=@beep/shared-domain`

## Contributor Checklist
- [ ] All new exports have `/** @since 0.0.0 */` JSDoc annotations
- [ ] Tests added/updated for new functionality
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
