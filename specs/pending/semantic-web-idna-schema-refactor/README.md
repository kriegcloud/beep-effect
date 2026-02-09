# Semantic Web IDNA: Effect + Schema-First Refactor

> Refactor `packages/common/semantic-web/src/idna` (punycode port) to be Effect-based and Schema-first, with strict error handling and a schema export named `IDNA`.

## Status

- Status: `pending`
- Package: `packages/common/semantic-web`
- Target module: `packages/common/semantic-web/src/idna/*`

## Problem Statement

`packages/common/semantic-web/src/idna/idna.ts` is a port of `punycode` that currently:

- throws `IDNAError` (via `throw`) from core operations like `decode` / `encode`
- exposes an `IDNA` *config object* (`new IDNAConfig({...})`) rather than an `IDNA` *schema* suitable for boundary validation

This makes it hard to use IDNA as a first-class schema at boundaries, and forces consumers into exception-based control flow instead of typed, exhaustively handled errors.

## Goals

1. Export a custom `effect/Schema` named `IDNA`.
   - `IDNA` MUST be an `S.Class` (Schema.Class) and usable as a schema.
   - Provide a schema-first boundary transform from `string` to `IDNA` using `S.transformOrFail` (recommended export: `IDNAFromString`).
2. `IDNA` provides static methods matching the existing default export feature surface:
   - `IDNA.version`
   - `IDNA.ucs2.encode`, `IDNA.ucs2.decode`
   - `IDNA.encode`, `IDNA.decode`
   - `IDNA.toASCII`, `IDNA.toUnicode`
3. Core operations become Effect-based (no `throw` for normal error flow).
   - Errors use Effect’s canonical schema error model (`effect/ParseResult`) rather than a custom `IDNAError` union.
4. Tests are refactored to the new API and remain equivalent in coverage/intent.

## Non-Goals / Constraints

- Do not “improve” punycode/IDNA correctness beyond what the current port does unless a bug is confirmed by tests.
- This is a **breaking rewrite** of the IDNA module:
  - old implementation files / exports may be deleted entirely
  - the orchestrator must search for and update **all** in-repo consumers (`rg "@beep/semantic-web/idna"` etc.)
  - do not add compatibility shims unless a concrete in-repo consumer cannot be updated safely
  - note (as of spec creation): `rg "@beep/semantic-web/idna"` finds only:
    - `packages/common/semantic-web/src/uri/uri.ts`
    - `packages/common/semantic-web/src/uri/schemes/mailto.ts`
    - `packages/common/semantic-web/test/idna/idna.test.ts`
- No `any`, `@ts-ignore`, or unchecked casts.
- Do not start long-running processes (e.g. `bun run dev`) without explicit confirmation.

## Key Existing Files (Baseline)

- Implementation: `packages/common/semantic-web/src/idna/idna.ts`
- Error model: `packages/common/semantic-web/src/idna/errors.ts`
- Public surface: `packages/common/semantic-web/src/idna/index.ts`
- Tests: `packages/common/semantic-web/test/idna/idna.test.ts`
- Consumer: `packages/common/semantic-web/src/uri/uri.ts`

## Desired End State (API Sketch)

The orchestrator should design an API that makes `IDNA` both:

- a schema/value model (for boundary validation), and
- a namespace exposing typed, Effect-based operations.

Example target shape (illustrative, not prescriptive):

```ts
export class IDNA extends S.Class<IDNA>($I`IDNA`)({
  value: S.String,
}) {
  static readonly version = /* ... */;
  static readonly ucs2 = { decode: /*...*/, encode: /*...*/ };

  static decode(input: string): Effect.Effect<string, ParseResult.ParseError> { /* ... */ }
  static encode(input: string): Effect.Effect<string, ParseResult.ParseError> { /* ... */ }
  static toASCII(input: string): Effect.Effect<string, ParseResult.ParseError> { /* ... */ }
  static toUnicode(input: string): Effect.Effect<string, ParseResult.ParseError> { /* ... */ }
}

// Boundary schema: strict, effectful, ParseIssue-based failures (required by transformOrFail).
export const IDNAFromString: S.Schema<IDNA, string> = S.transformOrFail(S.String, IDNA, {
  strict: true,
  decode: (input, _options, ast) =>
    /* Effect that returns `{ value: string }` or `IDNA.make(...)`, failing with `ParseResult.ParseIssue` */,
  encode: (idna) =>
    /* Effect.succeed(idna.value) (or equivalent) */,
});
```

