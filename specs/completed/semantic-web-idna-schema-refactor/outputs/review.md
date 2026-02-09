# Review: IDNA Effect + Schema Rewrite

## What Changed

- Replaced the legacy punycode port (throwing `IDNAError` union + `IDNAConfig` object) with a Schema-first module:
  - `IDNA` is now an `effect/Schema` `S.Class` with `value: string` representing canonical ASCII output.
  - `IDNAFromString` is a strict `S.transformOrFail(S.String, IDNA, ...)`.
- Extracted algorithm core into internal pure helpers that never throw and return `Either.Either<A, ParseResult.ParseIssue>`:
  - `packages/common/semantic-web/src/idna/internal/ucs2.ts`
  - `packages/common/semantic-web/src/idna/internal/punycode.ts`
  - `packages/common/semantic-web/src/idna/internal/domain.ts`
- Public surface (`packages/common/semantic-web/src/idna/idna.ts`) provides:
  - Effect API (`IDNA.encode/decode/toASCII/toUnicode`) failing with `ParseResult.ParseError`
  - Sync result API (`IDNA.*Result`) returning `Either.Either<_, ParseIssue>` for non-Effect consumers
  - Pure `IDNA.ucs2.encode/decode`

## Error Strategy

- Single failure surface in the algorithm core: `ParseResult.ParseIssue` (leaf issues are `new ParseResult.Type(ast, actual, message)`).
- Effect API wraps `ParseIssue` into `ParseError` via `ParseResult.parseError(issue)`.
- Legacy error strings preserved for compatibility:
  - `"Invalid input"`
  - `"Illegal input >= 0x80 (not a basic code point)"`
  - `"Overflow: input needs wider integers to process"`

## Schema Behavior

- `IDNAFromString` decode:
  - canonicalizes via `toASCII`
  - on failure, returns a `ParseIssue` constructed with the *passed* `ast` (required for correct Schema error attribution)
- `IDNAFromString` encode:
  - always succeeds with `idna.value`

## Consumer Updates

- `packages/common/semantic-web/src/uri/uri.ts`
- `packages/common/semantic-web/src/uri/schemes/mailto.ts`

Both were updated to avoid `try/catch` and avoid embedding `Effect.runSync` in sync codepaths:
- use `IDNA.toASCIIResult` / `IDNA.toUnicodeResult`
- on failure, format the `ParseIssue` with `ParseResult.TreeFormatter.formatIssueSync(issue)` and set `components.error`

## Tests

- `packages/common/semantic-web/test/idna/idna.test.ts` migrated to:
  - use `@beep/testkit`’s `effect(...)` harness for Effect-based APIs
  - assert failures via `Effect.either(...)` rather than `toThrow(...)`
  - add coverage for `IDNAFromString` schema decode + encode

## Compatibility Notes

- Default export `@beep/semantic-web/idna` remains available, but the return types changed:
  - `encode/decode/toASCII/toUnicode` are now Effect-based and do not throw for normal failures.
  - Sync callers should use `*Result` variants.
- Removed legacy `errors.ts` / `model.ts` exports (no in-repo consumers depended on them).

