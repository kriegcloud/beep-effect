# Plan: IDNA Effect + Schema Refactor

## Assumptions / Invariants

- The current IDNA module is a punycode port with:
  - `encode`/`decode` for punycode.
  - `toASCII`/`toUnicode` that map domains and email addresses.
  - IDNA2003 separator support (`.`, `\u3002`, `\uFF0E`, `\uFF61`).
- In-repo consumers are limited to:
  - `packages/common/semantic-web/src/uri/uri.ts` (default import, sync; currently try/catch)
  - `packages/common/semantic-web/src/uri/schemes/mailto.ts` (default import, sync; currently try/catch)
  - `packages/common/semantic-web/test/idna/idna.test.ts` (named imports from `@beep/semantic-web/idna/idna`)
- Tests encode behavior expectations and stable error messages; we should preserve messages where practical.

## Phased Steps (each ends with a checkpoint)

1. **Implement internal pure core (no exports)**
   - Add `src/idna/internal/ucs2.ts` with `ucs2encode`/`ucs2decode` parity.
   - Add `src/idna/internal/punycode.ts` implementing `encode`/`decode` as pure functions:
     - Return `ParseResult.ParseResult<string>` (`Either<string, ParseIssue>`)
     - No throws; map failure kinds to `new ParseResult.Type(ast, actual, message)` at the boundary.
   - Add `src/idna/internal/domain.ts` implementing `toASCII`/`toUnicode` as pure functions returning `ParseResult.ParseResult<string>`.
   - Checkpoint: `bun run check` (typecheck only).

2. **Public module surface**
   - Replace old implementation:
     - Delete `src/idna/errors.ts`, `src/idna/model.ts` if unused after rewrite.
     - Rewrite `src/idna/idna.ts` to export:
       - `export class IDNA extends S.Class...`
       - `export const IDNAFromString = S.transformOrFail(S.String, IDNA, { strict: true, ... })`
       - static methods:
         - effectful (`Effect<_, ParseError>`)
         - sync result (`ParseResult.ParseResult<_>`)
       - top-level wrappers for migration convenience.
   - Rewrite `src/idna/index.ts`:
     - named exports: `IDNA`, `IDNAFromString`
     - default export: `IDNA` (compat)
   - Checkpoint: `bun run check`.

3. **Update in-repo consumers**
   - Update `uri.ts` and `mailto.ts` to stop using try/catch.
   - Use `IDNA.toASCIIResult` / `IDNA.toUnicodeResult` to keep these modules synchronous and avoid `Effect.runSync` in library code.
   - On failure:
     - Keep behavior: set `components.error` with a stable message, including formatted `ParseIssue` or `ParseError` string.
   - Checkpoint: `bun run check`.

4. **Refactor tests**
   - Update `packages/common/semantic-web/test/idna/idna.test.ts`:
     - success cases: `await Effect.runPromise(IDNA.encode(...))` etc, or use wrappers exported from `@beep/semantic-web/idna/idna`.
     - error cases:
       - assert the failure is a `ParseError` for effectful API (`Effect.runPromise` rejects with `ParseError`), or
       - use the sync `*Result` surface and assert `Either.isLeft` with `ParseIssue` and message.
     - Avoid `toThrow(...)` since we are removing normal throws.
   - Keep messages stable (e.g. "Invalid input", "Overflow: ...", "Illegal input >= 0x80 ...") and assert on those strings.
   - Checkpoint: `bun run test`.

5. **Quality gates**
   - Run at repo root:
     - `bun run lint:fix`
     - `bun run lint`
     - `bun run check`
     - `bun run test`

6. **Docs**
   - Update `packages/common/semantic-web/README.md` (and/or `AGENTS.md`) with an “IDNA” section:
     - schema usage example (`S.decodeUnknown(IDNAFromString)` or `S.decode(IDNAFromString)`)
     - Effect API usage example (`IDNA.toASCII`, `IDNA.encode`)
     - sync `*Result` usage example for non-Effect code
   - Add `outputs/docs-checklist.md` summarizing changes and snippets.

## Risk Register + Mitigations

- **Risk: Consumers implicitly rely on thrown errors**
  - Mitigation: update consumers to use `*Result` API and set `components.error` on `Left`.
- **Risk: Error message mismatch breaks tests**
  - Mitigation: preserve the exact legacy strings where feasible; assert messages via `ParseError.message` / `TreeFormatter` output.
- **Risk: Schema transform failures attach to wrong AST**
  - Mitigation: ensure `IDNAFromString.decode` constructs issues with the passed `ast` argument only.
- **Risk: Return type churn causes cascading TS errors**
  - Mitigation: keep wrapper functions in `@beep/semantic-web/idna/idna` with familiar names; migrate call sites in small commits/checkpoints.

## Test Migration Notes

- Replace `expect(() => decode(...)).toThrow(...)` with one of:
  - sync: `const r = IDNA.decodeResult("..."); expect(Either.isLeft(r)).toBe(true);` and assert `issue.message` via formatter if needed.
  - effectful: `await expect(Effect.runPromise(IDNA.decode("..."))).rejects.toMatchObject({ _tag: "ParseError" })` and assert `.message` contains the legacy string.

