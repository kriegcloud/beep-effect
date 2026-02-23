# P5 Orchestrator Prompt: Closure Remediation

Copy-paste this into a new Codex session after P4 is complete.

---

You are executing **Phase 5 (Closure Remediation)** of `specs/codex-claude-parity`.

## Mission

Close final acceptance gate failures or produce a formal non-completion disposition with explicit ownership.

## Read First

- `specs/codex-claude-parity/outputs/P4_HARDENING.md`
- `specs/codex-claude-parity/outputs/parity-scorecard.md`
- `specs/codex-claude-parity/handoffs/HANDOFF_P5.md`
- `specs/codex-claude-parity/RUBRICS.md`
- `.codex/runtime/hook-parity.md`

## Deliverables

- Updated `specs/codex-claude-parity/outputs/parity-scorecard.md`
- `specs/codex-claude-parity/outputs/P5_CLOSURE.md`
- Updated `specs/codex-claude-parity/REFLECTION_LOG.md`

## Required Behavior

1. Resolve remaining gate blockers:
- Address lint/test/build failures found in P4 reruns or formally defer with owner/date.
- Evaluate lifecycle-hook parity defer status and determine whether it can be closed in-session.

2. Re-score rubric using exact formula in `RUBRICS.md`.

3. Keep claims evidence-bound:
- No completion claim without file-level proof.
- If any critical blocker remains unresolved, set explicit NON-COMPLETE status.

## Constraints

- Do not claim automated hook parity unless proven in-session.
- Keep owner/date explicit for every deferred blocker.

## Definition of Done

- [ ] Remaining blockers resolved or deferred with owner/date
- [ ] Rubric and gates re-evaluated explicitly
- [ ] P5 closure output completed with final status
