# AGENTS.md — `@beep/utils`

## Purpose & Scope
- Pure, deterministic runtime helpers shared across slices (string normalization, record transforms, guards, factories).
- NEVER introduce I/O, platform APIs, or side-effectful behavior; these utilities MUST run identically in Node, Bun, or the browser.
- Complements `@beep/types` (compile-time) and `@beep/invariant` (assertions) by providing Effect-friendly building blocks.

## Module Map (see `src/`)
- `array-buffer-to-blob.ts` / `array-buffer-to-uint8-array.ts` / `uint8-array-to-array-buffer.ts` — binary data conversions.
- `autosuggest-highlight/` — text highlighting utilities for search/autocomplete UIs.
- `browser-apis.ts` — browser-specific utility wrappers.
- `coerce.ts` — type coercion utilities.
- `const.ts` — literal-aware helpers (`constLiteral`).
- `data/` — immutable data manipulation built atop Effect APIs:
  - `ArrayUtils` — array operations (`orderBy`, `collect`, etc.)
  - `ModelUtils` — Effect SQL model helpers
  - `ObjectUtils` — deep merge, clone, omit operations
  - `RecordUtils` — record transformations (`reverseRecord`, `recordStringValues`)
  - `StrUtils` — string normalization, name initials, nested value access
  - `StructUtils` — struct operations for Effect schemas
  - `TupleUtils` — tuple and mapped enum utilities
- `dedent/` — template literal dedentation.
- `deep-remove-null.ts` — null removal from nested structures.
- `equality/` — deep equality checks.
- `factories/` (`enum.factory.ts`) — pure factories for enum derivation.
- `format-time.ts` — time formatting helpers (e.g., `fToNow`).
- `getters/` — safe property accessors (`getAt`) returning fallback values.
- `guards/` — type-narrowing predicates (`isUnsafeProperty`, `isNonEmptyRecord`).
- `merge-defined.ts` — merge utilities that skip undefined values.
- `mut.utils.ts` — mutation escape hatches kept pure via `mutative`.
- `noOps.ts` — canonical `noOp`, `nullOp`, `nullOpE` helpers required across the repo.
- `object/path.ts` — nested object path utilities (`getPath`).
- `random-hex-string.ts` — random hex string generation.
- `remove-accents/` — diacritic removal utilities.
- `sqids.ts` — Sqids encoder/decoder utilities.
- `struct/` — struct merge and field extraction utilities.
- `sync.utils.ts` — sync status types for adapter patterns.
- `thunk.ts` — thunk utilities for lazy evaluation.
- `timing/` — debounce and throttle helpers.
- `topo-sort/` — topological sort implementation.
- `transformations/` — higher-level transforms (`enumFromStringArray`, `valuesFromEnum`).

## Usage Snapshots
- `packages/common/schema/src/primitives/locales/currency-code-value.ts` uses `RecordUtils.recordKeys` to derive literal unions from currency maps.
- `packages/ui/ui/src/layouts/simple/layout.tsx` merges layout config via `RecordUtils.merge` before rendering.
- Various schema modules throughout the codebase use `RecordUtils.recordStringValues` to extract literal values from const objects.
- String utilities like `StrUtils.normalizeString` and `StrUtils.getNameInitials` are used across UI components for consistent text handling.

## Authoring Guardrails
- Pure functions only; NEVER use clocks, randomness, global state, or environment checks.
- ALWAYS namespace Effect imports (`import * as A from "effect/Array"`, etc.) and route every collection/string operation through those utilities—native `.map`, `.split`, etc. are BANNED.
- Keep helpers domain-neutral; if logic references business concepts (IAM, files, etc.) it belongs in the owning slice.
- Prefer returning `Option`/`Either` (via Effect helpers) to throwing; reserve `@beep/invariant` for true programming errors and mirror existing patterns (e.g., `enumFromStringArray`).
- Reuse `noOp`/`nullOp`/`nullOpE` instead of ad-hoc placeholders.

## Quick Recipes
```ts
import { RecordUtils, StrUtils } from "@beep/utils";
import * as F from "effect/Function";
import * as Str from "effect/String";

// Normalize user-facing strings before comparison
const normalized = StrUtils.normalizeString("Café de Flore");
const slug = F.pipe(normalized, Str.replace(/ /g, "-"));

// Gather literal values for schema kits
const mimeTypes = RecordUtils.recordStringValues({
  json: "application/json",
  zip: "application/zip",
} as const);

// Safe deep access (returns undefined when not present)
const primaryProduct = StrUtils.getNestedValue(
  { items: [{ product: { name: "Widget" } }] },
  "items.[0].product.name"
);
```

## Verifications
- `bun run test --filter=@beep/utils` for Vitest/Bun test suites (pure runtime behavior).
- `bun run lint --filter=@beep/utils` / `bun run lint:fix --filter=@beep/utils` to satisfy Biome + circular checks.
- `bun run check --filter=@beep/utils` to ensure TypeScript config stays aligned.
- `bun run coverage --filter=@beep/utils` generates coverage reports.

## Contributor Checklist
- [ ] Implementation stays pure (no timers, I/O, platform APIs).
- [ ] Effect namespace imports + `F.pipe` are used instead of native array/string helpers.
- [ ] Reused existing helpers (`noOp`, `nullOpE`, guards) instead of duplicating logic.
- [ ] Added or updated Vitest coverage when introducing new branches.
- [ ] Documented new helpers with JSDoc and, when relevant, cross-linked to `@beep/types` or `@beep/invariant`.
