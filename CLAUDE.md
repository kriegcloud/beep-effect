# beep-effect

Effect v4 monorepo. `bun` package manager. Turborepo build system.

## Verification Sources

- **Effect v4 API**: `.repos/effect-smol/packages/effect/src/`
- **Knowledge graph**: `graphiti-memory` MCP tool — search before assuming any Effect v4 API
- **Migration guides**: `.repos/effect-smol/migration/`

## Behavioral Rules

- Inhibition over instruction — verify claims before asserting correctness.
- Self-explanatory code over comments. Unclear code → rewrite, never comment.
- Tests verify behavior, not implementation. Refactor-safe tests only.
- `pipe(a, f, g)` over `g(f(a))` — no nested calls.
- UI: lightness variation over borders, elevation via background-color delta.

# CODEBASE LAWS

## Verification Source

NEVER assume Effect API signatures from training data. This project uses **Effect v4**. Verify ALL module paths, function signatures, and type parameters against `.repos/effect-smol` or the graphiti-memory MCP tool before writing code.

## Type Safety

- NEVER use `as`, `as any`, `as unknown`, `@ts-ignore`, or `@ts-expect-error` — fix the types, not the type system.
- NEVER use `!` (non-null assertion) — use Option or type guards.
- NEVER use `any` — use `unknown` with `effect/Predicate` type guards.
- NEVER use `typeof` for type checking — use `effect/Predicate` guards (`isString`, `isNumber`, `isObject`, etc).

## Effect Patterns

- NEVER use native `Array`, `Object`, `Map`, `Set`, `String`, `Number`, `Boolean`, `Date` methods — Effect has a module for each. Use `effect/Array`, `effect/Record`, `effect/String`, `effect/DateTime`, etc.
- NEVER return `null` or `undefined` — use `effect/Option`. Exception: external library boundaries and application entry points.
- NEVER use `try`/`catch` — use `Effect.try`, `Effect.tryPromise`, or `effect/Result` `Result.try`.
- NEVER use `throw` or native `Error` — define a `Schema.TaggedErrorClass` with annotations.
- NEVER use `if`/`else` chains or `switch` — use `effect/Match` (`Match.value`, `Match.type`, `Match.tags`).
- NEVER wrap `Effect.gen` generators in plain functions — use `Effect.fn`.

## Effect v4 Specifics

- NEVER use `Context.Tag`, `Context.GenericTag`, `Effect.Tag`, or `Effect.Service` — use `ServiceMap.Service`.
- NEVER use `.Default` or `.Live` for layer names — use `.layer` (v4 convention).
- NEVER use `dependencies` array on services — wire via `Layer.provide`.

## Project Identity System

- NEVER use plain string literals for Schema identifiers or ServiceMap service keys — use `@beep/identity` `IdentityComposer` tagged template literals.
- NEVER leave Schemas unannotated — use `.annotations()` with the identity returned by `IdentityComposer.annotate()`.

## Quality Gate

- NEVER continue work if typecheck, lint, or tests fail — fix errors before proceeding.
