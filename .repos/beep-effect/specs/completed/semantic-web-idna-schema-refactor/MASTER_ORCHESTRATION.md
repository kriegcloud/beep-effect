# Master Orchestration: semantic-web-idna-schema-refactor

> Full workflow for refactoring `packages/common/semantic-web/src/idna` into an Effect + Schema-first design.

## Complexity

Estimated complexity: **High** (multi-phase refactor + heavy research + strict schema/error requirements).

Per `specs/_guide/README.md`, treat this as a multi-session spec unless proven otherwise. Use handoffs to avoid context rot.

## Entry Points

- Phase 1 handoff: `handoffs/HANDOFF_P1.md`
- Phase 1 prompt: `handoffs/P1_ORCHESTRATOR_PROMPT.md`
- Phase 1 delegation prompts: `AGENT_PROMPTS.md`

## Phase 0 (Done): Scaffolding

Checklist:

- README + QUICK_START exist
- outputs/ and templates/ exist
- handoffs/ contains BOTH `HANDOFF_P1.md` and `P1_ORCHESTRATOR_PROMPT.md`
- spec review performed: `outputs/spec-review.md`

## Phase 1: Discovery (Read-Only)

Objective: capture current module surface, consumer expectations, and Schema/Effect patterns to mirror.

1. Delegate research outputs using `AGENT_PROMPTS.md`.
2. Ensure these files exist in `outputs/`:
   - `codebase-context.md`
   - `schema-utilities.md`
   - `effect-schema-patterns.md`
   - `effect-module-design.md`
3. Orchestrator integrates outputs and resolves contradictions.
4. Create handoff for Phase 2 if needed:
   - `handoffs/HANDOFF_P2.md`
   - `handoffs/P2_ORCHESTRATOR_PROMPT.md`

## Phase 2: Design

Objective: decide what `IDNA` means as a value schema and how API compatibility will work.

Deliverables (in `outputs/`):

- `api-design.md`
- `file-layout.md`

Design constraints:

- `IDNA` is `S.Class` and represents a value (not a function/config bag).
- Boundary decoding is strict and effectful:
  - `IDNAFromString = S.transformOrFail(S.String, IDNA, { strict: true, ... })`
  - `decode/encode` failures must be `ParseIssue` and use `ast`.
- Library methods should not throw; prefer `Effect` failures as `ParseError`.
- Avoid `Effect.runSync/runPromise` inside the library to manufacture sync APIs.

## Phase 3: Plan

Objective: create an incremental implementation plan with checkpoints.

Deliverable:

- `outputs/plan.md`

Plan requirements:

- invariants (behavior that must not change)
- step-by-step migration (each ends with `check`/`test`)
- risk register and mitigations
- test migration notes

## Phase 4: Implement

Objective: rewrite the module and update all in-repo consumers.

Implementation requirements:

- Old module can be deleted entirely.
- Replace exception-based failures with `ParseResult`-typed failures.
- Expose `IDNA` schema class and static methods matching the previous surface.
- Add `IDNAFromString` as strict `transformOrFail`.
- Update `packages/common/semantic-web/src/uri/*` consumers and tests.

Quality gates (repo root):

1. `bun run lint:fix`
2. `bun run lint`
3. `bun run check`
4. `bun run test`

## Phase 5: Review

Objective: confirm repo laws and spec acceptance criteria are satisfied.

Deliverable:

- `outputs/review.md`

Review checklist:

- No `throw` for normal invalid inputs.
- No `any` or unchecked casts.
- Error surface is `ParseResult`-based (`ParseIssue`/`ParseError`).
- Public exports are minimal and documented.
- Consumer updates are complete (no stale import paths).

## Phase 6: Documentation

Objective: ensure module is discoverable and documented for humans and future agents.

Deliverable:

- `outputs/docs-checklist.md`

Docs requirements:

- `packages/common/semantic-web/README.md` includes IDNA section with examples.
- `packages/common/semantic-web/AGENTS.md` exists and documents module boundaries/rules if missing.
- Only add `ai-context.md` if there is repo precedent.

## Phase Completion Standard

For any phase that continues into another session:

- Create BOTH `handoffs/HANDOFF_P[N].md` and `handoffs/P[N]_ORCHESTRATOR_PROMPT.md`.
- Keep handoff under the token budgets in `specs/_guide/HANDOFF_STANDARDS.md`.

