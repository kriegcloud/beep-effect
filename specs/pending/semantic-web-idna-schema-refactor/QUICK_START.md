# Quick Start: IDNA Effect + Schema Refactor

> Use this when you want to jump straight into orchestrating the work.

## 1. Read Baseline Code

- `packages/common/semantic-web/src/idna/idna.ts`
- `packages/common/semantic-web/src/idna/errors.ts`
- `packages/common/semantic-web/src/idna/index.ts`
- `packages/common/semantic-web/test/idna/idna.test.ts`
- `packages/common/semantic-web/src/uri/uri.ts`

## 2. Generate Discovery Outputs

Create the following files under `specs/pending/semantic-web-idna-schema-refactor/outputs/`:

- `codebase-context.md`
- `schema-utilities.md`
- `effect-schema-patterns.md`

Keep these tight: focus on what will change and what must remain stable.

## 3. Decide the IDNA “Value Model”

Before touching code, write down (in `outputs/api-design.md`) what `IDNA` means as a schema:

- what’s stored in `IDNA.value` (recommendation: canonical ASCII output of `toASCII`)
- what inputs it accepts when decoding from unknown
- what guarantees it provides to downstream consumers

## 4. Write the Plan

Create `outputs/plan.md` with:

- incremental steps
- verification checkpoints per step (compile/tests)
- compatibility strategy for the default export used by `uri.ts`
- test migration notes (how exception-based tests become Effect/Either assertions)

## 5. Implement + Verify

Run from repo root:

1. `bun run lint:fix`
2. `bun run lint`
3. `bun run check`
4. `bun run test`

If you need to iterate quickly, you can run package-local checks from `packages/common/semantic-web`.

## Entry Point Prompt

Use `specs/pending/semantic-web-idna-schema-refactor/P1_ORCHESTRATOR_PROMPT.md` as the seed prompt for the orchestrator instance.
