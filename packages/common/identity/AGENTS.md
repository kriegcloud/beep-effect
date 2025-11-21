# AGENTS.md — `@beep/identity`

## Purpose & Fit
- Provides the canonical identity builder for every `@beep/*` namespace, producing stable literal strings and `Symbol.for` tokens for services, schemas, and annotations.
- Keeps namespace hygiene enforced at runtime (no empty segments or leading/trailing `/`) while preserving literal types via `IdentityString` / `IdentitySymbol` brands.
- Centralizes module composers for all slices (schema, errors, core/env/db/ui, iam, files, tasks, runtime, tooling); update here when workspaces move or new slices land.
- Supplies schema annotation helpers that merge IDs with human titles and arbitrary `Schema.Annotations` extras for Effect Schema consumers.

## Surface Overview (`src/`)
- `BeepId.ts` — core builder with `module`, `from`, `compose`, `make`, `.symbol()`, `.annotations()`, segment validation, and automatic title derivation.
- `modules.ts` — pre-baked composers per workspace (`SchemaId`, `ErrorsId`, `CoreDbId`, `IamInfraId`, `FilesDomainId`, etc.); treat this as the source of truth for namespace coverage.
- `types.ts` — branded identity types, segment tuple utilities, annotation result helpers, and `IdentityComposer` interface definition.
- `index.ts` — barrels public exports (`BeepId`, all module composers, types).

## Usage Snapshots
- Schema annotations: `F.pipe(Identity.SchemaId.compose("annotations"), (id) => id.annotations("TenantProfile"))` to supply `schemaId`, `identifier`, `title`, plus optional extras merged into Effect Schema annotations.
- Service/type tokens: `Identity.CoreDbId.compose("repos").symbol()` feeds `Effect.Service` TypeIds and DI layers without manual `Symbol.for`.
- Namespaced strings: `Identity.IamInfraId.compose("adapters").make("UserRepo")` returns an `IdentityString<"@beep/iam-infra/adapters/UserRepo">` retained through type inference.
- Continuation from arbitrary bases: `Identity.BeepId.from("@beep/custom/ns").compose("feature").make("Widget")` preserves an external namespace while keeping validation.

## Authoring Guardrails
- Namespace all Effect imports (`import * as A from "effect/Array"`, `import * as Str from "effect/String"`, `import * as F from "effect/Function"`); never reintroduce native array/string helpers.
- Keep segment validation intact (`ensureSegment`, `ensureBase`): no empty segments, no leading/trailing `/`, and only strings. New helpers must call these before composition.
- When adding workspace composers in `modules.ts`, mirror actual package scopes and App Router aliases; avoid duplicating namespaces or drifting from `package.json#workspaces`.
- Titles from `.annotations()` rely on `toTitle` (splits on `_`/`-`/camelCase`); if you change the heuristic, update docs and ensure schema titles stay human-readable.
- Brands (`IdentityString`, `IdentitySymbol`) are part of the public API; do not strip them or coerce to `string`/`symbol` in callers—propagate branded types through service layers.
- JSDoc is part of the contract (docgen uses it). Document new exports with category/since/example blocks consistent with existing files.

## Quick Recipes
```ts
import * as Identity from "@beep/identity";
import * as S from "effect/Schema";

// Schema annotations with extras
const payloadAnnotations = Identity.SchemaId.compose("annotations").annotations("PasskeyAddPayload", {
  description: "IAM passkey add payload",
});
export class PasskeyAddPayload extends S.Class<PasskeyAddPayload>()({
  email: S.String,
}) {}
S.annotations(PasskeyAddPayload, payloadAnnotations);

// Service TypeId for Layer wiring
export const UserRepoId = Identity.IamInfraId.compose("repos").symbol();

// External namespace continuation
const ExternalId = Identity.BeepId.from("@beep/integrations-core").compose("clients").make("Stripe");
```

## Verifications
- `bun run lint --filter @beep/identity` / `bun run lint:fix --filter @beep/identity` — Biome + circular checks.
- `bun run check --filter @beep/identity` — TypeScript project refs (brands and exports stay aligned).
- `bun run build --filter @beep/identity` — emits ESM/CJS + packs dist manifests.
- `bun run test --filter @beep/identity` — Vitest suite covering builder invariants and branded types.

## Contributor Checklist
- [ ] New composers reflect real workspace names and call `BeepId.module` (or `.from`) with validated segments.
- [ ] No native array/string helpers; all transformations flow through Effect modules and `F.pipe`.
- [ ] Brands (`IdentityString`, `IdentitySymbol`) are maintained through exports and tests assert on branded types/symbol descriptions.
- [ ] JSDoc added/updated for new exports with examples and categories.
- [ ] Relevant commands run (lint, check, build, tests) when altering builder logic or module coverage.
