# Handoff: Phase 0 - Discovery Baseline

> Context document for executing P0 of `cursor-claude-parity`.

---

## Working Context (<=2,000 tokens)

Primary objective:

- Establish an evidence-based baseline of `.claude`, `.codex`, and `.cursor` capabilities to define parity targets for `.cursor`.

Critical constraints:

- P0 must not implement `.cursor` changes
- P0 must not modify `.claude` or `.codex` files

Immediate outputs:

- `outputs/P0_BASELINE.md`
- `outputs/parity-capability-matrix.md`

---

## Episodic Context (<=1,000 tokens)

Current session setup:

- Spec scaffold exists and has full phase docs
- P0 is the execution entry phase for downstream Cursor parity sessions
- `specs/codex-claude-parity` completed; `.codex/` is at parity with `.claude/`

Carry-forward concern:

- Capability inventory must be complete for all three config dirs before any mapping/implementation starts.

---

## Semantic Context (<=500 tokens)

Baseline facts (2026-02-07 snapshot):

- `.claude/agents/`: `29`; `.claude/skills/`: `60`; `.claude/commands/`: `13`; `.claude/rules/`: `5`; `.claude/hooks/`: `10`
- `.codex/`: rules, workflows, skills, agents, patterns, safety (post-parity)
- `.cursor/rules/`: `5` (`.mdc`, synced via `sync-cursor-rules`); `.cursor/skills/`: `2` only

Reconfirm and timestamp values in P0 output.

---

## Procedural Context (links only)

- `specs/cursor-claude-parity/README.md`
- `specs/cursor-claude-parity/MASTER_ORCHESTRATION.md`
- `specs/cursor-claude-parity/RUBRICS.md`
- `specs/codex-claude-parity/outputs/parity-capability-matrix.md` (reference)

---

## P0 Deliverables

1. `outputs/P0_BASELINE.md`
2. `outputs/parity-capability-matrix.md`

### Required `P0_BASELINE.md` sections

- Measurement timestamp
- Directory/component inventory with counts for `.claude`, `.codex`, `.cursor`
- Existing strengths and gaps in `.cursor`
- Risks and unknowns for Cursor parity

### Required `parity-capability-matrix.md` columns

- Capability domain
- Source artifact(s)
- Current behavior summary
- Cursor current state
- Required parity level (`required` or `optional`)
- Cursor target strategy (`direct-port`, `adaptation`, `investigate`)
- Notes/risks

---

## Exit Criteria

- [ ] Both P0 outputs exist and are populated
- [ ] Every required capability has an initial parity strategy
- [ ] Unknowns/blockers listed with impact and owner
- [ ] P1 handoff pair created
