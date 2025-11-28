# @beep/types — Common, compile‑time only TypeScript utilities

A tiny, architecture-safe package that centralizes reusable TypeScript utility types for the entire monorepo. It exists to keep type idioms consistent, deduplicate helpers, and avoid cross-slice coupling through runtime code.

This package deliberately ships only types. There are no runtime values, side effects, or environment assumptions.


## What belongs here

- __Pure type aliases and helpers__ that are broadly useful across multiple slices.
- __Zero-runtime constructs__ only: `type`, `interface`, `declare`, and `export type` namespaces.
- __Environment-agnostic types__: no Node, DOM, React, or platform specifics.
- __Effect-adjacent type helpers__ are allowed as type-only imports (e.g. `import type * as S from "effect/Schema"`).

Common modules in `src/` (exported via `index.ts`):
- `FnTypes` — function-related helpers
- `LiteralTypes` — literal narrowing helpers (e.g., string literal constraints)
- `Or` — small union helpers
- `RecordTypes` — record/dictionary helpers
- `SchemaTypes` — helpers for Effect Schema at the type level only
- `StringTypes` — string-oriented utility types
- `StructTypes` — struct/shape helpers (non-empty constraints, etc.)
- `TagTypes` — tag/branding helpers for safer nominal typing
- `UnsafeTypes` — escape hatches and interop helpers (use sparingly and review)
- `UtilTypes` — general-purpose building blocks (NonEmpty maps, key extraction, etc.)


## What must NOT go here

- __No runtime values__ of any kind (no functions/consts/classes that exist at runtime).
- __No side effects__, I/O, or environment reads (no `process`, no globals, no dynamic imports).
- __No framework/platform types__ that create coupling (no Node, DOM, React, Next types, etc.).
- __No domain-specific types__ (keep those in the owning slice’s `domain` layer).
- __No imports from other internal slices__ (e.g., do not depend on `@beep/iam-*`, `@beep/documents-*`, etc.).
- __No schema/runtime validators__ (e.g., do not export `effect/Schema` values here—types only are fine).


## How it fits the architecture

- __Vertical Slice + Hexagonal__: This package is cross-cutting and safe to import from any layer (`domain`, `application`, `api`, `db`, `ui`). Because it contains only types, it cannot accidentally introduce upward/downward runtime dependencies.
- __Monorepo path alias__: Resolved as `@beep/types` in `tsconfig.base.json`. Consumers should import _type-only_ symbols to ensure the compiler erases them from emitted code.
- __Ports & Adapters friendly__: Since nothing here executes, it won’t leak infrastructure concerns into domain/application code.


## Import guidelines

- __Prefer type-only imports__:
  ```ts
  import type { UtilTypes } from "@beep/types";
  // or
  import type * as T from "@beep/types";
  ```
- __Never import as a value__ in contexts that would require bundlers to include this package at runtime.
- __Do not re-export runtime libraries__ from here. If you need runtime helpers, they belong in `@beep/common/utils` or an appropriate slice.


## Usage examples

- __NonEmpty string literal__:
  ```ts
  import type { UtilTypes } from "@beep/types";

  // "foo" is valid; "" becomes never
  type Id = UtilTypes.NonEmptyStringLiteral<"foo">;
  ```

- __NonEmpty struct fields for Effect Schema__:
  ```ts
  import type { UtilTypes } from "@beep/types";
  import type * as S from "effect/Schema";

  type F = UtilTypes.NonEmptyStructFieldMap<{
    id: S.Struct.Field;
    name: S.Struct.Field;
  }>;
  // F is accepted only when the map is provably non-empty and has no empty-string key
  ```

- __NonEmpty string→string map__:
  ```ts
  import type { UtilTypes } from "@beep/types";

  type Headers = UtilTypes.NonEmptyStringToStringMap<{
    "content-type": "application/json";
  }>;
  ```


## When to add something here vs. in a slice

- __Add to `@beep/types`__ when the helper is domain-agnostic, reusable, and purely compile-time.
- __Keep in a slice__ when the type reflects specific domain concepts (entities, value objects), use-case I/O, or port contracts.
- __Promotion rule__: If a slice-level type proves broadly reusable and still meets the constraints above, consider promoting it here in a follow-up change.


## Constraints checklist (PR reviewer aid)

- __Types only__: no emitted JavaScript after build.
- __No platform/runtime imports__: Node/DOM/React/Next absent.
- __No cross-slice imports__: depends only on external typings and standard TS.
- __No domain leakage__: names and shapes are generic, not business-specific.
- __Type-only imports__: `import type` used for all external types (including Effect types).


## Package name and entry point

- Import as `@beep/types`.
- Public surface is defined by `src/index.ts` which re-exports the module namespaces listed above.


## Testing

- Unit tests can live in `test/` but should remain type-focused (e.g., compile-time assertions via `// @ts-expect-error`). Avoid introducing runtime-only test utilities.


## Versioning and changes

- Because this package is widely consumed, prefer additive changes.
- For breaking changes, update consumers in the same PR or stage changes with clear migration notes.


## FAQ

- __Can I put Zod/Effect Schema validators here?__ No—only type-level helpers. Put runtime validators in an appropriate runtime package.
- __Can I add a branded domain ID type here?__ Prefer keeping domain IDs in the slice’s `domain`. If an identifier pattern is truly generic and cross-cutting, discuss before promoting.
- __Why type-only imports?__ They guarantee the package never contributes runtime code to bundles, keeping all layers clean and tree-shakable.
