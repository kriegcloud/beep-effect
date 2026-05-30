# Operations serialization layer — deferred v4 gap

**Status:** documented gap, intentionally not ported in P1f.
**Date:** 2026-05-29 (absolute).

## Summary

The `adjunct` `Operations/` subsystem splits into two halves:

1. **The categorical core** — `Definition.ts`, `Composable.ts`, `Pipeline.ts`.
   These define operations as schema-typed Kleisli arrows and compose them
   (Functor/Monad/Applicative/Traversable). **Ported** to `@beep/nlp/Operations`
   under full repo-law (P1f).
2. **The serialization / AST-reconstruction layer** — `Serialization.ts`,
   `SchemaASTMatchers.ts`, `OperationCompiler.ts`, `Registry.ts`, and the parallel
   `GraphOperations/Schemas.ts`. These serialize a pipeline to JSON (capturing each
   operation's schema as JSON Schema + a raw AST blob) and reconstruct it later by
   walking the Effect Schema AST. **Not ported** — see the blockers below.

## Why the serialization layer is not ported

### 1. v4 removed `AST.getCompiler` and `AST.Match`

`SchemaASTMatchers.reconstructSchemaFromAST` is built entirely on
`AST.getCompiler(match)` where `match: AST.Match<...>` keys handlers by v3 AST
tags (`TupleType`, `TypeLiteral`, `Refinement`, `Transformation`, `Suspend`, ...).
In Effect v4 (`.repos/effect-v4/packages/effect/src/SchemaAST.ts`):

- `AST.getCompiler` and the `AST.Match` type **do not exist** (zero hits).
- The AST node taxonomy was renamed/restructured: v4 has `Arrays`, `Objects`
  classes (not v3's `TupleType` / `TypeLiteral`), different `Link`/`Encoding`
  modeling for transformations, etc.

So the AST-walk reconstruction is **structurally inexpressible** as written; it
would have to be rewritten against the v4 AST from scratch, and a faithful 1:1
port is not possible.

### 2. `@effect/typeclass` is not a dependency

`Composable.ts` imported `@effect/typeclass/{data/Array,data/Effect,Foldable,
Monoid,SemiApplicative,Traversable}`. That package is not installed in this repo
and is not a dependency of `@beep/nlp`. The ported core reimplements those
combinators on core `effect` (`Effect.all`/`Effect.zipWith`/`Effect.forEach`,
`A.reduce`, and the `@beep/nlp/Algebra/Monoid` already ported in P1a) — so the
typeclass dependency is gone for the core, but the serialization layer's heavier
usage is part of what is deferred.

### 3. The layer is cast-heavy best-effort with stubs (repo-law violations)

Even ignoring the API gaps, the serialization code cannot pass repo-law without a
ground-up redesign:

- Pervasive `as` / `as unknown as` casts (`Serialization.ts` deserialize arms,
  `OperationCompiler.ts` `as unknown as Result`, `GraphOperations/Schemas.ts`
  `as ExecutionId` / `as unknown as OperationResult` and `Schema.transform` with
  `strict: false`). The repo bans `as` (except `as const`).
- `Data.TaggedError` (repo requires `TaggedErrorClass` from `@beep/schema`),
  native `Map`/`Array`, `JSON.parse`/`JSON.stringify`, `Object.keys`, `!`
  non-null assertions, and `Effect.catchAll`.
- `OperationCompiler`'s `Map` and `ZipWith` reconstruction arms are **TODO stubs
  even in adjunct** (they fall back to `product` / return the base op), so the
  round-trip is lossy at the source.

`GraphOperations/Schemas.ts` specifically duplicates the `ExecutionMetrics` /
`OperationCost` / `ExecutionOptions` / `OperationResult` types that P1d already
ported soundly into `Graph/GraphOperations/Types.ts`; re-porting its
`Schema.transform(..., { strict: false })` codecs would reintroduce casts for no
new capability.

## What was ported instead (P1f)

`@beep/nlp/Operations`:

- `Definition.ts` — `OperationDefinition<A, B, R, E>` parameterized by **decoded
  value types** (schemas carried as `Schema.Schema<A>` metadata), avoiding `any`
  and keeping v4 schema variance (`DecodingServices`, tuple optionality) out of
  the operation algebra.
- `Composable.ts` — `OperationBuilder<A, B, R, E>` with `run` (decodes input via
  `Schema.decodeUnknownEffect`, failing with `S.SchemaError`), `map`, `flatMap`,
  `product`, `zipWith`, plus `compose`/`identity`/`traverse`/`aggregate`. adjunct's
  `{} as Schema.Schema.Type<OutputSchema>` dummy-input hack in `flatMap` is
  eliminated (it takes the next builder directly). No casts.

`Registry.ts` is **not ported**: adjunct's own header marks it `@deprecated` in
favor of `ImplementationProvider`, and `ImplementationProvider` exists only to
feed the deserializer — which is deferred.

## Future path (if serialization is needed)

Pipeline serialization is a real feature for the downstream MCP/agent use case,
but it should be **re-designed for v4**, not ported:

1. Serialize each operation's schema with v4 `JSONSchema.make` (this DOES exist —
   adjunct's `serializeSchemaAST` already used it and it survives in v4).
2. For reconstruction, either (a) keep a registry of named operations keyed by a
   stable id and serialize only the id + composition tree (no AST round-trip
   needed — the `ImplementationProvider` idea, done soundly), or (b) write a
   v4-native AST walk against the real `SchemaAST` node classes if structural
   reconstruction is genuinely required.
3. Model the serialized form with `S.TaggedClass` / `LiteralKit`, errors with
   `TaggedErrorClass`, and the dependency graph with the already-ported
   `Graph/GraphOps`.

Tracked for a future phase; not required for the P3 generic-IR handoff contract or
the P4 MCP driver, both of which consume the in-memory operation/graph types
directly.
