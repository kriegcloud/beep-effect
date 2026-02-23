# API Design: URI Effect + Schema Refactor

This is a breaking rewrite of `packages/common/semantic-web/src/uri` to be:

- Schema-first: `URI` / `IRI` are `effect/Schema` classes (`S.Class`) usable directly as schemas.
- Effect-based: exported operations return `Effect` with typed failures.
- Single error surface: failures are `ParseResult.ParseIssue` (schema layer) and `ParseResult.ParseError` (library API layer).

## Value Models

### `URI` (`S.Class`)

Shape:

- `class URI extends S.Class<URI>("URI")({ value: S.String })`

Meaning of `URI.value`:

- A canonical *normalized* URI serialization (ASCII-oriented).
- Deterministic: normalization uses a fixed, internal default option set (no runtime `URIOptions` influence).
- Canonicalization rules are aligned with existing `normalize(...)` behavior (RFC 3986 style normalization, percent-encoding normalization, dot-segment removal, scheme/host casing rules, and IDNA host handling where applicable).

### `IRI` (`S.Class`)

Shape:

- `class IRI extends S.Class<IRI>("IRI")({ value: S.String })`

Meaning of `IRI.value`:

- A canonical *normalized* IRI serialization (Unicode-oriented).
- Deterministic: normalization uses a fixed, internal default option set for IRI (no runtime `URIOptions` influence).
- Canonicalization rules mirror URI normalization, but retain Unicode in places where IRI allows it; host presentation is Unicode where convertible.

## Schema Transforms

### `URIFromString`

Export:

- `export const URIFromString = S.transformOrFail(S.String, URI, { strict: true, decode, encode })`

Decode semantics:

- Input: `string`
- Output: `URI` where `value` is the canonical normalized URI serialization.
- Failure: `ParseResult.ParseIssue` only, constructed with the provided `ast` argument so failures attach to the transformation stage.

Encode semantics:

- Input: `URI`
- Output: `string` equal to `uri.value`
- Failure: should not fail for well-formed `URI`, but the signature remains effectful (returns `Effect.succeed`).

### `IRIFromString`

Same pattern as `URIFromString`, but uses the deterministic IRI defaults.

## Operations (feature-surface parity)

`URI` exposes the current surface either as static methods or module-level exports. The preferred shape is:

- module exports: `parse`, `serialize`, `resolveComponents`, `resolve`, `normalize`, `equal`, `escapeComponent`, `unescapeComponent`
- `URI` class re-exports these as statics (e.g. `URI.parse = parse`) so callers can use either style.

### Return types

All operations that can fail return:

- `Effect.Effect<Success, ParseResult.ParseError>`

Rationale:

- Internals traffic in `ParseResult.ParseIssue` (cheap, structured).
- API boundary wraps issues as `ParseResult.ParseError` (`ParseResult.parseError(issue)`), matching Effect conventions and avoiding ad-hoc errors.

### Inputs

- String-based operations accept `string` (not `unknown`) since this module is already a parsing boundary.
- Component-based operations work on a typed `URIComponents` model (ported from current module but *without* `error?: string`).

### Normal invalid-input flows

- No `throw`, no `try/catch` for normal invalid inputs.
- Use `Either<ParseIssue, A>` internally and lift to `Effect` for exported API methods.

## Options and Determinism

`URIOptions` remains supported for operation-level behavior toggles where needed (e.g. tolerant parsing), but:

- `URIFromString` and `IRIFromString` do not accept options.
- The only way to express variants at the schema layer is via distinct schemas (e.g. `URIFromString` vs `IRIFromString`).

## Error Strategy

- Schema transforms (`URIFromString`, `IRIFromString`) fail with `ParseIssue` created as `new ParseResult.Type(ast, actual, message)` or similar constructors.
- Library APIs fail with `ParseError` created from a `ParseIssue` (no stringly-typed `.error` fields on components).

