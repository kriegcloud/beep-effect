# Semantic Web URI: Effect + Schema-First Refactor

> Refactor `packages/common/semantic-web/src/uri` (uri-js port) to be Effect-based and Schema-first, with strict error handling and a schema export named `URI`.

## Entry Points

- Phase 1 handoff: `specs/pending/semantic-web-uri-schema-refactor/handoffs/HANDOFF_P1.md`
- Phase 1 prompt (seed prompt): `specs/pending/semantic-web-uri-schema-refactor/handoffs/P1_ORCHESTRATOR_PROMPT.md`
- Phase 1 delegation prompts: `specs/pending/semantic-web-uri-schema-refactor/AGENT_PROMPTS.md`
- 5-minute triage: `specs/pending/semantic-web-uri-schema-refactor/QUICK_START.md`

## Status

- Status: `pending`
- Package: `packages/common/semantic-web`
- Target module: `packages/common/semantic-web/src/uri/*`

## Problem Statement

`packages/common/semantic-web/src/uri/uri.ts` is a port of `uri-js` (RFC 3986) that currently:

- returns ad-hoc parse results (`URIComponents`) with an `error?: string` field instead of typed failures
- uses exception-based control flow in a few places (notably IDNA conversion via `try/catch`, plus an internal `invariant(...)`)
- is not usable as a first-class schema at boundaries (no `S.Class` model representing a validated URI)

This makes URI handling hard to make strict/exhaustive and prevents downstream code from treating URIs as a schema-driven value object.

## Goals

1. Export a custom `effect/Schema` named `URI`.
   - `URI` MUST be an `S.Class` (Schema.Class) and usable as a schema.
   - Provide a strict, effectful `S.transformOrFail` schema transforming `string -> URI` (recommended export: `URIFromString`).
2. Export a separate IRI variant so schemas remain deterministic:
   - export an `S.Class` named `IRI`
   - provide `IRIFromString` via `S.transformOrFail(string -> IRI)`
   - do not make schema decoding depend on runtime `URIOptions` (if variants are needed, express them as distinct schemas)
3. Replace exception/string-error flows with typed, schema-native failures:
   - prefer a single error surface: `effect/ParseResult` (`ParseIssue` / `ParseError`)
   - no `throw` / `try/catch` for normal invalid-input control flow
4. Preserve the existing public feature surface (names may move to static methods, but functionality must exist):
   - `parse`
   - `serialize`
   - `resolveComponents`
   - `resolve`
   - `normalize`
   - `equal`
   - `escapeComponent`
   - `unescapeComponent`
5. Refactor scheme support (`packages/common/semantic-web/src/uri/schemes/*`) to the new typed API.
6. Refactor tests for the new API and keep coverage/intent equivalent.

## Non-Goals / Constraints

- Do not replace this with WHATWG `URL` parsing; this module targets RFC 3986 (URI/IRI) semantics.
- This is a **breaking rewrite** of the URI module:
  - old implementation files / exports may be deleted entirely
  - the orchestrator must search for and update **all** in-repo consumers (including tests)
  - do not add compatibility shims unless a concrete in-repo consumer cannot be updated safely
- Preserve license requirements:
  - `packages/common/semantic-web/src/uri/uri.ts` currently includes a BSD license header from `uri-js`; do not remove it if substantial code remains derived from it.
- No `any`, `@ts-ignore`, or unchecked casts.
- Do not start long-running processes (e.g. `bun run dev`) without explicit confirmation.

## Repo Consumer Reality (Verified)

As of spec creation, `rg "@beep/semantic-web/uri"` finds only:

- `packages/common/semantic-web/test/uri/uri.test.ts`
- a string literal in `packages/common/semantic-web/src/uri/uri.ts` used for invariant metadata

No other packages appear to import `@beep/semantic-web/uri` at the time of writing.

## Key Existing Files (Baseline)

- Main implementation: `packages/common/semantic-web/src/uri/uri.ts`
- Regex model (already Schema-based): `packages/common/semantic-web/src/uri/model.ts`
- Regex builders: `packages/common/semantic-web/src/uri/regex-uri.ts`, `packages/common/semantic-web/src/uri/regex-iri.ts`
- Scheme handlers: `packages/common/semantic-web/src/uri/schemes/*`
- Scheme registration: `packages/common/semantic-web/src/uri/schemes/index.ts`
- Tests: `packages/common/semantic-web/test/uri/uri.test.ts`

## Desired End State (API Sketch)

The orchestrator should design an API that makes `URI` both:

- a schema/value model (for boundary validation), and
- a namespace exposing typed, Effect-based operations.

Illustrative target shape (not prescriptive):

