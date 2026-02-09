# Quick Start: IDNA Effect + Schema Refactor

> Use this when you want to jump straight into orchestrating the work.

## 1. Read Baseline Code

- `packages/common/semantic-web/src/idna/idna.ts`
- `packages/common/semantic-web/src/idna/errors.ts`
- `packages/common/semantic-web/src/idna/index.ts`
- `packages/common/semantic-web/test/idna/idna.test.ts`
- `packages/common/semantic-web/src/uri/uri.ts`
- `packages/common/semantic-web/src/uri/schemes/mailto.ts`

## 2. Generate Discovery Outputs

Create the following files under `specs/pending/semantic-web-idna-schema-refactor/outputs/`:

- `codebase-context.md`
- `schema-utilities.md`
- `effect-schema-patterns.md`
- `effect-module-design.md`

Keep these tight: focus on what will change and what must remain stable.
In `effect-schema-patterns.md`, include at least one effectful `S.transformOrFail` example (see `.repos/effect/packages/effect/test/Schema/ParseResultEffectful.test.ts`) and at least one in-repo boundary transform (e.g. `URLFromString` or `LocalDateFromString`).
In `effect-module-design.md`, capture a few “worth mirroring” conventions from `.repos/effect/packages/effect/src/*` (public surface vs `internal/*`, stable exports, documentation style).

## 3. Decide the IDNA “Value Model”

Before touching code, write down (in `outputs/api-design.md`) what `IDNA` means as a schema:

- what’s stored in `IDNA.value` (recommendation: canonical ASCII output of `toASCII`)
- what inputs it accepts when decoding from unknown
- what guarantees it provides to downstream consumers
- how boundary decoding from `string` works:
  - recommended: `IDNAFromString = S.transformOrFail(S.String, IDNA, { strict: true, decode: ..., encode: ... })`
  - note: `transformOrFail` failures must be `ParseResult.ParseIssue` (e.g. `new ParseResult.Type(ast, actual, message)`), and should use the passed `ast` so issues attach to the transformation stage

## 4. Write the Plan

Create `outputs/plan.md` with:

- incremental steps
- verification checkpoints per step (compile/tests)
- consumer update strategy (this is a breaking rewrite; update all import sites)
- test migration notes (how exception-based tests become Effect/Either assertions)

## 5. Implement + Verify

Run from repo root:

1. `bun run lint:fix`
2. `bun run lint`
3. `bun run check`
4. `bun run test`

If you need to iterate quickly, you can run package-local checks from `packages/common/semantic-web`.

## Entry Point Prompt

Start from the Phase 1 handoff + prompt:

- `specs/pending/semantic-web-idna-schema-refactor/handoffs/HANDOFF_P1.md`
- `specs/pending/semantic-web-idna-schema-refactor/handoffs/P1_ORCHESTRATOR_PROMPT.md`
