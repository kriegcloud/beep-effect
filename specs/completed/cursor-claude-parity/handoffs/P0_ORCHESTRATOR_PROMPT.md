# P0 Orchestrator Prompt: Discovery Baseline

Copy-paste this into a new session to execute Phase 0.

---

You are executing **Phase 0 (Discovery Baseline)** of `specs/cursor-claude-parity`.

## Mission

Create evidence-backed baseline artifacts for `.cursor` capability parity planning:

1. `specs/cursor-claude-parity/outputs/P0_BASELINE.md`
2. `specs/cursor-claude-parity/outputs/parity-capability-matrix.md`

## Required Context

Read first:

- `specs/cursor-claude-parity/README.md`
- `specs/cursor-claude-parity/handoffs/HANDOFF_P0.md`
- `specs/cursor-claude-parity/MASTER_ORCHESTRATION.md`

## Phase Constraints

- Do NOT implement `.cursor/` changes in P0
- Do NOT modify `.claude/` or `.codex/` in P0
- All capability claims must reference actual repo artifacts

## Discovery Tasks

1. Measure `.claude`, `.codex`, and `.cursor` component counts and structure
2. Identify high-impact capabilities needed for Cursor operational parity
3. Build a capability matrix with initial strategy labels (`direct-port`, `adaptation`, `investigate`)
4. Document risks, unknowns, and phase-1 questions

## Output Requirements

`P0_BASELINE.md` must include:

- Date/time of measurements
- Component inventory with counts for all three config dirs
- Current strengths and coupling points
- Risks/unknowns with impact

`parity-capability-matrix.md` must include:

- Capability domain
- Source artifact(s)
- Current behavior summary
- Cursor current state
- Required parity level (`required`/`optional`)
- Cursor target strategy
- Risks/notes

## Definition of Done

- [ ] Both P0 outputs created and complete
- [ ] Required capability set explicitly defined
- [ ] Open questions for P1 documented
- [ ] New handoff pair created for Phase 1:
  - `specs/cursor-claude-parity/handoffs/HANDOFF_P1.md`
  - `specs/cursor-claude-parity/handoffs/P1_ORCHESTRATOR_PROMPT.md`
