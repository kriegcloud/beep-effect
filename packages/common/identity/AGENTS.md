# AGENTS.md — `@beep/identity`

## Purpose & Fit
- Provides the canonical identity builder for every `@beep/*` namespace, producing stable literal strings and `Symbol.for` tokens for services, schemas, and annotations.
- Keeps namespace hygiene enforced at runtime (no empty segments or leading/trailing `/`) while preserving literal types via `IdentityString` / `IdentitySymbol` brands.
- Centralizes module composers for all slices (schema, errors, iam, documents, shared, runtime, tooling, ui); update here when workspaces move or new slices land.
- Supplies schema annotation helpers that merge IDs with human titles and arbitrary `Schema.Annotations` extras for Effect Schema consumers.

## Surface Overview (`src/`)
- `Identifier.ts` — core builder factory with tagged template support, `compose`, `make`, `create`, `.symbol()`, `.annotations()`, segment validation, and automatic title derivation. Exports `Identifier.make()` for creating root composers.
- `packages.ts` — pre-baked tagged composers per workspace (`$SchemaId`, `$ErrorsId`, `$IamInfraId`, `$DocumentsDomainId`, etc.); treat this as the source of truth for namespace coverage. Exports `$I` as the root `@beep` composer.
- `schema.ts` — Effect Schema definitions for segment validation (`Segment`, `ModuleSegment`, `BaseSegment`) and tagged error classes (`InvalidSegmentError`, `InvalidModuleSegmentError`, `InvalidBaseError`).
- `types.ts` — branded identity types (`IdentityString`, `IdentitySymbol`), segment tuple utilities, annotation result helpers, and `IdentityComposer` interface definition.
- `index.ts` — barrels public exports (`Identifier`, `modules`, `$I`, `types`).

## Usage Snapshots
- **Tagged template syntax**: `const { $SchemaId } = modules.$I.compose("schema"); const id = $SchemaId\`TenantProfile\`;` — produces `IdentityString<"@beep/schema/TenantProfile">` using template literals.
- **Schema annotations**: `modules.$SchemaId.compose("annotations").annotations("TenantProfile")` supplies `schemaId`, `identifier`, `title`, plus optional extras merged into Effect Schema annotations.
- **Service/type tokens**: `modules.$IamInfraId.compose("repos").symbol()` feeds `Effect.Service` TypeIds and DI layers without manual `Symbol.for`.
- **Namespaced strings**: `modules.$IamInfraId.compose("adapters").make("UserRepo")` returns an `IdentityString<"@beep/iam-server/adapters/UserRepo">` retained through type inference.
- **Custom composer creation**: `Identifier.make("custom").then(({ $CustomId }) => $CustomId\`Feature\`)` creates composers for new namespaces while keeping validation.

## Authoring Guardrails
- Namespace all Effect imports (`import * as A from "effect/Array"`, `import * as Str from "effect/String"`, `import * as F from "effect/Function"`); never reintroduce native array/string helpers.
- Keep segment validation intact (`ensureSegment`, `ensureModuleSegment`, `ensureBaseSegment`): no empty segments, no leading/trailing `/`, module segments must start with alphabetic characters and contain only alphanumerics, hyphens, or underscores. New helpers must call these before composition.
- When adding workspace composers in `packages.ts`, mirror actual package scopes; avoid duplicating namespaces or drifting from `package.json#workspaces`. Use the `$I.compose(...)` pattern to register all workspace namespaces.
- Titles from `.annotations()` rely on `toTitle` (splits on `_`/`-` and capitalizes words); if you change the heuristic, update docs and ensure schema titles stay human-readable.
- Brands (`IdentityString`, `IdentitySymbol`) are part of the public API; do not strip them or coerce to `string`/`symbol` in callers—propagate branded types through service layers.
- JSDoc is part of the contract (docgen uses it). Document new exports with category/since/example blocks consistent with existing files.
- Tagged template composers (`TaggedComposer`) support both template literal syntax and method calls. Ensure template usage doesn't allow interpolations to maintain type safety.

## Quick Recipes
```ts
import { Identifier, modules, $I } from "@beep/identity";
import * as S from "effect/Schema";

// Using pre-baked module composers with tagged templates
const { $SchemaId } = modules.$I.compose("schema");
const entityId = $SchemaId`TenantEntity`;  // IdentityString<"@beep/schema/TenantEntity">

// Schema annotations with extras
const payloadAnnotations = modules.$SchemaId.annotations("PasskeyAddPayload", {
  description: "IAM passkey add payload",
});
export class PasskeyAddPayload extends S.Class<PasskeyAddPayload>()({
  email: S.String,
}) {}
S.annotations(PasskeyAddPayload, payloadAnnotations);

// Service TypeId for Layer wiring
export const UserRepoId = modules.$IamInfraId.compose("repos").symbol();

// Creating custom namespace composers
const { $IntegrationsId } = Identifier.make("integrations-core");
const stripeClientId = $IntegrationsId.compose("clients").make("Stripe");

// Multi-segment composition
const { $ReposId, $ServicesId, $AdaptersId } = modules.$IamInfraId.compose("repos", "services", "adapters");
const userRepoId = $ReposId`UserRepo`;
const authServiceId = $ServicesId.make("AuthService");
```

## Verifications
- `bun run lint --filter @beep/identity` / `bun run lint:fix --filter @beep/identity` — Biome linting.
- `bun run lint:circular --filter @beep/identity` — madge circular dependency checks.
- `bun run check --filter @beep/identity` — TypeScript project refs (brands and exports stay aligned).
- `bun run build --filter @beep/identity` — emits ESM/CJS + packs dist manifests.
- `bun run test --filter @beep/identity` — Bun test suite covering builder invariants, branded types, and schema validation.

## Contributor Checklist
- [ ] New composers added to `packages.ts` reflect real workspace names and use `$I.compose(...)` pattern with validated segments.
- [ ] No native array/string helpers; all transformations flow through Effect modules and `F.pipe`.
- [ ] Brands (`IdentityString`, `IdentitySymbol`) are maintained through exports and tests assert on branded types/symbol descriptions.
- [ ] Schema validation enforced via `schema.ts` patterns for all new segment types.
- [ ] Tagged template composers prevent interpolations and validate single literal segments.
- [ ] JSDoc added/updated for new exports with examples and categories.
- [ ] Relevant commands run (lint, check, build, tests) when altering builder logic or module coverage.
