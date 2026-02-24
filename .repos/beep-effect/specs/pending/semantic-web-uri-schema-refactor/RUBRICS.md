# Rubrics: semantic-web-uri-schema-refactor

## Completion Rubric (Implementation)

### 1) Schema Surface (Required)

- [ ] `URI` is exported as an `S.Class`.
- [ ] `IRI` is exported as an `S.Class`.
- [ ] `URIFromString` is exported and uses `S.transformOrFail(S.String, URI, { strict: true, ... })`.
- [ ] `IRIFromString` is exported and uses `S.transformOrFail(S.String, IRI, { strict: true, ... })`.
- [ ] `transformOrFail` decode/encode failures are `ParseResult.ParseIssue` and use the provided `ast`.
- [ ] `URI.value` / `IRI.value` semantics are defined in docs and in `outputs/api-design.md`.

### 2) API Surface (Required)

- [ ] Public surface includes:
  - [ ] `parse`
  - [ ] `serialize`
  - [ ] `resolveComponents`
  - [ ] `resolve`
  - [ ] `normalize`
  - [ ] `equal`
  - [ ] `escapeComponent`
  - [ ] `unescapeComponent`
- [ ] All in-repo consumers updated (validated via `rg`).

### 3) Error Model (Required)

- [ ] No `throw` used for expected invalid input flows.
- [ ] `components.error?: string` is not the primary error channel.
- [ ] Failures use `effect/ParseResult`:
  - [ ] `ParseIssue` for schema transforms
  - [ ] `ParseError` (via `ParseResult.parseError(...)`) for exported Effect APIs where an `Error` is expected

### 4) Schemes + IDNA (Required)

- [ ] `packages/common/semantic-web/src/uri/schemes/*` updated to new typed API.
- [ ] IDNA integration is exception-free for normal invalid inputs (maps into `ParseIssue` / `ParseError`).
- [ ] Any deliberate behavior changes vs old port are documented in `outputs/review.md`.

### 5) Tests (Required)

- [ ] Tests do not assert `toThrow(...)` for invalid inputs.
- [ ] Failure assertions check `ParseResult` structure and stable message strings.
- [ ] Coverage still includes key edge cases (bad percent-encoding, invalid IPv6, scheme-specific failures).

### 6) Repo Laws / Quality Gates (Required)

- [ ] `bun run lint:fix`
- [ ] `bun run lint`
- [ ] `bun run check`
- [ ] `bun run test`

## Spec Quality Rubric (Structure)

- [ ] High-complexity structure present:
  - [ ] `README.md`, `REFLECTION_LOG.md`, `QUICK_START.md`
  - [ ] `MASTER_ORCHESTRATION.md`, `AGENT_PROMPTS.md`
  - [ ] `handoffs/HANDOFF_P1.md` and `handoffs/P1_ORCHESTRATOR_PROMPT.md`
- [ ] Orchestrator prompt includes explicit delegation strategy (sub-agents write discovery outputs).
- [ ] `outputs/spec-review.md` exists and the latest review scores 5/5.

