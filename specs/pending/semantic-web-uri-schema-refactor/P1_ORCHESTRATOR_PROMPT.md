# P1 Orchestrator Prompt: URI Effect + Schema Refactor

You are the orchestrator for `specs/pending/semantic-web-uri-schema-refactor`.

Goal: refactor `packages/common/semantic-web/src/uri` (uri-js port) to be Effect-based and Schema-first so errors are typed/explicit and URI can be used as a schema.

Important: this is a **breaking rewrite**. You may delete the old URI module implementation and exports entirely. Your job is to update every in-repo consumer to the new API and keep the repo green (`lint`, `check`, `test`).

Note (as of spec creation): `rg "@beep/semantic-web/uri"` finds only:
- `packages/common/semantic-web/test/uri/uri.test.ts`
- a string literal in `packages/common/semantic-web/src/uri/uri.ts`

## Hard Requirements

- Export a custom `effect/Schema` named `URI`.
- `URI` MUST be an `S.Class` (Schema.Class).
- Provide a strict, effectful `S.transformOrFail` schema that transforms `string` -> `URI` (recommended export: `URIFromString`).
  - `transformOrFail` failures must be `ParseResult.ParseIssue` (e.g. `new ParseResult.Type(ast, actual, message)`).
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

## Step 1: Research (Write Outputs)

Create these files in `specs/pending/semantic-web-uri-schema-refactor/outputs/`:

1. `codebase-context.md`
   - Current export surface:
     - `packages/common/semantic-web/src/uri/uri.ts`
     - `packages/common/semantic-web/src/uri/schemes/index.ts`
     - `packages/common/semantic-web/src/uri/schemes/*`
   - Enumerate current error flows:
     - where `components.error` is set
     - where exceptions can occur (`try/catch`, `invariant`, implicit throws)
   - Consumers and test expectations:
     - `packages/common/semantic-web/test/uri/uri.test.ts`
   - Enumerate **all import sites** of `@beep/semantic-web/uri*` and list what they need from the module.

2. `schema-utilities.md`
   - Identify useful patterns/utilities in `packages/common/schema`, especially:
     - `DomainName` (`packages/common/schema/src/primitives/network/domain.ts`)
     - `IPv4` / `IPv6` / `IP` (`packages/common/schema/src/primitives/network/ip.ts`)
     - `URLFromString` (`packages/common/schema/src/primitives/network/url.ts`) as a boundary transform reference
   - Identify any semantic-web-local schema utilities already present:
     - `packages/common/semantic-web/src/uri/model.ts` (`URIRegExps` is already `S.Class`)

3. `effect-schema-patterns.md`
   - Extract the key Schema patterns needed from `.repos/effect/packages/effect/src/Schema.ts`:
     - `transformOrFail`
     - interaction with `ParseResult.ParseIssue`
   - Collect a few in-repo `S.transformOrFail` exemplars and note how they:
     - set `strict: true`
     - fail with `ParseResult.Type(ast, actual, message)` (or `ParseResult.fail(...)`)
     - use `ParseResult.try({ try: ..., catch: () => new ParseResult.Type(ast, actual, message) })` to wrap throwing code
     - use `Effect.mapError(...)` to convert typed errors into `ParseIssue` when decode/encode is effectful
     - use the `ast` passed to `decode`/`encode` so error messages attach to the transformation stage
     - Examples:
       - `packages/common/schema/src/primitives/network/url.ts` (`URLFromString`)
       - `packages/shared/domain/src/value-objects/LocalDate.ts` (`LocalDateFromString`)
       - `packages/shared/domain/src/services/EncryptionService/schemas.ts` (`EncryptedStringFromPlaintext`)
       - `.repos/effect/packages/effect/test/Schema/ParseResultEffectful.test.ts` (effectful transformOrFail)
   - Decide how URI failures map into:
     - schema failures (`ParseIssue`, required by `transformOrFail`), and
     - library API failures (prefer `ParseError` so callers receive an `Error` with `.message` and structured issue tree).

4. `effect-module-design.md`
   - Inspect upstream Effect module design in `.repos/effect/packages/effect/src/*` and record conventions to mirror:
     - file layout patterns (e.g. `internal/*`, `index.ts` re-exports)
     - naming conventions (`make`, static constructors, `FromString` boundary schemas)
     - error surface choices (when to expose `ParseIssue` vs `ParseError`)
     - layering/purity boundaries: `Either` internally, `Effect` at the edge
   - If you change the file layout for URI, justify how it improves long-term maintainability and aligns with Effect style.

## Step 2: Design (Decide the Model, Then Write It Down)

Write `outputs/api-design.md` that answers:

- What does the `URI` schema represent?
  - Recommendation: `URI.value` stores the canonical serialized output of normalization under a strict default option set.
- What does the `IRI` schema represent?
  - Recommendation: `IRI.value` stores canonical serialized IRI output under a strict default option set.
- What is the public API, and what is the compatibility strategy?
  - Since only tests consume this today, prefer a clean API over backwards shims.
- What are the return types for static methods / exported functions?
  - Preferred: `Effect.Effect<..., ParseResult.ParseError>` for exported APIs.
  - Internally, pure logic may use `Either<ParseIssue, ...>` for composition.
- How do you handle scheme handlers in a schema-first world?
  - Decide whether scheme registration remains global (`SCHEMES`) or becomes explicit (recommended).
- How do you represent IRI options and domain-host IDNA conversion without exceptions?
  - Integrate with the refactored IDNA module (Effect + ParseResult errors).

Write `outputs/file-layout.md` with the intended final file structure (keep it close to existing paths unless there is a compelling reason).

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
- schema strategy (`URI`, `URIFromString`)
- error strategy (ParseIssue vs ParseError)
- any deliberate behavior changes vs the old port

Update docs (create if missing):

- `packages/common/semantic-web/README.md` (add a short “URI” section + examples)
- `packages/common/semantic-web/AGENTS.md`
- `packages/common/semantic-web/ai-context.md`
