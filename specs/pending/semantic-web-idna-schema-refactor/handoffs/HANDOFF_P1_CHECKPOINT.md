# Context for Phase 1 (Checkpoint)

This checkpoint is created due to context-budget pressure (tool calls in the Yellow zone) before starting the breaking implementation rewrite.

## Working Context (what to do next)

Current task:
- Implement the breaking rewrite of `packages/common/semantic-web/src/idna` to be Effect-based + Schema-first.

Success criteria:
- `IDNA` is an `S.Class`.
- Export `IDNAFromString` as a strict `S.transformOrFail(S.String, IDNA, ...)` with failures as `ParseResult.ParseIssue` built using the passed `ast`.
- No `throw` for normal invalid-input / overflow / not-basic flows. Typed failures only (`ParseIssue` / `ParseError`).
- Update all in-repo consumers (`uri.ts`, `mailto.ts`) and tests (`idna.test.ts`) to the new API.
- Repo is green: `bun run lint`, `bun run check`, `bun run test`.

Immediate next steps (follow `outputs/plan.md`):
1. Add internal pure helpers returning `ParseResult.ParseResult<_>`:
   - `src/idna/internal/ucs2.ts`
   - `src/idna/internal/punycode.ts`
   - `src/idna/internal/domain.ts`
2. Rewrite public module:
   - `src/idna/idna.ts` defines `export class IDNA extends S.Class...` + static methods and `IDNAFromString`.
   - `src/idna/index.ts` re-exports, and keeps default export as `IDNA` for compatibility.
   - Remove old `errors.ts` / `model.ts` if unused.
3. Update consumers:
   - Replace `try/catch` in `uri.ts` and `mailto.ts` with `IDNA.toASCIIResult` / `IDNA.toUnicodeResult` and set `.error` on Left.
4. Update tests to assert on Effect results and typed failures.
5. Run quality gates.
6. Update docs + write `outputs/review.md` and `outputs/docs-checklist.md`.

## Completed in this phase

Research outputs (done):
- `specs/pending/semantic-web-idna-schema-refactor/outputs/codebase-context.md`
- `specs/pending/semantic-web-idna-schema-refactor/outputs/schema-utilities.md`
- `specs/pending/semantic-web-idna-schema-refactor/outputs/effect-schema-patterns.md`
- `specs/pending/semantic-web-idna-schema-refactor/outputs/effect-module-design.md`

Design + plan outputs (done):
- `specs/pending/semantic-web-idna-schema-refactor/outputs/api-design.md`
- `specs/pending/semantic-web-idna-schema-refactor/outputs/file-layout.md`
- `specs/pending/semantic-web-idna-schema-refactor/outputs/plan.md`

Key design decisions captured:
- `IDNA.value` is the canonical ASCII output of `toASCII`.
- Static methods `encode/decode/toASCII/toUnicode` are Effect-based and fail with `ParseError` (wrapping `ParseIssue`).
- Provide explicit sync `*Result` variants returning `ParseResult.ParseResult<_>` for sync codepaths (avoid `Effect.runSync`).
- Keep `IDNA.ucs2.encode/decode` pure and synchronous.

## Codebase facts (load-bearing)

Current import sites to update:
- `packages/common/semantic-web/src/uri/uri.ts` uses `import idna from "@beep/semantic-web/idna";` and calls `idna.toASCII` / `idna.toUnicode` inside try/catch.
- `packages/common/semantic-web/src/uri/schemes/mailto.ts` same pattern.
- Tests import named sync functions from `@beep/semantic-web/idna/idna`.

Current legacy thrown cases to preserve as typed failures:
- `invalid-input` -> message `"Invalid input"`
- `not-basic` -> message `"Illegal input >= 0x80 (not a basic code point)"`
- `overflow` -> message `"Overflow: input needs wider integers to process"`

## Procedural Links

- Spec plan: `specs/pending/semantic-web-idna-schema-refactor/outputs/plan.md`
- Design: `specs/pending/semantic-web-idna-schema-refactor/outputs/api-design.md`
- Effect patterns: `specs/pending/semantic-web-idna-schema-refactor/outputs/effect-schema-patterns.md`
- Schema patterns in repo: `specs/pending/semantic-web-idna-schema-refactor/outputs/schema-utilities.md`

