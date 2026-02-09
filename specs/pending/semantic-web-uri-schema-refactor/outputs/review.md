# Review: URI Effect + Schema Refactor

## Final API Surface

Exports from `@beep/semantic-web/uri/uri`:
- **Models / Schemas**
  - `URI` (`effect/Schema` `S.Class`) with `value: string`
  - `IRI` (`effect/Schema` `S.Class`) with `value: string`
  - `URIFromString`: strict `S.transformOrFail(S.String, URI, ...)` (`string -> URI`)
  - `IRIFromString`: strict `S.transformOrFail(S.String, IRI, ...)` (`string -> IRI`)
- **Effect APIs** (all fail with `ParseResult.ParseError`)
  - `parse(uriString, options?) -> Effect<URIComponents, ParseError>`
  - `serialize(components, options?) -> Effect<string, ParseError>`
  - `resolveComponents(base, relative, options?, skipNormalization?) -> Effect<URIComponents, ParseError>`
  - `resolve(base, relative, options?) -> Effect<string, ParseError>`
  - `normalize(uriOrComponents, options?) -> Effect<string | URIComponents, ParseError>`
  - `equal(uriA, uriB, options?) -> Effect<boolean, ParseError>`
- **Sync helpers**
  - `escapeComponent(str, options?) -> string`
  - `unescapeComponent(str, options?) -> string`

`URI` also exposes static methods mirroring the module-level exports:
`URI.parse`, `URI.serialize`, `URI.resolveComponents`, `URI.resolve`, `URI.normalize`, `URI.equal`,
`URI.escapeComponent`, `URI.unescapeComponent`.

## Schema Strategy

- `URI` / `IRI` are modeled as `S.Class` value objects whose `value` is a **canonical serialization**.
- `URIFromString` and `IRIFromString` are strict `S.transformOrFail` transforms:
  - **decode**: normalize via parse + serialize under deterministic option sets, then `new URI({ value })` / `new IRI({ value })`
  - **encode**: returns `.value`
- Deterministic option sets (no runtime `URIOptions` dependency):
  - `URIFromString` uses `{ iri: false, unicodeSupport: false }`
  - `IRIFromString` uses `{ iri: true, unicodeSupport: true }`

## Error Strategy (ParseIssue vs ParseError)

- Internals use a single error surface: `effect/ParseResult`.
- Parsing / serialization logic returns `Either<Success, ParseIssue>` internally.
- Public Effect APIs map `ParseIssue -> ParseError` at the boundary via `ParseResult.parseError(issue)`.
- Schema transforms (`transformOrFail`) fail with **`ParseIssue`**, constructed using the passed `ast`:
  - `new ParseResult.Type(ast, actual, message)`

## Scheme Handlers

- Scheme handlers (`packages/common/semantic-web/src/uri/schemes/*`) were updated to:
  - return `Either<Success, ParseIssue>` (no `throw`, no `components.error?: string`)
  - accept an optional `ast?: AST.AST` so schema decoding can anchor failures to the transform stage

## Deliberate Behavior Changes

- Removed ad-hoc `components.error` entirely.
- Invalid inputs that previously returned components with `.error` now **fail**:
  - invalid `urn:uuid:*` now fails with a typed `ParseError` containing `"UUID is not valid."`
  - `http:` / `https:` without a host now fails with `"HTTP URIs must have a host."` / the analogous HTTPS rule

## Tests

- `packages/common/semantic-web/test/uri/uri.test.ts` was rewritten to:
  - use `@beep/testkit` `effect(...)` runner for Effect APIs (no manual `Effect.runPromise`)
  - assert failures via `Effect.either` + stable substring checks on `String(ParseError)`
  - add coverage for `URIFromString` / `IRIFromString` schema decoding

