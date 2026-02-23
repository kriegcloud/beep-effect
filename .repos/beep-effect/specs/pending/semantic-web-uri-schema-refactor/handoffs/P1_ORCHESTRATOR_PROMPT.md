# P1 Orchestrator Prompt: URI Effect + Schema Refactor

You are the orchestrator for `specs/pending/semantic-web-uri-schema-refactor`.

Goal: refactor `packages/common/semantic-web/src/uri` (uri-js port) to be Effect-based and Schema-first so errors are typed/explicit and `URI`/`IRI` can be used as schemas.

This is a **breaking rewrite**. You may delete the old URI module implementation and exports entirely. Your job is to update every in-repo consumer to the new API and keep the repo green (`lint`, `check`, `test`).

Context-budget rule: if you hit Yellow/Red zone per `specs/_guide/HANDOFF_STANDARDS.md` (many tool calls / many large file reads), STOP and create a phase checkpoint handoff (`handoffs/HANDOFF_P[N]_CHECKPOINT.md` + next prompt) rather than pushing through.

Note: the only known in-repo consumer is `packages/common/semantic-web/test/uri/uri.test.ts`, but you MUST re-`rg` to confirm.

## Hard Requirements

- Export a custom `effect/Schema` named `URI`.
- `URI` MUST be an `S.Class` (Schema.Class).
- Provide a strict, effectful `S.transformOrFail` schema that transforms `string` -> `URI` (recommended export: `URIFromString`).
  - `transformOrFail` failures must be `ParseResult.ParseIssue` (e.g. `new ParseResult.Type(ast, actual, message)`).
  - Use the passed `ast` argument when constructing issues so failures attach to the transform stage.
- Export a separate IRI schema/value model to keep schemas deterministic:
  - export `IRI` as an `S.Class`
  - export `IRIFromString` (`string` -> `IRI`) via `S.transformOrFail`
  - do not make schema decoding depend on runtime `URIOptions` (express variants as distinct schemas)
- `URI` MUST expose static methods (or equivalent module-level exports) matching the current feature surface in `packages/common/semantic-web/src/uri/uri.ts`:
  - `parse`
  - `serialize`
  - `resolveComponents`
  - `resolve`
  - `normalize`
  - `equal`
  - `escapeComponent`
  - `unescapeComponent`
- No `throw` / `try/catch` for normal invalid-input flows. Use typed failures.
- Prefer a single error surface: use `effect/ParseResult` (`ParseIssue` / `ParseError`) instead of ad-hoc `components.error?: string`.
- Tests must be refactored accordingly and remain meaningful.

## Repo Constraints

- Follow repo guardrails in root `AGENTS.md` (no long-running dev servers without confirmation; no `any`; no boundary violations).
- Prefer `@beep/*` imports and avoid cross-slice relative imports.
- Keep diffs incremental and reviewable.
- Preserve the `uri-js` BSD license header in `packages/common/semantic-web/src/uri/uri.ts` if substantial derived code remains.

## Step 0: Delegate Research (Required)

Do not sequentially read a large number of files yourself. Delegate the research outputs to sub-agents, then integrate.

Use prompts in `specs/pending/semantic-web-uri-schema-refactor/AGENT_PROMPTS.md`:

1. `codebase-researcher` → writes `outputs/codebase-context.md`
2. `schema-expert` → writes `outputs/schema-utilities.md`
3. `effect-researcher` → writes `outputs/effect-schema-patterns.md` and `outputs/effect-module-design.md`

If your environment does not support sub-agents, you must still produce the same outputs, but keep your own reads disciplined.

## Step 1: Research (Write Outputs)

Ensure these exist in `specs/pending/semantic-web-uri-schema-refactor/outputs/`:

1. `codebase-context.md`
2. `schema-utilities.md`
3. `effect-schema-patterns.md`
4. `effect-module-design.md`

## Step 2: Design

Write:

- `outputs/api-design.md`
- `outputs/file-layout.md`

Design checklist:

- Decide what `URI.value` means (recommended: canonical normalized serialization under a strict default option set).
- Decide what `IRI.value` means (recommended: canonical normalized IRI serialization under a strict default option set).
- Decide the public API and compatibility strategy (prefer a clean API since only tests consume this today).
- Decide return types for static methods:
  - Preferred: `Effect.Effect<..., ParseResult.ParseError>`.
  - If a sync surface is needed, expose it explicitly as `Either`/`ParseResult` in addition to Effect wrappers.
  - Avoid `Effect.runSync` / `Effect.runPromise` inside library code.
- Ensure schema decoding uses `transformOrFail` strictly:
  - `URIFromString = S.transformOrFail(S.String, URI, { strict: true, decode, encode })`.
  - `decode`/`encode` failures MUST be `ParseResult.ParseIssue` and should use `ast`.
  - `IRIFromString` follows the same pattern for `IRI`.
- Decide how IDNA integration works (depends on the refactored IDNA module):
  - host/domain conversions must not use exceptions for invalid inputs
  - failures should map into `ParseIssue` (schema) and `ParseError` (Effect APIs)

## Step 3: Plan (Context-Engineering Style)

Write `outputs/plan.md` with:

- assumptions / invariants
- phased incremental steps (each step ends with a compile/test checkpoint)
- risk register + mitigations (behavior drift, scheme regressions, perf)
- test migration notes (how current string-returning assertions become Effect/Either assertions)

## Step 4: Implement

Implementation checklist:

- Introduce `URI` as an `S.Class` and `URIFromString` via `S.transformOrFail`.
  - `transformOrFail` failures must be `ParseResult.ParseIssue` and should use the passed `ast`.
- Introduce `IRI` as an `S.Class` and `IRIFromString` via `S.transformOrFail`.
- Replace `components.error` with typed failures.
  - Preferred internal pattern: return `Either<ParseIssue, A>` via `ParseResult.fail/succeed/try`.
  - For exported Effect APIs, wrap issues to `ParseResult.ParseError` via `ParseResult.parseError(issue)`.
- Refactor scheme handlers:
  - avoid `try/catch` around IDNA conversion
  - keep behavior aligned to existing tests unless an explicit improvement is chosen and re-justified
- Refactor `packages/common/semantic-web/test/uri/uri.test.ts`:
  - success cases: assert on `Effect.runPromise(...)` results (or decodeSync results if you provide sync helpers)
  - failure cases: assert on `ParseError.issue._tag` and stable messages (avoid `.toThrow(...)`)

Quality gates (repo root):

1. `bun run lint:fix`
2. `bun run lint`
3. `bun run check`
4. `bun run test`

## Step 5: Review + Documentation

Write `outputs/review.md` summarizing:

- final API surface
- schema strategy (`URI`, `URIFromString`, `IRI`, `IRIFromString`)
- error strategy (`ParseIssue` vs `ParseError`)
- any deliberate behavior changes vs the old port

Update docs (create if missing):

- `packages/common/semantic-web/README.md` (add a short “URI” section + examples)
- `packages/common/semantic-web/AGENTS.md`
- `packages/common/semantic-web/ai-context.md`

