# P1 Orchestrator Prompt: IDNA Effect + Schema Refactor

You are the orchestrator for `specs/pending/semantic-web-idna-schema-refactor`.

Goal: refactor `packages/common/semantic-web/src/idna` (punycode port) to be Effect-based and Schema-first so errors are typed/explicit and IDNA can be used as a schema.

## Hard Requirements

- Export a custom `effect/Schema` named `IDNA`.
- `IDNA` MUST be an `S.Class` (Schema.Class).
- `IDNA` MUST expose static methods / properties matching the current default export surface:
  - `version`
  - `ucs2.encode`, `ucs2.decode`
  - `encode`, `decode`
  - `toASCII`, `toUnicode`
- No `throw` for normal invalid-input / overflow / not-basic flows. Use typed failures.
- Tests must be refactored accordingly and remain meaningful.

## Repo Constraints

- Follow repo guardrails in root `AGENTS.md` (no long-running dev servers without confirmation; no `any`; no boundary violations).
- Prefer `@beep/*` imports and avoid cross-slice relative imports.
- Keep diffs incremental and reviewable.

## Step 1: Research (Write Outputs)

Create these files in `specs/pending/semantic-web-idna-schema-refactor/outputs/`:

1. `codebase-context.md`
   - Current export surface:
     - `packages/common/semantic-web/src/idna/index.ts`
     - `packages/common/semantic-web/src/idna/idna.ts`
   - Consumers that rely on the default export:
     - `packages/common/semantic-web/src/uri/uri.ts`
   - Test expectations:
     - `packages/common/semantic-web/test/idna/idna.test.ts`
   - Enumerate current thrown error cases and how they are triggered.

2. `schema-utilities.md`
   - Identify useful patterns/utilities in `packages/common/schema`, especially:
     - string schema patterns (e.g. `DomainName` in `packages/common/schema/src/primitives/network/domain.ts`)
     - `StringLiteralKit`, branded primitives, annotations conventions
   - Note any existing domain/email schemas that should interop with IDNA.

3. `effect-schema-patterns.md`
   - Extract the key Schema patterns needed from `.repos/effect/packages/effect/src/Schema.ts`:
     - `transformOrFail`
     - interaction with `ParseResult.ParseIssue`
   - Decide how IDNA failures map into schema failures (ParseIssue) vs library API failures (`IDNAError`).

## Step 2: Design (Decide the Model, Then Write It Down)

Write `outputs/api-design.md` that answers:

- What does the `IDNA` schema represent?
  - Recommendation: `IDNA.value` stores the canonical ASCII output of `toASCII`.
- What is the public API, and what is the compatibility strategy?
  - Strong preference: keep `default export` compatible with `idna.toASCII(...)` usage in `uri.ts` (either by exporting the `IDNA` class as default, or updating the consumer).
- What are the return types for static methods?
  - Preferred: `Effect.Effect<string, IDNAError>` (or `Either<IDNAError, string>` with Effect wrappers).
- How do you keep “schema decoding” errors strict while still staying canonical to Effect Schema?
  - `transformOrFail` requires failures as `ParseResult.ParseIssue`; decide how to convert an `IDNAError` into a `ParseIssue` with a stable message.

Write `outputs/file-layout.md` with the intended final file structure (keep it close to existing paths unless there is a compelling reason).

## Step 3: Plan (Context-Engineering Style)

Write `outputs/plan.md` with:

- assumptions / invariants
- phased incremental steps (each step ends with a compile/test checkpoint)
- risk register + mitigations
- test migration notes (replace `toThrow(...)` assertions with typed failure assertions)

## Step 4: Implement

Implementation checklist:

- Introduce/modify internal helpers so core punycode logic returns typed failures (no exceptions).
  - Good pattern: implement pure functions returning `Either<IDNAError, A>`; provide `Effect` wrappers at the export boundary.
- Replace exported `const IDNA = new IDNAConfig(...)` with `export class IDNA extends S.Class...`.
- Provide static surface (`version`, `ucs2`, `encode/decode/toASCII/toUnicode`) on the class.
- Ensure `packages/common/semantic-web/src/idna/index.ts` exports the new `IDNA` and handles default export compatibility intentionally.
- Update `packages/common/semantic-web/src/uri/uri.ts` if the default export shape changes.
- Refactor `packages/common/semantic-web/test/idna/idna.test.ts`:
  - success cases: assert on `Effect.runPromise` results
  - error cases: assert the returned error tag/type (`OverFlowError`, `InvalidInputError`, `NotBasicError`) rather than string matching

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

This package currently lacks standard docs files. Add/update:

- `packages/common/semantic-web/README.md`
- `packages/common/semantic-web/AGENTS.md`
- `packages/common/semantic-web/ai-context.md` (if the repo’s convention expects per-package AI context; check other packages for precedent)

Documentation must include:

- a short “IDNA” section
- examples for:
  - using the `IDNA` schema at a boundary
  - calling the Effect-based static methods

