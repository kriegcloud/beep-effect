# P4 Orchestrator Prompt: Hardening and Finalization

Copy-paste this into a new Codex session after P3 is complete.

---

You are executing **Phase 4 (Hardening and Finalization)** of `specs/codex-claude-parity`.

## Mission

Close residual validation gaps, rerun blocked checks, and produce final parity hardening outputs with explicit gate decisions.

## Read First

- `specs/codex-claude-parity/outputs/P3_VALIDATION_REPORT.md`
- `specs/codex-claude-parity/outputs/parity-scorecard.md`
- `specs/codex-claude-parity/handoffs/HANDOFF_P4.md`
- `specs/codex-claude-parity/RUBRICS.md`
- `.codex/runtime/hook-parity.md`

## Deliverables

- `specs/codex-claude-parity/outputs/P4_HARDENING.md`
- Updated `specs/codex-claude-parity/REFLECTION_LOG.md`
- Final downstream handoff pair

## Required Behavior

1. Address S2 blocker path:
- Validate and handle `packages/knowledge/domain/package.json:44` parse error (fix or formal defer with owner/date).
- Re-run `bun run lint`, `bun run check`, `bun run test`, `bun run build`.

2. Re-score rubric using exact formula in `RUBRICS.md`.

3. Keep hook orchestration defer explicit:
- Validate manual fallback remains executable.
- Do not claim automated hook parity unless proven in-session.

## Constraints

- No unsupported parity claims without file-level evidence.
- If blockers remain unresolved, keep final status explicit as non-complete.

## Definition of Done

- [ ] S2 blocker resolved or explicitly deferred with owner/date
- [ ] Validation rerun evidence captured
- [ ] Rubric acceptance gates re-evaluated explicitly
- [ ] P4 hardening output and final handoff pair completed