Important nuance: `S.Class` is appropriate for the *IDNA value*, not the prior “config bundle” object.
Static methods can preserve the old “bundle” ergonomics without turning “functions-as-data” into the schema.

## Schema Transform Notes (`S.transformOrFail`)

The `S.transformOrFail` path is the canonical way (in this repo and in Effect upstream) to build “boundary schemas” that:

- accept a primitive input (e.g. `string`),
- perform strict / effectful transformation (decode + encode), and
- fail with `ParseResult.ParseIssue` so Schema tooling can render structured error trees.

Observed patterns to mirror:

- `strict: true` (avoid “unknown” transforms).
- Failures are `ParseResult.ParseIssue` values, commonly:
  - `new ParseResult.Type(ast, actual, message)`
  - `ParseResult.fail(new ParseResult.Type(...))`
- Use the `ast` passed to `decode` / `encode` when constructing `ParseIssue`s, so failures attach to the transformation stage.
- Wrap throwing logic via `ParseResult.try({ try: ..., catch: () => new ParseResult.Type(ast, actual, msg) })`.
- For effectful domain operations, map typed errors to `ParseIssue` via `Effect.mapError(...)`.
  - `EncryptedStringFromPlaintext` shows this pattern for service-based transformations.
- Prefer stable message strings for IDNA failures (tests should not rely on implicit `toString()` formatting of arbitrary objects).
  - If you delete the custom error union, keep a small internal `const` map of messages (similar to the existing `ErrorType.MESSAGES`) so messages stay deliberate.

Concrete examples:

- `packages/common/schema/src/primitives/network/url.ts` (`URLFromString`)
- `packages/shared/domain/src/value-objects/LocalDate.ts` (`LocalDateFromString`)
- `packages/shared/domain/src/services/EncryptionService/schemas.ts` (`EncryptedStringFromPlaintext`)
- `.repos/effect/packages/effect/test/Schema/ParseResultEffectful.test.ts` (effectful `transformOrFail`)

## Phase Plan (Orchestrator-Driven)

This spec is intended to be executed by an orchestrator instance. Use `handoffs/P1_ORCHESTRATOR_PROMPT.md` as the primary entry point.

### Phase 1: Research (Discovery)

Outputs to produce:

- `outputs/codebase-context.md`
  - current exports, consumers, test expectations, and error cases
- `outputs/schema-utilities.md`
  - relevant utilities in `packages/common/schema` (e.g. `BS.*`, branded string patterns, `StringLiteralKit`)
- `outputs/effect-schema-patterns.md`
  - relevant patterns from `.repos/effect/packages/effect/src/Schema.ts` (esp. `transformOrFail`, `ParseResult`)
  - include concrete examples of `S.transformOrFail` usage from this repo:
    - `packages/common/schema/src/primitives/network/url.ts` (`URLFromString`)
    - `packages/shared/domain/src/value-objects/LocalDate.ts` (`LocalDateFromString`)
    - `packages/shared/domain/src/services/EncryptionService/schemas.ts` (`EncryptedStringFromPlaintext`, effectful transform)
  - include Effect’s own “effectful transformOrFail” example:
    - `.repos/effect/packages/effect/test/Schema/ParseResultEffectful.test.ts`
- `outputs/effect-module-design.md`
  - summarize how Effect organizes “core modules” (file layout, internal helpers, naming, docs)
  - focus on patterns that are *worth mirroring* in this repo, e.g.:
    - a small, intentional public surface
    - internal helpers under an `internal/` folder when useful
    - stable, documented exports (JSDoc, categories) where appropriate
  - suggest 2-3 concrete Effect modules to reference (example candidates):
    - `.repos/effect/packages/effect/src/Encoding.ts`
    - `.repos/effect/packages/effect/src/ParseResult.ts`
    - `.repos/effect/packages/effect/src/Brand.ts`

