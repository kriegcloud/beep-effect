# P1 Orchestrator Prompt: IDNA Effect + Schema Refactor

You are the orchestrator for `specs/pending/semantic-web-idna-schema-refactor`.

Goal: refactor `packages/common/semantic-web/src/idna` (punycode port) to be Effect-based and Schema-first so errors are typed/explicit and IDNA can be used as a schema.

This is a **breaking rewrite**. You may delete the old IDNA implementation and exports entirely. Your job is to update every in-repo consumer to the new API and keep the repo green (`lint`, `check`, `test`).

Context-budget rule: if you hit Yellow/Red zone per `specs/_guide/HANDOFF_STANDARDS.md` (many tool calls / many large file reads), STOP and create a phase checkpoint handoff (`handoffs/HANDOFF_P[N]_CHECKPOINT.md` + next prompt) rather than pushing through.

## Hard Requirements

- Export a custom `effect/Schema` named `IDNA`.
- `IDNA` MUST be an `S.Class` (Schema.Class).
- Provide a strict, effectful `S.transformOrFail` schema that transforms `string` -> `IDNA` (export: `IDNAFromString`).
  - `transformOrFail` failures must be `ParseResult.ParseIssue` (e.g. `new ParseResult.Type(ast, actual, message)`).
  - Use the passed `ast` argument when constructing issues so failures attach to the transform stage.
- `IDNA` MUST expose static methods / properties matching the current default export surface:
  - `version`
  - `ucs2.encode`, `ucs2.decode`
  - `encode`, `decode`
  - `toASCII`, `toUnicode`
- No `throw` for normal invalid-input / overflow / not-basic flows. Use typed failures.
- Prefer a single error surface: use `effect/ParseResult` (`ParseIssue` / `ParseError`) and delete the custom `IDNAError` union unless a concrete, in-repo consumer forces it.
- Tests must be refactored accordingly and remain meaningful.

## Repo Constraints

- Follow repo guardrails in root `AGENTS.md` (no long-running dev servers without confirmation; no `any`; no boundary violations).
- Prefer `@beep/*` imports and avoid cross-slice relative imports.
- Keep diffs incremental and reviewable.

## Step 0: Delegate Research (Required)

Do not sequentially read a large number of files yourself. Delegate the research outputs to sub-agents, then integrate.

Use prompts in `specs/pending/semantic-web-idna-schema-refactor/AGENT_PROMPTS.md`:

1. `codebase-researcher` → writes `outputs/codebase-context.md`
2. `schema-expert` → writes `outputs/schema-utilities.md`
3. `effect-researcher` → writes `outputs/effect-schema-patterns.md` and `outputs/effect-module-design.md`

If your environment does not support sub-agents, you must still produce the same outputs, but keep your own reads disciplined.

## Step 1: Research (Write Outputs)

Ensure these exist in `specs/pending/semantic-web-idna-schema-refactor/outputs/`:

1. `codebase-context.md`
2. `schema-utilities.md`
3. `effect-schema-patterns.md`
4. `effect-module-design.md`

## Step 2: Design

Write:

- `outputs/api-design.md`
- `outputs/file-layout.md`

Design checklist:

- Decide what `IDNA.value` means (recommended: canonical ASCII output of `toASCII`).
- Decide the public API and default export strategy (keep compatibility or update consumers intentionally).
- Decide return types for static methods:
  - Preferred: `Effect.Effect<string, ParseResult.ParseError>`.
  - If a sync surface is needed, expose it explicitly as `Either`/`ParseResult` in addition to Effect wrappers.
  - Avoid `Effect.runSync` / `Effect.runPromise` inside library code.
- Ensure schema decoding uses `transformOrFail` strictly:
  - `IDNAFromString = S.transformOrFail(S.String, IDNA, { strict: true, decode, encode })`.
  - `decode`/`encode` failures MUST be `ParseResult.ParseIssue` and should use `ast`.

## Step 3: Plan

Write `outputs/plan.md` with:

- assumptions / invariants
- phased incremental steps (each step ends with a compile/test checkpoint)
- risk register + mitigations
- test migration notes (replace `toThrow(...)` with typed failure assertions)

## Step 4: Implement

Implementation checklist:

- Replace `throw ...` with typed failures (`ParseResult.ParseIssue` / `ParseResult.ParseError`) and convert to `Effect` at the module boundary.
  - Good pattern: implement pure helpers returning `Either<ParseResult.ParseIssue, A>` using `ParseResult.try` / `ParseResult.fail`.
  - For the exported Effect API, wrap issues into `ParseResult.ParseError` via `ParseResult.parseError(...)` so callers receive an `Error` with `.message` and an issue tree.
- Replace exported `const IDNA = new IDNAConfig(...)` with `export class IDNA extends S.Class...`.
- Provide static surface (`version`, `ucs2`, `encode/decode/toASCII/toUnicode`) on the class.
- Ensure `packages/common/semantic-web/src/idna/index.ts` exports the new `IDNA` and handles default export compatibility intentionally.
- Update known consumer(s) (run `rg` to confirm all):
  - `packages/common/semantic-web/src/uri/uri.ts`
  - `packages/common/semantic-web/src/uri/schemes/mailto.ts`
- Refactor `packages/common/semantic-web/test/idna/idna.test.ts`:
  - success cases: assert on `Effect.runPromise` results
  - error cases: assert on `ParseResult` structure and stable messages (avoid `toThrow(...)`)

## Step 5: Review + Quality Gates

Run (repo root):

1. `bun run lint:fix`
2. `bun run lint`
3. `bun run check`
4. `bun run test`

Write `outputs/review.md` summarizing:

- API compatibility decisions
- error-handling strategy
- schema strategy and how it maps failures
- any non-obvious tradeoffs

## Step 6: Documentation

Add/update docs as needed:

- `packages/common/semantic-web/README.md`
- `packages/common/semantic-web/AGENTS.md`
- `packages/common/semantic-web/ai-context.md` (only if there is clear precedent in the repo)

Documentation must include:

- a short “IDNA” section
- examples for:
  - using the `IDNA` schema at a boundary
  - calling the Effect-based static methods

Write `outputs/docs-checklist.md` summarizing:

- what docs files were added/updated
- what new public exports were introduced
- example snippets that demonstrate intended usage

