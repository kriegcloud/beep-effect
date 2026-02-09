# Effect Schema patterns: transformOrFail / ParseResult

## Key points from Schema.ts (transformOrFail)

- `transformOrFail` creates a `Schema` that composes `from.ast -> to.ast` with an `AST.FinalTransformation` that is effectful for decode/encode. It returns a `Schema<ToA, FromI, FromR | ToR | RD | RE>` and is dual-arity (curried and uncurried).
- Decode/encode are required to return `Effect.Effect<_, ParseResult.ParseIssue, _>` and receive `(value, options, ast, originalEncoded)` or `(value, options, ast, originalType)`.
- `strict?: true` (default) means the decode/encode results are typed as the `To`/`From` encoded/type outputs. `strict: false` relaxes to `unknown`, letting the transformation be used for “shape-changing” results without asserting output types.
- `transform` is a convenience wrapper that uses `transformOrFail` with `ParseResult.succeed` to lift pure mappings into the effectful pipeline.

## ParseResult.ParseIssue expectations

- `ParseIssue` is a tagged union of leaf and composite issues:
  - Leaf: `Type`, `Missing`, `Unexpected`, `Forbidden`.
  - Composite: `Pointer`, `Refinement`, `Transformation`, `Composite`.
- Each issue carries an `ast`, `actual`, and optional `message` where relevant. `Transformation` issues include a `kind` (`Encoded | Transformation | Type`) that affects formatter output.
- `ParseError` is a `TaggedError("ParseError")` wrapper around a `ParseIssue`. It defines `message` via `TreeFormatter.formatIssueSync(issue)` and is surfaced by helpers like `parseError`.
- `ParseResult.succeed` and `ParseResult.fail` are `Either.right/left` wrappers. Effectful code is expected to use these to signal schema failure states.

## Effectful decode/encode patterns (from Schema.ts and ParseResult)

- Effectful transformations are expected to fail with a `ParseIssue` (not a generic error). If you need to fail, create an appropriate `ParseResult.Type | Forbidden | Transformation | Refinement` issue and `Effect.fail` it.
- If an effect is forced to run synchronously (`runSync`) but is actually async, ParseResult will produce a `Forbidden` issue with a stable error message (seen in `ParseResult.ts`). Treat this as a signal to keep transformation effects synchronous or use async parsing APIs.
- `filterEffect` shows the canonical pattern: run an effect, map the result into a `ParseIssue` via helper, then `ParseResult.fail` or `ParseResult.succeed`.

## Upstream example: effectful transform usage

From `.repos/effect/packages/effect/test/Schema/ParseResultEffectful.test.ts`:

- `Schema.transformOrFail(Schema.String, Schema.String, { strict: true, decode, encode })` where
  - `decode` fails with `Effect.fail(new ParseResult.Type(ast, actual, "Empty String"))` when the input is empty.
  - `encode` is `Effect.succeed`.
- The test output shows that failures are wrapped as `Transformation process failure`, and the underlying issue message (`Empty String`) is used in formatting. This confirms: use `ParseIssue` in the failure channel and let formatters wrap it into a `Transformation` node.

## Guidance: mapping schema failures vs library API failures

- Schema failures: always map to a `ParseIssue` subtype.
  - Input shape mismatch: `new ParseResult.Type(ast, actual, message)`.
  - Missing / unexpected key: `Missing` or `Unexpected` (usually handled by base schema).
  - Transform-specific validation: `Transformation` via failing with a leaf issue; the framework will wrap it.
  - “Do not run” / sync-only guardrails: `Forbidden` with a stable message.
- Library API failures (e.g., IDNA library returns a structured error): map them into a `ParseIssue` so they appear in schema formatting. Practical options:
  - Use `ParseResult.Type` with a concrete message if the library’s error indicates “input is invalid.”
  - Use `ParseResult.Forbidden` if the error indicates a disallowed operation (e.g., async-only or unsafe usage).
  - If you need to rethrow in effectful parsing APIs, wrap the `ParseIssue` with `ParseResult.parseError(issue)`.

