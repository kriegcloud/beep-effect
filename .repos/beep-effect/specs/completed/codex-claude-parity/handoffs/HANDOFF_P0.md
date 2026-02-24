# Handoff: Phase 0 - Discovery Baseline

> Context document for executing P0 of `codex-claude-parity`.

---

## Working Context (<=2,000 tokens)

Primary objective:

- Establish an evidence-based baseline of `.claude` capabilities to define parity targets for `.codex`.

Critical constraints:

- `.codex/` is currently absent in the project root
- P0 must not implement `.codex` files
- P0 must not modify `.claude` files

Immediate outputs:

- `outputs/P0_BASELINE.md`
- `outputs/parity-capability-matrix.md`

---

## Episodic Context (<=1,000 tokens)

Current session setup:

- Spec scaffold exists and has full phase docs
- P0 is the execution entry phase for downstream Codex sessions

Carry-forward concern:

- Capability inventory must be complete before any mapping/implementation starts.

---

## Semantic Context (<=500 tokens)

Baseline facts (2026-02-07 snapshot):

- `.claude/agents/`: `29`
- `.claude/skills/`: `60`
- `.claude/commands/`: `13`
- `.claude/rules/`: `5`
- `.claude/hooks/`: `10`
- `.codex/`: missing

Reconfirm and timestamp values in P0 output.

---

## Procedural Context (links only)

- `specs/codex-claude-parity/README.md`
- `specs/codex-claude-parity/MASTER_ORCHESTRATION.md`
- `specs/codex-claude-parity/RUBRICS.md`

---

## P0 Deliverables

1. `outputs/P0_BASELINE.md`
2. `outputs/parity-capability-matrix.md`

### Required `P0_BASELINE.md` sections

- Measurement timestamp
- Directory/component inventory with counts
- Existing strengths in `.claude`
- Risks and unknowns for Codex parity

### Required `parity-capability-matrix.md` columns

- Capability domain
- Source artifact(s)
- Current behavior summary
- Required parity level (`required` or `optional`)
- Codex target strategy (`direct-port`, `adaptation`, `investigate`)
- Notes/risks

---

## Exit Criteria

- [ ] Both P0 outputs exist and are populated
- [ ] Every required capability has an initial parity strategy
- [ ] Unknowns/blockers listed with impact and owner
- [ ] P1 handoff pair created
