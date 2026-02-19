# @beep/groking-effect-v4 Agent Guide

## Purpose & Fit
- Generated learning workspace for Effect v4 exports and examples.

## Surface Map
| Module | Key exports | Notes |
| --- | --- | --- |
| `src/index.ts` | `generator` re-exports | Package entry point |
| `src/generator/index.ts` | generator utilities | Codegen scaffolding and module surface generation |
| `src/runtime/index.ts` | runtime playground helpers | Shared executable playground runtime |

## Usage Snapshots
(Add usage examples as the package grows)

## Authoring Guardrails
- **Effect-first imports**: ALWAYS use namespace imports (`import * as Effect from "effect/Effect"`). NEVER use native Array/String helpers.
- **Tagged errors**: Use `S.TaggedErrorClass` for all error types.
- **Schema-based JSON**: Use `Schema.decodeUnknownEffect`/`Schema.encodeUnknownEffect` instead of `JSON.parse`/`JSON.stringify`.
- **Effect.fn**: Use `Effect.fn` for all functions returning Effects.

## Quick Recipes
```ts
import * as Generator from "@beep/groking-effect-v4/generator"
```

## Verifications
- `bunx turbo run test --filter=@beep/groking-effect-v4`
- `bunx turbo run lint --filter=@beep/groking-effect-v4`
- `bunx turbo run check --filter=@beep/groking-effect-v4`

## Contributor Checklist
- [ ] All new exports have `/** @since 0.0.0 */` JSDoc annotations where applicable
- [ ] Tests added/updated for new functionality
- [ ] `bun run check` passes
- [ ] `bun run test` passes
- [ ] `bun run lint` passes
