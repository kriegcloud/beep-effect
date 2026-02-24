# P1 Orchestrator Prompt: Gap Analysis

Copy-paste this into a new Codex session after P0 is complete.

---

You are executing **Phase 1 (Gap Analysis)** of `specs/codex-claude-parity`.

## Mission

Produce:

1. `specs/codex-claude-parity/outputs/P1_GAP_ANALYSIS.md`
2. `specs/codex-claude-parity/outputs/parity-decision-log.md`

## Read First

- `specs/codex-claude-parity/outputs/P0_BASELINE.md`
- `specs/codex-claude-parity/outputs/parity-capability-matrix.md`
- `specs/codex-claude-parity/handoffs/HANDOFF_P1.md`
- `specs/codex-claude-parity/MASTER_ORCHESTRATION.md`

## Required Method

For each `required` capability from the P0 matrix:

1. Map to Codex target implementation path
2. Classify as one of: `direct-port`, `adaptation`, `unsupported`, `defer`
3. Record rationale, risks, and mitigation
4. Define whether symlink or copy fallback is acceptable

## Known P0 Risk Hotspots

- Hook parity uncertainty (`.claude/settings.json`, `.claude/hooks/**`)
- Skill denominator ambiguity (60 entries vs 37 `SKILL.md`)
- Agent manifest portability (`.claude/agents-manifest.yaml`)

## Constraints

- Evidence-backed analysis only
- Do not start `.codex/` implementation in P1
- Every non-direct mapping must have explicit rationale
- If capability is `unsupported`/`defer`, define fallback behavior and owner

## Definition of Done

- [ ] Every `required` capability classified
- [ ] All non-direct mappings include rationale + mitigation
- [ ] P2 prerequisites are explicit, including symlink portability criteria
- [ ] `outputs/parity-decision-log.md` complete and auditable
- [ ] P2 handoff pair created:
- `specs/codex-claude-parity/handoffs/HANDOFF_P2.md`
- `specs/codex-claude-parity/handoffs/P2_ORCHESTRATOR_PROMPT.md`
