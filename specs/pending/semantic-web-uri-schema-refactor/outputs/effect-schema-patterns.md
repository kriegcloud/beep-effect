# Effect Schema patterns for effectful transforms

## S.transformOrFail essentials
- `Schema.transformOrFail` builds a `Schema` whose decode/encode functions return `Effect.Effect<_, ParseIssue, _>`, and wraps them in an `AST.Transformation` (`Schema.ts`).
- It is dual-arity: `transformOrFail(from, to, options)` or curried `(to, options)(from)`.
- The `options` overloads are strict vs non-strict. `strict: true` requires decode/encode to return the *exact* encoded/type values; `strict: false` allows `unknown` output.
- The transformation AST is always `AST.FinalTransformation(decode, encode)`; the actual decode/encode calls are in `ParseResult.getFinalTransformation` and are wired into the parser (`ParseResult.ts`).
- `Schema.transform` is a pure wrapper over `transformOrFail` that lifts pure functions into `ParseResult.succeed` (`Schema.ts`).

## ParseIssue expectations and shape
- `ParseIssue` is a tagged union that includes leaf issues (`Type`, `Missing`, `Unexpected`, `Forbidden`) and composite wrappers (`Pointer`, `Refinement`, `Transformation`, `Composite`) (`ParseResult.ts`).
- `Transformation` issues carry a `kind` of `Encoded`, `Transformation`, or `Type`, and the formatter renders those as “Encoded side transformation failure”, “Transformation process failure”, or “Type side transformation failure” (`ParseResult.ts`).
- `Forbidden` is used when effectful decoding is attempted in a non-effect context, or the effect has defects/async work during sync paths (`ParseResult.ts`).
- `ParseError` is a *wrapper* over a `ParseIssue` used in sync throwing APIs (`decodeSync`, `encodeSync`, `validateSync`, `asserts`). It is not the canonical error type for schema decoding itself (`ParseResult.ts`).

## Effectful decode/encode patterns
- Effectful decode/encode is allowed only when `isEffectAllowed` is true (set by `ParseResult.decodeUnknown` / `encodeUnknown`). Sync paths (`decodeUnknownSync`, `encodeUnknownSync`) will attempt to run effects; if async/defect occurs, they produce `Forbidden` (`ParseResult.ts`).
- Within transformations, failures from the decode/encode effect are mapped into `ParseResult.Transformation` with `kind` set by phase (`Encoded`/`Transformation`/`Type`) (`ParseResult.ts`).
- For leaf transforms, use `ParseResult.succeed`/`ParseResult.fail` or return an `Either` effect to avoid building custom `Effect` plumbing.

## Upstream effectful transform example
- `ParseResultEffectful.test.ts` defines `EffectfulStringFailure` using `Schema.transformOrFail` with an effectful `decode` that fails on empty string by `Effect.fail(new ParseResult.Type(ast, actual, "Empty String"))` and `encode: Effect.succeed`. The resulting errors show up under “Transformation process failure” in formatting.

## Mapping external library failures to ParseIssue
- Pattern: convert external library `Either`/exception into a `ParseIssue` in `transformOrFail`.
  - Example: `StringFromUriComponent` uses `Encoding.decodeUriComponent` / `encodeUriComponent` and maps the `DecodeException`/`EncodeException` message into `new ParseResult.Type(ast, value, message)` (`Schema.ts`).
- Guidance for schema refactors:
  - Use `ParseResult.Type` for invalid input content that violates a parse rule (wrong format, invalid URI, invalid decode).
  - Use `ParseResult.Transformation` only as the wrapper produced by the parser; don’t construct it manually unless you’re building custom parser nodes.
  - Reserve `ParseError` for *throwing* sync API boundaries. For effectful schemas, emit `ParseIssue` and let `decodeUnknown`/`encodeUnknown` surface it as the error channel.

## ParseIssue vs ParseError guidance (schema failures vs API failures)
- `ParseIssue` is the canonical failure type for schema decode/encode/validate. It is what `transformOrFail` should emit.
- `ParseError` is the *API-level* exception used by sync helpers (`decodeSync`, `encodeSync`, `validateSync`, `asserts`) which wrap a `ParseIssue` for throwing. It should not be used as an internal error value inside schemas.
- If a library API throws or returns an error, translate it into a `ParseIssue` (typically `Type` or `Refinement`) at the boundary. Let sync helpers convert to `ParseError` only when explicitly invoked.
