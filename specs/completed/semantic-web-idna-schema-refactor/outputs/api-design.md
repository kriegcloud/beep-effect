# API Design: Effect + Schema-first IDNA

## Goals / Non-goals

Goals:
- Provide an `effect/Schema` named `IDNA` that is an `S.Class`.
- Make IDNA operations effectful and typed: no `throw` for invalid input / overflow / not-basic.
- Make schema decoding strict and attach failures to the transform stage (`ast` in `transformOrFail`).
- Keep a non-effectful surface for synchronous callers without embedding `Effect.runSync` in library code.

Non-goals:
- Full IDNA2008 / UTS#46 compliance. This rewrite keeps parity with the existing punycode-port behavior and tests.

## Data Model

### `IDNA` (Schema.Class)

`IDNA` represents the canonical ASCII form of an IDNA-capable string.

`IDNA.value` meaning:
- The canonical ASCII output of `toASCII` for the provided input.
- This includes email-address handling (only the domain part is encoded; local-part is preserved).

Shape:
- `value: string` (ASCII form, including `xn--` labels when required)

Runtime behavior:
- `toString()` returns `value`.

## Schema

### `IDNAFromString` (strict effectful transform)

Export:
- `export const IDNAFromString = S.transformOrFail(S.String, IDNA, { strict: true, decode, encode })`

Decode (`string -> IDNA`):
- Runs the same canonicalization as `IDNA.toASCIIResult`.
- On success: `IDNA.make({ value: ascii })`.
- On failure: `Effect.fail(ParseIssue)` where `ParseIssue` is constructed with the passed `ast`.
  - Use `new ParseResult.Type(ast, input, message)` (message derived from failure kind).

Encode (`IDNA -> string`):
- `Effect.succeed(idna.value)` (should not fail).

## Public Surface

### Effect-based surface (preferred)

Static methods return `Effect.Effect<_, ParseResult.ParseError>`:
- `IDNA.encode(input: string): Effect.Effect<string, ParseResult.ParseError>`
- `IDNA.decode(input: string): Effect.Effect<string, ParseResult.ParseError>`
- `IDNA.toASCII(input: string): Effect.Effect<string, ParseResult.ParseError>`
- `IDNA.toUnicode(input: string): Effect.Effect<string, ParseResult.ParseError>`

Error strategy:
- Internal algorithm functions fail with `ParseResult.ParseIssue`.
- The exported Effect methods map `ParseIssue -> ParseError` via `ParseResult.parseError(issue)`.

AST strategy:
- For standalone methods (not schema transforms), issues use a stable AST anchor:
  - `S.String.ast` as the `ast` for `ParseResult.Type` issues.
  - Schema transforms (`IDNAFromString`) must use the `ast` passed to `decode`/`encode`.

### Sync surface (for non-Effect consumers)

Add explicit, non-throwing sync variants returning `ParseResult.ParseResult<A>` (i.e. `Either<A, ParseIssue>`):
- `IDNA.encodeResult(input: string): ParseResult.ParseResult<string>`
- `IDNA.decodeResult(input: string): ParseResult.ParseResult<string>`
- `IDNA.toASCIIResult(input: string): ParseResult.ParseResult<string>`
- `IDNA.toUnicodeResult(input: string): ParseResult.ParseResult<string>`

Rationale:
- Keeps synchronous code (e.g. URI parsing/serialization) deterministic without `Effect.runSync`.
- Still provides typed, structured errors (`ParseIssue`).

### UCS-2 helpers

Maintain the old shape:
- `IDNA.ucs2.decode(string: string): ReadonlyArray<number>`
- `IDNA.ucs2.encode(codePoints: ReadonlyArray<number>): string`

These are pure and should not fail for normal inputs (they implement the same surrogate-pair mapping as before).

### `version`

Expose `IDNA.version: "0.1.0"` to maintain parity with current tests and external expectations.

## Export Strategy

Module: `@beep/semantic-web/idna` (`src/idna/index.ts`)
- Named exports: `IDNA`, `IDNAFromString`.
- Compatibility: keep a default export for now as `IDNA` (class value), so `import idna from ...` remains valid if callers migrate to the new return types.

Module: `@beep/semantic-web/idna/idna` (`src/idna/idna.ts`)
- Named exports mirroring prior names for ease of migration:
  - `IDNA`, `IDNAFromString`, `encode`, `decode`, `toASCII`, `toUnicode`, `ucs2encode`, `ucs2decode`
- These top-level functions are thin wrappers around `IDNA.*` static methods:
  - `encode = IDNA.encode` (effectful)
  - `encodeResult = IDNA.encodeResult` (sync)
  - etc.