```ts
export class URI extends S.Class<URI>($I`URI`)({
  value: S.String, // recommendation: canonical serialized URI
}) {
  static parse(input: string, options?: URIOptions): Effect.Effect<URIComponents, ParseResult.ParseError> { /* ... */ }
  static serialize(components: URIComponents, options?: URIOptions): Effect.Effect<string, ParseResult.ParseError> { /* ... */ }
  static resolve(base: string, relative: string, options?: URIOptions): Effect.Effect<string, ParseResult.ParseError> { /* ... */ }
  static normalize(input: string, options?: URIOptions): Effect.Effect<string, ParseResult.ParseError> { /* ... */ }
  static equal(a: string, b: string, options?: URIOptions): Effect.Effect<boolean, ParseResult.ParseError> { /* ... */ }
}

export class IRI extends S.Class<IRI>($I`IRI`)({
  value: S.String, // canonical serialized IRI
}) {}

// Boundary schema: strict, effectful, ParseIssue-based failures (required by transformOrFail).
export const URIFromString: S.Schema<URI, string> = S.transformOrFail(S.String, URI, {
  strict: true,
  decode: (input, _options, ast) =>
    /* Effect that returns `new URI({ value })`, failing with `ParseResult.ParseIssue` */,
  encode: (uri) =>
    /* Effect.succeed(uri.value) */,
});

export const IRIFromString: S.Schema<IRI, string> = S.transformOrFail(S.String, IRI, {
  strict: true,
  decode: (input, _options, ast) =>
    /* Effect that returns `new IRI({ value })`, failing with `ParseResult.ParseIssue` */,
  encode: (iri) =>
    /* Effect.succeed(iri.value) */,
});
```

The key design decision is what `URI.value` (and/or additional fields) represent:

- Recommendation: `URI.value` stores the canonical serialized output of `normalize(input)` under a strict default option set.
- Recommendation: `IRI.value` stores the canonical serialized output of an IRI-normalization step under a strict default option set.
- Alternative: store structured components (`scheme`, `host`, `path`, …) and derive `value` on-demand. If you choose this, define a schema for the component model as well (prefer `S.Class` over anonymous structs for boundary-crossing models).

## Schema Transform Notes (`S.transformOrFail`)

The `S.transformOrFail` path is the canonical way (in this repo and in Effect upstream) to build “boundary schemas” that:

- accept a primitive input (e.g. `string`),
- perform strict / effectful transformation (decode + encode), and
- fail with `ParseResult.ParseIssue` so Schema tooling can render structured error trees.

Patterns to mirror:

- `strict: true`
- failures are `ParseResult.ParseIssue` values, commonly:
  - `new ParseResult.Type(ast, actual, message)`
  - `ParseResult.fail(new ParseResult.Type(...))`
- wrap throwing logic with `ParseResult.try({ try: ..., catch: () => new ParseResult.Type(ast, actual, msg) })`
- when decode/encode is effectful, map typed errors to `ParseIssue` via `Effect.mapError(...)`
- use the `ast` passed to `decode` / `encode` when constructing issues (attach failures to the transform stage)

Concrete examples:

- `packages/common/schema/src/primitives/network/url.ts` (`URLFromString`)
- `packages/shared/domain/src/value-objects/LocalDate.ts` (`LocalDateFromString`)
- `packages/shared/domain/src/services/EncryptionService/schemas.ts` (`EncryptedStringFromPlaintext`, effectful transform)
- `.repos/effect/packages/effect/test/Schema/ParseResultEffectful.test.ts` (effectful `transformOrFail`)

## Effect Module Design Notes (Mirror `.repos/effect`)

This refactor is also an opportunity to make the URI module “feel like” Effect code:

- Favor a thin public surface with re-exports + stable naming.
- Keep heavy implementation in “internal” modules (or clearly delineated files) and export only intentional APIs.
- Keep pure algorithmic code returning `Either<ParseIssue, A>` where possible, and wrap to `Effect.Effect<A, ParseError>` at the module boundary.
- Use `Schema.Class` for boundary-crossing value models (and avoid “functions-as-data” configs masquerading as schemas).

During Discovery, explicitly examine similar upstream patterns in `.repos/effect/packages/effect/src/*` (and tests) and write down the conventions you will mirror in `outputs/effect-module-design.md`.

## Phase Plan (Orchestrator-Driven)

This spec is intended to be executed by an orchestrator instance. Use `handoffs/P1_ORCHESTRATOR_PROMPT.md` as the seed prompt.

Note: `P1_ORCHESTRATOR_PROMPT.md` at the spec root is kept as a pointer for compatibility with older scaffolds.

### Phase 1: Research (Discovery)

Outputs to produce:

- `outputs/codebase-context.md`
- `outputs/schema-utilities.md`
- `outputs/effect-schema-patterns.md`
- `outputs/effect-module-design.md`

### Phase 2: Design

Outputs to produce:

- `outputs/api-design.md`
- `outputs/file-layout.md`

### Phase 3: Plan

Output to produce:

- `outputs/plan.md`

### Phase 4: Implement

Implementation requirements:

- Introduce a `URI` `S.Class` model and a strict `URIFromString` boundary transform.
- Introduce an `IRI` `S.Class` model and a strict `IRIFromString` boundary transform.
- Convert parsing/serializing/resolving to Effect-based APIs with typed failures (`ParseIssue`/`ParseError`).
- Remove `error?: string` as the primary error channel (invalid inputs should fail, not embed an error string).
- Update scheme handlers to the new API (and remove exception-based IDNA conversion paths).
- Refactor tests to assert on Effect results / `ParseError` structure (no string `.error` assertions).

Quality gates (run from repo root):

1. `bun run lint:fix`
2. `bun run lint`
3. `bun run check`
4. `bun run test`

### Phase 5: Review

Output to produce:

- `outputs/review.md`

### Phase 6: Documentation

Ensure documentation exists and is updated:

- `packages/common/semantic-web/README.md` (add a “URI” section and usage examples)
- `packages/common/semantic-web/AGENTS.md` (if the package uses per-package agent rules)
- `packages/common/semantic-web/ai-context.md` (if the repo convention expects per-package AI context; check for precedent)
