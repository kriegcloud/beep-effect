# Quick Start: URI Effect + Schema Refactor

> Use this when you want to jump straight into orchestrating the work.

## 1. Read Baseline Code

- `packages/common/semantic-web/src/uri/uri.ts`
- `packages/common/semantic-web/src/uri/model.ts`
- `packages/common/semantic-web/src/uri/regex-uri.ts`
- `packages/common/semantic-web/src/uri/regex-iri.ts`
- `packages/common/semantic-web/src/uri/schemes/index.ts`
- `packages/common/semantic-web/src/uri/schemes/*`
- `packages/common/semantic-web/test/uri/uri.test.ts`

## 2. Generate Discovery Outputs

Create the following files under `specs/pending/semantic-web-uri-schema-refactor/outputs/`:

- `codebase-context.md`
- `schema-utilities.md`
- `effect-schema-patterns.md`
- `effect-module-design.md`

Keep these tight: focus on what will change and what must remain stable.
In `effect-schema-patterns.md`, include at least one effectful `S.transformOrFail` example (see `.repos/effect/packages/effect/test/Schema/ParseResultEffectful.test.ts`) and at least one in-repo boundary transform (e.g. `URLFromString` or `LocalDateFromString`).

## 3. Decide the URI “Value Model”

Before touching code, write down (in `outputs/api-design.md`) what `URI` means as a schema:

- what’s stored in `URI.value` (recommendation: canonical normalized serialization)
- what inputs it accepts when decoding from unknown
- what guarantees it provides to downstream consumers
- how boundary decoding from `string` works:
  - recommended: `URIFromString = S.transformOrFail(S.String, URI, { strict: true, decode: ..., encode: ... })`
  - note: `transformOrFail` failures must be `ParseResult.ParseIssue` (e.g. `new ParseResult.Type(ast, actual, message)`), and should use the passed `ast` so issues attach to the transformation stage

Also decide (and document) the IRI variant:

- what’s stored in `IRI.value` (recommendation: canonical normalized IRI serialization)
- `IRIFromString = S.transformOrFail(S.String, IRI, { strict: true, decode: ..., encode: ... })`
- do not make schema decoding depend on runtime `URIOptions` (variants should be distinct schemas)

## 4. Write the Plan

Create `outputs/plan.md` with:

- incremental steps
- verification checkpoints per step (compile/tests)
- consumer update strategy (this is a breaking rewrite; update all import sites)
- test migration notes (how current tests become Effect/Either assertions)

## 5. Implement + Verify

Run from repo root:

1. `bun run lint:fix`
2. `bun run lint`
3. `bun run check`
4. `bun run test`

## Entry Point Prompt

Use the Phase 1 handoff prompt:

- `specs/pending/semantic-web-uri-schema-refactor/handoffs/P1_ORCHESTRATOR_PROMPT.md`

The root `P1_ORCHESTRATOR_PROMPT.md` is a pointer kept for compatibility.
