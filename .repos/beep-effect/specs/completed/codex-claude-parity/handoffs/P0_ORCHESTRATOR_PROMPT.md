# P0 Orchestrator Prompt: Discovery Baseline

Copy-paste this into a new Codex session to execute Phase 0.

---

You are executing **Phase 0 (Discovery Baseline)** of `specs/codex-claude-parity`.

## Mission

Create evidence-backed baseline artifacts for `.claude` capability parity planning:

1. `specs/codex-claude-parity/outputs/P0_BASELINE.md`
2. `specs/codex-claude-parity/outputs/parity-capability-matrix.md`

## Required Context

Read first:

- `specs/codex-claude-parity/README.md`
- `specs/codex-claude-parity/handoffs/HANDOFF_P0.md`
- `specs/codex-claude-parity/MASTER_ORCHESTRATION.md`

## Phase Constraints

- Do NOT create `.codex/` files in P0
- Do NOT modify `.claude/` in P0
- All capability claims must reference actual repo artifacts

## Discovery Tasks

1. Measure `.claude` component counts and structure
2. Identify high-impact capabilities needed for operational parity
3. Build a capability matrix with initial strategy labels (`direct-port`, `adaptation`, `investigate`)
4. Document risks, unknowns, and phase-1 questions

## Output Requirements

`P0_BASELINE.md` must include:

- Date/time of measurements
- Component inventory with counts
- Current strengths and coupling points
- Risks/unknowns with impact

`parity-capability-matrix.md` must include:

- Capability domain
- Source artifact(s)
- Current behavior summary
- Required parity level (`required`/`optional`)
- Codex target strategy
- Risks/notes

## Definition of Done

- [ ] Both P0 outputs created and complete
- [ ] Required capability set explicitly defined
- [ ] Open questions for P1 documented
- [ ] New handoff pair created for Phase 1:
- `specs/codex-claude-parity/handoffs/HANDOFF_P1.md`
- `specs/codex-claude-parity/handoffs/P1_ORCHESTRATOR_PROMPT.md`
