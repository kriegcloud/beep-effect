# P1 Orchestrator Prompt (Checkpoint): Implement IDNA Effect + Schema Rewrite

You are the orchestrator for `specs/pending/semantic-web-idna-schema-refactor`.

Resume from checkpoint:
- Read `specs/pending/semantic-web-idna-schema-refactor/handoffs/HANDOFF_P1_CHECKPOINT.md`.
- Follow `specs/pending/semantic-web-idna-schema-refactor/outputs/plan.md` exactly.

Goal:
- Refactor `packages/common/semantic-web/src/idna` (punycode port) to be Effect-based and Schema-first so errors are typed/explicit and IDNA can be used as a schema.

Hard requirements:
- Export `IDNA` as `S.Class`.
- Export `IDNAFromString` as strict `S.transformOrFail(S.String, IDNA, ...)`.
  - Failures must be `ParseResult.ParseIssue` built with the passed `ast`.
- Provide static surface on `IDNA`:
  - `version`
  - `ucs2.encode`, `ucs2.decode`
  - `encode`, `decode`
  - `toASCII`, `toUnicode`
- No `throw` for normal invalid input / overflow / not-basic flows.
- Prefer `ParseResult` as the single error surface; remove custom `IDNAError` union unless forced by a consumer.
- Update all in-repo consumers and tests; keep repo green (`lint`, `check`, `test`).

Implementation guidance:
- Implement pure helpers returning `ParseResult.ParseResult<_>` (Either-based) for algorithm core.
- Wrap issues into `ParseError` for the exported Effect API via `ParseResult.parseError`.
- For synchronous consumers (`uri.ts`, `mailto.ts`), use the explicit `*Result` APIs to avoid `Effect.runSync`.

Quality gates:
1. `bun run lint:fix`
2. `bun run lint`
3. `bun run check`
4. `bun run test`

Deliverables to write:
- `specs/pending/semantic-web-idna-schema-refactor/outputs/review.md`
- `specs/pending/semantic-web-idna-schema-refactor/outputs/docs-checklist.md`
- Update semantic-web docs with an “IDNA” section and examples.

