# AGENTS.md — `@beep/utils`

## Purpose & Scope
- Pure, deterministic runtime helpers shared across slices (string normalization, record transforms, guards, factories).
- Never introduce I/O, platform APIs, or side-effectful behavior; these utilities must run identically in Node, Bun, or the browser.
- Complements `@beep/types` (compile-time) and `@beep/invariant` (assertions) by providing Effect-friendly building blocks.

## Module Map (see `src/`)
- `assertions/` + `assertions.ts` — runtime assertion helpers that pair with `InvariantViolation` without adding new error types.
- `data/` (`ArrayUtils`, `RecordUtils`, `StrUtils`, `StructUtils`) — immutable data manipulation built atop Effect Array/Record/String APIs.
- `factories/` (`URN.factory.ts`) — pure factories for identifiers and similar data shapes.
- `getters/` — safe property accessors (`getAt`, `getNestedValue`) returning Options or throwing invariant-friendly errors.
- `guards/` — type-narrowing predicates that avoid native `instanceof`.
- `mut.utils.ts` / `sync.utils.ts` — mutation escape hatches kept pure via `mutative` or sync wrappers.
- `transformations/` — higher-level transforms (`enumFromStringArray`, `valuesFromEnum`).
- `noOps.ts` — canonical `noOp`, `nullOp`, `nullOpE` helpers required across the repo.
- `execute.ts` — local scratchpad invoked via `bun run execute`; **never** wire this into production builds.

## Usage Snapshots
- `packages/common/schema/src/custom/MimeType.schema.ts` uses `RecordUtils.recordStringValues` to derive literal unions from maps.
- `packages/ui/src/layouts/simple/layout.tsx` normalizes layout config via `RecordUtils` before rendering.
- `packages/_internal/db-admin/src/execute.ts` imports `reverseRecord` to reshape migration metadata.
- `packages/common/schema/src/EntityId/EntityId.ts` relies on `StrUtils` helpers for consistent ID normalization.

## Tooling & Docs Shortcuts
- Effect Schema alignment (string + struct guards): `context7__get-library-docs` with `{ "context7CompatibleLibraryID": "/llmstxt/effect_website_llms-small_txt", "topic": "schema" }`.
- Pipeline patterns & array safety: `effect_docs__get_effect_doc` with `{ "documentId": 6585 }` for `effect/Function.pipe`, plus `{ "documentId": 4793 }` for `effect/Array.get`.

## Authoring Guardrails
- Pure functions only; avoid clocks, randomness, global state, or environment checks.
- Namespace all Effect imports (`import * as A from "effect/Array"`, etc.) and route every collection/string operation through those utilities—native `.map`, `.split`, etc. are banned.
- Keep helpers domain-neutral; if logic references business concepts (IAM, files, etc.) it belongs in the owning slice.
- Prefer returning `Option`/`Either` (via Effect helpers) to throwing; reserve `@beep/invariant` for true programming errors and mirror existing patterns (e.g., `enumFromStringArray`).
- Reuse `noOp`/`nullOp`/`nullOpE` instead of ad-hoc placeholders.
- Do not grow `execute.ts`; treat it as a temporary scratchpad and leave it out of reviews unless explicitly needed.

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
- `bun run test --filter=@beep/utils` for Vitest suites (pure runtime behavior).
- `bun run lint --filter=@beep/utils` / `bun run lint:fix --filter=@beep/utils` to satisfy Biome + circular checks.
- `bun run check --filter=@beep/utils` to ensure TypeScript config stays aligned.
- `bun run execute --filter=@beep/utils` runs the scratchpad; only execute locally when debugging helpers.

## Contributor Checklist
- [ ] Implementation stays pure (no timers, I/O, platform APIs).
- [ ] Effect namespace imports + `F.pipe` are used instead of native array/string helpers.
- [ ] Reused existing helpers (`noOp`, `nullOpE`, guards) instead of duplicating logic.
- [ ] Added or updated Vitest coverage when introducing new branches.
- [ ] Documented new helpers with JSDoc and, when relevant, cross-linked to `@beep/types` or `@beep/invariant`.
