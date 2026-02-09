# Handoff P1: IDNA Effect + Schema Refactor

## Context for Phase 1

### Working Context (≤2K tokens)

**Current task**

Refactor `packages/common/semantic-web/src/idna` (punycode port) into an Effect-based, Schema-first module that exports an `S.Class` named `IDNA`, plus an effectful, strict boundary schema `IDNAFromString` built with `S.transformOrFail`.

**Success criteria (definition of done)**

- `packages/common/semantic-web/src/idna` exports `IDNA` as an `S.Class` schema.
- `IDNAFromString` exists and is `S.transformOrFail(S.String, IDNA, { strict: true, ... })`.
- `IDNA` has static `version`, `ucs2`, `encode`, `decode`, `toASCII`, `toUnicode`.
- No `throw` used for expected invalid-input / overflow / not-basic IDNA failures.
- Failures use Effect’s canonical schema error model: `effect/ParseResult` (`ParseIssue` / `ParseError`), not a custom `IDNAError` union.
- Tests updated and passing: `packages/common/semantic-web/test/idna/idna.test.ts`.
- All quality gates pass: `bun run lint:fix`, `bun run lint`, `bun run check`, `bun run test`.
- Documentation includes an “IDNA” section with examples (schema + Effect API).

**Hard requirements**

- `IDNA` MUST be an `S.Class` (Schema.Class).
- Boundary transform MUST use `S.transformOrFail` with `strict: true`.
  - Failures in decode/encode MUST be `ParseResult.ParseIssue`.
  - Use the passed `ast` when constructing `ParseIssue`s.
- Static methods must cover the prior default export surface.
- Do not use `Effect.runSync` / `Effect.runPromise` inside library code to fake sync APIs.

**Immediate dependencies (files)**

- Current module:
  - `packages/common/semantic-web/src/idna/idna.ts`
  - `packages/common/semantic-web/src/idna/errors.ts`
  - `packages/common/semantic-web/src/idna/index.ts`
- Tests:
  - `packages/common/semantic-web/test/idna/idna.test.ts`
- Known consumers (re-confirm with `rg`):
  - `packages/common/semantic-web/src/uri/uri.ts`
  - `packages/common/semantic-web/src/uri/schemes/mailto.ts`

**Phase 1 outputs to produce**

Write these files under `specs/pending/semantic-web-idna-schema-refactor/outputs/`:

- `codebase-context.md`
- `schema-utilities.md`
- `effect-schema-patterns.md`
- `effect-module-design.md`

### Episodic Context (≤1K tokens)

**Decisions made during spec creation**

- This is a breaking redesign; old IDNA code can be deleted.
- The canonical error surface should be `effect/ParseResult`; custom `IDNAError` should be removed.
- `IDNA` should be a value schema (`S.Class`), not a config object. Static methods preserve the old “bundle” ergonomics.
- Boundary parsing should use `S.transformOrFail` with strict, effectful decode/encode.
- The spec now requires explicit research of existing `transformOrFail` usage and Effect module organization patterns.

**Known transformOrFail exemplars to consult**

- `packages/common/schema/src/primitives/network/url.ts` (`URLFromString`)
- `packages/shared/domain/src/value-objects/LocalDate.ts` (`LocalDateFromString`)
- `packages/shared/domain/src/services/EncryptionService/schemas.ts` (`EncryptedStringFromPlaintext`)
- `.repos/effect/packages/effect/test/Schema/ParseResultEffectful.test.ts`

### Semantic Context (≤500 tokens)

- Repo uses Bun + Effect 3. Avoid exceptions for normal error flow.
- Guardrails from root `AGENTS.md` apply (no `any`, no `@ts-ignore`, no unchecked casts, no long-running processes without confirmation).
- Cross-slice imports only through `packages/shared/*` or `packages/common/*` with `@beep/*` aliases.

### Procedural Context (links only)

- Spec guide: `specs/_guide/README.md`
- Handoff standards: `specs/_guide/HANDOFF_STANDARDS.md`
- Spec entry points:
  - `specs/pending/semantic-web-idna-schema-refactor/README.md`
  - `specs/pending/semantic-web-idna-schema-refactor/QUICK_START.md`
  - `specs/pending/semantic-web-idna-schema-refactor/handoffs/P1_ORCHESTRATOR_PROMPT.md`
  - `specs/pending/semantic-web-idna-schema-refactor/AGENT_PROMPTS.md`

## Context Budget Audit

Use `specs/_guide/HANDOFF_STANDARDS.md`:

- Direct tool calls: aim ≤ 10 (Yellow at 11-15; Red at 16+)
- Large file reads (>200 lines): aim ≤ 2 (Yellow at 3-4; Red at 5+)
- Sub-agent delegations: aim ≤ 5

If you hit Yellow/Red zone, create a checkpoint handoff and continue in a new session.

## Verification Commands

```bash
# Find all consumers (re-confirm this list before editing)
rg -n \"@beep/semantic-web/idna\" packages/common/semantic-web

# Run quality gates (repo root)
bun run lint:fix
bun run lint
bun run check
bun run test
```

