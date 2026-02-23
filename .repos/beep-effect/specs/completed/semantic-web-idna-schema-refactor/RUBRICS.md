# Rubrics: semantic-web-idna-schema-refactor

## Completion Rubric (Implementation)

### 1) Schema Surface (Required)

- [ ] `IDNA` is exported as an `S.Class`.
- [ ] `IDNAFromString` is exported and uses `S.transformOrFail(S.String, IDNA, { strict: true, ... })`.
- [ ] `transformOrFail` decode/encode failures are `ParseResult.ParseIssue` and use the provided `ast`.
- [ ] `IDNA.value` semantics are defined in docs and in `outputs/api-design.md`.

### 2) API Compatibility (Required)

- [ ] Static surface matches prior default export:
  - [ ] `version`
  - [ ] `ucs2.encode`, `ucs2.decode`
  - [ ] `encode`, `decode`
  - [ ] `toASCII`, `toUnicode`
- [ ] All in-repo consumers updated (validated via `rg`).

### 3) Error Model (Required)

- [ ] No `throw` used for expected invalid input flows.
- [ ] No custom `IDNAError` union remains in the public surface.
- [ ] Failures use `effect/ParseResult`:
  - [ ] `ParseIssue` for schema transforms
  - [ ] `ParseError` (via `ParseResult.parseError(...)`) for exported Effect APIs where an `Error` is expected

### 4) Tests (Required)

- [ ] Tests do not assert `toThrow(...)` for invalid inputs.
- [ ] Failure assertions check `ParseResult` structure and stable message strings.
- [ ] Coverage still includes key edge cases (invalid chars, overflow, non-basic).

### 5) Repo Laws / Quality Gates (Required)

- [ ] `bun run lint:fix`
- [ ] `bun run lint`
- [ ] `bun run check`
- [ ] `bun run test`

## Spec Quality Rubric (Structure)

- [ ] High-complexity structure present:
  - [ ] `README.md`, `REFLECTION_LOG.md`, `QUICK_START.md`
  - [ ] `MASTER_ORCHESTRATION.md`, `AGENT_PROMPTS.md`
  - [ ] `handoffs/HANDOFF_P1.md` and `handoffs/P1_ORCHESTRATOR_PROMPT.md`
- [ ] Orchestrator prompt includes explicit delegation strategy (sub-agents write outputs).
- [ ] `outputs/spec-review.md` exists and the latest review scores 5/5.

