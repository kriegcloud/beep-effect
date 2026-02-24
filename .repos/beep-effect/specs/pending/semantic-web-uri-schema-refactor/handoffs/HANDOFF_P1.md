# Handoff P1: URI Effect + Schema Refactor

## Context for Phase 1

### Working Context (≤2K tokens)

**Current task**

Refactor `packages/common/semantic-web/src/uri` (uri-js port) into an Effect-based, Schema-first module that exports:

- `URI` as an `S.Class` schema/value model, plus `URIFromString` (`S.transformOrFail`),
- `IRI` as an `S.Class` schema/value model, plus `IRIFromString` (`S.transformOrFail`),
- a typed Effect API surface for parsing/serializing/resolving/normalizing.

**Success criteria (definition of done)**

- `packages/common/semantic-web/src/uri` exports `URI` and `IRI` as `S.Class` schemas.
- `URIFromString` exists and is `S.transformOrFail(S.String, URI, { strict: true, ... })`.
- `IRIFromString` exists and is `S.transformOrFail(S.String, IRI, { strict: true, ... })`.
- `URI` provides a stable public surface (static methods or module-level exports) covering:
  - `parse`, `serialize`, `resolveComponents`, `resolve`, `normalize`, `equal`, `escapeComponent`, `unescapeComponent`
- No `throw` used for expected invalid input flows; failures are typed.
- Error surface is canonical: `effect/ParseResult`:
  - `ParseIssue` for schema transforms (`transformOrFail`)
  - `ParseError` for exported Effect APIs (via `ParseResult.parseError(issue)`)
- Scheme handlers in `packages/common/semantic-web/src/uri/schemes/*` are updated to the new typed API.
- Tests updated and passing: `packages/common/semantic-web/test/uri/uri.test.ts`.
- All quality gates pass: `bun run lint:fix`, `bun run lint`, `bun run check`, `bun run test`.
- Documentation includes a “URI” section with examples (schema + Effect API).

**Hard requirements**

- `URI` and `IRI` MUST be `S.Class` (Schema.Class).
- Boundary transforms MUST use `S.transformOrFail` with `strict: true`.
  - Failures in decode/encode MUST be `ParseResult.ParseIssue`.
  - Use the passed `ast` when constructing `ParseIssue`s.
- No `Effect.runSync` / `Effect.runPromise` inside library code to fake sync APIs.
- Schemas must be deterministic: do not depend on runtime `URIOptions` to decode `URI`/`IRI`.

**Immediate dependencies (files)**

- Current module:
  - `packages/common/semantic-web/src/uri/uri.ts`
  - `packages/common/semantic-web/src/uri/model.ts`
  - `packages/common/semantic-web/src/uri/regex-uri.ts`
  - `packages/common/semantic-web/src/uri/regex-iri.ts`
  - `packages/common/semantic-web/src/uri/schemes/index.ts`
  - `packages/common/semantic-web/src/uri/schemes/*`
- Tests:
  - `packages/common/semantic-web/test/uri/uri.test.ts`
- IDNA dependency (must be Effect + ParseResult based after refactor):
  - `packages/common/semantic-web/src/idna/*`

**Phase 1 outputs to produce**

Write these files under `specs/pending/semantic-web-uri-schema-refactor/outputs/`:

- `codebase-context.md`
- `schema-utilities.md`
- `effect-schema-patterns.md`
- `effect-module-design.md`

### Episodic Context (≤1K tokens)

**Decisions made during spec creation**

- This is a breaking redesign; old URI code can be deleted.
- The canonical error surface should be `effect/ParseResult` rather than `components.error?: string`.
- `URI` and `IRI` should be value schemas (`S.Class`), not config bags.
- Boundary parsing should use strict, effectful `S.transformOrFail`.
- Schemas must be deterministic: variants should be expressed as distinct schemas (not runtime option flags).

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
  - `specs/pending/semantic-web-uri-schema-refactor/README.md`
  - `specs/pending/semantic-web-uri-schema-refactor/QUICK_START.md`
  - `specs/pending/semantic-web-uri-schema-refactor/handoffs/P1_ORCHESTRATOR_PROMPT.md`
  - `specs/pending/semantic-web-uri-schema-refactor/AGENT_PROMPTS.md`

## Context Budget Audit

Use `specs/_guide/HANDOFF_STANDARDS.md`:

- Direct tool calls: aim ≤ 10 (Yellow at 11-15; Red at 16+)
- Large file reads (>200 lines): aim ≤ 2 (Yellow at 3-4; Red at 5+)
- Sub-agent delegations: aim ≤ 5

If you hit Yellow/Red zone, create a checkpoint handoff and continue in a new session.

## Verification Commands

```bash
# Find all consumers (re-confirm this list before editing)
rg -n \"@beep/semantic-web/uri\" packages/common/semantic-web

# Run quality gates (repo root)
bun run lint:fix
bun run lint
bun run check
bun run test
```

