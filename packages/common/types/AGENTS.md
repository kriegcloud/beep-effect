# AGENTS.md — `@beep/types`

## Purpose & Fit
- Compile-time-only helper library that keeps shared type idioms aligned across slices. No runtime symbols leave this package.
- Lives alongside `@beep/utils` and `@beep/invariant` to support schema composition, tagged errors, and effectful layers without creating runtime coupling.
- Consumers must import these namespaces with `import type` so bundlers can erase them; mixing value imports breaks the zero-runtime guarantee.

## Surface Map (see `src/`)

### Namespaced Exports
- `fn.types.ts` (`FnTypes`) — conditional type helpers for higher-order functions and composition.
- `literal.types.ts` (`LiteralTypes`) — literal narrowing helpers (string/number literal enforcement).
- `model.types.ts` (`ModelTypes`) — Variant Schema field map helpers (non-empty constraints for `@effect/experimental/VariantSchema`).
- `mut.types.ts` (`MutTypes`) — mutation-oriented escape hatches (use sparingly, mostly for interop tests).
- `or.types.ts` (`Or`) — union helpers (`Maybe`, `Either` style unions).
- `promise.types.ts` (`PromiseTypes`) — async type utilities (`Awaitable<T>`).
- `record.types.ts` (`RecordTypes`) — dictionary utils (NonEmpty, key picking, safe value extraction).
- `schema.types.ts` (`SchemaTypes`) — Effect Schema-only aliases (`AnySchema`, `AnySchemaNoContext`). Type-only glue into `effect/Schema`.
- `string.types.ts` (`StringTypes`) — compile-time string manipulations (NonEmpty, Snake/Pascal case).
- `struct.types.ts` (`StructTypes`) — struct shape helpers (NonEmpty maps, key guards).
- `tag.types.ts` (`TagTypes`) — brand/tag constructors (aligns with `effect/Brand`).
- `unsafe.types.ts` (`UnsafeTypes`) — unavoidable `any`-adjacent helpers wrapped with explicit naming for audits.
- `util.types.ts` (`UtilTypes`) — grab bag: non-empty maps, tuple helpers, key extraction.

### Direct Exports (non-namespaced)
- `built-in.types.ts` — `Builtin` union of primitive types, Function, Date, Error, RegExp.
- `char.types.ts` — `UpperLetter` for template literal helpers.
- `common.types.ts` — shared aliases (e.g. `BrandWith`) for other modules to build on.
- `deep-non-nullable.types.ts` — `DeepNonNullable<T>` recursive non-nullable transformer.
- `primitive.types.ts` — `Primitive` union of string, number, boolean, bigint, symbol, undefined, null.
- `prop.type.ts` — Property key utilities for Effect Schema struct builders (not in index.ts but available via subpath export).

## Usage Snapshots
- `packages/common/schema/src/core/utils/brands.ts` builds branded schemas with `UnsafeTypes` + `effect/Brand` to guarantee nominal IDs.
- `packages/shared/server/src/internal/db/pg/PgClient.ts` and other DB helpers depend on `UnsafeTypes` to thread Drizzle client generics without losing type safety.
- `packages/common/utils/src/data/struct.utils.ts` imports `RecordTypes`/`StructTypes` to keep runtime helpers aligned with the type-level contracts.

## Authoring Guardrails
- Types only: exporting a value, class, or runtime helper is a bug. Re-run `bun run build` after edits to confirm nothing emits JS.
- Always namespace Effect imports (`import type * as S from "effect/Schema"`). No bare `Schema` default imports.
- `import type` for every symbol — even internal relative imports should stay type-only when possible.
- Keep modules domain-agnostic. If a helper mentions a slice-specific concept (IAM, files, etc.), it belongs in that slice.
- When promoting a type from a slice, ensure it uses existing aliases (e.g., prefer `StringTypes.NonEmptyString` instead of redefining).

## Quick Recipes
```ts
import type { SchemaTypes, UtilTypes, StringTypes, ModelTypes, PromiseTypes } from "@beep/types";
import type * as S from "effect/Schema";
import type { Field } from "@effect/experimental/VariantSchema";

// Glue Effect Schema definitions into reusable typing
type AnyEffectStruct = SchemaTypes.AnySchema;

// Enforce compile-time non-empty string constraints
type DisplayName = StringTypes.NonEmptyString;

// Async type utilities for effect-style adapters
type MaybeAsyncConfig = PromiseTypes.Awaitable<{ port: number }>;

// Variant Schema field maps with non-empty guarantees
type EntityFields = ModelTypes.NonEmptyModelFields<{
  id: Field.Any;
  name: Field.Any;
}>;
```

## Verifications
- `bun run check --filter=@beep/types` for TS build baselines.
- `bun run test --filter=@beep/types` (TestKit workspace) for compile-time assertion suites.
- `bun run lint --filter=@beep/types` to keep Biome happy; prefer `bun run lint:fix --filter=@beep/types` before handing back changes.

## Contributor Checklist
- [ ] No runtime exports (inspect generated `build/esm` if unsure).
- [ ] All imports are `import type` and namespace Effect modules correctly.
- [ ] Helpers remain domain-neutral and additive.
- [ ] Updated README or docs where new namespaces were introduced.
- [ ] Added/updated test fixtures (`test/` or inline `// @ts-expect-error`) covering tricky type behavior when necessary.