### Phase 2: Design

Outputs to produce:

- `outputs/api-design.md`
  - final API surface, compatibility strategy, error strategy, schema strategy
- `outputs/file-layout.md`
  - where code lives and what moves/renames are required

Design checklist:

- Decide what the `IDNA` schema represents (e.g. canonical ASCII form stored in `value`).
- Decide how schema decoding relates to the Effect-based operations.
- Decide how to represent failures (single error surface):
  - For `S.transformOrFail` (`IDNAFromString`), failures must be `ParseResult.ParseIssue` (e.g. `new ParseResult.Type(ast, actual, message)`).
  - For static “library API” calls, prefer failing with `ParseResult.ParseError` (wrap issues via `ParseResult.parseError(issue)`), so consumers get an `Error` value with a stable `.message` and structured issue tree.
  - Use `strict: true` and actually use the `ast` parameter when constructing issues so failures attach to the transformation stage.

### Phase 3: Plan

Output to produce:

- `outputs/plan.md`

Plan requirements (context-engineering oriented):

- Explicit assumptions and invariants (what must not change).
- Incremental steps with checkpoints (compile, tests) per step.
- Risk list (API breakage, behavior drift, perf regressions) and mitigations.
- Test strategy: map existing tests to new result types and add missing edge cases if discovered.

### Phase 4: Implement

Implementation requirements:

- Replace `throw ...` with typed failures (`ParseResult.ParseIssue` / `ParseResult.ParseError`) and convert to `Effect` at the module boundary.
- Export `IDNA` as an `S.Class` with static methods covering the previous default export feature surface.
- Update `packages/common/semantic-web/src/idna/index.ts` to export the new `IDNA` and preserve/adjust the default export surface.
- Refactor `packages/common/semantic-web/test/idna/idna.test.ts` to the new API (no exception assertions).
- Update consumer(s) like `packages/common/semantic-web/src/uri/uri.ts` if necessary.

Quality gates (run from repo root):

1. `bun run lint:fix`
2. `bun run lint`
3. `bun run check`
4. `bun run test`

### Phase 5: Review

Output to produce:

- `outputs/review.md`

Review checklist:

- No `throw` used for expected IDNA failures.
- Errors are typed using `effect/ParseResult` (`ParseIssue` / `ParseError`).
- No cross-slice boundary violations.
- Public exports are deliberate and documented.

### Phase 6: Document

Outputs to produce:

- `outputs/docs-checklist.md`

Documentation tasks:

- Add `packages/common/semantic-web/README.md` and `packages/common/semantic-web/AGENTS.md` if missing.
- Add a short “IDNA” section with usage examples (schema + Effect API).
- Confirm whether an `ai-context.md` exists for the package; add/update if the repo’s convention expects one.

## Success Criteria (Acceptance)

- [ ] `packages/common/semantic-web/src/idna` exports `IDNA` as an `S.Class` schema.
- [ ] `IDNAFromString` exists and is `S.transformOrFail(S.String, IDNA, { strict: true, ... })`.
- [ ] `IDNA` has static `version`, `ucs2`, `encode`, `decode`, `toASCII`, `toUnicode`.
- [ ] All IDNA failure paths are typed (no exceptions for normal invalid input).
- [ ] Failures are represented using `effect/ParseResult` (`ParseIssue` / `ParseError`), not a custom `IDNAError` union.
- [ ] `packages/common/semantic-web/test/idna/idna.test.ts` updated and passing.
- [ ] All quality gates pass (`lint`, `check`, `test`).
- [ ] Documentation exists and includes an “IDNA” section with examples.

## Related

- Spec workflow: `specs/_guide/README.md`
- Handoff standard: `specs/_guide/HANDOFF_STANDARDS.md`
