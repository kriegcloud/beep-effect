# Plan: URI Effect + Schema Refactor

## Assumptions / Invariants

- In-repo import sites of `@beep/semantic-web/uri/*` are limited to `packages/common/semantic-web/test/uri/uri.test.ts` (confirmed by discovery output; re-run `rg` before implementation).
- The existing parsing/serialization behavior (uri-js port) is valuable; behavior drift is a risk. Prefer refactoring error handling and return types while keeping core algorithm semantics stable.
- `@beep/semantic-web/idna` already exposes typed (Either-like) results; failures must map to `ParseIssue`/`ParseError`, not exceptions or `components.error`.
- No long-running commands (dev server) will be started; only finite `bun run lint/check/test` gates at checkpoints.

## Phased Steps (each ends with a checkpoint)

### Phase 1: Confirm consumers + set guardrails

1. Re-run `rg` for all import sites of `@beep/semantic-web/uri` and local `src/uri/*`.
2. Snapshot current failing behavior risks (note test expectations that depend on scheme handlers and `options` defaults).

Checkpoint:
- `bun run check` (should be green before edits, or capture baseline failures).

### Phase 2: Introduce typed error foundation in `uri.ts`

1. Define internal helpers:
   - `issue(ast?, actual, message)` => `ParseResult.Type(ast, actual, message)` where `ast` is available.
   - `toParseError(issue)` => `ParseResult.parseError(issue)` (API boundary).
2. Remove `components.error` from `URIComponents` and stop mutating it.
3. Replace all previous `components.error = ...` with `Either.left(ParseIssue)` at the point of failure.
4. Replace `invariant(...)` in `removeDotSegments` with a typed failure (no throw) and thread it through callers.

Checkpoint:
- `bun run check` (TypeScript and imports should still typecheck).

### Phase 3: Convert public operations to Effect-returning APIs

1. Convert:
   - `parse`, `serialize`, `resolveComponents`, `resolve`, `normalize`, `equal`, `escapeComponent`, `unescapeComponent`
2. Internal core stays `Either<ParseIssue, A>` (deterministic, no effects); exported functions lift to `Effect` and wrap errors to `ParseError`.
3. Ensure IDNA failures map to `ParseIssue` at the conversion boundary.

Checkpoint:
- `bun run check`

### Phase 4: Refactor scheme handlers

1. Update scheme handlers in `src/uri/schemes/*`:
   - `parse` / `serialize` return typed success/failure (no mutation of `components.error`).
2. Keep `schemes/index.ts` registration (side-effect import remains valid).

Checkpoint:
- `bun run check`
- Run the URI tests only if a per-package test runner exists; otherwise defer to Phase 6.

### Phase 5: Add Schema-first models (`URI`, `IRI`, transforms)

1. Add `URI` (`S.Class`) and `URIFromString` (`S.transformOrFail(S.String, URI, { strict: true, ... })`).
2. Add `IRI` (`S.Class`) and `IRIFromString` similarly.
3. `decode` must:
   - use deterministic default options (URI vs IRI) without runtime config
   - fail with `ParseIssue` constructed using the provided `ast` argument
4. `encode` must be deterministic: `uri.value` / `iri.value`.

Checkpoint:
- `bun run check`

### Phase 6: Migrate tests

1. Update `packages/common/semantic-web/test/uri/uri.test.ts` to the new API:
   - Use `Effect.runPromise(...)` for success cases.
   - For failure cases, assert on `ParseError.issue._tag` (or a stable formatted message), not `toThrow`.
2. Keep tests meaningful:
   - retain a representative subset across parse/serialize/resolve/normalize/equal + scheme-specific behavior (urn/mailto/ws).
3. Remove all assertions that depend on `components.error` being a string field.

Checkpoint:
- `bun run test`

### Phase 7: Repo quality gates + docs

1. Run:
   - `bun run lint:fix`
   - `bun run lint`
   - `bun run check`
   - `bun run test`
2. Write `outputs/review.md` summarizing final API and error strategy.
3. Update or create:
   - `packages/common/semantic-web/README.md`
   - `packages/common/semantic-web/AGENTS.md`
   - `packages/common/semantic-web/ai-context.md`

## Risk Register + Mitigations

- Behavior drift in normalization/resolve logic.
  - Mitigation: keep core parsing algorithm and scheme handlers as close to existing code as possible; keep representative tests for each major feature.
- Error typing regressions (accidentally returning `ParseError` where `ParseIssue` is required).
  - Mitigation: schemas only emit `ParseIssue`; library APIs wrap to `ParseError` at boundary; add targeted tests for failure cases.
- IDNA conversion edge cases (domain punycode/unicode mismatch).
  - Mitigation: preserve existing IDNA call sites, but map failures to typed issues; keep mailto + http host test coverage.
- Perf regressions from over-Effect-ifying pure code paths.
  - Mitigation: keep core parse/serialize as `Either`; use `Effect` only at export boundary and within schema transforms.

## Test Migration Notes

- Old style:
  - `parse("...")` returns `URIComponents` with `error?: string`.
  - Tests assert directly on returned value and sometimes `components.error`.
- New style:
  - `parse("...")` returns `Effect<URIComponents, ParseError>`.
  - Use `await Effect.runPromise(parse("..."))` for success.
  - For failures, `await Effect.runPromiseExit(...)` (or `Effect.either(...)`) and assert on:
    - `ParseError.issue._tag`
    - stable `message` passed into `ParseResult.Type(ast, actual, message)` where appropriate.

